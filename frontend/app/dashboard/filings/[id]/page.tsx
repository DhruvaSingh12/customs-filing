import { getServerSession } from "next-auth/next"
import { notFound, redirect } from "next/navigation"
import { authOptions } from "@/lib/nextauth.config"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/DashboardLayout"
import { FilingForm } from "@/components/FilingForm"

interface EditFilingPageProps {
  params: {
    id: string
  }
}

async function getFiling(id: string, userId: string) {
  const filing = await prisma.filing.findUnique({
    where: {
      id,
      createdById: userId,
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

export default async function EditFilingPage({ params }: EditFilingPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const filing = await getFiling(params.id, session.user.id)

  if (!filing) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Filing</h1>
          <p className="text-muted-foreground">Update the details of your filing</p>
        </div>

        <FilingForm filing={filing} userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
