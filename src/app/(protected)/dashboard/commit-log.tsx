'use client'

import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import useProject from '~/hooks/use-project'
import { api } from '~/trpc/react'

const CommitLog = () => {

    const {projectId, project} = useProject()
    const {data: commits} = api.project.getCommits.useQuery({projectId})

  return (
    <ul className='relative space-y-6'>
        {/* Timeline line */}
        <div className='absolute left-5 top-0 h-full w-0.5 bg-linear-to-b from-black/10 via-black/5 to-transparent' />

        {commits?.map((commit) => {
            return (
            <li key={commit.id} className='relative flex gap-4 group'>
                
                {/* Timeline dot */}
                <div className='relative z-10'>
                    <div className='w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition'>
                        <img 
                            src={commit.commitAuthorAvatar} 
                            alt='commiter avatar' 
                            className='w-8 h-8 rounded-full'
                        />
                    </div>
                </div>

                {/* Card */}
                <div className='flex-1 rounded-xl border border-black/10 bg-white/80 backdrop-blur p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200'>
                    
                    {/* Header */}
                    <div className='flex items-center justify-between mb-2'>
                        <Link 
                            target='_blank' 
                            href={`${project?.githubUrl}/commit/${commit.commitHash}`} 
                            className='flex items-center gap-2 text-sm'
                        >
                            <span className='font-semibold text-black/90 group-hover:text-black'>
                                {commit.commitAuthorName}
                            </span>
                            <span className='text-black/40'>
                                committed
                            </span>
                            <ExternalLink className='w-4 h-4 opacity-60 group-hover:opacity-100 transition' />
                        </Link>

                        <span className='text-xs text-black/40'>
                            {new Date(commit.commitDate).toLocaleString()}
                        </span>
                    </div>

                    {/* Commit Message */}
                    <p className='text-sm font-medium text-black/80 mb-3'>
                        {commit.commitMessage}
                    </p>

                    {/* AI Summary Badge */}
                    <div className='inline-flex items-center gap-2 text-[11px] font-medium px-2 py-1 rounded-md bg-black/5 border border-black/10 mb-2'>
                        Summary
                    </div>

                    {/* Summary */}
                    <pre className='text-xs bg-linear-to-br from-black/4 to-black/2 border border-black/10 rounded-lg p-3 whitespace-pre-wrap font-mono text-black/70 leading-relaxed'>
                        {commit.summary}
                    </pre>
                </div>
            </li>
            )
        })}
    </ul>
  )
}

export default CommitLog