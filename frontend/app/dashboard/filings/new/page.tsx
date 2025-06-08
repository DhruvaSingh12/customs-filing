import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/nextauth.config"
import { DashboardLayout } from "@/components/DashboardLayout"
import { FilingForm } from "@/components/FilingForm"

export default async function NewFilingPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Filing</h1>
          <p className="text-muted-foreground">Create a new filing by filling out the form below</p>
        </div>

        <FilingForm userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
