"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Brain } from "lucide-react"
import { motion } from "framer-motion"

export function AIPreferences() {
  const [aiSettings, setAiSettings] = useState({
    enableAI: true,
    communicationStyle: "professional",
    suggestionFrequency: "moderate",
    autoSuggestions: true,
    learningMode: true,
    personalizedInsights: true,
    confidenceThreshold: [75],
    analysisDepth: "detailed",
  })

  const handleToggle = (key: keyof typeof aiSettings) => {
    setAiSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Brain className="w-5 h-5 text-primary" />
            AI Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Features */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">AI Features</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-ai" className="text-sm font-medium">
                    Enable AI Assistant
                  </Label>
                  <p className="text-xs text-muted-foreground">Turn on AI-powered insights and suggestions</p>
                </div>
                <Switch id="enable-ai" checked={aiSettings.enableAI} onCheckedChange={() => handleToggle("enableAI")} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-suggestions" className="text-sm font-medium">
                    Auto Suggestions
                  </Label>
                  <p className="text-xs text-muted-foreground">Automatically generate message suggestions</p>
                </div>
                <Switch
                  id="auto-suggestions"
                  checked={aiSettings.autoSuggestions}
                  onCheckedChange={() => handleToggle("autoSuggestions")}
                  disabled={!aiSettings.enableAI}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="learning-mode" className="text-sm font-medium">
                    Learning Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">Allow AI to learn from your communication patterns</p>
                </div>
                <Switch
                  id="learning-mode"
                  checked={aiSettings.learningMode}
                  onCheckedChange={() => handleToggle("learningMode")}
                  disabled={!aiSettings.enableAI}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="personalized-insights" className="text-sm font-medium">
                    Personalized Insights
                  </Label>
                  <p className="text-xs text-muted-foreground">Get insights tailored to your relationship patterns</p>
                </div>
                <Switch
                  id="personalized-insights"
                  checked={aiSettings.personalizedInsights}
                  onCheckedChange={() => handleToggle("personalizedInsights")}
                  disabled={!aiSettings.enableAI}
                />
              </div>
            </div>
          </div>

          {/* Communication Style */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Communication Style</h4>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="communication-style">Default Tone</Label>
                <Select
                  value={aiSettings.communicationStyle}
                  onValueChange={(value) => setAiSettings((prev) => ({ ...prev, communicationStyle: value }))}
                  disabled={!aiSettings.enableAI}
                >
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="suggestion-frequency">Suggestion Frequency</Label>
                <Select
                  value={aiSettings.suggestionFrequency}
                  onValueChange={(value) => setAiSettings((prev) => ({ ...prev, suggestionFrequency: value }))}
                  disabled={!aiSettings.enableAI}
                >
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="frequent">Frequent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Advanced Settings</h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confidence-threshold">
                  AI Confidence Threshold: {aiSettings.confidenceThreshold[0]}%
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Only show suggestions when AI is at least this confident
                </p>
                <Slider
                  id="confidence-threshold"
                  value={aiSettings.confidenceThreshold}
                  onValueChange={(value) => setAiSettings((prev) => ({ ...prev, confidenceThreshold: value }))}
                  max={100}
                  min={50}
                  step={5}
                  className="w-full"
                  disabled={!aiSettings.enableAI}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="analysis-depth">Analysis Depth</Label>
                <Select
                  value={aiSettings.analysisDepth}
                  onValueChange={(value) => setAiSettings((prev) => ({ ...prev, analysisDepth: value }))}
                  disabled={!aiSettings.enableAI}
                >
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
