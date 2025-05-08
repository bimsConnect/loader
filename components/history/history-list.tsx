"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Calendar,
  FileText,
  Truck,
  User,
  Search,
  Download,
  Eye,
  ArrowUpDown,
  ChevronDown,
  HistoryIcon,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { PdfGenerator } from "@/components/pdf-generator"
import { HistoryDetail } from "@/components/history/history-detail"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  documentNumber?: string
  photos: Photo[]
}

interface Photo {
  id: string
  type: string
  category: string
  url: string
  publicId: string
}

export function HistoryList() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<LoaderRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LoaderRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedRequest, setSelectedRequest] = useState<LoaderRequest | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [formattedData, setFormattedData] = useState<any>(null)
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    requestId: "",
    loading: false,
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchLoaderRequests()
  }, [])

  useEffect(() => {
    if (requests.length > 0) {
      filterAndSortRequests()
    }
  }, [searchTerm, sortField, sortDirection, requests])

  const fetchLoaderRequests = async () => {
    try {
      setLoading(true)
      setErrorMessage(null)
      const response = await fetch("/api/loader-requests")

      if (!response.ok) {
        throw new Error("Failed to fetch loader requests")
      }

      const data = await response.json()
      setRequests(data.loaderRequests)
    } catch (error) {
      console.error("Error fetching loader requests:", error)
      setErrorMessage("Gagal memuat data. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortRequests = () => {
    let filtered = [...requests]

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (request) =>
          request.customerName.toLowerCase().includes(term) ||
          request.vehicleNumber.toLowerCase().includes(term) ||
          request.warehouseName.toLowerCase().includes(term) ||
          request.checkerName.toLowerCase().includes(term) ||
          (request.containerNumber && request.containerNumber.toLowerCase().includes(term)),
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let valueA, valueB

      switch (sortField) {
        case "date":
          valueA = new Date(a.date).getTime()
          valueB = new Date(b.date).getTime()
          break
        case "customerName":
          valueA = a.customerName.toLowerCase()
          valueB = b.customerName.toLowerCase()
          break
        case "vehicleNumber":
          valueA = a.vehicleNumber.toLowerCase()
          valueB = b.vehicleNumber.toLowerCase()
          break
        case "status":
          valueA = a.status.toLowerCase()
          valueB = b.status.toLowerCase()
          break
        default:
          valueA = a.date
          valueB = b.date
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    setFilteredRequests(filtered)
  }

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleViewDetail = (request: LoaderRequest) => {
    setSelectedRequest(request)
    setShowDetail(true)
  }

  const handleViewPdf = (request: LoaderRequest) => {
    // Format the data for PDF generation
    const formattedRequest = formatRequestForPdf(request)
    setFormattedData(formattedRequest)
    setSelectedRequest(request) // Pastikan request yang dipilih disimpan
    setShowPdfPreview(true)
  }

  const handleDeleteRequest = (requestId: string) => {
    setDeleteDialog({
      open: true,
      requestId,
      loading: false,
    })
  }

  const confirmDelete = async () => {
    try {
      setDeleteDialog((prev) => ({ ...prev, loading: true }))

      const response = await fetch(`/api/loader-requests/${deleteDialog.requestId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete request")
      }

      // Remove the deleted request from state
      setRequests((prev) => prev.filter((request) => request.id !== deleteDialog.requestId))

      // Close the dialog
      setDeleteDialog({
        open: false,
        requestId: "",
        loading: false,
      })
    } catch (error) {
      console.error("Error deleting request:", error)
      setErrorMessage(error instanceof Error ? error.message : "Gagal menghapus permintaan")
    } finally {
      setDeleteDialog((prev) => ({ ...prev, loading: false }))
    }
  }

  const formatRequestForPdf = (request: LoaderRequest) => {
    // Group photos by category and type
    const requiredPhotos: any = {}
    const photos: any = {
      products: [],
    }

    request.photos.forEach((photo) => {
      if (photo.category === "required") {
        requiredPhotos[photo.type] = {
          preview: photo.url,
        }
      } else if (photo.category === "transaction") {
        photos[photo.type] = {
          preview: photo.url,
        }
      } else if (photo.category === "product") {
        photos.products.push({
          id: photo.id,
          preview: photo.url,
        })
      }
    })

    // Ensure products array has 7 items
    while (photos.products.length < 7) {
      photos.products.push({
        id: `empty-${photos.products.length}`,
        preview: null,
      })
    }

    return {
      date: request.date,
      plant: request.plant,
      customerName: request.customerName,
      vehicleType: request.vehicleType,
      vehicleNumber: request.vehicleNumber,
      containerNumber: request.containerNumber,
      warehouseName: request.warehouseName,
      transactionType: request.transactionType,
      requiredPhotos,
      photos,
      checkerName: request.checkerName,
      documentNumber: request.documentNumber, // Pastikan document number disertakan
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
    return sortDirection === "asc" ? <ArrowUpDown className="ml-1 h-4 w-4" /> : <ArrowUpDown className="ml-1 h-4 w-4" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Permintaan Loader</CardTitle>
          <CardDescription>Daftar permintaan loader yang telah dibuat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>No. Kendaraan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-green-600" />
            Riwayat Permintaan Loader
          </CardTitle>
          <CardDescription>Daftar permintaan loader yang telah dibuat</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Cari berdasarkan customer, no kendaraan, gudang..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => fetchLoaderRequests()} className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium">Tidak ada data</h3>
              <p className="text-sm text-gray-500">
                {searchTerm
                  ? "Tidak ada hasil yang cocok dengan pencarian Anda"
                  : "Belum ada permintaan loader yang dibuat"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                      <div className="flex items-center">Tanggal {renderSortIcon("date")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("customerName")}>
                      <div className="flex items-center">Customer {renderSortIcon("customerName")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("vehicleNumber")}>
                      <div className="flex items-center">No. Kendaraan {renderSortIcon("vehicleNumber")}</div>
                    </TableHead>
                    <TableHead>No. Dokumen</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                      <div className="flex items-center">Status {renderSortIcon("status")}</div>
                    </TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {format(new Date(request.date), "dd MMM yyyy", { locale: id })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          {request.customerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-gray-500" />
                          {request.vehicleNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          {request.documentNumber || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={request.transactionType === "Inbound" ? "default" : "secondary"}>
                          {request.transactionType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={request.status === "submitted" ? "default" : "outline"}>
                          {request.status === "submitted" ? "Terkirim" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Aksi <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(request)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewPdf(request)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteRequest(request.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Detail Permintaan Loader</DialogTitle>
          {selectedRequest && <HistoryDetail request={selectedRequest} />}
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-[90vw] w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Preview PDF</DialogTitle>
          {formattedData && <PdfGenerator formData={formattedData} documentNumber={selectedRequest?.documentNumber} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Konfirmasi Hapus
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus permintaan loader ini? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, requestId: "", loading: false })}
              disabled={deleteDialog.loading}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteDialog.loading}>
              {deleteDialog.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
