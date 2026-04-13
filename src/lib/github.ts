import {Octokit} from 'octokit'
import { db } from '../server/db';
import axios from 'axios'
import { aiSummariseCommit } from './gemini';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
})

const githubUrl = 'https://github.com/OneDev-Harsh/repo-hero'

type Response = {
    commitHash: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
    commitMessage: string;
}

export const getCommitHashes = async (githubUrl: string) : Promise<Response[] | null> => {

    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)

if (!match) {
    console.error('Invalid github url', githubUrl)
    return []
}

const [, owner, repo] = match
    if(!owner || !repo){
        throw new Error('Invalid github url')
    }

    const {data} = await octokit.rest.repos.listCommits({
        owner,
        repo
    })
    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime()) as any[]
    
    return sortedCommits.slice(0,10).map((commit: any) => ({
        commitHash: commit.sha as string,
        commitMessage: commit.commit.message ?? '',
        commitAuthorName: commit.commit.author.name ?? '',
        commitAuthorAvatar: commit.author?.avatar_url ?? '',
        commitDate: commit.commit.author.date ?? '',
    }))
}

export const pollCommits = async (projectId: string) => {
    const {project, githubUrl} = await fetchProjectGithubUrl(projectId)
    const commitHashes = await getCommitHashes(githubUrl?githubUrl:'')
    if (!commitHashes) {
        console.log('No commitHashes')
        return;
    }
    const unprocessedCommits = await filterUnprocessedCommits( projectId, commitHashes )
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map(c => {
        return summariseCommit(githubUrl!, c.commitHash)
    }))

    const summaries = summaryResponses.map((res) => {
        if(res.status === 'fulfilled') {
            return res.value as string
        }
        return ""
    })

    const commits = await db.commit.createMany({
        data: summaries
  .map((summary, index) => {
      if (!summary || summary.trim().length === 0) return null

      return {
          projectId,
          commitHash: unprocessedCommits[index]!.commitHash,
          commitMessage: unprocessedCommits[index]!.commitMessage,
          commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
          commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
          commitDate: unprocessedCommits[index]!.commitDate,
          summary,
      }
  })
  .filter(Boolean) as any
    })

    return commits
}

async function summariseCommit(githubUrl: string | undefined, commitHash: string) {
    if (!githubUrl) return ""

    try {
        const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (!match) return ""

        const [, owner, repo] = match

        const response = await octokit.request<string>(
            'GET /repos/{owner}/{repo}/commits/{ref}',
            {
                owner,
                repo,
                ref: commitHash,
                headers: {
                    accept: 'application/vnd.github.v3.diff'
                }
            }
        )

        const diff = response.data
        const trimmedDiff = diff.slice(0, 8000)

        return await aiSummariseCommit(trimmedDiff)

    } catch (err) {
        console.error("❌ summariseCommit failed:", commitHash, err)
        return ""
    }
}

async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: {
            id: projectId
        },
        select: {
            githubUrl: true
        }
    })
    return {project, githubUrl: project?.githubUrl}
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: {
            projectId
        }
    })

    const unprocessedCommits = commitHashes.filter((c) => !processedCommits.some((processedCommit) => processedCommit.commitHash === c.commitHash))
    
    return unprocessedCommits
}

pollCommits('cmnopym8r0000t4mon5lgu8h6').then(console.log)