'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Target,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface FollowUpData {
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalFollowUps: number;
    completedFollowUps: number;
    effectiveFollowUps: number;
    overdueFollowUps: number;
    completionRate: number;
    effectivenessRate: number;
  };
  insights: Array<{
    type: string;
    message: string;
    recommendation: string;
  }>;
}

export function FollowUpEffectivenessTracker() {
  const [data, setData] = useState<FollowUpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const fetchFollowUpData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Import the analytics API
      const { analyticsAPI } = await import('@/lib/api');
      
      const response = await analyticsAPI.getFollowUpEffectiveness(parseInt(selectedPeriod));
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch follow-up effectiveness data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching follow-up effectiveness:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUpData();
  }, [selectedPeriod]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'low-completion':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'low-effectiveness':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'overdue-followups':
        return <Clock className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getEffectivenessColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Follow-up Effectiveness Tracker
          </CardTitle>
          <CardDescription>
            Measures how often follow-ups result in responses or further engagement
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
            <Target className="h-5 w-5" />
            Follow-up Effectiveness Tracker
          </CardTitle>
          <CardDescription>
            Measures how often follow-ups result in responses or further engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            <div className="text-center">
              <p className="font-medium">Error loading follow-up data</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button 
                onClick={fetchFollowUpData} 
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
              <Target className="h-5 w-5" />
              Follow-up Effectiveness Tracker
            </CardTitle>
            <CardDescription>
              Measures how often follow-ups result in responses or further engagement
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
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={fetchFollowUpData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {data && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Total Follow-ups
                  </p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {data.metrics.totalFollowUps}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Completed
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {data.metrics.completedFollowUps}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Effective
                  </p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {data.metrics.effectiveFollowUps}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Overdue
                  </p>
                  <p className="text-lg font-bold text-red-900 dark:text-red-100">
                    {data.metrics.overdueFollowUps}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="space-y-6">
              {/* Completion Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Completion Rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getCompletionColor(data.metrics.completionRate)}`}>
                      {data.metrics.completionRate}%
                    </span>
                    <Badge variant={data.metrics.completionRate >= 80 ? 'default' : data.metrics.completionRate >= 60 ? 'secondary' : 'destructive'}>
                      {data.metrics.completionRate >= 80 ? 'Excellent' : data.metrics.completionRate >= 60 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </div>
                <Progress value={data.metrics.completionRate} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {data.metrics.completedFollowUps} of {data.metrics.totalFollowUps} follow-ups completed on time
                </p>
              </div>

              {/* Effectiveness Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">Effectiveness Rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getEffectivenessColor(data.metrics.effectivenessRate)}`}>
                      {data.metrics.effectivenessRate}%
                    </span>
                    <Badge variant={data.metrics.effectivenessRate >= 80 ? 'default' : data.metrics.effectivenessRate >= 60 ? 'secondary' : 'destructive'}>
                      {data.metrics.effectivenessRate >= 80 ? 'Excellent' : data.metrics.effectivenessRate >= 60 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </div>
                <Progress value={data.metrics.effectivenessRate} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {data.metrics.effectiveFollowUps} of {data.metrics.completedFollowUps} completed follow-ups were effective
                </p>
              </div>
            </div>

            {/* Insights */}
            {data.insights.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Follow-up Insights</h4>
                <div className="space-y-3">
                  {data.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{insight.message}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">
                          💡 {insight.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-3">Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Average Completion Time</p>
                  <p className="font-medium">
                    {data.metrics.totalFollowUps > 0 
                      ? `${Math.round(data.metrics.completedFollowUps / data.metrics.totalFollowUps * 100)}% on time`
                      : 'No data'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Success Rate</p>
                  <p className="font-medium">
                    {data.metrics.totalFollowUps > 0 
                      ? `${Math.round(data.metrics.effectiveFollowUps / data.metrics.totalFollowUps * 100)}% effective`
                      : 'No data'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Overdue Rate</p>
                  <p className="font-medium">
                    {data.metrics.totalFollowUps > 0 
                      ? `${Math.round(data.metrics.overdueFollowUps / data.metrics.totalFollowUps * 100)}% overdue`
                      : 'No data'
                    }
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
