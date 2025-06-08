import type { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: Role
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role
  }
}
