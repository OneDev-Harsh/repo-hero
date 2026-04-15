'use client'

import React from 'react'
import useProject from '~/hooks/use-project'
import { api } from '~/trpc/react'

const TeamMembers = () => {
  const { projectId } = useProject()
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId })

  return (
    <div className="flex items-center">
      {members?.map((member, index) => (
        <img
          key={member.id}
          src={member.user.imageUrl || '/avatar.png'}
          alt={member.user.firstName || 'user'}
          className={`
            w-8 h-8 rounded-full object-cover border-2 border-background
            -ml-2 first:ml-0
            hover:z-10 hover:scale-110 transition
          `}
          style={{ zIndex: members.length - index }}
        />
      ))}
    </div>
  )
}

export default TeamMembers