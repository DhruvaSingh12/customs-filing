import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/nextauth.config"
import { AuthForm } from "@/components/AuthForm"
import { Role } from "@prisma/client"

export default async function AdminSignupPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect(session.user.role === Role.admin ? "/admin" : "/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm type="admin" mode="signup" title="Create Admin Account" description="Sign up for admin access" />
    </div>
  )
}
