import { NextResponse } from "next/server"
import { removeAuthCookie } from "@/lib/auth"

export async function POST() {
  try {
    await removeAuthCookie()

    return NextResponse.json({ message: "Logout berhasil" }, { status: 200 })
  } catch (error) {
    console.error("Error logging out:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat logout" }, { status: 500 })
  }
}
