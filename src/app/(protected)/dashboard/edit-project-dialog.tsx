'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { api } from '~/trpc/react'
import { useUser } from '@clerk/nextjs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Pencil, Trash2, Loader2, Check, UserMinus } from 'lucide-react'

interface Props {
  projectId: string
  currentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EditProjectDialog = ({ projectId, currentName, open, onOpenChange }: Props) => {
  const { user } = useUser()
  const utils = api.useUtils()

  const [tab, setTab] = useState<'rename' | 'members'>('rename')
  const [name, setName] = useState(currentName)

  // Reset state whenever dialog opens
  useEffect(() => {
    if (open) {
      setName(currentName)
      setTab('rename')
    }
  }, [open, currentName])

  const { data: members, isLoading: membersLoading } = api.project.getTeamMembers.useQuery(
    { projectId },
    { enabled: open }
  )

  const rename = api.project.renameProject.useMutation({
    onSuccess: () => {
      toast.success('Project renamed')
      utils.project.getProjects.invalidate()
      onOpenChange(false)
    },
    onError: (e) => toast.error(e.message),
  })

  const removeMember = api.project.removeMember.useMutation({
    onSuccess: () => {
      toast.success('Member removed')
      utils.project.getTeamMembers.invalidate({ projectId })
    },
    onError: (e) => toast.error(e.message),
  })

  const handleRename = () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed === currentName) return
    rename.mutate({ projectId, name: trimmed })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Pencil className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            Edit Project
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border/60">
          {(['rename', 'members'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors capitalize ${
                tab === t
                  ? 'text-foreground border-b-2 border-foreground -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'rename' ? 'Rename' : 'Members'}
            </button>
          ))}
        </div>

        <div className="px-6 py-5">
          {/* ── RENAME TAB ── */}
          {tab === 'rename' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Update the display name for this project.
              </p>
              <div className="flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Project name"
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleRename}
                  disabled={!name.trim() || name.trim() === currentName || rename.isPending}
                >
                  {rename.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span className="ml-1.5">Save</span>
                </Button>
              </div>
            </div>
          )}

          {/* ── MEMBERS TAB ── */}
          {tab === 'members' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Remove members from this project. You cannot remove yourself.
              </p>

              {membersLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : members && members.length > 0 ? (
                <div className="divide-y divide-border/50 rounded-lg border border-border/60 overflow-hidden">
                  {members.map((member) => {
                    const isSelf = member.user?.id === user?.id
                    const isRemoving =
                      removeMember.isPending &&
                      removeMember.variables?.memberUserId === member.user?.id

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors"
                      >
                        {/* Avatar */}
                        <img
                          src={member.user?.imageUrl || '/avatar.png'}
                          alt={member.user?.firstName || 'user'}
                          className="w-8 h-8 rounded-full object-cover border border-border/60 shrink-0"
                        />

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {member.user?.firstName
                              ? `${member.user.firstName} ${member.user.lastName ?? ''}`.trim()
                              : member.user?.emailAddress ?? 'Unknown'}
                          </p>
                          {isSelf && (
                            <p className="text-[11px] text-muted-foreground">You</p>
                          )}
                        </div>

                        {/* Remove button */}
                        {!isSelf && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                            disabled={isRemoving}
                            onClick={() =>
                              removeMember.mutate({
                                projectId,
                                memberUserId: member.user?.id ?? '',
                              })
                            }
                          >
                            {isRemoving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserMinus className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No members found.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditProjectDialog
