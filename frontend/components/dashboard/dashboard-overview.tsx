"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, MessageCircle, TrendingUp, Calendar, Linkedin } from "lucide-react"
import { motion } from "framer-motion"
import { dashboardAPI, integrationAPI, contactsAPI } from "@/lib/api"

export function DashboardOverview() {
  const [stats, setStats] = useState([
    {
      title: "Total Contacts",
      value: "0",
      change: "0%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "This Week",
      value: "0",
      change: "0%",
      changeType: "positive" as const,
      icon: MessageCircle,
    },
    {
      title: "Strong Relationships",
      value: "0",
      change: "0%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Pending Follow-ups",
      value: "0",
      change: "0%",
      changeType: "negative" as const,
      icon: Calendar,
    },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)
  const [isUpdatingStrengths, setIsUpdatingStrengths] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    const handler = () => fetchDashboardData()
    window.addEventListener('data-updated', handler)
    return () => window.removeEventListener('data-updated', handler)
  }, [])

  const handleLinkedInSync = async () => {
    setIsSyncing(true)
    try {
      const response = await integrationAPI.syncLinkedIn()
      if (response.success) {
        // Refresh dashboard data after sync
        await fetchDashboardData()
        // You could add a toast notification here
        console.log('LinkedIn sync successful:', response.message)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('data-updated'))
        }
      } else {
        setError('LinkedIn sync failed: ' + response.message)
      }
    } catch (error: any) {
      console.error('LinkedIn sync error:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        details: error.details,
        errorCode: error.errorCode
      })
      setError('LinkedIn sync failed: ' + (error.message || 'Unknown error occurred'))
    } finally {
      setIsSyncing(false)
    }
  }

  const handleUpdateRelationshipStrengths = async () => {
    setIsUpdatingStrengths(true)
    try {
      const response = await contactsAPI.updateRelationshipStrengths()
      if (response.success) {
        // Refresh dashboard data after update
        await fetchDashboardData()
        console.log('Relationship strengths updated:', response.message)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('data-updated'))
        }
      } else {
        setError('Failed to update relationship strengths: ' + response.message)
      }
    } catch (error: any) {
      console.error('Update relationship strengths error:', error)
      setError('Failed to update relationship strengths: ' + error.message)
    } finally {
      setIsUpdatingStrengths(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getOverview()
      
      if (response.success) {
        const data = response.data?.overview ? response.data.overview : response.data

        setStats([
          {
            title: "Total Contacts",
            value: String(data.totalContacts?.count ?? data.totalContacts ?? 0),
            change: `${(data.totalContacts?.change ?? 0) >= 0 ? '+' : ''}${data.totalContacts?.change ?? 0}%`,
            changeType: (data.totalContacts?.change ?? 0) >= 0 ? "positive" : "negative",
            icon: Users,
          },
          {
            title: "This Week",
            value: String(data.weeklyActivity?.count ?? data.weeklyActivity ?? 0),
            change: `${(data.weeklyActivity?.change ?? 0) >= 0 ? '+' : ''}${data.weeklyActivity?.change ?? 0}%`,
            changeType: (data.weeklyActivity?.change ?? 0) >= 0 ? "positive" : "negative",
            icon: MessageCircle,
          },
          {
            title: "Strong Relationships",
            value: String(data.strongRelationships?.count ?? data.strongRelationships ?? 0),
            change: `${(data.strongRelationships?.change ?? 0) >= 0 ? '+' : ''}${data.strongRelationships?.change ?? 0}%`,
            changeType: (data.strongRelationships?.change ?? 0) >= 0 ? "positive" : "negative",
            icon: TrendingUp,
          },
          {
            title: "Pending Follow-ups",
            value: String(data.pendingFollowUps?.count ?? data.pendingFollowUps ?? 0),
            change: `${(data.pendingFollowUps?.change ?? 0) >= 0 ? '+' : ''}${data.pendingFollowUps?.change ?? 0}%`,
            changeType: (data.pendingFollowUps?.change ?? 0) >= 0 ? "positive" : "negative",
            icon: Calendar,
          },
        ])
        
      } else {
        setError("Failed to load dashboard data")
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      setError(error.message || "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your relationships today.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleUpdateRelationshipStrengths}
            disabled={isUpdatingStrengths}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            {isUpdatingStrengths ? "Updating..." : "Update Strengths"}
          </Button>
          <Button
            onClick={handleLinkedInSync}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            <Linkedin className="w-4 h-4" />
            {isSyncing ? "Syncing..." : "Sync LinkedIn"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : stat.value}
                </div>
                <p className={`text-xs ${stat.changeType === "positive" ? "text-primary" : "text-destructive"}`}>
                  {isLoading ? "Loading..." : `${stat.change} from last month`}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
