"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Upload, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { contactsAPI } from "@/lib/api"
import { Contact } from "@/types/contact"

const availableTags = [
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



interface EditContactFormProps {
  contact: Contact
  onClose: () => void
}

export function EditContactForm({ contact, onClose }: EditContactFormProps) {
  const [formData, setFormData] = useState({
    name: contact.fullName,
    role: contact.jobTitle,
    company: contact.company,
    email: contact.email,
    phone: contact.phone || "",
    location: contact.location || "",
    linkedInUrl: contact.linkedInUrl || "",
    notes: contact.notes && contact.notes.length > 0 ? contact.notes.join(", ") : "",
    strength: contact.relationshipStrength,
  })
  const [selectedTags, setSelectedTags] = useState<string[]>(contact.tags)
  const [customTag, setCustomTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag])
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const addCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim())
      setCustomTag("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare contact data for API
      const contactData = {
        fullName: formData.name,
        jobTitle: formData.role,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        linkedInUrl: formData.linkedInUrl,
        relationshipStrength: formData.strength,
        tags: selectedTags,
        location: formData.location,
        notes: formData.notes ? [formData.notes] : []
      }

      const response = await contactsAPI.updateContact(contact._id, contactData)
      
      if (response.success) {
        console.log("Contact updated successfully:", response.data.contact)
        // You can add a success notification here
        onClose()
      } else {
        console.error("Failed to update contact:", response.message)
        // You can add error handling here
      }
    } catch (error: any) {
      console.error("Error updating contact:", error)
      // You can add error handling here
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this contact?")) {
      setIsLoading(true)
      
      try {
        const response = await contactsAPI.deleteContact(contact._id)
        
        if (response.success) {
          console.log("Contact deleted successfully")
          // You can add a success notification here
          onClose()
        } else {
          console.error("Failed to delete contact:", response.message)
          // You can add error handling here
        }
      } catch (error: any) {
        console.error("Error deleting contact:", error)
        // You can add error handling here
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Avatar Upload */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src="/placeholder.svg" alt="Contact" />
          <AvatarFallback className="bg-muted text-muted-foreground text-lg">
            {formData.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Change Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive bg-transparent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Contact
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            required
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role/Title</Label>
          <Input
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            placeholder="e.g., Product Manager"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            placeholder="Company name"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="City, State/Country"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="email@example.com"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedInUrl">LinkedIn Profile</Label>
        <Input
          id="linkedInUrl"
          name="linkedInUrl"
          value={formData.linkedInUrl}
          onChange={handleInputChange}
          placeholder="https://linkedin.com/in/username"
          autoComplete="off"
        />
      </div>

      {/* Relationship Strength */}
      <div className="space-y-2">
        <Label>Relationship Strength</Label>
        <Select
          value={formData.strength}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, strength: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Strong">Strong</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Weak">Weak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <Label>Tags</Label>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Available Tags */}
        <div className="flex flex-wrap gap-2">
          {availableTags
            .filter((tag) => !selectedTags.includes(tag))
            .map((tag) => (
              <Button
                key={tag}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(tag)}
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                {tag}
              </Button>
            ))}
        </div>

        {/* Custom Tag Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom tag"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
            className="flex-1"
            autoComplete="off"
          />
          <Button type="button" onClick={addCustomTag} size="sm">
            Add
          </Button>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Add notes about this contact, how you met, shared interests, etc."
          rows={4}
          autoComplete="off"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
            />
          ) : null}
          Save Changes
        </Button>
      </div>
    </motion.form>
  )
}
