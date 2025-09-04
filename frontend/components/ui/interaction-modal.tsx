"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Sparkles, Mail, Linkedin } from "lucide-react"
import { integrationAPI, interactionAPI, messageAPI } from "@/lib/api"
import { ContactBasic } from "@/app/types/contact"

interface AISuggestion {
  suggestion: string
  context: string
  lastContact: string
  contactName: string
  company: string
  jobTitle: string
}

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
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null)
  const [showAISuggestion, setShowAISuggestion] = useState(false)

  useEffect(() => {
    if (isOpen && contact) {
      setMessage("")
      setAiSuggestion(null)
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
    setShowAISuggestion(false)
    try {
      const response = await integrationAPI.getAISuggestion(contact._id, interactionType)
      if (response.success && response.data) {
        setAiSuggestion({
          suggestion: response.data.suggestion,
          context: response.data.context || 'previous interactions',
          lastContact: response.data.lastContact || 'Never',
          contactName: response.data.contactName || contact.fullName,
          company: response.data.company || contact.company || '',
          jobTitle: response.data.jobTitle || contact.jobTitle || ''
        })
        setShowAISuggestion(true)
      }
    } catch (error) {
      console.error('Failed to get AI suggestion:', error)
      // Show error to user
      alert('Failed to generate AI suggestion. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseAISuggestion = () => {
    if (aiSuggestion?.suggestion) {
      setMessage(aiSuggestion.suggestion)
      setShowAISuggestion(false)
    }
  }

  const handleSend = async () => {
    if (!contact || !message.trim()) return;

    setIsLoading(true);
    try {
      // Prepare message data for the message API
      const messageData = {
        content: message.trim(),
        type: interactionType,
        subject: `Message from LinkMind - ${interactionType}`,
        priority: 'Medium',
        ...(interactionType === 'LinkedIn' && contact.linkedInUrl && {
          linkedInUrl: contact.linkedInUrl
        })
      };

      console.log('Sending message with data:', { contactId: contact._id, ...messageData });
      
      // For LinkedIn messages, we'll only save them as messages (not interactions)
      const response = await messageAPI.sendMessage(contact._id, messageData);
      
      if (response.success) {
        // Only create an interaction for non-LinkedIn messages
        if (interactionType !== 'LinkedIn') {
          const interactionData = {
            type: interactionType,
            content: message.trim().substring(0, 2000),
            outcome: 'Positive'
          };
          
          try {
            await interactionAPI.addInteraction(contact._id, interactionData);
          } catch (error) {
            console.warn('Message sent but interaction logging failed:', error);
          }
        }

        // Call the callback to refresh data
        if (onInteractionSent) {
          onInteractionSent();
        }

        // Close modal and reset state
        onClose();
        setMessage("");
        setAiSuggestion(null);
        setShowAISuggestion(false);
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('data-updated'));
        }
      } else {
        console.error("Failed to send message:", response.message);
        alert(`Failed to send ${interactionType} message. Please try again.`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
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
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGetAISuggestion}
              disabled={isLoading}
              className="w-full flex items-center gap-2 justify-center"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Analyzing conversation...' : 'Get AI-Powered Suggestion'}
            </Button>

            {showAISuggestion && (
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">AI Suggestion</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Based on {aiSuggestion?.context || 'previous interactions'}
                    </span>
                  </div>
                  {aiSuggestion?.lastContact && (
                    <span className="text-xs text-muted-foreground">
                      Last contact: {aiSuggestion.lastContact}
                    </span>
                  )}
                </div>
                
                <div className="bg-background p-3 rounded border border-border mb-3">
                  <p className="text-sm whitespace-pre-line">{aiSuggestion?.suggestion}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUseAISuggestion}
                    className="text-xs"
                  >
                    Use This Suggestion
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAISuggestion(false)}
                    className="text-xs text-muted-foreground"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </div>

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
