import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/nextauth.config"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/DashboardLayout"
import { DashboardTable } from "@/components/DashboardTable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Role } from "@prisma/client"

async function getUserFilings(userId: string) {
  return await prisma.filing.findMany({
    where: {
      createdById: userId,
    },
    include: {
      items: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role === Role.admin) {
    redirect("/admin")
  }

  const filings = await getUserFilings(session.user.id)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.name || session.user.email}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Filings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filings.length}</div>
              <p className="text-xs text-muted-foreground">
                {filings.filter((f) => f.status === "submitted").length} submitted
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Filings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filings.filter((f) => f.status === "draft").length}</div>
              <p className="text-xs text-muted-foreground">
                {filings.filter((f) => f.status === "error").length} with errors
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{session.user.role}</div>
              <p className="text-xs text-muted-foreground">Standard access level</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Filings</CardTitle>
              <CardDescription>Manage your filings and track their status</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardTable filings={filings} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
