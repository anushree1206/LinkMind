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
    call: number;
    message: number;
    meeting: number;
    coffee: number;
    lunch: number;
    conference: number;
    referral: number;
    other: number;
  };
  channelPercentages: {
    email: number;
    call: number;
    message: number;
    meeting: number;
    coffee: number;
    lunch: number;
    conference: number;
    referral: number;
    other: number;
  };
  insights: Array<{
    type: string;
    message: string;
    recommendation: string;
  }>;
}

const CHANNEL_COLORS = {
  email: '#3b82f6',      // blue
  call: '#10b981',       // green
  message: '#f59e0b',    // amber
  meeting: '#8b5cf6',    // purple
  coffee: '#ef4444',     // red
  lunch: '#06b6d4',      // cyan
  conference: '#84cc16', // lime
  referral: '#f97316',   // orange
  other: '#6b7280'       // gray
};

const CHANNEL_ICONS = {
  email: Mail,
  call: Phone,
  message: MessageSquare,
  meeting: Calendar,
  coffee: Coffee,
  lunch: Coffee,
  conference: Users,
  referral: TrendingUp,
  other: MessageSquare
};

const CHANNEL_LABELS = {
  email: 'Email',
  call: 'Phone Call',
  message: 'Message',
  meeting: 'Meeting',
  coffee: 'Coffee',
  lunch: 'Lunch',
  conference: 'Conference',
  referral: 'Referral',
  other: 'Other'
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
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Total Interactions
                  </p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {data.totalInteractions}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Phone Calls
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {data.channelBreakdown.call}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <Mail className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Emails
                  </p>
                  <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                    {data.channelBreakdown.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Meetings
                  </p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {data.channelBreakdown.meeting}
                  </p>
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
