"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Network, Building, MapPin, Briefcase } from "lucide-react"
import { motion } from "framer-motion"

const networkStats = [
  {
    category: "Industry",
    data: [
      { name: "Technology", count: 89, percentage: 36 },
      { name: "Finance", count: 45, percentage: 18 },
      { name: "Healthcare", count: 34, percentage: 14 },
      { name: "Education", count: 28, percentage: 11 },
      { name: "Other", count: 51, percentage: 21 },
    ],
    icon: Briefcase,
  },
  {
    category: "Location",
    data: [
      { name: "San Francisco", count: 67, percentage: 27 },
      { name: "New York", count: 54, percentage: 22 },
      { name: "Austin", count: 32, percentage: 13 },
      { name: "Seattle", count: 28, percentage: 11 },
      { name: "Other", count: 66, percentage: 27 },
    ],
    icon: MapPin,
  },
  {
    category: "Company Size",
    data: [
      { name: "Startup (1-50)", count: 78, percentage: 32 },
      { name: "Mid-size (51-500)", count: 89, percentage: 36 },
      { name: "Enterprise (500+)", count: 56, percentage: 23 },
      { name: "Freelance", count: 24, percentage: 9 },
    ],
    icon: Building,
  },
]

const networkGrowth = [
  { month: "Jan", newConnections: 12, totalConnections: 235 },
  { month: "Feb", newConnections: 18, totalConnections: 253 },
  { month: "Mar", newConnections: 15, totalConnections: 268 },
  { month: "Apr", newConnections: 22, totalConnections: 290 },
  { month: "May", newConnections: 19, totalConnections: 309 },
  { month: "Jun", newConnections: 25, totalConnections: 334 },
]

export function NetworkAnalysis() {
  const maxGrowthValue = Math.max(...networkGrowth.map((d) => d.newConnections))

  return (
    <div className="space-y-6">
      {/* Network Growth */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Network Growth</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4 h-32 mb-6">
            {networkGrowth.map((data, index) => (
              <motion.div
                key={data.month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-center justify-end space-y-2"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.newConnections / maxGrowthValue) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                  className="w-full bg-primary rounded-t-sm min-h-[8px] flex items-end justify-center"
                >
                  <span className="text-xs text-primary-foreground font-medium mb-1">{data.newConnections}</span>
                </motion.div>
                <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">25</div>
              <p className="text-xs text-muted-foreground">New this month</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">334</div>
              <p className="text-xs text-muted-foreground">Total connections</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">18.5%</div>
              <p className="text-xs text-muted-foreground">Growth rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
        {networkStats.map((stat, statIndex) => (
          <Card key={stat.category} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm text-foreground">{stat.category}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {stat.data.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: statIndex * 0.2 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{item.count}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.percentage}%
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
