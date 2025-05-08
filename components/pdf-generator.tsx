"use client"

import { useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FormData } from "@/types/loader-form"
import { useAuth } from "@/context/auth-context"

interface PdfGeneratorProps {
  formData: FormData
  documentNumber?: string
}

export function PdfGenerator({ formData, documentNumber = "-" }: PdfGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const generatePdf = async () => {
    setLoading(true)
    setError(null)

    try {
      // Panggil API untuk menghasilkan PDF
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          documentNumber,
        }),
      })

      if (!response.ok) {
        let errorMessage = "Failed to generate PDF"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // Jika tidak bisa parse JSON, gunakan pesan error default
        }
        throw new Error(errorMessage)
      }

      // Dapatkan blob dari response
      const blob = await response.blob()

      // Buat URL untuk blob
      const url = window.URL.createObjectURL(blob)

      // Buat link untuk download
      const a = document.createElement("a")
      a.href = url
      a.download = `Loader_Request_${documentNumber || "Document"}.pdf`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setError(error instanceof Error ? error.message : "Failed to generate PDF")
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formattedDate = format(new Date(formData.date), "dd MMMM yyyy", { locale: id })

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">PDF Preview</h2>
        <Button onClick={generatePdf} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="bg-white border border-gray-300 shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg mr-4">
                  <div className="h-14 w-14 flex items-center justify-center">
                    <img src="/images/company/logo.png" alt="Company Logo" className="max-w-full max-h-full" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">PT. DUNIA KIMIA JAYA</h1>
                  <p className="text-sm opacity-80">Warehouse Management System</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-blue-700 px-4 py-2 rounded-lg inline-block">
                  <span className="text-sm opacity-80">Document No.</span>
                  <p className="font-bold text-lg">{documentNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="bg-gray-50 border-b border-gray-300 p-4 text-center">
            <h2 className="text-xl font-bold text-gray-800">
              Report Documentation Warehouse {formData.transactionType} Activity
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Generated on {format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}
            </p>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Main Info */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">Customer Name</div>
                    <div className="w-2/3 font-semibold">: {formData.customerName}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">Receipt Date</div>
                    <div className="w-2/3 font-semibold">: {formattedDate}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">No Document</div>
                    <div className="w-2/3 font-semibold">: {documentNumber}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">Transaction</div>
                    <div className="w-2/3 font-semibold">: {formData.transactionType}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">Vehicle No</div>
                    <div className="w-2/3 font-semibold">: {formData.vehicleNumber}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 text-gray-600 font-medium">Container No</div>
                    <div className="w-2/3 font-semibold">: {formData.containerNumber || "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center p-8 text-gray-500">
              <p className="mb-2">This is a preview of your PDF document.</p>
              <p>Click the "Download PDF" button to generate and download the full PDF.</p>
              <p className="mt-4 text-sm">Checker: {user?.name || formData.checkerName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
