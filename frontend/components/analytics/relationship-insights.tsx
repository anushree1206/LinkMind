"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown, Heart, AlertTriangle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

const relationshipUpdates = [
  {
    id: 1,
    contact: {
      name: "Sarah Chen",
      avatar: "/professional-woman-diverse.png",
    },
    type: "improvement",
    change: "+15%",
    description: "Relationship strength increased after recent collaboration",
    timeframe: "This week",
    icon: TrendingUp,
    color: "text-primary",
  },
  {
    id: 2,
    contact: {
      name: "Marcus Johnson",
      avatar: "/professional-man.png",
    },
    type: "decline",
    change: "-8%",
    description: "No contact for 3 weeks, relationship strength declining",
    timeframe: "Past month",
    icon: TrendingDown,
    color: "text-destructive",
  },
  {
    id: 3,
    contact: {
      name: "Emily Rodriguez",
      avatar: "/professional-woman-smiling.png",
    },
    type: "stable",
    change: "Stable",
    description: "Consistent engagement maintaining strong relationship",
    timeframe: "This month",
    icon: CheckCircle,
    color: "text-primary",
  },
  {
    id: 4,
    contact: {
      name: "David Kim",
      avatar: "/professional-asian-man.png",
    },
    type: "attention",
    change: "At Risk",
    description: "Relationship needs attention - consider reaching out",
    timeframe: "2 weeks ago",
    icon: AlertTriangle,
    color: "text-accent",
  },
]

const strengthDistribution = [
  { strength: "Strong", count: 89, percentage: 36, color: "bg-primary" },
  { strength: "Medium", count: 124, percentage: 50, color: "bg-accent" },
  { strength: "Weak", count: 34, percentage: 14, color: "bg-destructive" },
]

export function RelationshipInsights() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "improvement":
        return "bg-primary/20 text-primary"
      case "decline":
        return "bg-destructive/20 text-destructive"
      case "stable":
        return "bg-primary/20 text-primary"
      case "attention":
        return "bg-accent/20 text-accent"
      default:
        return "bg-muted/20 text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Relationship Strength Distribution */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Relationship Distribution</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {strengthDistribution.map((item, index) => (
            <motion.div
              key={item.strength}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{item.strength}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                  <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                  className={`h-full ${item.color} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Relationship Changes */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Changes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {relationshipUpdates.map((update, index) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={update.contact.avatar || "/placeholder.svg"} alt={update.contact.name} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {update.contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground text-sm">{update.contact.name}</h4>
                  <Badge className={`text-xs ${getTypeColor(update.type)}`}>{update.change}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1 leading-relaxed">{update.description}</p>
                <div className="flex items-center gap-2">
                  <update.icon className={`w-3 h-3 ${update.color}`} />
                  <span className="text-xs text-muted-foreground">{update.timeframe}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
