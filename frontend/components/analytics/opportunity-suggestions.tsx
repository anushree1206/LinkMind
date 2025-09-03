'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  ArrowRight,
  RefreshCw,
  Calendar,
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react';

interface OpportunitySuggestion {
  id: string;
  contactName: string;
  company: string;
  jobTitle: string;
  type: string;
  priority: number;
  message: string;
  action: string;
  reason: string;
  daysSinceLastContact: number;
  relationshipStrength: string;
  totalInteractions: number;
  recentInteractions: number;
  urgency: 'high' | 'medium' | 'low';
  suggestedDate: string;
}

interface OpportunityData {
  suggestions: OpportunitySuggestion[];
  insights: {
    totalContacts: number;
    atRiskContacts: number;
    highValueContacts: number;
    lastAnalyzed: string | null;
    suggestionsGenerated: number;
    averagePriority: number;
  };
}

export function OpportunitySuggestions() {
  const [data, setData] = useState<OpportunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOpportunitySuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Import the analytics API
      const { analyticsAPI } = await import('@/lib/api');
      
      const response = await analyticsAPI.getOpportunitySuggestions(5);
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch opportunity suggestions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching opportunity suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSuggestions = async () => {
    setRefreshing(true);
    await fetchOpportunitySuggestions();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOpportunitySuggestions();
  }, []);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'high-value-at-risk':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'strengthen-relationship':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'reconnect':
        return <Users className="h-5 w-5 text-amber-500" />;
      case 'nurture-new-contact':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'maintain-strong-relationship':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'opportunity-potential':
        return <Lightbulb className="h-5 w-5 text-orange-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRelationshipStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Strong':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'Weak':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.toLowerCase().includes('call') || action.toLowerCase().includes('meeting')) {
      return <Phone className="h-4 w-4" />;
    } else if (action.toLowerCase().includes('message') || action.toLowerCase().includes('email')) {
      return <Mail className="h-4 w-4" />;
    } else {
      return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatSuggestedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Powered Opportunity Suggestions
          </CardTitle>
          <CardDescription>
            AI analyzes patterns and suggests actionable steps to improve your networking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Powered Opportunity Suggestions
          </CardTitle>
          <CardDescription>
            AI analyzes patterns and suggests actionable steps to improve your networking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            <div className="text-center">
              <p className="font-medium">Error loading suggestions</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button 
                onClick={fetchOpportunitySuggestions} 
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI-Powered Opportunity Suggestions
            </CardTitle>
            <CardDescription>
              AI analyzes patterns and suggests actionable steps to improve your networking
            </CardDescription>
          </div>
          
          <Button
            onClick={refreshSuggestions}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {data && (
          <>
            {/* Insights Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Total Contacts
                  </p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {data.insights.totalContacts}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    At Risk
                  </p>
                  <p className="text-lg font-bold text-red-900 dark:text-red-100">
                    {data.insights.atRiskContacts}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    High Value
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {data.insights.highValueContacts}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <Target className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Suggestions
                  </p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {data.insights.suggestionsGenerated}
                  </p>
                </div>
              </div>
            </div>

            {/* Suggestions List */}
            {data.suggestions.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Prioritized Actions</h4>
                {data.suggestions.map((suggestion, index) => (
                  <div 
                    key={suggestion.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getSuggestionIcon(suggestion.type)}
                        <div>
                          <h5 className="font-medium text-base">{suggestion.contactName}</h5>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.jobTitle} at {suggestion.company}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getUrgencyColor(suggestion.urgency)}>
                          {suggestion.urgency.toUpperCase()}
                        </Badge>
                        <Badge className={getRelationshipStrengthColor(suggestion.relationshipStrength)}>
                          {suggestion.relationshipStrength}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {suggestion.message}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.reason}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getActionIcon(suggestion.action)}
                          <span>{suggestion.action}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Last contact: {suggestion.daysSinceLastContact} days ago</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Suggested: {formatSuggestedDate(suggestion.suggestedDate)}</span>
                        </div>
                      </div>
                      
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        Take Action
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium text-lg mb-2">No Suggestions Available</h4>
                <p className="text-muted-foreground">
                  Your network is in great shape! Keep up the good work maintaining your relationships.
                </p>
              </div>
            )}

            {/* Last Analyzed */}
            {data.insights.lastAnalyzed && (
              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Last analyzed: {new Date(data.insights.lastAnalyzed).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
