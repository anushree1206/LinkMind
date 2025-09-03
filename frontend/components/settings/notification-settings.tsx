"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell } from "lucide-react"
import { motion } from "framer-motion"

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    weeklyDigest: true,
    aiSuggestions: true,
    contactReminders: true,
    relationshipAlerts: false,
    frequency: "daily",
    quietHours: "22:00-08:00",
  })

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Bell className="w-5 h-5 text-primary" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Notification Types</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-sm font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={() => handleToggle("emailNotifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications" className="text-sm font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Receive push notifications on your device</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.pushNotifications}
                  onCheckedChange={() => handleToggle("pushNotifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="in-app-notifications" className="text-sm font-medium">
                    In-App Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Show notifications within the app</p>
                </div>
                <Switch
                  id="in-app-notifications"
                  checked={notifications.inAppNotifications}
                  onCheckedChange={() => handleToggle("inAppNotifications")}
                />
              </div>
            </div>
          </div>

          {/* Content Preferences */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Content Preferences</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-digest" className="text-sm font-medium">
                    Weekly Digest
                  </Label>
                  <p className="text-xs text-muted-foreground">Weekly summary of your relationship activities</p>
                </div>
                <Switch
                  id="weekly-digest"
                  checked={notifications.weeklyDigest}
                  onCheckedChange={() => handleToggle("weeklyDigest")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-suggestions" className="text-sm font-medium">
                    AI Suggestions
                  </Label>
                  <p className="text-xs text-muted-foreground">AI-powered relationship insights and recommendations</p>
                </div>
                <Switch
                  id="ai-suggestions"
                  checked={notifications.aiSuggestions}
                  onCheckedChange={() => handleToggle("aiSuggestions")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="contact-reminders" className="text-sm font-medium">
                    Contact Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground">Reminders to reach out to contacts</p>
                </div>
                <Switch
                  id="contact-reminders"
                  checked={notifications.contactReminders}
                  onCheckedChange={() => handleToggle("contactReminders")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="relationship-alerts" className="text-sm font-medium">
                    Relationship Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">Alerts when relationships need attention</p>
                </div>
                <Switch
                  id="relationship-alerts"
                  checked={notifications.relationshipAlerts}
                  onCheckedChange={() => handleToggle("relationshipAlerts")}
                />
              </div>
            </div>
          </div>

          {/* Frequency Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Frequency & Timing</h4>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Notification Frequency</Label>
                <Select
                  value={notifications.frequency}
                  onValueChange={(value) => setNotifications((prev) => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiet-hours">Quiet Hours</Label>
                <Select
                  value={notifications.quietHours}
                  onValueChange={(value) => setNotifications((prev) => ({ ...prev, quietHours: value }))}
                >
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No quiet hours</SelectItem>
                    <SelectItem value="22:00-08:00">10 PM - 8 AM</SelectItem>
                    <SelectItem value="23:00-07:00">11 PM - 7 AM</SelectItem>
                    <SelectItem value="00:00-09:00">12 AM - 9 AM</SelectItem>
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
