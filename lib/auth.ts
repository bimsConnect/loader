import { type NextRequest, NextResponse } from "next/server"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { User } from "@prisma/client"

const JWT_SECRET = process.env.JWT_SECRET || "kXp2s5v8y/B?E(H+MbQeThWmZq4t6w9z"

export async function signJwtToken(payload: any) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret)
    return token
  } catch (error) {
    console.error("Error signing JWT token:", error)
    throw error
  }
}

export async function verifyJwtToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error("Error verifying JWT token:", error)
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  try {
    const payload = await verifyJwtToken(token)
    return payload
  } catch (error) {
    return null
  }
}

export async function getUserFromSession() {
  const session = await getSession()
  if (!session || !session.id) return null
  return session as User
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  })
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}

export function withAuth(handler: Function) {
  return async (req: NextRequest) => {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return handler(req, session)
  }
}
