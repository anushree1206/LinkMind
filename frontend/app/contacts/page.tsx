import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ContactsManager } from "@/components/contacts/contacts-manager"

export default function ContactsPage() {
  return (
    <DashboardLayout>
      <ContactsManager />
    </DashboardLayout>
  )
}
