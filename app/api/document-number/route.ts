import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get the current count of submitted loader requests
    const count = await prisma.loaderRequest.count({
      where: {
        status: "submitted",
      },
    })

    // Format the document number as 00-00-XX where XX is the count + 1
    // This ensures each new document gets a sequential number
    const formattedCount = (count + 1).toString().padStart(2, "0")
    const documentNumber = `00-00-${formattedCount}`

    return NextResponse.json({ documentNumber }, { status: 200 })
  } catch (error) {
    console.error("Error generating document number:", error)
    return NextResponse.json({ error: "Failed to generate document number" }, { status: 500 })
  }
}
