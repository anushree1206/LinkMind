"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Sparkles, Mail, Linkedin } from "lucide-react"
import { integrationAPI, interactionAPI, messageAPI } from "@/lib/api"
import { ContactBasic } from "@/app/types/contact"

interface InteractionModalProps {
  isOpen: boolean
  onClose: () => void
  contact: ContactBasic | null
  onInteractionSent?: () => void
}

export function InteractionModal({ isOpen, onClose, contact, onInteractionSent }: InteractionModalProps) {
  const [interactionType, setInteractionType] = useState<'Email' | 'LinkedIn'>('Email')
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [showAISuggestion, setShowAISuggestion] = useState(false)

  useEffect(() => {
    if (isOpen && contact) {
      setMessage("")
      setAiSuggestion("")
      setShowAISuggestion(false)
      
      // Auto-select the best available option
      if (contact.email && contact.linkedInUrl) {
        setInteractionType('Email') // Default to email if both available
      } else if (contact.email) {
        setInteractionType('Email')
      } else if (contact.linkedInUrl) {
        setInteractionType('LinkedIn')
      } else {
        setInteractionType('Email') // Default fallback
      }
    }
  }, [isOpen, contact])

  const handleGetAISuggestion = async () => {
    if (!contact) return
    
    setIsLoading(true)
    try {
      const response = await integrationAPI.getAISuggestion(contact._id, interactionType)
      if (response.success) {
        setAiSuggestion(response.data.suggestion)
        setShowAISuggestion(true)
      }
    } catch (error) {
      console.error('Failed to get AI suggestion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseAISuggestion = () => {
    if (aiSuggestion) {
      setMessage(aiSuggestion)
    }
  }

  const handleSend = async () => {
    if (!contact || !message.trim()) return

    setIsLoading(true)
    try {
      // Send message using the message API
      const messageData = {
        content: message,
        type: interactionType,
        subject: `Message from LinkMind - ${interactionType}`,
        priority: 'Medium'
      }

      const response = await messageAPI.sendMessage(contact._id, messageData)
      
      if (response.success) {
        // Also add as interaction for tracking
        const interactionData = {
          type: interactionType,
          content: message.trim(),
          outcome: "Positive"
        }
        await interactionAPI.addInteraction(contact._id, interactionData)

        // Call the callback to refresh data
        if (onInteractionSent) {
          onInteractionSent()
        }

        // Close modal and reset state
        onClose()
        setMessage("")
        setAiSuggestion("")
        setShowAISuggestion(false)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('data-updated'))
        }
      } else {
        console.error("Failed to send message:", response.message)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!contact) return null

  const canSendEmail = contact.email && interactionType === 'Email'
  const canSendLinkedIn = contact.linkedInUrl && interactionType === 'LinkedIn'
  const canSendAnyway = interactionType === 'Email' || interactionType === 'LinkedIn' // Allow sending even without contact info

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send {interactionType} to {contact.fullName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Send Method Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Send via:</label>
            <div className="flex gap-2">
              <Button
                variant={interactionType === 'Email' ? 'default' : 'outline'}
                onClick={() => setInteractionType('Email')}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email {!contact.email && '(No email)'}
              </Button>
              <Button
                variant={interactionType === 'LinkedIn' ? 'default' : 'outline'}
                onClick={() => setInteractionType('LinkedIn')}
                className="flex items-center gap-2"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn {!contact.linkedInUrl && '(No URL)'}
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-foreground">To:</label>
              <p className="text-sm text-muted-foreground">
                {interactionType === 'Email' ? contact.email || 'No email available' : contact.linkedInUrl || 'No LinkedIn URL available'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Company:</label>
              <p className="text-sm text-muted-foreground">{contact.company}</p>
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="text-sm font-medium text-foreground">Message:</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="mt-1"
              placeholder={`Type your ${interactionType.toLowerCase()} message here...`}
            />
          </div>

          {/* AI Suggestion */}
          {showAISuggestion && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">AI Suggestion:</span>
              </div>
              <p className="text-sm text-foreground mb-3">{aiSuggestion}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseAISuggestion}
                className="text-xs"
              >
                Use This Suggestion
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleGetAISuggestion}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Get AI Suggestion
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !message.trim()}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? "Sending..." : `Send via ${interactionType}`}
              </Button>
            </div>
          </div>

          {/* Validation Messages */}
          {interactionType === 'Email' && !contact.email && (
            <p className="text-sm text-destructive">
              ⚠️ This contact doesn't have an email address. Please select LinkedIn or add an email address.
            </p>
          )}
          {interactionType === 'LinkedIn' && !contact.linkedInUrl && (
            <p className="text-sm text-destructive">
              ⚠️ This contact doesn't have a LinkedIn URL. Please select Email or add a LinkedIn URL.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
