import OpenAI from 'openai'
import type { Document } from '@langchain/core/documents'

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPEN_ROUTER_API_KEY!,
  defaultHeaders: {
    'HTTP-Referer': 'https://repo-hero.vercel.app',
    'X-Title': 'Repo Hero',
  },
})

/**
 * 🔥 Smarter retry (with jitter)
 */
async function generateText(prompt: string, retries = 2) {
  try {
    const response = await openai.chat.completions.create({
      model: 'openrouter/owl-alpha',
      messages: [{ role: 'user', content: prompt }],
    })

    return response.choices[0]?.message?.content || ''

  } catch (err: any) {
    if (err.status === 429 && retries > 0) {
      await new Promise(res => setTimeout(res, 1000 + Math.random() * 2000))
      return generateText(prompt, retries - 1)
    }

    console.error("🚨 Error calling OpenRouter LLM", err)
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
 * Embedding (unchanged interface)
 */
export async function generateEmbedding(summary: string) {
  const response = await openai.embeddings.create({
    model: 'openai/text-embedding-3-large',
    input: summary,
  });

  return response.data[0]?.embedding;
}