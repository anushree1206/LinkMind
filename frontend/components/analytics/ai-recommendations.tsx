"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, Clock, Users, MessageCircle, Target, Lightbulb } from "lucide-react"
import { motion } from "framer-motion"

const recommendations = [
  {
    id: 1,
    type: "engagement",
    title: "Increase Email Response Rate",
    description:
      "Your email response rate is 12% below average. Try personalizing subject lines and following up within 3 days.",
    impact: "High",
    effort: "Low",
    icon: MessageCircle,
    color: "text-primary",
  },
  {
    id: 2,
    type: "timing",
    title: "Optimize Contact Timing",
    description:
      "Your contacts respond 40% more on Tuesday-Thursday between 10-11 AM. Schedule important outreach accordingly.",
    impact: "Medium",
    effort: "Low",
    icon: Clock,
    color: "text-accent",
  },
  {
    id: 3,
    type: "network",
    title: "Strengthen Weak Connections",
    description: "You have 23 contacts marked as 'Weak' who haven't been contacted in 30+ days. Consider reaching out.",
    impact: "High",
    effort: "Medium",
    icon: Users,
    color: "text-destructive",
  },
  {
    id: 4,
    type: "growth",
    title: "Expand Network in AI Sector",
    description: "Based on your interests, connecting with 5-10 more AI professionals could unlock new opportunities.",
    impact: "Medium",
    effort: "High",
    icon: TrendingUp,
    color: "text-primary",
  },
]

const quickTips = [
  {
    tip: "Send follow-up messages within 24 hours of meetings for 67% better engagement",
    category: "Follow-up",
  },
  {
    tip: "Contacts tagged as 'Mentor' have 3x higher response rates to career-related questions",
    category: "Mentorship",
  },
  {
    tip: "Your strongest relationships come from contacts you interact with at least once every 2 weeks",
    category: "Frequency",
  },
  {
    tip: "Adding personal notes increases relationship strength by an average of 23%",
    category: "Personalization",
  },
]

export function AIRecommendations() {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "bg-destructive text-destructive-foreground"
      case "Medium":
        return "bg-accent text-accent-foreground"
      case "Low":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "High":
        return "bg-destructive/20 text-destructive"
      case "Medium":
        return "bg-accent/20 text-accent"
      case "Low":
        return "bg-primary/20 text-primary"
      default:
        return "bg-muted/20 text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">AI Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-lg bg-card-foreground/10">
                    <rec.icon className={`w-4 h-4 ${rec.color}`} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-foreground text-sm">{rec.title}</h4>
                    <Badge className={`text-xs ${getImpactColor(rec.impact)}`}>{rec.impact} Impact</Badge>
                    <Badge variant="outline" className={`text-xs ${getEffortColor(rec.effort)}`}>
                      {rec.effort} Effort
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{rec.description}</p>
                  <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
                    Apply Suggestion
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            <CardTitle className="text-foreground">Quick Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-3 rounded-lg bg-muted/30 border border-border"
            >
              <div className="flex items-start gap-2">
                <Target className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-foreground leading-relaxed mb-1">{tip.tip}</p>
                  <Badge variant="outline" className="text-xs">
                    {tip.category}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
