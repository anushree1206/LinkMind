import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ContactsList } from "@/components/dashboard/contacts-list"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { AtRiskContacts } from "@/components/analytics/at-risk-contacts"
import { RelationshipPieChart } from "@/components/dashboard/relationship-pie-chart"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardOverview />

        <AtRiskContacts />

        <RelationshipPieChart />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ContactsList />
          </div>

          <div className="space-y-6">
            <AIInsights />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
