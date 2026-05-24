'use client'

import Image from 'next/image'
import React, { useState, type FormEvent } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Textarea } from '~/components/ui/textarea'
import useProject from '~/hooks/use-project'
import MDEditor from '@uiw/react-md-editor'
import CodeReferences from './code-references'
import { api } from '~/trpc/react'
import { toast } from 'sonner'
import useRefetch from '~/hooks/use-refetch'
import { askQuestion } from './actions'
import { readStreamableValue } from '@ai-sdk/rsc'

const AskQuestionCard = () => {
  const { project } = useProject()

  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [filesReferences, setFilesReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([])
  const [answer, setAnswer] = useState('')
  const saveAnswer = api.project.saveAnswer.useMutation()

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!project?.id || !question.trim()) return

    setLoading(true)
    setAnswer('')
    setFilesReferences([])

    try {
      setOpen(true)
      const { output, filesReferences } = await askQuestion(question, project.id)
      setFilesReferences(filesReferences)

      for await (const chunk of readStreamableValue(output)) {
        if (chunk) {
          setAnswer(chunk)
        }
      }
    } catch (err) {
      console.error(err)
      setAnswer('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const refetch = useRefetch()

  return (
    <>
      {/* 🔥 MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[95vw] lg:max-w-6xl xl:max-w-7xl max-h-[90vh] p-0 overflow-hidden rounded-xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/40">

            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="repo-hero" width={28} height={28} />
              <span className="font-semibold text-lg">Repo-Hero</span>
            </div>

            {/* 🔥 Right controls */}
            <div className="flex items-center gap-3 pr-8">
              <Button
                disabled={
                  saveAnswer.isPending ||
                  !answer?.trim() ||
                  !question?.trim() ||
                  !project?.id
                }
                variant="outline"
                onClick={() => {
                  if (!project?.id) return

                  saveAnswer.mutate(
                    {
                      projectId: project.id,
                      question,
                      answer,
                      filesReferences,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Question saved.")
                        refetch()
                      },
                      onError: () => {
                        toast.error("Failed to save question!")
                      },
                    }
                  )
                }}
              >
                {saveAnswer.isPending ? "Saving..." : "Save Answer"}
              </Button>
            </div>

          </div>

          {/* Content */}
          <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
            <div className="prose prose-neutral max-w-none">
              <div data-color-mode="light">
                <MDEditor.Markdown source={answer || "No response yet..."} />
              </div>
            </div>

            <div className="space-y-6"></div>

            <CodeReferences filesReferences={filesReferences} />
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-3 bg-muted/30 flex justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>

        </DialogContent>
      </Dialog>

      {/* 🔥 CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Ask Repo-Hero a question</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <Textarea
              placeholder="Where am I making the API calls?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px]"
            />

            <Button type="submit" disabled={loading || !question.trim()}>
              {loading ? 'Thinking...' : 'Ask Repo-Hero!'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default AskQuestionCard