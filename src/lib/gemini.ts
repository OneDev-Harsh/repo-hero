import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import type { Document } from '@langchain/core/documents'

/**
 * Gemini (ONLY for embeddings — unchanged)
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

/**
 * OpenRouter via OpenAI SDK (CORRECT way)
 */
const openRouter = new OpenAI({
  apiKey: process.env.OPEN_ROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
})

/**
 * Utility: generate text
 */
async function generateText(prompt: string) {
  const response = await openRouter.chat.completions.create({
    model: 'meta-llama/llama-3-70b-instruct',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  return response.choices[0]?.message?.content || ''
}

/**
 * Summarise Commit
 */
export const aiSummariseCommit = async (diff: string) => {
  try {
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
`

    return await generateText(prompt)
  } catch (error) {
    console.error('Error in aiSummariseCommit:', error)
    return ''
  }
}

/**
 * Summarise Code
 */
export async function summariseCode(doc: Document) {
  try {
    console.log('getting summary for', doc.metadata.source)

    const code = doc.pageContent.slice(0, 10000)

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
`

    return await generateText(prompt)
  } catch (error) {
    console.error('Error in summariseCode:', error)
    return ''
  }
}

/**
 * Embedding (UNCHANGED as requested)
 */
export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-embedding-001"
  })
  const result = await model.embedContent(summary)
  const embedding = result.embedding
  return embedding.values
}