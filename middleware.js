import { NextResponse } from "next/server"

export function middleware(request) {
  const allCookies = request.cookies.getAll()
  const hasSession = allCookies.some(cookie =>
    cookie.name.includes("sb-") || cookie.name.includes("supabase")
  )

  const path = request.nextUrl.pathname

  const isProtected =
    path.startsWith("/admin") ||
    path.startsWith("/user")

  const isLoginPage = path.startsWith("/login")

  if (!hasSession && isProtected) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (hasSession && isLoginPage) {
    const adminUrl = new URL("/admin", request.url)
    return NextResponse.redirect(adminUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/login"]
}
