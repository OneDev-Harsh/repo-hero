'use client'

import Link from "next/link"
import { Bot, LayoutDashboard, Plus, Presentation } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "~/components/ui/sidebar"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import Image from "next/image"
import useProject from "~/hooks/use-project"

const items = [
  { title: "Dashboard", url: '/dashboard', icon: LayoutDashboard },
  { title: "Q&A", url: '/qa', icon: Bot },
  { title: "Meetings", url: '/meetings', icon: Presentation },
]

export function AppSidebar() {

  const pathname = usePathname();
  const { open } = useSidebar();

  const router = useRouter();

  const {projects, projectId, setProjectId} = useProject();

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="bg-white border-r border-black/10"
    >
      {/* HEADER */}
      <SidebarHeader
        className={cn(
          "border-b border-black/10 transition-all duration-200",
          open ? "px-6 py-5" : "px-0 py-5"
        )}
      >
        <div className={cn(
          "flex items-center transition-all duration-200",
          open ? "gap-3" : "justify-center"
        )}>
          <Image
            src='/logo.png'
            alt='Repo Hero logo'
            width={36}
            height={36}
            className="rounded-sm shrink-0"
          />
          {open && (
            <h1 className="text-[15px] font-semibold text-black tracking-tight truncate">
              Repo Hero
            </h1>
          )}
        </div>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>

        {/* Application Section */}
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="px-6 text-[11px] uppercase text-black/40 tracking-widest">
              Application
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu className={cn("mt-2 space-y-1", open ? "px-3" : "px-0")}>
              {items.map(item => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title} className={cn(!open && "flex justify-center")}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={cn(
                          "group relative flex items-center rounded-md text-sm font-medium transition-all duration-150",
                          "text-black/60 hover:text-black hover:bg-black/4",
                          isActive && "text-black bg-black/8",
                          open
                            ? "gap-3 px-4 py-2.5 w-full"
                            : "justify-center p-2.5 w-10 h-10"
                        )}
                      >
                        {open && (
                          <span
                            className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full transition-all",
                              isActive ? "bg-black opacity-100" : "opacity-0 group-hover:opacity-40"
                            )}
                          />
                        )}

                        <item.icon
                          size={18}
                          className={cn(
                            "shrink-0 transition-colors",
                            isActive ? "text-black" : "text-black/50 group-hover:text-black"
                          )}
                        />

                        {open && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Slim divider between sections when collapsed */}
        {!open && <div className="mx-auto w-6 h-px bg-black/10 my-1" />}

        {/* Projects Section */}
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="px-6 mt-4 text-[11px] uppercase text-black/40 tracking-widest">
              Your Projects
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu className={cn("mt-2 space-y-1", open ? "px-3" : "px-0")}>
              {projects?.map(project => {
                const isActive = pathname === `/projects/${project.name}`

                return (
                  <SidebarMenuItem key={project.name} className={cn(!open && "flex justify-center")}>
                    <SidebarMenuButton asChild>
                      <div
                        onClick={() => {
                          setProjectId(project.id)
                          router.push(`/dashboard`)
                        }}
                        className={cn(
                          "group relative flex items-center rounded-md text-sm font-medium transition-all duration-150 cursor-pointer",
                          "text-black/60 hover:text-black hover:bg-black/[0.04]",
                          project.id === projectId && "text-black bg-black/[0.08]",
                          open
                            ? "gap-3 px-4 py-2 w-full"
                            : "justify-center p-2 w-10 h-10"
                        )}
                      >
                        {open && (
                          <span
                            className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full transition-all",
                              isActive ? "bg-black opacity-100" : "opacity-0 group-hover:opacity-40"
                            )}
                          />
                        )}

                        {/* PROJECT INITIAL AVATAR */}
                        <div
                          className={cn(
                            "flex items-center justify-center h-6 w-6 shrink-0 rounded-sm text-[11px] font-semibold text-black transition-colors",
                            isActive ? "bg-black/[0.10]" : "bg-black/[0.06] group-hover:bg-black/[0.09]"
                          )}
                        >
                          {project.name[0]}
                        </div>

                        {open && <span className="truncate">{project.name}</span>}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}

              {/* Create Project */}
              <SidebarMenuItem className={cn(!open && "flex justify-center")}>
                {open ? (
                  <Link href='/create'>
                    <div className="px-1 mt-4">
                      <Button
                        variant="outline"
                        className="w-full text-black/60 border-black/10 hover:text-black hover:border-black/20 hover:bg-black/[0.03] transition-all"
                      >
                        <Plus size={15} className="mr-1.5" />
                        Create Project
                      </Button>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href='/create'
                    className={cn(
                      "mt-1 flex items-center justify-center rounded-md w-10 h-10 transition-all duration-150",
                      "text-black/40 hover:text-black hover:bg-black/[0.04]"
                    )}
                  >
                    <Plus size={16} className="shrink-0" />
                  </Link>
                )}
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}