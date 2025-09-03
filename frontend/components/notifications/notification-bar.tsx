"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NotificationBarProps {
  message: string
  ctaLabel?: string
  onCta?: () => void
}

export function NotificationBar({ message, ctaLabel = "View", onCta }: NotificationBarProps) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div className="w-full border-b border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <p className="text-sm text-foreground">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          {onCta && (
            <Button size="sm" variant="outline" onClick={onCta}>
              {ctaLabel}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setVisible(false)} aria-label="Dismiss notification bar">
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
}
