'use client'

import React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import useProject from '~/hooks/use-project'
import useRefetch from '~/hooks/use-refetch'
import { api } from '~/trpc/react'
import { Archive } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'

const ArchiveButton = () => {
  const { projectId } = useProject()
  const archiveProject = api.project.archiveProject.useMutation()
  const refetch = useRefetch()
  const router = useRouter()

  const handleArchive = () => {
    archiveProject.mutate(
      { projectId },
      {
        onSuccess: () => {
          toast.success("Project archived successfully")

          // 🔥 Redirect to create project page
          router.push('/create')

          // optional: refetch if needed elsewhere
          refetch()
        },
        onError: () => {
          toast.error("Failed to archive project")
        },
      }
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          className="flex items-center gap-2"
        >
          <Archive className="w-4 h-4" />
          Archive Project
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Archive this project?
          </AlertDialogTitle>

          <AlertDialogDescription>
            This will archive the project and remove it from your active workspace.
            <br />
            <span className="text-red-500 font-medium">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleArchive}
            className="bg-red-500 hover:bg-red-600"
            disabled={archiveProject.isPending}
          >
            {archiveProject.isPending ? "Archiving..." : "Yes, Archive"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ArchiveButton