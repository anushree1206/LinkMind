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
import { X, Plus, Upload } from "lucide-react"
import { motion } from "framer-motion"
import { contactsAPI } from "@/lib/api"

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

interface AddContactFormProps {
  onClose: () => void
}

export function AddContactForm({ onClose }: AddContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    company: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    notes: "",
    strength: "Medium",
  })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
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
        fullName: formData.name.trim(),
        jobTitle: formData.role.trim() || null,
        company: formData.company.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        linkedInUrl: formData.linkedin.trim() || null,
        relationshipStrength: formData.strength.charAt(0).toUpperCase() + formData.strength.slice(1).toLowerCase(),

        tags: selectedTags,
        location: formData.location.trim() || null,
        notes: formData.notes.trim().split("\n").filter(Boolean)
      }
      
      console.log("📤 Submitting contact data:", contactData)

      const response = await contactsAPI.createContact(contactData)
      
      if (response.success) {
        console.log("Contact created successfully:", response.data.contact)
        // You can add a success notification here
        onClose()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('data-updated'))
        }
      } else {
        console.error("Failed to create contact:", response.message)
        // You can add error handling here
      }
    } catch (error: any) {
      console.error("❌ Full API error object:", error);
      
      let errorMessage = "Failed to create contact. Please try again.";
      
      if (error?.details && Array.isArray(error.details)) {
        console.error("❌ Validation errors:");
        error.details.forEach((detail: any, index: number) => {
          console.error(`  ${index + 1}. ${detail.field || detail.path?.join('.') || '[unknown]'}: ${detail.message}`);
        });
        errorMessage = `Validation failed: ${error.details.map((d: any) => d.message).join(', ')}`;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error?.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (error?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      // Show error to user (you can replace this with a toast notification)
      alert(errorMessage);
      console.error("❌ Error creating contact:", errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto pr-2">
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
          <Button type="button" variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
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
          <Label htmlFor="linkedin">LinkedIn Profile</Label>
          <Input
            id="linkedin"
            name="linkedin"
            value={formData.linkedin}
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
            Add Contact
          </Button>
        </div>
      </motion.form>
    </div>
  )
}
