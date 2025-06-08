import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/nextauth.config"
import { DashboardLayout } from "@/components/DashboardLayout"
import { FilingForm } from "@/components/FilingForm"
import { Role } from "@prisma/client"

export default async function AdminNewFilingPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== Role.admin) {
    redirect("/auth/admin-login")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Filing (Admin)</h1>
          <p className="text-muted-foreground">Create a new filing as an administrator</p>
        </div>

        <FilingForm isAdmin={true} userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
