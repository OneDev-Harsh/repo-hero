import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { generateEmbedding } from "~/lib/gemini"
import { db } from "~/server/db"

const openrouter = createOpenAI({
  apiKey: process.env.OPEN_ROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
})

export async function POST(req: Request) {
  const { question, projectId } = await req.json()

  const queryVector = await generateEmbedding(question)
  const vectorQuery = `[${queryVector.join(",")}]`

  const result = await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10  
  `

  let context = ""

  for (const doc of result as any[]) {
    context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`
  }

  const response = streamText({
    model: openrouter("meta-llama/llama-3-70b-instruct"), // ✅ FIXED
    messages: [
      {
        role: "user",
        content: `
            You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern who is new to the project.

AI assistant is a brand new, powerful, human-like artificial intelligence.

The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.

AI is a well-behaved and well-mannered individual.

AI is always friendly, kind, and inspiring, and is eager to provide vivid and thoughtful responses to the user.

AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in the codebase.

If the question is asking about code or a specific file, AI will provide a detailed answer, giving step-by-step instructions when necessary.

---------------------
START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK
---------------------

---------------------
START QUESTION
${question}
END OF QUESTION
---------------------

AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.

If the context does not provide the answer to the question, the AI assistant will say:
"I'm sorry, but I don't know the answer to that."

AI assistant will not apologize for previous responses, but instead will indicate new information when relevant.

AI assistant MUST ONLY use information from the provided CONTEXT BLOCK. If unsure, respond with "I don't know based on the provided context."

Answer in markdown syntax, with code snippets if needed.

Be as detailed as possible when answering, especially for code-related questions.
        `,
      },
    ],
  })

  const stream = response.toTextStreamResponse()

return new Response(stream.body, {
  headers: {
    "Content-Type": "text/plain",
    "x-files": encodeURIComponent(JSON.stringify(result)), // ✅ safe encoding
  },
})
}