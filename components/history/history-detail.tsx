"use client"

import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar, Truck, Building, User, FileText, Download, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Photo {
  id: string
  type: string
  category: string
  url: string
  publicId: string
}

interface LoaderRequest {
  id: string
  date: string
  plant: string
  customerName: string
  vehicleType: string
  vehicleNumber: string
  containerNumber: string | null
  warehouseName: string
  transactionType: string
  checkerName: string
  status: string
  createdAt: string
  updatedAt: string
  photos: Photo[]
}

interface HistoryDetailProps {
  request: LoaderRequest
}

export function HistoryDetail({ request }: HistoryDetailProps) {
  // Group photos by category
  const requiredPhotos = request.photos.filter((photo) => photo.category === "required")
  const transactionPhotos = request.photos.filter((photo) => photo.category === "transaction")
  const productPhotos = request.photos.filter((photo) => photo.category === "product")

  // Function to get photo by type
  const getPhotoByType = (photos: Photo[], type: string) => {
    return photos.find((photo) => photo.type === type)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Detail Permintaan Loader</h2>
        <Badge variant={request.status === "submitted" ? "default" : "outline"} className="text-sm">
          {request.status === "submitted" ? "Terkirim" : "Draft"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Tanggal:</span>
          </div>
          <p className="font-medium">{format(new Date(request.date), "dd MMMM yyyy", { locale: id })}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Building className="h-4 w-4" />
            <span>Plant:</span>
          </div>
          <p className="font-medium">{request.plant}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <User className="h-4 w-4" />
            <span>Customer:</span>
          </div>
          <p className="font-medium">{request.customerName}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Truck className="h-4 w-4" />
            <span>Tipe Kendaraan:</span>
          </div>
          <p className="font-medium">{request.vehicleType}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Truck className="h-4 w-4" />
            <span>No. Polisi:</span>
          </div>
          <p className="font-medium">{request.vehicleNumber}</p>
        </div>

        {request.containerNumber && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500">
              <Truck className="h-4 w-4" />
              <span>No. Container:</span>
            </div>
            <p className="font-medium">{request.containerNumber}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Building className="h-4 w-4" />
            <span>Gudang:</span>
          </div>
          <p className="font-medium">{request.warehouseName}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <FileText className="h-4 w-4" />
            <span>Tipe Transaksi:</span>
          </div>
          <p className="font-medium">{request.transactionType}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <User className="h-4 w-4" />
            <span>Checker:</span>
          </div>
          <p className="font-medium">{request.checkerName}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Dibuat pada:</span>
          </div>
          <p className="font-medium">{format(new Date(request.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}</p>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="required">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="required">Foto Wajib</TabsTrigger>
          <TabsTrigger value="transaction">Foto Transaksi</TabsTrigger>
          <TabsTrigger value="product">Foto Produk</TabsTrigger>
        </TabsList>

        <TabsContent value="required" className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {requiredPhotos.map((photo) => (
              <div key={photo.id} className="border rounded-md overflow-hidden">
                <div className="p-2 bg-gray-50 border-b">
                  <p className="text-xs font-medium">{getPhotoLabel(photo.type)}</p>
                </div>
                <div className="aspect-square">
                  <img src={photo.url || "/placeholder.svg"} alt={photo.type} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transaction" className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {transactionPhotos.map((photo) => (
              <div key={photo.id} className="border rounded-md overflow-hidden">
                <div className="p-2 bg-gray-50 border-b">
                  <p className="text-xs font-medium">{getPhotoLabel(photo.type)}</p>
                </div>
                <div className="aspect-square">
                  <img src={photo.url || "/placeholder.svg"} alt={photo.type} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="product" className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productPhotos.map((photo, index) => (
              <div key={photo.id} className="border rounded-md overflow-hidden">
                <div className="p-2 bg-gray-50 border-b">
                  <p className="text-xs font-medium">Produk {index + 1}</p>
                </div>
                <div className="aspect-square">
                  <img
                    src={photo.url || "/placeholder.svg"}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        <Button className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Selesai
        </Button>
      </div>
    </div>
  )
}

// Helper function to get readable photo labels
function getPhotoLabel(type: string): string {
  const labels: Record<string, string> = {
    frontView: "Foto Tampak Depan",
    frontLeftSide: "Foto Depan Sisi Kiri",
    frontRightSide: "Foto Depan Sisi Kanan",
    seal: "Foto Segel",
    backBeforeOpen: "Foto Tampak Belakang Sebelum Dibuka",
    rightSide: "Foto Samping Kanan",
    leftSide: "Foto Samping Kiri",
    beforeUnloading: "Foto Sebelum Bongkar",
    afterUnloading: "Foto Sesudah Bongkar",
    beforeLoading: "Foto Sebelum Muat",
    afterLoading: "Foto Sesudah Muat",
    product: "Foto Produk",
  }

  return labels[type] || type
}
