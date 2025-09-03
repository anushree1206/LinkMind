'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Target, 
  Activity,
  MessageSquare,
  Calendar,
  RefreshCw,
  Star,
  Award,
  Zap,
  Heart
} from 'lucide-react';

interface NetworkingScoreData {
  overallScore: number;
  maxScore: number;
  scoreCategory: string;
  scoreColor: string;
  components: {
    networkSize: {
      score: number;
      maxScore: number;
      description: string;
      details: string;
    };
    relationshipQuality: {
      score: number;
      maxScore: number;
      description: string;
      details: string;
    };
    activityLevel: {
      score: number;
      maxScore: number;
      description: string;
      details: string;
    };
    consistency: {
      score: number;
      maxScore: number;
      description: string;
      details: string;
    };
    channelDiversity: {
      score: number;
      maxScore: number;
      description: string;
      details: string;
    };
    followUpEffectiveness: {
      score: number;
      maxScore: number;
      description: string;
      details: string;
    };
  };
  recommendations: string[];
  lastCalculated: string;
}

export function NetworkingScore() {
  const [data, setData] = useState<NetworkingScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworkingScore = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Import the analytics API
      const { analyticsAPI } = await import('@/lib/api');
      
      const response = await analyticsAPI.getNetworkingScore();
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch networking score');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching networking score:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkingScore();
  }, []);

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (score >= 80) return <Award className="h-6 w-6 text-blue-500" />;
    if (score >= 60) return <Star className="h-6 w-6 text-green-500" />;
    if (score >= 40) return <TrendingUp className="h-6 w-6 text-amber-500" />;
    return <Target className="h-6 w-6 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-blue-400 to-blue-600';
    if (score >= 40) return 'from-amber-400 to-amber-600';
    return 'from-red-400 to-red-600';
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'networkSize':
        return <Users className="h-4 w-4" />;
      case 'relationshipQuality':
        return <Heart className="h-4 w-4" />;
      case 'activityLevel':
        return <Activity className="h-4 w-4" />;
      case 'consistency':
        return <Calendar className="h-4 w-4" />;
      case 'channelDiversity':
        return <MessageSquare className="h-4 w-4" />;
      case 'followUpEffectiveness':
        return <Target className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Networking Score
          </CardTitle>
          <CardDescription>
            AI assigns a score (0-100) based on activity, diversity of contacts, and consistency
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
            <Trophy className="h-5 w-5" />
            Networking Score
          </CardTitle>
          <CardDescription>
            AI assigns a score (0-100) based on activity, diversity of contacts, and consistency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            <div className="text-center">
              <p className="font-medium">Error loading networking score</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button 
                onClick={fetchNetworkingScore} 
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
              <Trophy className="h-5 w-5" />
              Networking Score
            </CardTitle>
            <CardDescription>
              AI assigns a score (0-100) based on activity, diversity of contacts, and consistency
            </CardDescription>
          </div>
          
          <Button
            onClick={fetchNetworkingScore}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {data && (
          <>
            {/* Main Score Display */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                <div 
                  className="absolute inset-2 rounded-full bg-gradient-to-r"
                  style={{
                    background: `conic-gradient(from 0deg, ${data.scoreColor === 'green' ? '#10b981' : data.scoreColor === 'blue' ? '#3b82f6' : data.scoreColor === 'amber' ? '#f59e0b' : '#ef4444'} ${data.overallScore * 3.6}deg, #e5e7eb 0deg)`
                  }}
                ></div>
                <div className="relative z-10 flex flex-col items-center justify-center w-24 h-24 rounded-full bg-background">
                  {getScoreIcon(data.overallScore)}
                  <span className={`text-2xl font-bold ${getScoreColor(data.overallScore)}`}>
                    {data.overallScore}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{data.scoreCategory}</h3>
                <Badge 
                  variant={data.overallScore >= 80 ? 'default' : data.overallScore >= 60 ? 'secondary' : 'destructive'}
                  className="text-sm"
                >
                  {data.overallScore >= 80 ? 'Excellent Networking' : 
                   data.overallScore >= 60 ? 'Good Networking' : 
                   data.overallScore >= 40 ? 'Fair Networking' : 'Needs Improvement'}
                </Badge>
              </div>
            </div>

            {/* Score Components */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium">Score Breakdown</h4>
              {Object.entries(data.components).map(([key, component]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getComponentIcon(key)}
                      <span className="text-sm font-medium">{component.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{component.score}/{component.maxScore}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round((component.score / component.maxScore) * 100)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(component.score / component.maxScore) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">{component.details}</p>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {data.recommendations.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Recommendations</h4>
                <div className="space-y-3">
                  {data.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Last calculated: {new Date(data.lastCalculated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
