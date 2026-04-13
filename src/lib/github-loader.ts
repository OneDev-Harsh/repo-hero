import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { db } from "~/server/db";

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || '',
        branch: 'main',
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5,

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
    })
    const docs = await loader.load()
    return docs
} 

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
    const docs = await loadGithubRepo(githubUrl, githubToken)
    console.log("Docs loaded:", docs.length)

    const filteredDocs = docs.filter(doc => {
        const file = doc.metadata.source || ''

        return (
            doc.pageContent &&
            doc.pageContent.trim().length > 50 &&
            !file.includes('node_modules') &&
            !file.endsWith('.json') &&
            !file.endsWith('.lock') &&
            !file.endsWith('.png') &&
            !file.endsWith('.jpg')
        )
    })

    console.log("Generating embeddings...")
    const allEmbeddings = await generateEmbeddings(filteredDocs)
    console.log("DB keys:", Object.keys(db))
    await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
        console.log(`processing ${index} of ${allEmbeddings.length}`)
        if(!embedding) return

        console.log("Saving:", embedding.fileName)
        let sourceCodeEmbedding;
        try {
            sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
                data: {
                    summary: embedding.summary,
                    sourceCode: embedding.sourceCode,
                    fileName: embedding.fileName,
                    projectId,
                }
            })
        } catch (error) {
            console.log('Error in saving sourceCodeEmbedding', error)
            return
        }
        if (!sourceCodeEmbedding) return

        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${JSON.stringify(embedding.embedding)}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}
        `
    }))
}

const generateEmbeddings = async (docs: Document[]) => {
    return await Promise.all(docs.map(async doc => {
        const summary = await summariseCode(doc)

        if (!summary || summary.trim().length === 0) {
            return null
        }

        const embedding = await generateEmbedding(summary)
        return {
            summary,
            embedding,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source ?? 'unknown'
        }
    }))
}