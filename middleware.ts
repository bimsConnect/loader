import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJwtToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/login" || path === "/register"

  // Get the token from the cookies
  const token = request.cookies.get("auth-token")?.value || ""

  // If the path is public and the user is logged in, redirect to the dashboard page
  if (isPublicPath && token) {
    try {
      const payload = await verifyJwtToken(token)

      if (payload) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      // If token verification fails, continue to the public page
    }
  }

  // If the path is not public and the user is not logged in, redirect to the login page
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/", "/login", "/register", "/dashboard", "/loader-request/:path*", "/history/:path*"],
}
