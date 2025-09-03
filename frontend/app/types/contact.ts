export interface MessageStats {
  totalMessages: number
  respondedMessages: number
  pendingMessages: number
  hasReplied: boolean
  lastReplyDate: string | null
  lastReplyContent: string | null
  responseRate: number
}

export interface Contact {
  _id: string
  fullName: string
  jobTitle: string
  company: string
  email?: string
  phone?: string
  lastContacted: string
  relationshipStrength: string
  tags: string[]
  notes: string[]
  location?: string
  linkedInUrl?: string
  source: string
  createdAt: string
  updatedAt: string
  messageStats?: MessageStats
}

export interface ContactBasic {
  _id: string
  fullName: string
  jobTitle: string
  company: string
  email?: string
  linkedInUrl?: string
  relationshipStrength: string
}
