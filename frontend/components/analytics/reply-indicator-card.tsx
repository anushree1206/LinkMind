'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Users, 
  Coffee, 
  Calendar,
  CheckCircle,
  Clock,
  User,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ReplyData {
  contactId: string;
  contactName: string;
  company?: string;
  medium: string;
  repliedAt: string;
  replyContent: string;
  originalMessageType: string;
  responseTime: number; // in hours
}

interface ReplyIndicatorData {
  period: {
    start: string;
    end: string;
  };
  totalReplies: number;
  recentReplies: ReplyData[];
  mediumBreakdown: {
    [key: string]: number;
  };
  averageResponseTime: number;
}

const MEDIUM_ICONS = {
  email: Mail,
  linkedin: MessageSquare,
  phone: Phone,
  meeting: Calendar,
  coffee: Coffee,
  message: MessageSquare,
  other: Users
};

const MEDIUM_COLORS = {
  email: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  linkedin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  phone: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  meeting: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  coffee: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  message: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

export function ReplyIndicatorCard() {
  const [data, setData] = useState<ReplyIndicatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  const fetchReplyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Import the analytics API
      const { analyticsAPI } = await import('@/lib/api');
      
      const response = await analyticsAPI.getReplyIndicators(parseInt(selectedPeriod));
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch reply indicators');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching reply indicators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplyData();
  }, [selectedPeriod]);

  const formatResponseTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      return `${Math.round(hours)}h`;
    } else {
      return `${Math.round(hours / 24)}d`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Reply Indicators
          </CardTitle>
          <CardDescription>
            Track who has replied and through which communication medium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Reply Indicators
          </CardTitle>
          <CardDescription>
            Track who has replied and through which communication medium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-red-500">
            <div className="text-center">
              <p className="font-medium">Error loading reply data</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button 
                onClick={fetchReplyData} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Reply Indicators
              </CardTitle>
              <CardDescription>
                Track who has replied and through which communication medium
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={fetchReplyData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {data && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Total Replies
                    </p>
                    <p className="text-lg font-bold text-green-900 dark:text-green-100">
                      {data.totalReplies}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Avg Response Time
                    </p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {formatResponseTime(data.averageResponseTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Top Medium
                    </p>
                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100 capitalize">
                      {Object.entries(data.mediumBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medium Breakdown */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Replies by Medium</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.mediumBreakdown).map(([medium, count]) => {
                    const IconComponent = MEDIUM_ICONS[medium as keyof typeof MEDIUM_ICONS] || MessageSquare;
                    const colorClass = MEDIUM_COLORS[medium as keyof typeof MEDIUM_COLORS] || MEDIUM_COLORS.other;
                    
                    return (
                      <Badge key={medium} variant="secondary" className={`${colorClass} flex items-center gap-1`}>
                        <IconComponent className="h-3 w-3" />
                        <span className="capitalize">{medium}</span>
                        <span className="ml-1 font-bold">{count}</span>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Recent Replies */}
              <div>
                <h4 className="font-medium mb-3">Recent Replies</h4>
                {data.recentReplies.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {data.recentReplies.map((reply, index) => {
                      const IconComponent = MEDIUM_ICONS[reply.medium as keyof typeof MEDIUM_ICONS] || MessageSquare;
                      const colorClass = MEDIUM_COLORS[reply.medium as keyof typeof MEDIUM_COLORS] || MEDIUM_COLORS.other;
                      
                      return (
                        <motion.div
                          key={`${reply.contactId}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-foreground truncate">
                                {reply.contactName}
                              </p>
                              {reply.company && (
                                <span className="text-xs text-muted-foreground">
                                  at {reply.company}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className={`${colorClass} text-xs flex items-center gap-1`}>
                                <IconComponent className="h-3 w-3" />
                                <span className="capitalize">{reply.medium}</span>
                              </Badge>
                              
                              <span className="text-xs text-muted-foreground">
                                {formatDate(reply.repliedAt)}
                              </span>
                              
                              <span className="text-xs text-muted-foreground">
                                • {formatResponseTime(reply.responseTime)} response
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {reply.replyContent}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No replies in the selected period</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
