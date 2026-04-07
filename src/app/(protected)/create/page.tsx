'use client'

import { useForm } from 'react-hook-form'
import React from 'react'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { toast } from 'sonner'
import useRefetch from '~/hooks/use-refetch'

type FormInput = {
    repoUrl: string
    projectName: string
    githubToken?: string
}

const CreatePage = () => {

    const {register, handleSubmit, reset} = useForm<FormInput>();

    const createProject = api.project.createProject.useMutation()
    const refetch = useRefetch();

    function onsubmit(data: FormInput) {
        createProject.mutate({
            githubUrl: data.repoUrl,
            name: data.projectName,
            githubToken: data.githubToken
        }, {
            onSuccess: () => {
                toast.success('Project created successfully!')
                refetch()
                reset()
            },
            onError: (error) => {
                toast.error('Failed to create project')
            }
        })
        return true;
    }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-10 items-center'>

        {/* LEFT: IMAGE */}
        <div className='flex justify-center'>
            <img 
                src='/coder.png' 
                alt='photo' 
                className='w-1/2 max-w-50 opacity-90'
            />
        </div>

        {/* RIGHT: CONTENT */}
        <div className='space-y-6 max-w-md w-full'>

            {/* TEXT */}
            <div className='space-y-2'>
                <h1 className='text-xl font-semibold text-black tracking-tight'>
                    Link your GitHub repository to get started
                </h1>
                <p className='text-sm text-black/60 leading-relaxed'>
                    Enter the URL of your GitHub repository and an optional project name. RepoHero will analyze your repository and provide insights to help you manage your project more effectively.
                </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit(onsubmit)} className='space-y-4'>

                <Input
                    placeholder='Project Name'
                    className='bg-white border-black/10 focus-visible:ring-0 focus-visible:border-black'
                    {...register('projectName', { required: true })} 
                />

                <Input
                    placeholder='GitHub Repository URL'
                    className='bg-white border-black/10 focus-visible:ring-0 focus-visible:border-black'
                    {...register('repoUrl', { required: true })} 
                />

                <Input
                    placeholder='GitHub Token (Optional)'
                    type='url'
                    className='bg-white border-black/10 focus-visible:ring-0 focus-visible:border-black'
                    {...register('githubToken')} 
                />

                <Button 
                    type='submit'
                    className='w-full mt-2 bg-black text-white hover:bg-black/90 transition-all'
                    disabled={createProject.isPending}
                >
                    Create Project
                </Button>

            </form>
        </div>
    </div>
  )
}

export default CreatePage