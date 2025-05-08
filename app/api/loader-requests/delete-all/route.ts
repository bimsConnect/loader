import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"
import { deleteImage } from "@/lib/cloudinary"

export async function DELETE() {
  try {
    // Verifikasi autentikasi
    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Hanya admin atau user yang bisa menghapus semua data miliknya
    const where = user.role === "admin" ? {} : { userId: user.id }

    // Ambil semua foto untuk dihapus dari Cloudinary
    const photos = await prisma.photo.findMany({
      where: {
        loaderRequest: {
          userId: user.id,
        },
      },
    })

    // Hapus semua foto dari Cloudinary
    for (const photo of photos) {
      try {
        await deleteImage(photo.publicId)
      } catch (error) {
        console.error(`Error deleting image ${photo.publicId} from Cloudinary:`, error)
        // Lanjutkan proses meskipun ada error pada penghapusan foto
      }
    }

    // Hapus semua loader requests (akan cascade delete photos)
    const { count } = await prisma.loaderRequest.deleteMany({
      where,
    })

    return NextResponse.json({ message: `${count} permintaan loader berhasil dihapus` }, { status: 200 })
  } catch (error) {
    console.error("Error deleting all loader requests:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat menghapus semua permintaan loader" }, { status: 500 })
  }
}
