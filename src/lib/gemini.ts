import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import type { Document } from '@langchain/core/documents'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const openRouter = new OpenAI({
  apiKey: process.env.OPEN_ROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
})

/**
 * 🔥 Smarter retry (with jitter)
 */
let QUOTA_EXCEEDED = false

async function generateText(prompt: string, retries = 2) {
  if (QUOTA_EXCEEDED) return null

  try {
    const response = await openRouter.chat.completions.create({
      model: 'liquid/lfm-2.5-1.2b-thinking:free',
      messages: [{ role: 'user', content: prompt }],
    })

    return response.choices[0]?.message?.content || ''

  } catch (err: any) {
    const msg = err?.error?.message || ""

    if (msg.includes("free-models-per-day")) {
      console.log("🚨 DAILY QUOTA HIT — disabling LLM")
      QUOTA_EXCEEDED = true
      return null
    }

    if (err.status === 429 && retries > 0) {
      await new Promise(res => setTimeout(res, 1000 + Math.random() * 2000))
      return generateText(prompt, retries - 1)
    }

    return null
  }
}

/**
 * Commit Summary (unchanged logic)
 */
export const aiSummariseCommit = async (diff: string) => {
  const prompt = `
You are a senior software engineer reviewing a Git commit diff.

RULES:
- Write 3–5 bullet points maximum
- Focus on WHAT changed and WHY
- Be concise and technical
- Do NOT repeat code
- Group related changes
- Mention file names in [brackets] when useful

DIFF:
${diff}
`;

  return await generateText(prompt);
};

/**
 * Code Summary
 */
export async function summariseCode(doc: Document) {
  try {
    const code = doc.pageContent.slice(0, 3000);

    const prompt = `
You are a senior engineer explaining code to a junior developer.

Explain clearly:
- What this file does
- Main components/functions
- Important logic

Keep it under 100 words.

File: ${doc.metadata.source}

CODE:
${code}
`;

    return await generateText(prompt);

  } catch (error) {
    console.error('Summarise error:', error);
    return '';
  }
}

/**
 * Embedding (unchanged)
 */
export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-embedding-001"
  });

  const result = await model.embedContent(summary);
  return result.embedding.values;
}