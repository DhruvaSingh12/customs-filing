import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/nextauth.config"
import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/DashboardLayout"
import { DashboardTable } from "@/components/DashboardTable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Role } from "@prisma/client"

async function getAllFilings() {
  return await prisma.filing.findMany({
    include: {
      items: true,
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== Role.admin) {
    redirect("/auth/admin-login")
  }

  const filings = await getAllFilings()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.name || session.user.email}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Filings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filings.length}</div>
              <p className="text-xs text-muted-foreground">All filings in system</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filings.filter((f) => f.status === "submitted").length}</div>
              <p className="text-xs text-muted-foreground">Successfully submitted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filings.filter((f) => f.status === "draft").length}</div>
              <p className="text-xs text-muted-foreground">In draft status</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filings.filter((f) => f.status === "error").length}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Filings</CardTitle>
            <CardDescription>Manage all filings in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardTable filings={filings} isAdmin={true} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
