"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { motion } from "framer-motion"

const relationshipData = [
  { name: "Strong", value: 45, color: "#00ff88" },
  { name: "Medium", value: 35, color: "#0099ff" },
  { name: "Weak", value: 15, color: "#ff6b6b" },
  { name: "At Risk", value: 5, color: "#ff3366" },
]

export function RelationshipPieChart() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Relationship Distribution</CardTitle>
          <CardDescription>Breakdown of your relationship strengths</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              strong: { label: "Strong", color: "#00ff88" },
              medium: { label: "Medium", color: "#0099ff" },
              weak: { label: "Weak", color: "#ff6b6b" },
              atRisk: { label: "At Risk", color: "#ff3366" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={relationshipData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {relationshipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {relationshipData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
