import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Session } from "@/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Filing Management System",
  description: "Manage your filings with ease",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Session>{children}</Session>
      </body>
    </html>
  )
}
