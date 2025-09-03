"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Download, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

export function PrivacySettings() {
  const [privacy, setPrivacy] = useState({
    dataCollection: true,
    analyticsTracking: false,
    thirdPartySharing: false,
    profileVisibility: "private",
    contactSharing: false,
    aiDataUsage: true,
    dataRetention: "2years",
    exportData: true,
  })

  const handleToggle = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Collection */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Data Collection</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-collection" className="text-sm font-medium">
                    Allow Data Collection
                  </Label>
                  <p className="text-xs text-muted-foreground">Collect usage data to improve your experience</p>
                </div>
                <Switch
                  id="data-collection"
                  checked={privacy.dataCollection}
                  onCheckedChange={() => handleToggle("dataCollection")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics-tracking" className="text-sm font-medium">
                    Analytics Tracking
                  </Label>
                  <p className="text-xs text-muted-foreground">Track app usage for analytics purposes</p>
                </div>
                <Switch
                  id="analytics-tracking"
                  checked={privacy.analyticsTracking}
                  onCheckedChange={() => handleToggle("analyticsTracking")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-data-usage" className="text-sm font-medium">
                    AI Data Usage
                  </Label>
                  <p className="text-xs text-muted-foreground">Allow AI to analyze your data for insights</p>
                </div>
                <Switch
                  id="ai-data-usage"
                  checked={privacy.aiDataUsage}
                  onCheckedChange={() => handleToggle("aiDataUsage")}
                />
              </div>
            </div>
          </div>

          {/* Sharing Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Sharing & Visibility</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="third-party-sharing" className="text-sm font-medium">
                    Third-Party Sharing
                  </Label>
                  <p className="text-xs text-muted-foreground">Share data with trusted third-party services</p>
                </div>
                <Switch
                  id="third-party-sharing"
                  checked={privacy.thirdPartySharing}
                  onCheckedChange={() => handleToggle("thirdPartySharing")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="contact-sharing" className="text-sm font-medium">
                    Contact Sharing
                  </Label>
                  <p className="text-xs text-muted-foreground">Allow contacts to find you through mutual connections</p>
                </div>
                <Switch
                  id="contact-sharing"
                  checked={privacy.contactSharing}
                  onCheckedChange={() => handleToggle("contactSharing")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <Select
                  value={privacy.profileVisibility}
                  onValueChange={(value) => setPrivacy((prev) => ({ ...prev, profileVisibility: value }))}
                >
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="contacts">Contacts Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Data Management</h4>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention Period</Label>
                <Select
                  value={privacy.dataRetention}
                  onValueChange={(value) => setPrivacy((prev) => ({ ...prev, dataRetention: value }))}
                >
                  <SelectTrigger className="bg-muted border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2years">2 Years</SelectItem>
                    <SelectItem value="5years">5 Years</SelectItem>
                    <SelectItem value="indefinite">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              We take your privacy seriously. Your data is encrypted and stored securely. You can review our full
              privacy policy and terms of service at any time.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
