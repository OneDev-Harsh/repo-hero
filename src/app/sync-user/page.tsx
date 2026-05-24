import { auth, clerkClient } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { db } from '~/server/db';

const SyncUser = async () => {

    const {userId} = await auth();
    if(!userId){
        throw new Error("User does not exist")
    }
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if(!user.emailAddresses[0]?.emailAddress){
        return notFound();
    }

  const email = user.emailAddresses[0]?.emailAddress ?? '';
  const { data: existingUser } = await db.database.from('User')
    .select('id')
    .eq('emailAddress', email)
    .maybeSingle();

  if (existingUser) {
    await db.database.from('User').update({
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        updatedAt: new Date().toISOString()
    }).eq('id', existingUser.id);
  } else {
    await db.database.from('User').insert({
        id: userId,
        emailAddress: email,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        updatedAt: new Date().toISOString()
    });
  }
  
  return redirect('/dashboard')
}

export default SyncUser