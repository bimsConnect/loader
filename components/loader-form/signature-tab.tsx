"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, CheckCircle2, AlertCircle, User, Save, Send, Printer, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PdfGenerator } from "@/components/pdf-generator"
import type { FormData } from "@/types/loader-form"

interface SignatureTabProps {
  formData: FormData
  isFormValid: () => boolean
  isRequiredPhotosValid: () => boolean
  isTransactionPhotosValid: () => boolean
  isGeneralInfoValid: () => boolean
  loading: boolean
  submitted: boolean
  onPrevTab: () => void
  onSaveDraft: () => void
  onSubmit: (e: React.FormEvent) => void
  onPrint: () => void
  documentNumber?: string
}

export function SignatureTab({
  formData,
  isFormValid,
  isRequiredPhotosValid,
  isTransactionPhotosValid,
  isGeneralInfoValid,
  loading,
  submitted,
  onPrevTab,
  onSaveDraft,
  onSubmit,
  onPrint,
  documentNumber = "-",
}: SignatureTabProps) {
  const [showPdfPreview, setShowPdfPreview] = useState(false)

  const handlePrintClick = () => {
    setShowPdfPreview(true)
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <User className="h-5 w-5 text-blue-600" />
          Konfirmasi Data
        </CardTitle>
        <CardDescription>Konfirmasi identitas checker dan kirim form</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="checkerName" className="flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            Nama Checker
          </Label>
          <Input
            id="checkerName"
            name="checkerName"
            value={formData.checkerName}
            readOnly
            className="bg-gray-50 border-gray-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentNumber" className="flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            Nomor Dokumen
          </Label>
          <Input
            id="documentNumber"
            name="documentNumber"
            value={documentNumber}
            readOnly
            className="bg-gray-50 border-gray-200"
          />
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Status Form</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className={`w-4 h-4 rounded-full ${isGeneralInfoValid() ? "bg-blue-500" : "bg-red-500"}`}></div>
              <div>
                <p className="font-medium">Informasi Umum</p>
                <p className="text-sm text-gray-500">{isGeneralInfoValid() ? "Lengkap" : "Belum lengkap"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className={`w-4 h-4 rounded-full ${isRequiredPhotosValid() ? "bg-blue-500" : "bg-red-500"}`}></div>
              <div>
                <p className="font-medium">Foto Wajib</p>
                <p className="text-sm text-gray-500">{isRequiredPhotosValid() ? "Lengkap" : "Belum lengkap"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-md border border-gray-200">
              <div
                className={`w-4 h-4 rounded-full ${isTransactionPhotosValid() ? "bg-blue-500" : "bg-red-500"}`}
              ></div>
              <div>
                <p className="font-medium">Foto Transaksi</p>
                <p className="text-sm text-gray-500">{isTransactionPhotosValid() ? "Lengkap" : "Belum lengkap"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Ringkasan Form</h4>
              <p className="text-sm text-gray-500">Periksa kembali data yang telah diisi</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Tanggal:</div>
              <div className="font-medium">{formData.date}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Plant:</div>
              <div className="font-medium">{formData.plant}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Customer:</div>
              <div className="font-medium">{formData.customerName || "-"}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Tipe Kendaraan:</div>
              <div className="font-medium">{formData.vehicleType || "-"}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">No. Polisi:</div>
              <div className="font-medium">{formData.vehicleNumber || "-"}</div>
            </div>
            {formData.vehicleType === "Container" && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">No. Container:</div>
                <div className="font-medium">{formData.containerNumber || "-"}</div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Gudang:</div>
              <div className="font-medium">{formData.warehouseName || "-"}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Tipe Transaksi:</div>
              <div className="font-medium">{formData.transactionType}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Foto Wajib:</div>
              <div className="font-medium">
                {isRequiredPhotosValid() ? (
                  <span className="text-blue-600 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Lengkap
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" /> Belum Lengkap
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">No. Dokumen:</div>
              <div className="font-medium">{documentNumber}</div>
            </div>
          </div>
        </div>

        {!isFormValid() && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertDescription>Mohon lengkapi semua data yang diperlukan sebelum mengirim form.</AlertDescription>
          </Alert>
        )}

        {submitted && (
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertDescription className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Form berhasil dikirim! Anda dapat mencetak dokumen ini.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-between pt-2 pb-6">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onPrevTab}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button type="button" variant="outline" onClick={onSaveDraft} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Draft
              </>
            )}
          </Button>
        </div>
        <div className="flex gap-2">
          {submitted && (
            <Button type="button" variant="outline" onClick={handlePrintClick}>
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Button>
          )}
          <Button
            type="submit"
            disabled={!isFormValid() || loading}
            className="bg-blue-600 hover:bg-blue-700"
            onClick={onSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Kirim Form
              </>
            )}
          </Button>
        </div>
      </CardFooter>

      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-[90vw] w-[900px] max-h-[90vh] overflow-y-auto">
          <PdfGenerator formData={formData} documentNumber={documentNumber} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
