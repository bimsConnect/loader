import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"

export async function GET() {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const loaderRequests = await prisma.loaderRequest.findMany({
      where: {
        userId: user.id,
      },
      include: {
        photos: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ loaderRequests }, { status: 200 })
  } catch (error) {
    console.error("Error getting loader requests:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data permintaan loader" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.json()

    // Create loader request
    const loaderRequest = await prisma.loaderRequest.create({
      data: {
        date: new Date(formData.date),
        plant: formData.plant,
        customerName: formData.customerName,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        containerNumber: formData.containerNumber || null,
        warehouseName: "Default Warehouse", // Tetap mengisi nilai default
        transactionType: formData.transactionType,
        checkerName: formData.checkerName,
        status: formData.status || "draft",
        documentNumber: formData.documentNumber || null,
        userId: user.id,
      },
    })

    // If this is a submitted request, increment the document counter
    if (formData.status === "submitted") {
      await prisma.documentCounter.upsert({
        where: { id: "document_counter" },
        update: { count: { increment: 1 }, updatedAt: new Date() },
        create: { id: "document_counter", count: 1 },
      })
    }

    // Upload and save required photos
    const requiredPhotoPromises = []
    for (const [type, photo] of Object.entries(formData.requiredPhotos)) {
      if (photo && photo.preview) {
        const uploadedPhoto = await uploadImage(photo.preview, "required-photos")
        requiredPhotoPromises.push(
          prisma.photo.create({
            data: {
              type,
              category: "required",
              url: uploadedPhoto.url,
              publicId: uploadedPhoto.publicId,
              loaderRequestId: loaderRequest.id,
            },
          }),
        )
      }
    }

    // Upload and save transaction photos
    const transactionPhotoPromises = []
    for (const [type, photo] of Object.entries(formData.photos)) {
      if (type !== "products" && photo && photo.preview) {
        const uploadedPhoto = await uploadImage(photo.preview, "transaction-photos")
        transactionPhotoPromises.push(
          prisma.photo.create({
            data: {
              type,
              category: "transaction",
              url: uploadedPhoto.url,
              publicId: uploadedPhoto.publicId,
              loaderRequestId: loaderRequest.id,
            },
          }),
        )
      }
    }

    // Upload and save product photos
    const productPhotoPromises = []
    for (const photo of formData.photos.products) {
      if (photo && photo.preview) {
        const uploadedPhoto = await uploadImage(photo.preview, "product-photos")
        productPhotoPromises.push(
          prisma.photo.create({
            data: {
              type: "product",
              category: "product",
              url: uploadedPhoto.url,
              publicId: uploadedPhoto.publicId,
              loaderRequestId: loaderRequest.id,
            },
          }),
        )
      }
    }

    // Wait for all photo uploads to complete
    await Promise.all([...requiredPhotoPromises, ...transactionPhotoPromises, ...productPhotoPromises])

    return NextResponse.json({ loaderRequest, message: "Permintaan loader berhasil dibuat" }, { status: 201 })
  } catch (error) {
    console.error("Error creating loader request:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat membuat permintaan loader" }, { status: 500 })
  }
}
