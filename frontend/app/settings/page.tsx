import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { PrivacySettings } from "@/components/settings/privacy-settings"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Customize your experience and manage your preferences</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ProfileSettings />
          </div>

          <div className="space-y-6">
            <PrivacySettings />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
