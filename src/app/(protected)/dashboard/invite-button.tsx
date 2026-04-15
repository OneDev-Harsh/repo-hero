'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import useProject from '~/hooks/use-project'
import { Copy, Users } from 'lucide-react'

const InviteButton = () => {
  const { projectId } = useProject()
  const [open, setOpen] = useState(false)

  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join/${projectId}`
      : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success('Invite link copied!')
  }

  return (
    <>
      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Invite team members
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Share this link with your teammates to give them access to this project.
          </p>

          {/* Copy box */}
          <div className="flex items-center gap-2 mt-4">
            <Input
              readOnly
              value={inviteLink}
              className="text-sm"
            />

            <Button
              size="icon"
              variant="outline"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* Hint */}
          <p className="text-xs text-muted-foreground mt-2">
            Anyone with this link can join the project.
          </p>

        </DialogContent>
      </Dialog>

      {/* Trigger Button */}
        <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
        >
        <Users className="w-4 h-4" />
        Invite Member
        </Button>
    </>
  )
}

export default InviteButton