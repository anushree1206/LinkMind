"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface Tip {
  tip: string
  category: string
}

interface AIInsightsProps {
  className?: string
}

export function AIInsights({ className = "" }: AIInsightsProps) {
  const [tips, setTips] = useState<Tip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'best practice':
        return 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 border-blue-200 dark:border-blue-800/50';
      case 'engagement':
        return 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200 border-green-200 dark:border-green-800/50';
      case 'networking':
        return 'bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200 border-purple-200 dark:border-purple-800/50';
      default:
        return 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800/50';
    }
  };

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await fetch('/api/insights', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.tips && Array.isArray(data.tips)) {
          setTips(data.tips);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching AI insights:', err);
        setError('Failed to load insights. Using sample data.');
        // Fallback sample data
        setTips([
          { tip: "Regular check-ins help maintain strong relationships.", category: "Best Practice" },
          { tip: "Try to respond to messages within 24 hours.", category: "Engagement" },
          { tip: "Connect with mutual contacts to expand your network.", category: "Networking" }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTips();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getCategoryColor(tip.category)}`}
            >
              <p className="font-medium mb-2">{tip.tip}</p>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50 dark:bg-black/20">
                {tip.category}
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
