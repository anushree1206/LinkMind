"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { RefreshCw, Mail, MessageCircle, Phone, Users } from "lucide-react"
import { motion } from "framer-motion"
import { analyticsAPI } from "@/lib/api"
import { ReplyIndicatorCard } from "./reply-indicator-card"

interface MediumData {
  medium: string
  interactions: number
  responses: number
  responseRate: number
  effectiveness: number
  icon: string
}

interface ContactMediumData {
  contactId: string
  contactName: string
  mediums: MediumData[]
}

export function CommunicationMediumEffectiveness() {
  const [data, setData] = useState<MediumData[]>([])
  const [contactData, setContactData] = useState<ContactMediumData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overall' | 'contact'>('overall')
  const [selectedContact, setSelectedContact] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState('30')

  const fetchMediumData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsAPI.getCommunicationMediumEffectiveness(
        parseInt(selectedPeriod),
        viewMode,
        selectedContact !== 'all' ? selectedContact : undefined
      )
      
      if (response.success) {
        if (viewMode === 'overall') {
          setData(response.data.overall || [])
        } else {
          setContactData(response.data.byContact || [])
        }
      } else {
        throw new Error(response.message || 'Failed to fetch medium effectiveness data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching medium effectiveness:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMediumData()
  }, [selectedPeriod, viewMode, selectedContact])

  const getMediumIcon = (medium: string) => {
    switch (medium.toLowerCase()) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'linkedin':
        return <MessageCircle className="h-4 w-4" />
      case 'phone':
        return <Phone className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 80) return '#00ff88'
    if (effectiveness >= 60) return '#0099ff'
    if (effectiveness >= 40) return '#ffaa00'
    return '#ff6b6b'
  }

  const currentData = viewMode === 'overall' ? data : 
    selectedContact !== 'all' ? 
      contactData.find(c => c.contactId === selectedContact)?.mediums || [] :
      []

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Communication Medium Effectiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">Communication Medium Effectiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>Error loading data: {error}</p>
            <Button onClick={fetchMediumData} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <ReplyIndicatorCard />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Communication Medium Effectiveness</CardTitle>
              <CardDescription>
                Compare interaction success rates across different communication channels
              </CardDescription>
            </div>
            <Button onClick={fetchMediumData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={(value: 'overall' | 'contact') => setViewMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall</SelectItem>
                <SelectItem value="contact">By Contact</SelectItem>
              </SelectContent>
            </Select>

            {viewMode === 'contact' && (
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts</SelectItem>
                  {contactData.map((contact) => (
                    <SelectItem key={contact.contactId} value={contact.contactId}>
                      {contact.contactName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {currentData.length > 0 ? (
            <>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="medium" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value, name) => [
                        name === 'effectiveness' ? `${value}%` : value,
                        name === 'effectiveness' ? 'Effectiveness Rate' : 
                        name === 'interactions' ? 'Total Interactions' : 'Response Rate'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="interactions" 
                      fill="#0099ff" 
                      name="Interactions"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="responses" 
                      fill="#00ff88" 
                      name="Responses"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="effectiveness" 
                      fill="#ffaa00" 
                      name="Effectiveness %"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentData.map((medium) => (
                  <div key={medium.medium} className="p-4 rounded-lg bg-muted/20 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      {getMediumIcon(medium.medium)}
                      <h4 className="font-semibold text-foreground">{medium.medium}</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interactions:</span>
                        <span className="text-foreground font-medium">{medium.interactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Responses:</span>
                        <span className="text-foreground font-medium">{medium.responses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response Rate:</span>
                        <span className="text-foreground font-medium">{medium.responseRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Effectiveness:</span>
                        <span 
                          className="font-medium"
                          style={{ color: getEffectivenessColor(medium.effectiveness) }}
                        >
                          {medium.effectiveness}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No data available for the selected filters</p>
            </div>
          )}
        </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
