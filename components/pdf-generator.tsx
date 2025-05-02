"use client"

import { useRef } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import type { FormData } from "@/types/loader-form"

interface PdfGeneratorProps {
  formData: FormData
  documentNumber?: string
}

export function PdfGenerator({ formData, documentNumber = "-" }: PdfGeneratorProps) {
  const pdfRef = useRef<HTMLDivElement>(null)

  const generatePdf = async () => {
    if (!pdfRef.current) return

    // Use better settings for image quality
    const canvas = await html2canvas(pdfRef.current, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 0,
      backgroundColor: "#ffffff",
    })

    // Use better compression settings
    const imgData = canvas.toDataURL("image/jpeg", 0.8) // 80% quality JPEG

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calculate aspect ratio to prevent distortion
    const canvasRatio = canvas.width / canvas.height
    const pageRatio = pdfWidth / pdfHeight

    let imgWidth, imgHeight, imgX, imgY

    if (canvasRatio > pageRatio) {
      // Canvas is wider than page ratio
      imgWidth = pdfWidth
      imgHeight = imgWidth / canvasRatio
      imgX = 0
      imgY = (pdfHeight - imgHeight) / 2
    } else {
      // Canvas is taller than page ratio
      imgHeight = pdfHeight
      imgWidth = imgHeight * canvasRatio
      imgX = (pdfWidth - imgWidth) / 2
      imgY = 0
    }

    pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth, imgHeight)
    pdf.save(`loader-request-${formData.date}-${documentNumber}.pdf`)
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end">
        <button
          onClick={generatePdf}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download PDF
        </button>
      </div>

      <div
        ref={pdfRef}
        className="bg-white border border-gray-300 p-8 shadow-md"
        style={{ width: "210mm", minHeight: "297mm", margin: "0 auto" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <img src="/images/company/logo.png" alt="Company Logo" className="h-16 mr-4" />
            <div className="text-blue-800 font-bold">PT. DUNIA KIMIA JAYA</div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-center text-blue-800 mb-6">
          Report Documentation Warehouse {formData.transactionType} Activity
        </h1>

        {/* Main Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <div className="grid grid-cols-3 mb-2">
              <div className="font-semibold">Shipper Name</div>
              <div className="col-span-2">: {formData.customerName}</div>
            </div>
            <div className="grid grid-cols-3 mb-2">
              <div className="font-semibold">Receipt Date</div>
              <div className="col-span-2">: {format(new Date(formData.date), "dd-MMM-yyyy", { locale: id })}</div>
            </div>
            <div className="grid grid-cols-3 mb-2">
              <div className="font-semibold">No Document</div>
              <div className="col-span-2">: {documentNumber}</div>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-3 mb-2">
              <div className="font-semibold">Transaction</div>
              <div className="col-span-2">: {formData.transactionType}</div>
            </div>
            <div className="grid grid-cols-3 mb-2">
              <div className="font-semibold">Vehicle No</div>
              <div className="col-span-2">: {formData.vehicleNumber}</div>
            </div>
            <div className="grid grid-cols-3 mb-2">
              <div className="font-semibold">Container No</div>
              <div className="col-span-2">: {formData.containerNumber || "-"}</div>
            </div>
          </div>
        </div>

        {/* Photos Section 1 */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Foto Tampak Depan</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.requiredPhotos.frontView?.preview && (
                <img
                  src={formData.requiredPhotos.frontView.preview || "/placeholder.svg"}
                  alt="Front View"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Depan Sisi Kiri</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.requiredPhotos.frontLeftSide?.preview && (
                <img
                  src={formData.requiredPhotos.frontLeftSide.preview || "/placeholder.svg"}
                  alt="Front Left Side"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Depan Sisi Kanan</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.requiredPhotos.frontRightSide?.preview && (
                <img
                  src={formData.requiredPhotos.frontRightSide.preview || "/placeholder.svg"}
                  alt="Front Right Side"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Segel</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.requiredPhotos.seal?.preview && (
                <img
                  src={formData.requiredPhotos.seal.preview || "/placeholder.svg"}
                  alt="Seal"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Photos Section 2 */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">
              <div className="line-clamp-2">Foto Tampak Belakang Sebelum Dibuka</div>
            </div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.requiredPhotos.backBeforeOpen?.preview && (
                <img
                  src={formData.requiredPhotos.backBeforeOpen.preview || "/placeholder.svg"}
                  alt="Back Before Open"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Samping Kanan</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.requiredPhotos.rightSide?.preview && (
                <img
                  src={formData.requiredPhotos.rightSide.preview || "/placeholder.svg"}
                  alt="Right Side"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Samping Kiri</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.requiredPhotos.leftSide?.preview && (
                <img
                  src={formData.requiredPhotos.leftSide.preview || "/placeholder.svg"}
                  alt="Left Side"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">
              <div className="line-clamp-2">
                Foto Tampak Belakang Sebelum {formData.transactionType === "Inbound" ? "Bongkar" : "Muat"}
              </div>
            </div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.transactionType === "Inbound"
                ? formData.photos.beforeUnloading?.preview && (
                    <img
                      src={formData.photos.beforeUnloading.preview || "/placeholder.svg"}
                      alt="Before Unloading"
                      className="w-full h-full object-cover"
                    />
                  )
                : formData.photos.beforeLoading?.preview && (
                    <img
                      src={formData.photos.beforeLoading.preview || "/placeholder.svg"}
                      alt="Before Loading"
                      className="w-full h-full object-cover"
                    />
                  )}
            </div>
          </div>
        </div>

        {/* Photos Section 3 - Products */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">
              <div className="line-clamp-2">
                Foto Setelah {formData.transactionType === "Inbound" ? "Bongkar" : "Muat"}
              </div>
            </div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.transactionType === "Inbound"
                ? formData.photos.afterUnloading?.preview && (
                    <img
                      src={formData.photos.afterUnloading.preview || "/placeholder.svg"}
                      alt="After Unloading"
                      className="w-full h-full object-cover"
                    />
                  )
                : formData.photos.afterLoading?.preview && (
                    <img
                      src={formData.photos.afterLoading.preview || "/placeholder.svg"}
                      alt="After Loading"
                      className="w-full h-full object-cover"
                    />
                  )}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Product 1</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.photos.products[0]?.preview && (
                <img
                  src={formData.photos.products[0].preview || "/placeholder.svg"}
                  alt="Product 1"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Product 2</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.photos.products[1]?.preview && (
                <img
                  src={formData.photos.products[1].preview || "/placeholder.svg"}
                  alt="Product 2"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Product 3</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.photos.products[2]?.preview && (
                <img
                  src={formData.photos.products[2].preview || "/placeholder.svg"}
                  alt="Product 3"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Photos Section 4 - More Products */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Product 4</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.photos.products[3]?.preview && (
                <img
                  src={formData.photos.products[3].preview || "/placeholder.svg"}
                  alt="Product 4"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Product 5</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.photos.products[4]?.preview && (
                <img
                  src={formData.photos.products[4].preview || "/placeholder.svg"}
                  alt="Product 5"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Product 6</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.photos.products[5]?.preview && (
                <img
                  src={formData.photos.products[5].preview || "/placeholder.svg"}
                  alt="Product 6"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1 h-10 flex items-center">Product 7</div>
            <div className="border border-gray-300 h-32 overflow-hidden">
              {formData.photos.products[6]?.preview && (
                <img
                  src={formData.photos.products[6].preview || "/placeholder.svg"}
                  alt="Product 7"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer with space for physical signature */}
        <div className="flex justify-between items-end mt-8">
          <div className="flex-1"></div>
          <div className="flex-1 text-center">
            {/* Space for physical signature - 40px height */}
            <div className="mb-16 h-40 border-b border-dashed border-gray-300">
              {/* Empty space for physical signature */}
            </div>
            <div className="font-semibold">{formData.checkerName}</div>
            <div className="text-sm">Checker</div>
          </div>
        </div>
      </div>
    </div>
  )
}
