import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { db } from "~/server/db";
import crypto from "crypto"

function generateHash(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex")
}

function fallbackSummary(code: string, file: string) {
  return `File ${file} contains code (${code.length} chars). Likely defines logic/functions.`
}

/**
 * Loader (unchanged)
 */
export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || '',
    branch: 'main',
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 3, // 🔥 reduced
    ignorePaths: [
      'node_modules',
      'dist',
      'build',
      '.next',
      '.git',
      'coverage',
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock'
    ]
  });

  return await loader.load();
};

/**
 * Main indexer
 */
export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  console.log("Docs loaded:", docs.length);

  const filteredDocs = docs.filter(doc => {
    const file = doc.metadata.source || '';

    return (
      doc.pageContent &&
      doc.pageContent.trim().length > 50 &&
      !file.includes('node_modules') &&
      !file.endsWith('.json') &&
      !file.endsWith('.lock') &&
      !file.endsWith('.png') &&
      !file.endsWith('.jpg')
    );
  });

  const MAX_FILES = 80;

  const importantFiles = filteredDocs
    .sort((a, b) => {
      const priority = (name: string) => {
        if (name.includes('package.json')) return 1;
        if (name.includes('README')) return 2;
        if (name.includes('config')) return 3;
        if (name.includes('src')) return 4;
        return 5;
      };

      return priority(a.metadata.source || '') - priority(b.metadata.source || '');
    })
    .slice(0, MAX_FILES);

  console.log("Processing files:", importantFiles.length);

  const embeddings = await generateEmbeddings(importantFiles);

  for (let i = 0; i < embeddings.length; i++) {
    const embedding = embeddings[i];
    if (!embedding) continue;

    console.log(`Saving ${i + 1}/${embeddings.length}:`, embedding.fileName);

    try {
        
        const contentHash = generateHash(embedding.sourceCode)

        const existing = await db.sourceCodeEmbedding.findFirst({
        where: {
            projectId,
            contentHash
        }
        })

        if (existing) {
        console.log("Skipping duplicate:", embedding.fileName)
        continue
        }

      const record = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
          contentHash
        }
      });

      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${JSON.stringify(embedding.embedding)}::vector
        WHERE "id" = ${record.id}
      `;
    } catch (err) {
      console.log("DB error:", err);
    }
  }
};

/**
 * 🔥 Optimized Embedding Generator
 */
const generateEmbeddings = async (docs: Document[]) => {
  const results: any[] = [];

  const CONCURRENCY = 2; // 🔥 key control
  let index = 0;

  const cache = new Map<string, any>(); // 🔥 avoids duplicate work

  async function worker(workerId: number) {
    while (index < docs.length) {
      const currentIndex = index++;
      const doc = docs[currentIndex];

      const fileKey = doc?.metadata.source || `file-${currentIndex}`;

      if (cache.has(fileKey)) {
        results[currentIndex] = cache.get(fileKey);
        continue;
      }

      console.log(`Worker ${workerId} → ${fileKey}`);

      try {
        const MAX_LLM_CALLS = 20

const useLLM = currentIndex < MAX_LLM_CALLS

const summary = useLLM
  ? await summariseCode(doc!)
  : fallbackSummary(doc!.pageContent, fileKey)

        if (!summary || summary.trim().length === 0) {
          results[currentIndex] = null;
          continue;
        }

        // small delay between requests (rate smoothing)
        await sleep(400);

        const embedding = await generateEmbedding(summary);

        const result = {
          summary,
          embedding,
          sourceCode: doc?.pageContent,
          fileName: fileKey
        };

        cache.set(fileKey, result);
        results[currentIndex] = result;

      } catch (err) {
        console.log("Error:", fileKey, err);
        results[currentIndex] = null;
      }
    }
  }

  await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, i) => worker(i))
  );

  return results;
};

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));