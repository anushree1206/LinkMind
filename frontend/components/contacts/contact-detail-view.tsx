"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageCircle, Mail, MapPin, Linkedin, Edit, Calendar, TrendingUp, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { Contact } from "@/types/contact"

interface ContactDetailViewProps {
  contact: Contact
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
}

export function ContactDetailView({ contact, isOpen, onClose, onEdit }: ContactDetailViewProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contact Details</DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg" alt={contact.fullName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {contact.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-foreground">{contact.fullName}</h2>
                <Badge className={`${getStrengthColor(contact.relationshipStrength)}`}>{contact.relationshipStrength}</Badge>
              </div>
              <p className="text-lg text-muted-foreground mb-1">{contact.jobTitle}</p>
              <p className="text-muted-foreground mb-3">{contact.company}</p>

              <div className="flex gap-2">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{contact.email}</span>
              </div>
              {contact.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{contact.location}</span>
                </div>
              )}
              {contact.linkedInUrl && (
                <div className="flex items-center gap-3">
                  <Linkedin className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={contact.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    LinkedIn Profile
                </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Relationship Insights */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Relationship Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">Last Contact</span>
                </div>
                <span className="text-muted-foreground">{new Date(contact.lastContacted).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">Relationship Strength</span>
                </div>
                <Badge className={`${getStrengthColor(contact.relationshipStrength)}`}>{contact.relationshipStrength}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">Next Suggested Contact</span>
                </div>
                <span className="text-primary">In 3 days</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                {contact.notes && contact.notes.length > 0 ? contact.notes.join(", ") : "No notes added yet."}
              </p>
            </CardContent>
          </Card>

          {/* Recent Interactions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Recent Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Email conversation</p>
                    <p className="text-xs text-muted-foreground">Discussed project collaboration - 3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
