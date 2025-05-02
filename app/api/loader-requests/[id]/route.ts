import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUserFromSession } from "@/lib/auth"
import { uploadImage, deleteImage } from "@/lib/cloudinary"

interface PhotoData {
  preview: string;
  publicId?: string;
}

interface FormData {
  date: string;
  plant: string;
  customerName: string;
  vehicleType: string;
  vehicleNumber: string;
  containerNumber?: string | null;
  warehouseName: string;
  transactionType: string;
  checkerName: string;
  status?: string;
  signature?: string;
  requiredPhotos: Record<string, PhotoData>;
  photos: {
    products: PhotoData[];
    [key: string]: PhotoData | PhotoData[];
  };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const loaderRequest = await prisma.loaderRequest.findUnique({
      where: {
        id: params.id,
      },
      include: {
        photos: true,
      },
    })

    if (!loaderRequest) {
      return NextResponse.json({ error: "Permintaan loader tidak ditemukan" }, { status: 404 })
    }

    // Check if user is authorized to view this loader request
    if (loaderRequest.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ loaderRequest }, { status: 200 })
  } catch (error) {
    console.error("Error getting loader request:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data permintaan loader" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.json()

    // Check if loader request exists
    const existingRequest = await prisma.loaderRequest.findUnique({
      where: {
        id: params.id,
      },
      include: {
        photos: true,
      },
    })

    if (!existingRequest) {
      return NextResponse.json({ error: "Permintaan loader tidak ditemukan" }, { status: 404 })
    }

    // Check if user is authorized to update this loader request
    if (existingRequest.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Upload signature if changed
    let signatureUrl = existingRequest.signature
    if (formData.signature && formData.signature !== existingRequest.signature) {
      const uploadedSignature = await uploadImage(formData.signature, "signatures")
      signatureUrl = uploadedSignature.url
    }

    // Update loader request
    const loaderRequest = await prisma.loaderRequest.update({
      where: {
        id: params.id,
      },
      data: {
        date: new Date(formData.date),
        plant: formData.plant,
        customerName: formData.customerName,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        containerNumber: formData.containerNumber || null,
        warehouseName: formData.warehouseName,
        transactionType: formData.transactionType,
        checkerName: formData.checkerName,
        status: formData.status || existingRequest.status,
        signature: signatureUrl,
      },
    })

    // Delete existing photos if needed
    const existingPhotos = existingRequest.photos

    // Handle required photos
    for (const [type, photo] of Object.entries(formData.requiredPhotos)) {
      const existingPhoto = existingPhotos.find((p) => p.type === type && p.category === "required")

      if (existingPhoto) {
        // If photo changed, delete old one and upload new one
        if (photo && photo.preview && !photo.preview.includes(existingPhoto.url)) {
          await deleteImage(existingPhoto.publicId)
          await prisma.photo.delete({
            where: { id: existingPhoto.id },
          })

          const uploadedPhoto = await uploadImage(photo.preview, "required-photos")
          await prisma.photo.create({
            data: {
              type,
              category: "required",
              url: uploadedPhoto.url,
              publicId: uploadedPhoto.publicId,
              loaderRequestId: loaderRequest.id,
            },
          })
        }
      } else if (photo && photo.preview) {
        // If no existing photo but new one provided, upload it
        const uploadedPhoto = await uploadImage(photo.preview, "required-photos")
        await prisma.photo.create({
          data: {
            type,
            category: "required",
            url: uploadedPhoto.url,
            publicId: uploadedPhoto.publicId,
            loaderRequestId: loaderRequest.id,
          },
        })
      }
    }

    // Handle transaction photos
    for (const [type, photo] of Object.entries(formData.photos)) {
      if (type !== "products") {
        const existingPhoto = existingPhotos.find((p) => p.type === type && p.category === "transaction")

        if (existingPhoto) {
          // If photo changed, delete old one and upload new one
          if (photo && photo.preview && !photo.preview.includes(existingPhoto.url)) {
            await deleteImage(existingPhoto.publicId)
            await prisma.photo.delete({
              where: { id: existingPhoto.id },
            })

            const uploadedPhoto = await uploadImage(photo.preview, "transaction-photos")
            await prisma.photo.create({
              data: {
                type,
                category: "transaction",
                url: uploadedPhoto.url,
                publicId: uploadedPhoto.publicId,
                loaderRequestId: loaderRequest.id,
              },
            })
          }
        } else if (photo && photo.preview) {
          // If no existing photo but new one provided, upload it
          const uploadedPhoto = await uploadImage(photo.preview, "transaction-photos")
          await prisma.photo.create({
            data: {
              type,
              category: "transaction",
              url: uploadedPhoto.url,
              publicId: uploadedPhoto.publicId,
              loaderRequestId: loaderRequest.id,
            },
          })
        }
      }
    }

    // Handle product photos
    const existingProductPhotos = existingPhotos.filter((p) => p.category === "product")

    // Delete all existing product photos
    for (const photo of existingProductPhotos) {
      await deleteImage(photo.publicId)
      await prisma.photo.delete({
        where: { id: photo.id },
      })
    }

    // Upload new product photos
    for (const photo of formData.photos.products) {
      if (photo && photo.preview) {
        const uploadedPhoto = await uploadImage(photo.preview, "product-photos")
        await prisma.photo.create({
          data: {
            type: "product",
            category: "product",
            url: uploadedPhoto.url,
            publicId: uploadedPhoto.publicId,
            loaderRequestId: loaderRequest.id,
          },
        })
      }
    }

    return NextResponse.json({ loaderRequest, message: "Permintaan loader berhasil diperbarui" }, { status: 200 })
  } catch (error) {
    console.error("Error updating loader request:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat memperbarui permintaan loader" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if loader request exists
    const existingRequest = await prisma.loaderRequest.findUnique({
      where: {
        id: params.id,
      },
      include: {
        photos: true,
      },
    })

    if (!existingRequest) {
      return NextResponse.json({ error: "Permintaan loader tidak ditemukan" }, { status: 404 })
    }

    // Check if user is authorized to delete this loader request
    if (existingRequest.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete all photos from Cloudinary
    for (const photo of existingRequest.photos) {
      await deleteImage(photo.publicId)
    }

    // Delete loader request (will cascade delete photos)
    await prisma.loaderRequest.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Permintaan loader berhasil dihapus" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting loader request:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat menghapus permintaan loader" }, { status: 500 })
  }
}
