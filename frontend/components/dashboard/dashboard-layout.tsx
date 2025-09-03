"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Brain, Search, Home, Users, BarChart3, Settings, Bell, Plus, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NotificationBar } from "@/components/notifications/notification-bar"
import { AddContactForm } from "@/components/contacts/add-contact-form"
import { authAPI, dashboardAPI } from "@/lib/api"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<{ id: string | number; title: string; detail: string; time: string }[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [userName, setUserName] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")

  // Auth persistence + initial notifications load
  useEffect(() => {
    const init = async () => {
      try {
        const profileRes = await authAPI.getProfile()
        if (profileRes?.success && profileRes?.data?.user) {
          setUserName(profileRes.data.user.fullName || "User")
          setUserEmail(profileRes.data.user.email || "")
        } else {
          router.push('/login')
          return
        }
      } catch (e) {
        router.push('/login')
        return
      }

      try {
        const notifRes = await dashboardAPI.getNotifications()
        if (notifRes?.success) {
          setUnreadCount(notifRes.data.unreadCount || 0)
          // Map server notifications into UI-friendly list if needed
          const items = (notifRes.data.notifications || []).map((n: any, idx: number) => ({
            id: n.id || idx,
            title: n.title || n.type || 'Notification',
            detail: n.detail || '',
            time: n.time || ''
          }))
          setNotifications(items)
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }

    init()
  }, [router])

  const refreshNotifications = async () => {
    try {
      const notifRes = await dashboardAPI.getNotifications()
      if (notifRes?.success) {
        setUnreadCount(notifRes.data.unreadCount || 0)
        const items = (notifRes.data.notifications || []).map((n: any, idx: number) => ({
          id: n.id || idx,
          title: n.title || n.type || 'Notification',
          detail: n.detail || '',
          time: n.time || ''
        }))
        setNotifications(items)
      }
    } catch (error) {
      console.error('Failed to refresh notifications:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if the API call fails, clear tokens and redirect
      router.push('/login')
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Contacts", href: "/contacts", icon: Users },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            </motion.div>

            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border lg:hidden"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-8 h-8 text-primary" />
                  <span className="text-xl font-bold text-foreground">LinkMind</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <nav className="px-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">LinkMind</span>
          </div>

          <nav className="flex flex-1 flex-col space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-4 h-4" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex-1"></div>

            <div className="flex items-center gap-4">

              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={async () => { await refreshNotifications(); setIsNotifOpen(true) }}
                aria-label="Open notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-h-4 min-w-4 px-1 flex items-center justify-center text-[10px] leading-none bg-primary text-primary-foreground rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/user-avatar.png" alt="User" />
                      <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/support">Support</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>


        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>

        {/* Add Contact Modal */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <AddContactForm onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Notifications Modal */}
        <Dialog open={isNotifOpen} onOpenChange={setIsNotifOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Notifications</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start justify-between rounded-md border border-border p-3 bg-card"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </div>
              ))}
              <div className="pt-2 text-right">
                <Button variant="outline" size="sm" onClick={() => setIsNotifOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
