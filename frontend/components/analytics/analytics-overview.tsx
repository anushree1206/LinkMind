"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, MessageCircle, Calendar, Target } from "lucide-react"
import { motion } from "framer-motion"
import { analyticsAPI } from "@/lib/api"

type ChangeType = "positive" | "negative"

interface StatItem {
  title: string
  value: string
  change: string
  changeType: ChangeType
  icon: any
  description: string
}

export function AnalyticsOverview() {
  const [stats, setStats] = useState<StatItem[]>([
    { title: "Total Interactions", value: "0", change: "+0%", changeType: "positive", icon: MessageCircle, description: "This month" },
    { title: "Active Relationships", value: "0", change: "+0%", changeType: "positive", icon: Users, description: "Strong connections" },
    { title: "Response Rate", value: "0%", change: "+0%", changeType: "positive", icon: Target, description: "Average response" },
    { title: "Follow-up Score", value: "0", change: "+0%", changeType: "positive", icon: Calendar, description: "Consistency rating" },
  ])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSummary = async () => {
    try {
      const res = await analyticsAPI.getAnalyticsSummary()
      if (res?.success && res?.data) {
        const current = res.data.current || {}
        const growth = res.data.growth || {}
        setStats([
          { title: "Total Interactions", value: String(current.totalInteractions ?? 0), change: `${Math.round(growth.interactions ?? 0) >= 0 ? '+' : ''}${Math.round(growth.interactions ?? 0)}%`, changeType: (growth.interactions ?? 0) >= 0 ? "positive" : "negative", icon: MessageCircle, description: "This month" },
          { title: "Active Relationships", value: String(current.totalContacts ?? 0), change: `${Math.round(growth.contacts ?? 0) >= 0 ? '+' : ''}${Math.round(growth.contacts ?? 0)}%`, changeType: (growth.contacts ?? 0) >= 0 ? "positive" : "negative", icon: Users, description: "Strong connections" },
          { title: "Response Rate", value: `${Math.round(current.engagementRate ?? 0)}%`, change: `+0%`, changeType: "positive", icon: Target, description: "Average response" },
          { title: "Network Health", value: String(Math.round(current.networkHealth ?? 0)), change: `${Math.round(growth.engagement ?? 0) >= 0 ? '+' : ''}${Math.round(growth.engagement ?? 0)}%`, changeType: (growth.engagement ?? 0) >= 0 ? "positive" : "negative", icon: Calendar, description: "Health score" },
        ])
      }
    } catch (e) {
      console.error('Analytics summary failed', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
    const handler = () => fetchSummary()
    window.addEventListener('data-updated', handler)
    return () => window.removeEventListener('data-updated', handler)
  }, [])

  return (
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
              <div className="text-2xl font-bold text-foreground">{isLoading ? '...' : stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`flex items-center gap-1 text-xs ${
                    stat.changeType === "positive" ? "text-primary" : "text-destructive"
                  }`}
                >
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
