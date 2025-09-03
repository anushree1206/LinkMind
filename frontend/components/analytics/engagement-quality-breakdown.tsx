'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface QualityData {
  date: string;
  strong: number;
  moderate: number;
  weak: number;
  total: number;
  engagementRate: number;
  strongPercentage: number;
}

interface QualityBreakdown {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalContacts: number;
    strongRelationships: number;
    moderateRelationships: number;
    weakRelationships: number;
    averageEngagementRate: number;
    qualityTrend: 'improving' | 'declining' | 'stable';
  };
  dailyData: QualityData[];
  weeklyData: QualityData[];
  monthlyData: QualityData[];
  qualityInsights: Array<{
    type: string;
    title: string;
    message: string;
    recommendation: string;
  }>;
}

const COLORS = {
  strong: '#10b981', // green-500
  moderate: '#f59e0b', // amber-500
  weak: '#ef4444', // red-500
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export function EngagementQualityBreakdown() {
  const [breakdown, setBreakdown] = useState<QualityBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedView, setSelectedView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'stacked' | 'pie' | 'line'>('stacked');

  const fetchQualityBreakdown = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Import the analytics API
      const { analyticsAPI } = await import('@/lib/api');
      
      const data = await analyticsAPI.getEngagementQualityBreakdown(parseInt(selectedPeriod));
      if (data.success) {
        setBreakdown(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch engagement quality breakdown');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching engagement quality breakdown:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityBreakdown();
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'excellent':
      case 'good':
      case 'positive-trend':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'needs-improvement':
      case 'warning-trend':
      case 'low-engagement':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCurrentData = () => {
    if (!breakdown) return [];
    
    switch (selectedView) {
      case 'weekly':
        return breakdown.weeklyData;
      case 'monthly':
        return breakdown.monthlyData;
      default:
        return breakdown.dailyData;
    }
  };

  const getPieData = () => {
    if (!breakdown) return [];
    
    return [
      { name: 'Strong', value: breakdown.summary.strongRelationships, color: COLORS.strong },
      { name: 'Moderate', value: breakdown.summary.moderateRelationships, color: COLORS.moderate },
      { name: 'Weak', value: breakdown.summary.weakRelationships, color: COLORS.weak }
    ].filter(item => item.value > 0);
  };

  const renderChart = () => {
    const dataRaw = getCurrentData();
    const data = (dataRaw || []).map((d: any) => ({
      ...d,
      strong: Number(d?.strong) || 0,
      moderate: Number(d?.moderate) || 0,
      weak: Number(d?.weak) || 0,
    }));
    
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No data available for the selected period
        </div>
      );
    }

    if (chartType === 'pie') {
      const pieData = getPieData();
      if (pieData.length === 0) {
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No relationship data available
          </div>
        );
      }

      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [value, name]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
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
                name === 'strongPercentage' ? 'Strong %' :
                name === 'engagementRate' ? 'Engagement Rate (%)' : name
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="strongPercentage" 
              stroke={COLORS.strong} 
              strokeWidth={2}
              dot={{ fill: COLORS.strong, strokeWidth: 2, r: 4 }}
              name="Strong Relationships %"
            />
            <Line 
              type="monotone" 
              dataKey="engagementRate" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              name="Engagement Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Default stacked bar chart
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
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
              typeof value === 'number' ? value : value,
              name === 'strong' ? 'Strong' :
              name === 'moderate' ? 'Moderate' :
              name === 'weak' ? 'Weak' : name
            ]}
          />
          <Legend />
          <Bar dataKey="strong" stackId="a" fill={COLORS.strong} name="Strong" />
          <Bar dataKey="moderate" stackId="a" fill={COLORS.moderate} name="Moderate" />
          <Bar dataKey="weak" stackId="a" fill={COLORS.weak} name="Weak" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Engagement Quality Breakdown
          </CardTitle>
          <CardDescription>
            Categorize interactions into Strong, Moderate, Weak relationships over time
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
            Engagement Quality Breakdown
          </CardTitle>
          <CardDescription>
            Categorize interactions into Strong, Moderate, Weak relationships over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            <div className="text-center">
              <p className="font-medium">Error loading quality breakdown</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button 
                onClick={fetchQualityBreakdown} 
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
              Engagement Quality Breakdown
            </CardTitle>
            <CardDescription>
              Categorize interactions into Strong, Moderate, Weak relationships over time
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
              variant={chartType === 'stacked' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('stacked')}
            >
              Stacked
            </Button>
            <Button
              variant={chartType === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('pie')}
            >
              Pie
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {breakdown && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Strong
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {breakdown.summary.strongRelationships}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <Users className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Moderate
                  </p>
                  <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                    {breakdown.summary.moderateRelationships}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                <Users className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Weak
                  </p>
                  <p className="text-lg font-bold text-red-900 dark:text-red-100">
                    {breakdown.summary.weakRelationships}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Quality Trend
                  </p>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(breakdown.summary.qualityTrend)}
                    <span className={`text-lg font-bold ${getTrendColor(breakdown.summary.qualityTrend)}`}>
                      {breakdown.summary.qualityTrend}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="border rounded-lg p-4">
              {renderChart()}
            </div>

            {/* Quality Insights */}
            {breakdown.qualityInsights.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Quality Insights</h4>
                <div className="space-y-3">
                  {breakdown.qualityInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{insight.title}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium">
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
