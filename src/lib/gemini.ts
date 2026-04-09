import {GoogleGenerativeAI} from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash'
})

export const aiSummariseCommit = async(diff: string) => {
    const response = await model.generateContent([
        `You are a senior software engineer reviewing a Git commit diff.

        Your task is to summarize the changes clearly and concisely.

        RULES:
        - Write 3–5 bullet points maximum
        - Focus on WHAT changed and WHY (not raw code)
        - Be concise and technical
        - Do NOT repeat code
        - Do NOT explain obvious things
        - Group related changes together
        - Mention file names in [brackets] when relevant
        - If many files are involved, you can skip file names

        DIFF FORMAT:
        - Lines starting with "+" were added
        - Lines starting with "-" were removed
        - Other lines are context only

        OUTPUT FORMAT:
        - Return ONLY bullet points
        - Each bullet should be one meaningful change

        EXAMPLE STYLE (do not copy):
        * Improved API response handling [api/user.ts]
        * Fixed typo in authentication middleware [auth.ts]
        * Refactored database connection logic [db.ts]

        Now analyze the following git diff and generate a summary:

        ${diff}`
    ])

    return response.response.text()
}