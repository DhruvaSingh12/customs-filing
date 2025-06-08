import { getServerSession } from "next-auth/next"
import { notFound, redirect } from "next/navigation"
import { authOptions } from "@/lib/nextauth.config"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/DashboardLayout"
import { FilingForm } from "@/components/FilingForm"
enum Role {
  admin = "admin",
  user = "user",
}

interface AdminEditFilingPageProps {
  params: Promise<{ id: string }>;
}


async function getFiling(id: string) {
  const filing = await prisma.filing.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
    },
  })

  if (!filing) {
    return null
  }

  return filing
}

export default async function AdminEditFilingPage({ params }: AdminEditFilingPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== Role.admin) {
    redirect("/auth/admin-login")
  }

  const filing = await getFiling((await params).id)

  if (!filing) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Filing (Admin)</h1>
          <p className="text-muted-foreground">Update the details of this filing</p>
        </div>

        <FilingForm filing={filing} isAdmin={true} userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
