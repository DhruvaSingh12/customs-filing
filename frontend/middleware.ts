import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

enum Role {
  user = "user",
  admin = "admin"
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== Role.admin) {
        return NextResponse.redirect(new URL("/auth/admin-login", req.url))
      }
    }

    // User dashboard protection
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow access to auth pages without token
        if (pathname.startsWith("/auth/")) {
          return true
        }

        // Require token for protected routes
        if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
          return !!token
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/auth/:path*"],
}
