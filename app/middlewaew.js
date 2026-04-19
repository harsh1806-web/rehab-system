import { NextResponse } from "next/server"

export function middleware(request) {
  const hasSession = request.cookies.getAll().some(cookie =>
    cookie.name.includes("sb-")
  )

  const path = request.nextUrl.pathname

  const isProtected =
    path.startsWith("/admin") ||
    path.startsWith("/user")

  const isLoginPage = path.startsWith("/login")

  if (!hasSession && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/login"]
}
