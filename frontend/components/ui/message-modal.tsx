"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Sparkles } from "lucide-react"
import { interactionAPI } from "@/lib/api"
import { Contact } from "@/types/contact"

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onSendMessage?: (message: string, tone: string) => void
  onGetAISuggestion?: () => void
  onInteractionSent?: () => void
}

const messageTemplates = {
  friendly: {
    subject: "Hope you're doing well!",
    body: "Hi {name},\n\nI hope you're doing well! It's been a while since we last connected, and I was thinking about you. How have things been going at {company}?\n\nWould love to catch up soon!\n\nBest regards",
  },
  professional: {
    subject: "Following up on our connection",
    body: "Dear {name},\n\nI hope this message finds you well. I wanted to reach out and reconnect as it's been some time since our last conversation.\n\nI'd be interested to hear about any recent developments at {company} and explore potential collaboration opportunities.\n\nLooking forward to hearing from you.\n\nBest regards",
  },
  casual: {
    subject: "Long time no talk!",
    body: "Hey {name}!\n\nLong time no talk! How's everything going? I saw some updates about {company} and thought of you.\n\nWe should definitely catch up soon - maybe grab coffee or have a quick call?\n\nTalk soon!",
  },
}

const getAISuggestion = (contact: Contact) => {
  if (contact.jobTitle.toLowerCase().includes('engineer') || contact.jobTitle.toLowerCase().includes('developer')) {
    return "Based on their technical background, consider asking about their latest project or sharing an interesting technical article."
  } else if (contact.jobTitle.toLowerCase().includes('ceo') || contact.jobTitle.toLowerCase().includes('founder')) {
    return "Since they're in a leadership role, they might appreciate insights about industry trends or potential partnership opportunities."
  } else if (contact.jobTitle.toLowerCase().includes('designer') || contact.jobTitle.toLowerCase().includes('creative')) {
    return "As a creative professional, they'd likely enjoy discussing design trends or sharing creative inspiration."
  } else {
    return "Consider reaching out with industry insights or asking about their current projects and challenges."
  }
}

export function MessageModal({ isOpen, onClose, contact, onSendMessage, onGetAISuggestion, onInteractionSent }: MessageModalProps) {
  const [selectedTone, setSelectedTone] = useState<keyof typeof messageTemplates>("friendly")
  const [customMessage, setCustomMessage] = useState("")
  const [showAISuggestion, setShowAISuggestion] = useState(false)
  const [isSending, setIsSending] = useState(false)

  if (!contact) return null

  const handleToneChange = (tone: keyof typeof messageTemplates) => {
    setSelectedTone(tone)
    const template = messageTemplates[tone]
    const personalizedMessage = template.body
      .replace(/{name}/g, contact.fullName.split(" ")[0])
      .replace(/{company}/g, contact.company)
    setCustomMessage(personalizedMessage)
  }

  const handleSend = async () => {
    if (!contact || !customMessage.trim()) return

    setIsSending(true)
    try {
      // Send interaction to backend
      const interactionData = {
        type: "Message",
        content: customMessage,
        outcome: "Positive"
      }

      const response = await interactionAPI.addInteraction(contact._id, interactionData)
      
      if (response.success) {
        // Call the callback if provided
        if (onSendMessage) {
          onSendMessage(customMessage, selectedTone)
        }
        
        // Call interaction sent callback to refresh data
        if (onInteractionSent) {
          onInteractionSent()
        }

        // Close modal and reset state
        onClose()
        setCustomMessage("")
        setShowAISuggestion(false)
      } else {
        console.error("Failed to send interaction:", response.message)
        // You could add a toast notification here
      }
    } catch (error) {
      console.error("Error sending interaction:", error)
      // You could add a toast notification here
    } finally {
      setIsSending(false)
    }
  }

  const handleAISuggestion = () => {
    if (onGetAISuggestion) {
      onGetAISuggestion()
    }
    setShowAISuggestion(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Message to {contact.fullName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">To:</label>
              <p className="text-sm text-muted-foreground">{contact.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Tone:</label>
              <Select
                value={selectedTone}
                onValueChange={handleToneChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Subject:</label>
            <p className="text-sm text-muted-foreground mt-1">{messageTemplates[selectedTone].subject}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Message:</label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={8}
              className="mt-1"
              placeholder="Type your message here..."
            />
          </div>

          {showAISuggestion && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">AI Suggestion:</span>
              </div>
              <p className="text-sm text-foreground">
                {getAISuggestion(contact)}
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleAISuggestion}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Get AI Suggestion
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={isSending || !customMessage.trim()}>
                <Send className="w-4 h-4 mr-2" />
                {isSending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
