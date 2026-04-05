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

        <main className=''>
            <div className=''>
                {/**<SearchBar /> */}
                <div className=''></div>
                <UserButton />
            </div>
            <div className=''></div>

            {/** main content */}
            <div className=''>
                {children}
            </div>
        </main>

    </SidebarProvider>
  )
}

export default SidebarLayout