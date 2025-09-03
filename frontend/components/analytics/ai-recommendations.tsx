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
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">AI Recommendations</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-all duration-200 hover:border-primary/20"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <rec.icon className={`w-4 h-4 ${rec.color}`} />
                  </div>
                  <div className="flex gap-1">
                    <Badge className={`text-xs px-1.5 py-0.5 ${getImpactColor(rec.impact)}`}>{rec.impact}</Badge>
                    <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getEffortColor(rec.effort)}`}>
                      {rec.effort}
                    </Badge>
                  </div>
                </div>
                
                <h4 className="font-medium text-foreground text-sm mb-2 leading-tight">{rec.title}</h4>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed flex-1">{rec.description}</p>
                
                <Button size="sm" variant="outline" className="text-xs h-7 w-full bg-transparent hover:bg-primary/10">
                  Apply Suggestion
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Tips Section */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-accent" />
            <h3 className="font-medium text-foreground text-sm">Quick Tips</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {quickTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-3 rounded-lg bg-muted/20 border border-border/30"
              >
                <div className="flex items-start gap-2">
                  <Target className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-foreground leading-relaxed mb-2">{tip.tip}</p>
                    <Badge variant="outline" className="text-xs">
                      {tip.category}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
