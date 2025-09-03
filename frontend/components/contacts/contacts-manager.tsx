"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader,DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Grid, List, MoreHorizontal, Edit, MessageCircle, Mail, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { AddContactForm } from "./add-contact-form"
import { ContactDetailView } from "./contact-detail-view"
import { EditContactForm } from "./edit-contact-form"
import { InteractionModal } from "@/components/ui/interaction-modal"
import { contactsAPI } from "@/lib/api"
import { Contact, MessageStats } from "../../app/types/contact"
import { ReplyIndicatorCard } from "../analytics/reply-indicator-card"

const allTags = [
  "Work",
  "Friend",
  "Business",
  "Networking",
  "Mentor",
  "Creative",
  "Technical",
  "AI",
  "Startup",
  "Marketing",
  "Design",
  "Backend",
]

export function ContactsManager() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("all")
  const [strengthFilter, setStrengthFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null)
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false)
  const [contactToInteract, setContactToInteract] = useState<Contact | null>(null)
  const [interactionType, setInteractionType] = useState<'Email' | 'LinkedIn'>('Email')

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await contactsAPI.getContacts()
        
        if (response.success) {
          setContacts(response.data.contacts)
        } else {
          setError("Failed to load contacts")
        }
      } catch (error: any) {
        console.error("Error fetching contacts:", error)
        setError(error.message || "Failed to load contacts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchContacts()
  }, [])

  const refreshContacts = async () => {
    try {
      const response = await contactsAPI.getContacts()
      if (response.success) {
        setContacts(response.data.contacts)
      }
    } catch (error) {
      console.error("Error refreshing contacts:", error)
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTag = selectedTag === "all" || contact.tags.includes(selectedTag)
    const matchesStrength = strengthFilter === "all" || contact.relationshipStrength === strengthFilter

    return matchesSearch && matchesTag && matchesStrength
  })

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

  const handleEditContact = (contact: Contact) => {
    setContactToEdit(contact)
    setIsEditDialogOpen(true)
  }

  const handleInteraction = (contact: Contact, type: 'Email' | 'LinkedIn') => {
    setContactToInteract(contact)
    setInteractionType(type)
    setIsInteractionModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Reply Indicator Card */}
      <ReplyIndicatorCard />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">Manage your professional and personal connections</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
    Fill out the form below to create a new contact.
  </DialogDescription>
            </DialogHeader>
            <AddContactForm 
              onClose={() => {
                setIsAddDialogOpen(false)
                refreshContacts()
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
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
            </div>

            <div className="flex gap-4">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={strengthFilter} onValueChange={setStrengthFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by strength" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Strengths</SelectItem>
                  <SelectItem value="Strong">Strong</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Weak">Weak</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading contacts..." : `Showing ${filteredContacts.length} of ${contacts.length} contacts`}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Contacts Grid/List */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-lg border border-border animate-pulse">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No contacts found</h3>
          <p className="text-sm">Try adjusting your search or filters, or add a new contact.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder.svg" alt={contact.fullName} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {contact.fullName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {contact.fullName}
                          </h3>
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
                        <p className="text-sm text-muted-foreground">{contact.jobTitle}</p>
                        <p className="text-sm text-muted-foreground">{contact.company}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStrengthColor(contact.relationshipStrength)}`}>
                      {contact.relationshipStrength}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {contact.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {contact.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{contact.tags.length - 3}
                      </Badge>
                    )}
                    {/* Message Stats */}
                    {contact.messageStats && contact.messageStats.totalMessages > 0 && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {contact.messageStats.responseRate}% response rate
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {contact.messageStats?.hasReplied ? (
                        <div>
                          <span>Last reply: {contact.messageStats.lastReplyDate ? new Date(contact.messageStats.lastReplyDate).toLocaleDateString() : 'Unknown'}</span>
                          {contact.messageStats.lastReplyContent && (
                            <div className="text-xs italic truncate max-w-48" title={contact.messageStats.lastReplyContent}>
                              "{contact.messageStats.lastReplyContent}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>Last contact: {new Date(contact.lastContacted).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {contact.email && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleInteraction(contact, 'Email')}
                          title="Send Email"
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      )}
                      {contact.linkedInUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleInteraction(contact, 'LinkedIn')}
                          title="Send LinkedIn Message"
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEditContact(contact)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer group"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center gap-4">
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
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {contact.fullName}
                      </h4>
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
                      {contact.tags.slice(0, 3).map((tag: string) => (
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

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {contact.messageStats?.hasReplied ? 'Last reply' : 'Last contact'}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {contact.messageStats?.hasReplied && contact.messageStats.lastReplyDate 
                        ? new Date(contact.messageStats.lastReplyDate).toLocaleDateString()
                        : new Date(contact.lastContacted).toLocaleDateString()
                      }
                    </p>
                    {contact.messageStats?.hasReplied && contact.messageStats.lastReplyContent && (
                      <p className="text-xs text-muted-foreground italic truncate max-w-32" title={contact.messageStats.lastReplyContent}>
                        "{contact.messageStats.lastReplyContent}"
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {contact.email && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleInteraction(contact, 'Email')}
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    {contact.linkedInUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleInteraction(contact, 'LinkedIn')}
                        title="Send LinkedIn Message"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleEditContact(contact)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Contact Detail Dialog */}
      {selectedContact && (
        <ContactDetailView
          contact={selectedContact}
          isOpen={!!selectedContact}
          onClose={() => setSelectedContact(null)}
          onEdit={() => {
            handleEditContact(selectedContact)
            setSelectedContact(null)
          }}
        />
      )}

      {/* Edit Contact Dialog */}
      {contactToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
              <DialogDescription>
    Update the information for this contact.
  </DialogDescription>
            </DialogHeader>
            <EditContactForm
              contact={contactToEdit}
              onClose={() => {
                setIsEditDialogOpen(false)
                setContactToEdit(null)
                refreshContacts()
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Interaction Modal */}
      <InteractionModal
        isOpen={isInteractionModalOpen}
        onClose={() => {
          setIsInteractionModalOpen(false)
          setContactToInteract(null)
        }}
        contact={contactToInteract}
        onInteractionSent={refreshContacts}
      />
    </div>
  )
}
