'use client'

import React, { useState } from 'react'
import useProject from '~/hooks/use-project'
import { api } from '~/trpc/react'
import AskQuestionCard from '../dashboard/ask-question-card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import MDEditor from '@uiw/react-md-editor'
import CodeReferences from '../dashboard/code-references'

const QAPage = () => {
  const { projectId } = useProject()
  const { data: questions, isLoading } =
    api.project.getQuestions.useQuery({ projectId })

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const selected = selectedIndex !== null ? questions?.[selectedIndex] : null

  return (
    <Sheet>


      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Saved Questions</h1>
        <p className="text-sm text-muted-foreground">
          Review previously generated answers
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading...</p>
      )}

      {/* Empty */}
      {!isLoading && !questions?.length && (
        <p className="text-sm text-muted-foreground">
          No questions yet. Ask something!
        </p>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions?.map((q, index) => (
          <SheetTrigger asChild key={q.id} onClick={() => setSelectedIndex(index)}>
            <div className="cursor-pointer rounded-xl border p-4 hover:bg-muted/40 transition shadow-sm hover:shadow-md">

              <div className="flex gap-4">
                {/* Avatar */}
                <img
                  src={q.user.imageUrl || '/avatar.png'}
                  className="w-10 h-10 rounded-full border object-cover"
                />

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm line-clamp-2">
                      {q.question}
                    </p>

                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {q.answer}
                  </p>
                </div>
              </div>

            </div>
          </SheetTrigger>
        ))}
      </div>

      {/* 🔥 SHEET */}
      {selected && (
        <SheetContent
          side="right"
          className="!w-[90vw] !max-w-[1200px] p-0 flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold leading-snug">
                {selected.question}
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Asked on {new Date(selected.createdAt).toLocaleString()}
              </p>
            </SheetHeader>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* Markdown */}
            <div
              className="prose prose-neutral max-w-none
              prose-headings:font-semibold
              prose-p:text-sm
              prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-lg
              mb-8"
            >
              <div data-color-mode="light">
                <MDEditor.Markdown source={selected.answer} />
              </div>
            </div>

            {/* References */}
            <div className="border-t pt-5">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Code References
              </h3>

              <CodeReferences
                filesReferences={(selected.filesReferences ?? []) as any}
              />
            </div>

          </div>
        </SheetContent>
      )}

    </Sheet>
  )
}

export default QAPage