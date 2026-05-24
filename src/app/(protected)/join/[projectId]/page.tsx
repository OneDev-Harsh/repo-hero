import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'
import cuid from 'cuid'
import { db } from '~/server/db'

type Props = {
    params: Promise<{projectId: string}>
}

const JoinHandler = async (props: Props) => {
    const {projectId} = await props.params
    const {userId} = await auth()
    if(!userId) return redirect("/sign-in")
    const { data: dbUser } = await db.database.from('User')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    if(!dbUser) {
        await db.database.from('User').insert({
            id: userId,
            emailAddress: user.emailAddresses[0]!.emailAddress,
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
            updatedAt: new Date().toISOString()
        })
    }
    const { data: project } = await db.database.from('Project')
        .select('id')
        .eq('id', projectId)
        .maybeSingle()
        
    if(!project) return redirect("/dashboard")
    try {
        const { error } = await db.database.from('UserToProject').insert({
            id: cuid(),
            userId,
            projectId,
            updatedAt: new Date().toISOString()
        })
        if (error) throw new Error(error.message);
    } catch (error) {
        console.error("User already in Project")
    }
    return redirect("/dashboard")
}

export default JoinHandler