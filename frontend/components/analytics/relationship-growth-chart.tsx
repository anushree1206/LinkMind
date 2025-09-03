'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Users, MessageSquare, Calendar, Activity } from 'lucide-react';

interface GrowthData {
  date: string;
  contacts: number;
  newContacts: number;
  interactions: number;
  engagementRate: number;
  networkHealth: number;
  relationshipDistribution: {
    strong: number;
    medium: number;
    weak: number;
  };
}

interface GrowthTrends {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalContacts: number;
    totalInteractions: number;
    averageEngagementRate: number;
    networkHealthScore: number;
    growthRate: number;
  };
  dailyData: GrowthData[];
  weeklyData: GrowthData[];
  monthlyData: GrowthData[];
}

export function RelationshipGrowthChart() {
  const [trends, setTrends] = useState<GrowthTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedView, setSelectedView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const fetchGrowthTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Import the analytics API
      const { analyticsAPI } = await import('@/lib/api');
      
      const data = await analyticsAPI.getGrowthTrends(parseInt(selectedPeriod));
      if (data.success) {
        setTrends(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch growth trends');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching growth trends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthTrends();
  }, [selectedPeriod]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTooltipDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (rate < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCurrentData = () => {
    if (!trends) return [];
    
    switch (selectedView) {
      case 'weekly':
        return trends.weeklyData;
      case 'monthly':
        return trends.monthlyData;
      default:
        return trends.dailyData;
    }
  };

  const renderChart = () => {
    const data = getCurrentData();
    
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No data available for the selected period
        </div>
      );
    }

    const ChartComponent = chartType === 'line' ? LineChart : BarChart;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelFormatter={(value) => formatTooltipDate(value)}
            formatter={(value, name) => [
              typeof value === 'number' ? value.toFixed(1) : value,
              name === 'contacts' ? 'Total Contacts' :
              name === 'newContacts' ? 'New Contacts' :
              name === 'interactions' ? 'Interactions' :
              name === 'engagementRate' ? 'Engagement Rate (%)' :
              name === 'networkHealth' ? 'Network Health' : name
            ]}
          />
          <Legend />
          
          {chartType === 'line' ? (
            <>
              <Line 
                type="monotone" 
                dataKey="contacts" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Total Contacts"
              />
              <Line 
                type="monotone" 
                dataKey="newContacts" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="New Contacts"
              />
              <Line 
                type="monotone" 
                dataKey="interactions" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                name="Interactions"
              />
              <Line 
                type="monotone" 
                dataKey="engagementRate" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                name="Engagement Rate (%)"
              />
            </>
          ) : (
            <>
              <Bar dataKey="contacts" fill="#3b82f6" name="Total Contacts" />
              <Bar dataKey="newContacts" fill="#10b981" name="New Contacts" />
              <Bar dataKey="interactions" fill="#f59e0b" name="Interactions" />
              <Bar dataKey="engagementRate" fill="#8b5cf6" name="Engagement Rate (%)" />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Relationship Growth Trends
          </CardTitle>
          <CardDescription>
            Track how your network has evolved over time
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
            <TrendingUp className="h-5 w-5" />
            Relationship Growth Trends
          </CardTitle>
          <CardDescription>
            Track how your network has evolved over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            <div className="text-center">
              <p className="font-medium">Error loading growth trends</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button 
                onClick={fetchGrowthTrends} 
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
              <TrendingUp className="h-5 w-5" />
              Relationship Growth Trends
            </CardTitle>
            <CardDescription>
              Track how your network has evolved over time
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
            
            <Select value={selectedView} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setSelectedView(value)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              Bar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {trends && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Total Contacts
                  </p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {trends.summary.totalContacts}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Total Interactions
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {trends.summary.totalInteractions}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <Activity className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Engagement Rate
                  </p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {trends.summary.averageEngagementRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Growth Rate
                  </p>
                  <div className="flex items-center gap-1">
                    {getGrowthIcon(trends.summary.growthRate)}
                    <span className={`text-lg font-bold ${getGrowthColor(trends.summary.growthRate)}`}>
                      {Math.abs(trends.summary.growthRate).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="border rounded-lg p-4">
              {renderChart()}
            </div>

            {/* Insights */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Key Insights</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {trends.summary.growthRate > 5 && (
                  <p>📈 Your network is growing at a healthy rate of {trends.summary.growthRate.toFixed(1)}%</p>
                )}
                {trends.summary.averageEngagementRate > 50 && (
                  <p>🎯 You have excellent engagement with {trends.summary.averageEngagementRate.toFixed(1)}% of your contacts</p>
                )}
                {trends.summary.totalInteractions > 0 && (
                  <p>💬 You've had {trends.summary.totalInteractions} interactions in the last {selectedPeriod} days</p>
                )}
                {trends.summary.growthRate < 0 && (
                  <p>⚠️ Your network has decreased by {Math.abs(trends.summary.growthRate).toFixed(1)}% - consider reaching out to more contacts</p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
