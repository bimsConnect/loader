"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Camera, Check, Trash2, ImageIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PhotoUploadFieldProps {
  label: string
  preview: string | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDelete?: () => void
  className?: string
  height?: string
  onCameraCapture?: (imageData: string) => void
}

export function PhotoUploadField({
  label,
  preview,
  onChange,
  onDelete,
  className = "",
  height = "h-40",
  onCameraCapture,
}: PhotoUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  // Clean up camera resources when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  const openCamera = async () => {
    setCameraError(null)
    setCameraReady(false)

    try {
      // First try to get the environment-facing camera (back camera on mobile)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        setCameraStream(stream)
        setShowCamera(true)

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        // If environment camera fails, try any available camera
        console.log("Couldn't access back camera, trying any camera")
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })

        setCameraStream(stream)
        setShowCamera(true)

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setCameraError("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.")
    }
  }

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
    setCameraReady(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && onCameraCapture) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the video frame to the canvas
      const context = canvas.getContext("2d")
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL
        const imageData = canvas.toDataURL("image/jpeg", 0.9)
        onCameraCapture(imageData)

        // Close camera
        closeCamera()
      }
    }
  }

  const handleVideoLoaded = () => {
    setCameraReady(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete()
    }
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      <div
        className={`border-2 border-dashed rounded-lg p-4 ${height} flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${
          preview ? "border-blue-500" : "border-gray-300"
        }`}
        onClick={preview ? undefined : handleBrowseClick}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onChange} />

        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview || "/placeholder.svg"}
              alt={`Preview for ${label}`}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
              <Check size={16} />
            </div>
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute bottom-2 right-2 h-8 w-8"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                <span className="sr-only">Delete photo</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={openCamera}
              >
                <Camera size={16} />
                Ambil Foto
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleBrowseClick}
              >
                <ImageIcon size={16} />
                Pilih dari Galeri
              </Button>
            </div>
            <p className="text-sm text-gray-500">Klik untuk memilih atau mengambil foto</p>
          </div>
        )}
      </div>

      {/* Camera Dialog */}
      <Dialog open={showCamera} onOpenChange={(open) => !open && closeCamera()}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Ambil Foto</DialogTitle>
          <div className="flex flex-col items-center gap-4">
            {cameraError ? (
              <Alert variant="destructive">
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    onLoadedData={handleVideoLoaded}
                  />
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                      Memuat kamera...
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={closeCamera}>
                    Batal
                  </Button>
                  <Button
                    type="button"
                    onClick={capturePhoto}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!cameraReady}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Ambil Foto
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
