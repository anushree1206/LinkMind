"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"

const growthData = [
  { month: "Jan", score: 65, connections: 45 },
  { month: "Feb", score: 68, connections: 52 },
  { month: "Mar", score: 72, connections: 58 },
  { month: "Apr", score: 75, connections: 63 },
  { month: "May", score: 78, connections: 67 },
  { month: "Jun", score: 82, connections: 74 },
  { month: "Jul", score: 85, connections: 78 },
  { month: "Aug", score: 83, connections: 76 },
  { month: "Sep", score: 87, connections: 82 },
  { month: "Oct", score: 89, connections: 85 },
  { month: "Nov", score: 92, connections: 89 },
  { month: "Dec", score: 95, connections: 94 },
]

export function RelationshipGrowthChart() {
  const currentScore = growthData[growthData.length - 1].score
  const previousScore = growthData[growthData.length - 2].score
  const growth = currentScore - previousScore
  const isPositive = growth > 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Relationship Growth</CardTitle>
              <CardDescription>Your network strength over time</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {isPositive ? "+" : ""}
                {growth}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              score: {
                label: "Relationship Score",
                color: "#00ff88",
              },
              connections: {
                label: "Active Connections",
                color: "#0099ff",
              },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="connectionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0099ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0099ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} axisLine={false} tickLine={false} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#00ff88"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                  dot={{ fill: "#00ff88", strokeWidth: 2, r: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="connections"
                  stroke="#0099ff"
                  strokeWidth={2}
                  fill="url(#connectionsGradient)"
                  dot={{ fill: "#0099ff", strokeWidth: 2, r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{currentScore}</p>
              <p className="text-xs text-muted-foreground">Current Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">94</p>
              <p className="text-xs text-muted-foreground">Active Connections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">12</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
