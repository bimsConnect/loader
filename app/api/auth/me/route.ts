import { NextResponse } from "next/server"
import { getUserFromSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 })
  } catch (error) {
    console.error("Error getting user:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data pengguna" }, { status: 500 })
  }
}
