"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Calendar, MessageCircle, Mail, Video } from "lucide-react"
import { motion } from "framer-motion"

// Mock data for engagement frequency
const engagementData = [
  { month: "Jan", emails: 45, meetings: 8, messages: 23 },
  { month: "Feb", emails: 52, meetings: 10, messages: 28 },
  { month: "Mar", emails: 48, meetings: 12, messages: 31 },
  { month: "Apr", emails: 61, meetings: 15, messages: 35 },
  { month: "May", emails: 58, meetings: 18, messages: 42 },
  { month: "Jun", emails: 67, meetings: 22, messages: 48 },
]

const weeklyData = [
  { day: "Mon", interactions: 12 },
  { day: "Tue", interactions: 18 },
  { day: "Wed", interactions: 25 },
  { day: "Thu", interactions: 22 },
  { day: "Fri", interactions: 28 },
  { day: "Sat", interactions: 8 },
  { day: "Sun", interactions: 5 },
]

const interactionTypes = [
  { type: "Email", count: 156, icon: Mail, color: "bg-primary" },
  { type: "Messages", count: 134, icon: MessageCircle, color: "bg-secondary" },
  { type: "Meetings", count: 45, icon: Video, color: "bg-destructive" },
]

export function EngagementCharts() {
  const maxMonthlyValue = Math.max(...engagementData.flatMap((d) => [d.emails, d.meetings, d.messages]))
  const maxWeeklyValue = Math.max(...weeklyData.map((d) => d.interactions))

  return (
    <div className="space-y-6">
      {/* Monthly Engagement Trends */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Monthly Engagement Trends</CardTitle>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Emails</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-muted-foreground">Meetings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Messages</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4 h-64">
            {engagementData.map((data, index) => (
              <motion.div
                key={data.month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-center justify-end space-y-1"
              >
                <div className="flex flex-col items-center justify-end h-full w-full space-y-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.emails / maxMonthlyValue) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                    className="w-full bg-primary rounded-t-sm min-h-[4px]"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.meetings / maxMonthlyValue) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
                    className="w-full bg-secondary min-h-[4px]"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.messages / maxMonthlyValue) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.5 }}
                    className="w-full bg-destructive rounded-b-sm min-h-[4px]"
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Pattern */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              <CardTitle className="text-foreground">Weekly Activity Pattern</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((data, index) => (
                <motion.div
                  key={data.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm font-medium text-foreground w-8">{data.day}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(data.interactions / maxWeeklyValue) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{data.interactions}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interaction Types Breakdown */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Interaction Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interactionTypes.map((type, index) => (
                <motion.div
                  key={type.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <type.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-foreground">{type.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">{type.count}</div>
                    <div className="text-xs text-muted-foreground">this month</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
