'use client'

import { UserButton } from '@clerk/nextjs'
import React from 'react'
import { SidebarProvider } from '~/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { Geist, Geist_Mono } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})


type Props = {
  children: React.ReactNode
}

const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>

      <AppSidebar />

      <main className={`min-h-screen flex-1 px-3 py-3 space-y-4 bg-muted/30 text-foreground ${geist.variable} ${mono.variable}`}>

        {/* TOP BAR */}
        <div className="h-14 flex items-center justify-end bg-background border rounded-lg px-4 shadow-sm">
          <UserButton />
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-background border rounded-lg p-6 shadow-sm">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

      </main>

    </SidebarProvider>
  )
}

export default SidebarLayout