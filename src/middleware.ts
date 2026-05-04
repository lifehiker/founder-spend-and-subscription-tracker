import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  const isAppRoute = pathname.startsWith("/app")
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isAuthenticated = !!req.auth

  if (isAppRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/app/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
}
