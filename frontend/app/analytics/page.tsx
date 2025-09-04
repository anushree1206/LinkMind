import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AnalyticsOverview } from "@/components/analytics/analytics-overview"
import { AIInsights } from "@/components/analytics/ai-insights"
import { RelationshipGrowthChart } from "@/components/analytics/relationship-growth-chart"
import { OpportunitySuggestions } from "@/components/analytics/opportunity-suggestions"
import { NetworkingScore } from "@/components/analytics/networking-score"
import { CommunicationMediumEffectiveness } from "@/components/analytics/communication-medium-effectiveness"
import { CommunicationChannelInsights } from "@/components/analytics/communication-channel-insights"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
              <p className="text-muted-foreground">
                Understand your relationship patterns and get AI-powered recommendations
              </p>
            </div>
          </div>

          <ErrorBoundary>
            <AnalyticsOverview />
          </ErrorBoundary>


          <ErrorBoundary>
            <RelationshipGrowthChart />
          </ErrorBoundary>

          <ErrorBoundary>
            <OpportunitySuggestions />
          </ErrorBoundary>

          {/* Networking Score - Prominent Display */}
          <ErrorBoundary>
            <NetworkingScore />
          </ErrorBoundary>

          {/* Communication Medium Effectiveness Chart */}
          <ErrorBoundary>
            <CommunicationMediumEffectiveness />
          </ErrorBoundary>

          {/* Communication and Follow-up Analysis */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ErrorBoundary>
              <CommunicationChannelInsights />
            </ErrorBoundary>
          </div>

          {/* AI-Powered Insights */}
          <ErrorBoundary>
            <AIInsights className="col-span-full" />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
