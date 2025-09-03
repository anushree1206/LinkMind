"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MessageCircle, Mail, MoreHorizontal, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { dashboardAPI } from "@/lib/api"
// import { Contact, MessageStats } from "@/types/contact"

interface MessageStats {
  totalMessages: number
  respondedMessages: number
  pendingMessages: number
  hasReplied: boolean
  lastReplyDate: string | null
  lastReplyContent: string | null
  responseRate: number
}

interface Contact {
  _id: string
  fullName: string
  jobTitle: string
  company: string
  relationshipStrength: string
  tags: string[]
  lastInteraction: string
  lastContacted: string
  email?: string
  linkedInUrl?: string
  messageStats?: MessageStats
}

export function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchRecentContacts = async () => {
      try {
        const response = await dashboardAPI.getRecentContacts()
        
        if (response.success) {
          setContacts(response.data.recentContacts)
        } else {
          setError("Failed to load recent contacts")
        }
      } catch (error: any) {
        console.error("Error fetching recent contacts:", error)
        setError(error.message || "Failed to load recent contacts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentContacts()
  }, [])

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "Strong":
        return "bg-primary text-primary-foreground"
      case "Medium":
        return "bg-accent text-accent-foreground"
      case "Weak":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Recent Contacts</CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted border-0"
            autoComplete="off"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-4 w-4 bg-muted rounded"></div>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No contacts found</p>
            <p className="text-sm">Try adjusting your search terms</p>
          </div>
        ) : (
          filteredContacts.map((contact, index) => (
            <motion.div
              key={contact._id || `contact-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg" alt={contact.fullName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {contact.fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{contact.fullName}</h4>
                    <Badge className={`text-xs ${getStrengthColor(contact.relationshipStrength)}`}>
                      {contact.relationshipStrength}
                    </Badge>
                    {/* Reply Status Indicator */}
                    {contact.messageStats && contact.messageStats.totalMessages > 0 && (
                      <div className="flex items-center gap-1">
                        {contact.messageStats.hasReplied ? (
                          <div className="flex items-center gap-1 text-green-600" title={`Last replied: ${contact.messageStats.lastReplyDate ? new Date(contact.messageStats.lastReplyDate).toLocaleDateString() : 'Unknown'}`}>
                            <CheckCircle className="h-3 w-3" />
                            <span className="text-xs">Replied</span>
                          </div>
                        ) : contact.messageStats.pendingMessages > 0 ? (
                          <div className="flex items-center gap-1 text-orange-600" title={`${contact.messageStats.pendingMessages} pending messages`}>
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">Pending</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-500" title="No recent messages">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-xs">No reply</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {contact.jobTitle} at {contact.company}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {contact.tags.slice(0, 2).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {/* Message Stats */}
                    {contact.messageStats && contact.messageStats.totalMessages > 0 && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {contact.messageStats.responseRate}% response rate
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {contact.messageStats?.hasReplied ? 'Last reply' : 'Last contact'}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {contact.messageStats?.hasReplied && contact.messageStats.lastReplyDate 
                      ? new Date(contact.messageStats.lastReplyDate).toLocaleDateString()
                      : contact.lastContacted 
                        ? new Date(contact.lastContacted).toLocaleDateString() 
                        : 'Never'
                    }
                  </p>
                  {contact.messageStats?.hasReplied && contact.messageStats.lastReplyContent && (
                    <p className="text-xs text-muted-foreground italic truncate max-w-32" title={contact.messageStats.lastReplyContent}>
                      "{contact.messageStats.lastReplyContent}"
                    </p>
                  )}
                </div>

                <div className="flex gap-1">
                  {contact.email && (
                    <Button variant="ghost" size="sm" title="Send Email">
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                  {contact.linkedInUrl && (
                    <Button variant="ghost" size="sm" title="Send LinkedIn Message">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
