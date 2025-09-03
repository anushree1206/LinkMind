import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">This is a placeholder profile page. You can customize it later.</p>
      </div>
    </DashboardLayout>
  )
}
