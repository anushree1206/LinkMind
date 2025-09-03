"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { dashboardAPI } from "@/lib/api"

interface RelationshipData {
  name: string
  value: number
  color: string
}

export function RelationshipPieChart() {
  const [relationshipData, setRelationshipData] = useState<RelationshipData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchRelationshipData = async () => {
      try {
        const response = await dashboardAPI.getSummary()
        
        if (response.success) {
          const distribution = response.data.relationshipDistribution
          const data = Object.entries(distribution).map(([strength, count]) => ({
            name: strength,
            value: count as number,
            color: getColorForStrength(strength)
          }))
          setRelationshipData(data)
        } else {
          setError("Failed to load relationship data")
        }
      } catch (error: any) {
        console.error("Error fetching relationship data:", error)
        setError(error.message || "Failed to load relationship data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelationshipData()
  }, [])

  const getColorForStrength = (strength: string) => {
    switch (strength) {
      case "Strong":
        return "#10b981"
      case "Medium":
        return "#3b82f6"
      case "Weak":
        return "#f59e0b"
      case "At-Risk":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const totalContacts = relationshipData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Relationship Distribution</CardTitle>
        <CardDescription className="text-slate-400">Breakdown of your network by relationship strength</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : relationshipData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-slate-400">
            <div className="text-center">
              <p>No relationship data available</p>
              <p className="text-sm">Add some contacts to see the distribution</p>
            </div>
          </div>
        ) : (
          <>
            <ChartContainer
              config={{
                strong: {
                  label: "Strong",
                  color: "#10b981",
                },
                medium: {
                  label: "Medium",
                  color: "#3b82f6",
                },
                weak: {
                  label: "Weak",
                  color: "#f59e0b",
                },
                atRisk: {
                  label: "At Risk",
                  color: "#ef4444",
                },
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
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {relationshipData.map((item) => {
                const percentage = totalContacts > 0 ? Math.round((item.value / totalContacts) * 100) : 0
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-300">{item.name}</span>
                    <span className="text-sm text-slate-400 ml-auto">{percentage}%</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
