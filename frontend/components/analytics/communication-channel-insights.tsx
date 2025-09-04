'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Users, 
  Coffee, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface ChannelData {
  period: {
    start: string;
    end: string;
  };
  totalInteractions: number;
  channelBreakdown: {
    email: number;
    linkedin: number;
  };
  channelPercentages: {
    email: number;
    linkedin: number;
  };
  insights: Array<{
    type: string;
    message: string;
    recommendation: string;
  }>;
}

const CHANNEL_COLORS = {
  email: '#3b82f6',      // blue
  linkedin: '#0a66c2'    // linkedin blue
};

const CHANNEL_ICONS = {
  email: Mail,
  linkedin: (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.413v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065a2.066 2.066 0 1 1 2.063 2.065zm1.782 13.02H3.555V9h3.564v11.453zM22.225 0H1.771C.792 0 0 .775 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .775 23.2 0 22.222 0h.003z" />
    </svg>
  )
};

const CHANNEL_LABELS = {
  email: 'Email',
  linkedin: 'LinkedIn'
};

export function CommunicationChannelInsights() {
  const [data, setData] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const fetchChannelInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Import the analytics API
      const { analyticsAPI } = await import('@/lib/api');
      
      const response = await analyticsAPI.getCommunicationChannelInsights(parseInt(selectedPeriod));
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch communication channel insights');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching communication channel insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannelInsights();
  }, [selectedPeriod]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'primary-channel':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'email-heavy':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'low-calls':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getChannelData = () => {
    if (!data) return [];
    
    return Object.entries(data.channelPercentages)
      .filter(([channel, percentage]) => percentage > 0)
      .map(([channel, percentage]) => ({
        name: CHANNEL_LABELS[channel as keyof typeof CHANNEL_LABELS],
        value: percentage,
        count: data.channelBreakdown[channel as keyof typeof data.channelBreakdown],
        color: CHANNEL_COLORS[channel as keyof typeof CHANNEL_COLORS]
      }))
      .sort((a, b) => b.value - a.value);
  };

  const renderChart = () => {
    const chartData = getChannelData();
    
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No communication data available for the selected period
        </div>
      );
    }

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [
                `${value}% (${props.payload.count} interactions)`,
                name
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // Bar chart
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value, name, props) => [
              `${value}% (${props.payload.count} interactions)`,
              'Percentage'
            ]}
          />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication Channel Insights
          </CardTitle>
          <CardDescription>
            Breakdown of how you interact with people across different channels
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
            <MessageSquare className="h-5 w-5" />
            Communication Channel Insights
          </CardTitle>
          <CardDescription>
            Breakdown of how you interact with people across different channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            <div className="text-center">
              <p className="font-medium">Error loading channel insights</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button 
                onClick={fetchChannelInsights} 
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
              <MessageSquare className="h-5 w-5" />
              Communication Channel Insights
            </CardTitle>
            <CardDescription>
              Breakdown of how you interact with people across different channels
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
              variant={chartType === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('pie')}
            >
              Pie
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
        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Email Interactions
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-50">
                      {data.channelBreakdown.email}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
                  {data.channelPercentages.email}% of total
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 border border-blue-200 dark:border-blue-800/50">
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-white"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.413v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065a2.066 2.066 0 1 1 2.063 2.065zm1.782 13.02H3.555V9h3.564v11.453zM22.225 0H1.771C.792 0 0 .775 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .775 23.2 0 22.222 0h.003z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-white/90">
                      LinkedIn Engagements
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {data.channelBreakdown.linkedin}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-white/90 bg-white/20 px-2 py-1 rounded-full">
                  {data.channelPercentages.linkedin}% of total
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="border rounded-lg p-4">
              {renderChart()}
            </div>

            {/* Channel Breakdown */}
            <div className="mt-6">
              <h4 className="font-medium mb-4">Channel Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getChannelData().map((channel) => {
                  const IconComponent = CHANNEL_ICONS[Object.keys(CHANNEL_LABELS).find(key => 
                    CHANNEL_LABELS[key as keyof typeof CHANNEL_LABELS] === channel.name
                  ) as keyof typeof CHANNEL_ICONS] || MessageSquare;
                  
                  return (
                    <div key={channel.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: channel.color }}
                      />
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{channel.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {channel.value}% • {channel.count} interactions
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insights */}
            {data.insights.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Channel Insights</h4>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
