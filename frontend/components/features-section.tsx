"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, MessageCircle, TrendingUp, Users, Calendar, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Get intelligent recommendations on when and how to reach out to your contacts based on communication patterns and relationship strength.",
    color: "text-primary",
  },
  {
    icon: MessageCircle,
    title: "Communication Analysis",
    description:
      "Analyze tone, sentiment, and engagement levels in your conversations to improve your communication effectiveness.",
    color: "text-accent",
  },
  {
    icon: TrendingUp,
    title: "Relationship Tracking",
    description:
      "Monitor relationship strength over time with visual graphs and receive alerts when connections need attention.",
    color: "text-primary",
  },
  {
    icon: Users,
    title: "Contact Management",
    description:
      "Organize contacts with smart tags, notes, and categories. Never forget important details about your connections.",
    color: "text-accent",
  },
  {
    icon: Calendar,
    title: "Smart Reminders",
    description:
      "Automated reminders to follow up with contacts based on your interaction history and relationship goals.",
    color: "text-primary",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Comprehensive insights into your networking patterns, response rates, and relationship growth metrics.",
    color: "text-accent",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-card/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Powerful Features for Better Relationships
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to build, maintain, and strengthen your personal and professional network with the power
            of AI.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 group h-full">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-card-foreground/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-card-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
