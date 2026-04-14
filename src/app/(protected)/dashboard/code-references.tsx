'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent } from '~/components/ui/tabs'
import { cn } from '~/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight  } from 'react-syntax-highlighter/dist/esm/styles/prism'

type Props = {
  filesReferences: { fileName: string; sourceCode: string; summary: string }[]
}

const CodeReferences = ({ filesReferences }: Props) => {
  const [tab, setTab] = useState(filesReferences[0]?.fileName)
  if (filesReferences.length === 0) return null

  return (
    <div className="mt-6 border rounded-xl overflow-hidden bg-background">

      <Tabs value={tab} onValueChange={setTab}>

        {/* 🔥 Tabs Header */}
        <div className="flex gap-2 px-3 py-2 border-b bg-muted/40 overflow-x-auto">

  {filesReferences.map((file) => {
    const isActive = tab === file.fileName

    return (
      <button
        key={file.fileName}
        onClick={() => setTab(file.fileName)}
        className={cn(
          "text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-all duration-200",
          "border border-transparent",
          "focus:outline-none",

          // 👇 ACTIVE
          isActive &&
            "bg-foreground text-background border shadow-sm",

          // 👇 INACTIVE
          !isActive &&
            "text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border"
        )}
      >
        {file.fileName.split('/').pop()}
      </button>
    )
  })}

</div>

        {/* 🔥 Code Content */}
        {filesReferences.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className="m-0"
          >
            <div className="max-h-100 overflow-auto">

              <SyntaxHighlighter
                language="typescript"
                style={oneLight }
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  background: 'transparent',
                  fontSize: '13px',
                }}
              >
                {file.sourceCode}
              </SyntaxHighlighter>

            </div>
          </TabsContent>
        ))}

      </Tabs>
    </div>
  )
}

export default CodeReferences