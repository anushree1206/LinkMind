"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Clock, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { dashboardAPI } from "@/lib/api"

interface Insight {
  _id: string
  fullName: string
  company: string
  jobTitle: string
  lastContacted: string
  daysSinceContact: number | null
  relationshipStrength: string
  priority: string
  suggestedActions: string[]
  aiExplanation: string
  riskFactor: number
}

export function AIInsights() {
  const router = useRouter()
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        const response = await dashboardAPI.getAIInsights()
        
        if (response.success) {
          setInsights(response.data.insights)
        } else {
          setError("Failed to load AI insights")
        }
      } catch (error: any) {
        console.error("Error fetching AI insights:", error)
        setError(error.message || "Failed to load AI insights")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAIInsights()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-accent"
      case "low":
        return "text-primary"
      default:
        return "text-muted-foreground"
    }
  }

  const getIconColor = (insight: Insight) => {
    if (insight.riskFactor > 70) return "text-destructive"
    if (insight.riskFactor > 40) return "text-accent"
    return "text-primary"
  }

  const getIcon = (insight: Insight) => {
    if (insight.riskFactor > 70) return AlertCircle
    if (insight.daysSinceContact && insight.daysSinceContact > 30) return Clock
    if (insight.relationshipStrength === "Strong") return CheckCircle
    return TrendingUp
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">AI Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-border animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No AI insights available yet</p>
            <p className="text-sm">Add some contacts to get personalized recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const IconComponent = getIcon(insight)
              return (
                <motion.div
                  key={insight._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" alt={insight.fullName} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {insight.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-card border-2 border-card flex items-center justify-center ${getIconColor(insight)}`}>
                        <IconComponent className="h-2.5 w-2.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground text-sm">
                        {insight.fullName} - {insight.company}
                      </h4>
                      <span className={`text-xs font-medium ${getPriorityColor(insight.priority)}`}>
  {insight.priority?.toString().toUpperCase() || "UNKNOWN"}
</span>

                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {insight.aiExplanation}
                    </p>
                    {insight.daysSinceContact && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Last contacted: {insight.daysSinceContact} days ago
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {insight.suggestedActions.slice(0, 2).map((action, i) => (
                        <Button key={`${insight._id}-action-${i}`} size="sm" variant="outline" className="text-xs h-7 bg-transparent">
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
          </div>
        )}

        <div className="pt-2">
          <Button 
            variant="ghost" 
            className="w-full text-sm text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/analytics')}
          >
            View All Insights
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
