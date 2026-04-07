import { UserButton } from '@clerk/nextjs';
import React from 'react'
import { SidebarProvider } from '~/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';

type Props = {
    children: React.ReactNode;
}

const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
        
        <AppSidebar />

        <main className='bg-white min-h-screen text-black px-2 py-2 space-y-4 flex-1'>
            
            {/* TOP BAR */}
            <div className='h-14 flex items-center justify-end bg-black/[0.02] border border-black/10 rounded-md px-4'>
                <UserButton />
            </div>

            {/* MAIN CONTENT */}
            <div className='bg-black/[0.02] border border-black/10 rounded-md p-6'>
                <div className='max-w-7xl mx-auto'>
                    {children}
                </div>
            </div>

        </main>

    </SidebarProvider>
  )
}

export default SidebarLayout