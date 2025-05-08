"use client"

import type React from "react"

import { ArrowLeft, ArrowRight, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { PhotoUploadField } from "./photo-upload-field"
import type { FormData } from "@/types/loader-form"

interface PhotosTabProps {
  formData: FormData
  onRequiredPhotoUpload: (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => void
  onPhotoUpload: (type: string, index?: number) => (e: React.ChangeEvent<HTMLInputElement>) => void
  onDeleteRequiredPhoto: (type: string) => void
  onDeletePhoto: (type: string, index?: number) => void
  onPrevTab: () => void
  onNextTab: () => void
  onCameraCapture?: (type: string) => (imageData: string) => void
  onCameraCaptureForPhoto?: (type: string, index?: number) => (imageData: string) => void
}

export function PhotosTab({
  formData,
  onRequiredPhotoUpload,
  onPhotoUpload,
  onDeleteRequiredPhoto,
  onDeletePhoto,
  onPrevTab,
  onNextTab,
  onCameraCapture,
  onCameraCaptureForPhoto,
}: PhotosTabProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <ImageIcon className="h-5 w-5 text-blue-600" />
          Upload Foto
        </CardTitle>
        <CardDescription>Upload foto sesuai dengan ketentuan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-700">
            <Badge className="bg-red-500">Wajib</Badge>
            Foto Kendaraan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <PhotoUploadField
              label="Foto Tampak Depan"
              preview={formData.requiredPhotos.frontView?.preview || null}
              onChange={onRequiredPhotoUpload("frontView")}
              onDelete={() => onDeleteRequiredPhoto("frontView")}
              onCameraCapture={onCameraCapture ? onCameraCapture("frontView") : undefined}
            />

            <PhotoUploadField
              label="Foto Depan Sisi Kiri"
              preview={formData.requiredPhotos.frontLeftSide?.preview || null}
              onChange={onRequiredPhotoUpload("frontLeftSide")}
              onDelete={() => onDeleteRequiredPhoto("frontLeftSide")}
              onCameraCapture={onCameraCapture ? onCameraCapture("frontLeftSide") : undefined}
            />

            <PhotoUploadField
              label="Foto Depan Sisi Kanan"
              preview={formData.requiredPhotos.frontRightSide?.preview || null}
              onChange={onRequiredPhotoUpload("frontRightSide")}
              onDelete={() => onDeleteRequiredPhoto("frontRightSide")}
              onCameraCapture={onCameraCapture ? onCameraCapture("frontRightSide") : undefined}
            />

            <PhotoUploadField
              label="Foto Segel"
              preview={formData.requiredPhotos.seal?.preview || null}
              onChange={onRequiredPhotoUpload("seal")}
              onDelete={() => onDeleteRequiredPhoto("seal")}
              onCameraCapture={onCameraCapture ? onCameraCapture("seal") : undefined}
            />

            <PhotoUploadField
              label="Tampak Belakang Sebelum Dibuka"
              preview={formData.requiredPhotos.backBeforeOpen?.preview || null}
              onChange={onRequiredPhotoUpload("backBeforeOpen")}
              onDelete={() => onDeleteRequiredPhoto("backBeforeOpen")}
              onCameraCapture={onCameraCapture ? onCameraCapture("backBeforeOpen") : undefined}
            />

            <PhotoUploadField
              label="Foto Samping Kanan"
              preview={formData.requiredPhotos.rightSide?.preview || null}
              onChange={onRequiredPhotoUpload("rightSide")}
              onDelete={() => onDeleteRequiredPhoto("rightSide")}
              onCameraCapture={onCameraCapture ? onCameraCapture("rightSide") : undefined}
            />

            <PhotoUploadField
              label="Foto Samping Kiri"
              preview={formData.requiredPhotos.leftSide?.preview || null}
              onChange={onRequiredPhotoUpload("leftSide")}
              onDelete={() => onDeleteRequiredPhoto("leftSide")}
              onCameraCapture={onCameraCapture ? onCameraCapture("leftSide") : undefined}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-700">
            <Badge className="bg-red-500">Wajib</Badge>
            Foto Transaksi {formData.transactionType}
          </h3>

          {formData.transactionType === "Inbound" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PhotoUploadField
                label="Foto Sebelum Bongkar"
                preview={formData.photos.beforeUnloading?.preview || null}
                onChange={onPhotoUpload("beforeUnloading")}
                onDelete={() => onDeletePhoto("beforeUnloading")}
                height="h-48"
                onCameraCapture={onCameraCaptureForPhoto ? onCameraCaptureForPhoto("beforeUnloading") : undefined}
              />

              <PhotoUploadField
                label="Foto Sesudah Bongkar"
                preview={formData.photos.afterUnloading?.preview || null}
                onChange={onPhotoUpload("afterUnloading")}
                onDelete={() => onDeletePhoto("afterUnloading")}
                height="h-48"
                onCameraCapture={onCameraCaptureForPhoto ? onCameraCaptureForPhoto("afterUnloading") : undefined}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PhotoUploadField
                label="Foto Sebelum Muat"
                preview={formData.photos.beforeLoading?.preview || null}
                onChange={onPhotoUpload("beforeLoading")}
                onDelete={() => onDeletePhoto("beforeLoading")}
                height="h-48"
                onCameraCapture={onCameraCaptureForPhoto ? onCameraCaptureForPhoto("beforeLoading") : undefined}
              />

              <PhotoUploadField
                label="Foto Sesudah Muat"
                preview={formData.photos.afterLoading?.preview || null}
                onChange={onPhotoUpload("afterLoading")}
                onDelete={() => onDeletePhoto("afterLoading")}
                height="h-48"
                onCameraCapture={onCameraCaptureForPhoto ? onCameraCaptureForPhoto("afterLoading") : undefined}
              />
            </div>
          )}
        </div>

        <Separator />

        <Accordion type="single" collapsible className="bg-gray-50 rounded-lg border border-gray-200">
          <AccordionItem value="product-photos" className="border-b-0">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-100 rounded-t-lg">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-gray-500" />
                <span>Foto Produk (Opsional)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {formData.photos.products.map((photo, index) => (
                  <div key={photo.id} className="space-y-2">
                    <PhotoUploadField
                      label={`Foto Produk ${index + 1}`}
                      preview={photo.preview}
                      onChange={onPhotoUpload("products", index)}
                      onDelete={() => onDeletePhoto("products", index)}
                      height="h-32"
                      onCameraCapture={onCameraCaptureForPhoto ? onCameraCaptureForPhoto("products", index) : undefined}
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 pb-6">
        <Button type="button" variant="outline" onClick={onPrevTab}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <Button type="button" onClick={onNextTab} className="bg-blue-600 hover:bg-blue-700">
          Lanjut
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
