import type { Role } from "@prisma/client"

export interface User {
  id: string
  name?: string | null
  email?: string | null
  gstin: string
  phone?: string | null
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  gstin: string
  password: string
  role: Role
}

export interface LoginResponse {
  id: string
  name: string | null
  email: string | null
  role: string
}
