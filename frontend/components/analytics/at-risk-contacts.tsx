"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, MessageCircle, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { dashboardAPI } from "@/lib/api"
import { InteractionModal } from "@/components/ui/interaction-modal"

interface AtRiskContact {
  _id: string
  fullName: string
  jobTitle: string
  company: string
  email?: string
  linkedInUrl?: string
  lastContacted: string
  relationshipStrength: string
}

export function AtRiskContacts() {
  const [atRiskContacts, setAtRiskContacts] = useState<AtRiskContact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedContact, setSelectedContact] = useState<AtRiskContact | null>(null)
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false)

  useEffect(() => {
    const fetchAtRiskContacts = async () => {
      try {
        const response = await dashboardAPI.getSummary()
        if (response.success) {
          setAtRiskContacts(response.data.top3AtRiskContacts || [])
        } else {
          setError("Failed to load at-risk contacts")
        }
      } catch (error: any) {
        console.error("Error fetching at-risk contacts:", error)
        setError(error.message || "Failed to load at-risk contacts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAtRiskContacts()
  }, [])

  const handleInteraction = (contact: AtRiskContact) => {
    setSelectedContact(contact)
    setIsInteractionModalOpen(true)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "At-Risk":
        return "bg-destructive text-destructive-foreground"
      case "Weak":
        return "bg-yellow-500 text-yellow-50"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatLastContact = (dateString: string) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const refreshContacts = () => {
    // Refresh the contacts list after interaction
    const fetchAtRiskContacts = async () => {
      try {
        const response = await dashboardAPI.getSummary()
        if (response.success) {
          setAtRiskContacts(response.data.top3AtRiskContacts || [])
        }
      } catch (error: any) {
        console.error("Error refreshing at-risk contacts:", error)
      }
    }
    fetchAtRiskContacts()
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            At-Risk Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            At-Risk Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-4">
              {error}
            </div>
          )}

          {atRiskContacts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No At-Risk Contacts</h3>
              <p className="text-muted-foreground">Great job! All your contacts are well-maintained.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {atRiskContacts.map((contact, index) => (
                <motion.div
                  key={contact._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" alt={contact.fullName} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {contact.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">
                          {contact.fullName}
                        </h4>
                        <Badge className={`text-xs ${getRiskColor(contact.relationshipStrength)}`}>
                          {contact.relationshipStrength}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {contact.jobTitle} at {contact.company}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last contact: {formatLastContact(contact.lastContacted)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {contact.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInteraction(contact)}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Email
                      </Button>
                    )}
                    {contact.linkedInUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInteraction(contact)}
                        className="flex items-center gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        LinkedIn
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interaction Modal */}
      <InteractionModal
        isOpen={isInteractionModalOpen}
        onClose={() => {
          setIsInteractionModalOpen(false)
          setSelectedContact(null)
        }}
        contact={selectedContact}
        onInteractionSent={refreshContacts}
      />
    </>
  )
}
