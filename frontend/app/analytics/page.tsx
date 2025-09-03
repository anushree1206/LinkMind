import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AnalyticsOverview } from "@/components/analytics/analytics-overview"
import { RelationshipInsights } from "@/components/analytics/relationship-insights"
import { AIRecommendations } from "@/components/analytics/ai-recommendations"
import { NetworkAnalysis } from "@/components/analytics/network-analysis"
import { AtRiskContacts } from "@/components/analytics/at-risk-contacts"
import { RelationshipPieChart } from "@/components/analytics/relationship-pie-chart"
import { RelationshipGrowthChart } from "@/components/analytics/relationship-growth-chart"
import { EngagementQualityBreakdown } from "@/components/analytics/engagement-quality-breakdown"
import { OpportunitySuggestions } from "@/components/analytics/opportunity-suggestions"
import { CommunicationChannelInsights } from "@/components/analytics/communication-channel-insights"
import { FollowUpEffectivenessTracker } from "@/components/analytics/follow-up-effectiveness-tracker"
import { NetworkingScore } from "@/components/analytics/networking-score"
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
            <EngagementQualityBreakdown />
          </ErrorBoundary>

          <ErrorBoundary>
            <OpportunitySuggestions />
          </ErrorBoundary>

          {/* Networking Score - Prominent Display */}
          <ErrorBoundary>
            <NetworkingScore />
          </ErrorBoundary>

          {/* Communication and Follow-up Analysis */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ErrorBoundary>
              <CommunicationChannelInsights />
            </ErrorBoundary>
            <ErrorBoundary>
              <FollowUpEffectivenessTracker />
            </ErrorBoundary>
          </div>

          <ErrorBoundary>
            <AtRiskContacts />
          </ErrorBoundary>

          <ErrorBoundary>
            <RelationshipPieChart />
          </ErrorBoundary>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ErrorBoundary>
                <NetworkAnalysis />
              </ErrorBoundary>
            </div>

            <div className="space-y-6">
              <ErrorBoundary>
                <AIRecommendations />
              </ErrorBoundary>
              <ErrorBoundary>
                <RelationshipInsights />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  )
}
