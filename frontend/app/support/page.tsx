import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function SupportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Support</h1>
        <p className="text-muted-foreground">Need help? Add your support content or contact info here.</p>
      </div>
    </DashboardLayout>
  )
}
