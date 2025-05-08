"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { FileText, ImageIcon, ClipboardSignature, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FormTabSystem } from "./form-tabs/form-tab-system"
import { GeneralInfoTab } from "./loader-form/general-info-tab"
import { PhotosTab } from "./loader-form/photos-tab"
import { SignatureTab } from "./loader-form/signature-tab"
import { SuccessDialog } from "./ui/success-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import type { FormData } from "@/types/loader-form"

// Dummy data
const PLANTS = ["Cibitung", "Cikarang"]
const VEHICLE_TYPES = ["Pribadi", "Grandmax", "CDE", "CDD", "Fuso", "Wingbox", "Container 20FT", "Container 40FT"]

// Function to create empty form data
const createEmptyFormData = (today: string, userName: string): FormData => ({
  date: today,
  plant: PLANTS[0],
  customerName: "",
  vehicleType: "",
  vehicleNumber: "",
  containerNumber: "",
  transactionType: "Inbound",
  requiredPhotos: {
    frontView: null,
    frontLeftSide: null,
    frontRightSide: null,
    seal: null,
    backBeforeOpen: null,
    rightSide: null,
    leftSide: null,
  },
  photos: {
    beforeUnloading: null,
    afterUnloading: null,
    beforeLoading: null,
    afterLoading: null,
    products: Array(7)
      .fill(null)
      .map(() => ({
        id: crypto.randomUUID(),
        file: null,
        preview: null,
      })),
  },
  checkerName: userName || "Guest User",
})

// Tambahkan fungsi fetchWithRetry untuk mengatasi masalah pengiriman form yang kadang gagal
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3) => {
  let retries = 0

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options)

      // Jika respons OK, kembalikan respons
      if (response.ok) {
        return response
      }

      // Jika respons tidak OK, coba parse error
      let errorMessage = `Error: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        // Jika tidak bisa parse JSON, gunakan pesan error default
      }

      // Jika ini percobaan terakhir, lempar error
      if (retries === maxRetries - 1) {
        throw new Error(errorMessage)
      }

      // Tunggu sebelum mencoba lagi (dengan backoff eksponensial)
      const waitTime = Math.pow(2, retries) * 1000
      await new Promise((resolve) => setTimeout(resolve, waitTime))

      retries++
    } catch (error) {
      // Jika ini percobaan terakhir, lempar error
      if (retries === maxRetries - 1) {
        throw error
      }

      // Tunggu sebelum mencoba lagi
      const waitTime = Math.pow(2, retries) * 1000
      await new Promise((resolve) => setTimeout(resolve, waitTime))

      retries++
    }
  }

  // Jika semua percobaan gagal
  throw new Error("Maximum retries exceeded")
}

export default function LoaderRequestForm() {
  const { user } = useAuth()
  const today = format(new Date(), "yyyy-MM-dd", { locale: id })
  const [activeTab, setActiveTab] = useState("general")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successDialogContent, setSuccessDialogContent] = useState({
    title: "",
    description: "",
  })
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    title: "",
    message: "",
  })
  const [documentNumber, setDocumentNumber] = useState("-")

  // Store form data for each tab
  const [tabsData, setTabsData] = useState<Record<string, FormData>>({
    "tab-1": createEmptyFormData(today, user?.name || "Guest User"),
  })
  const [currentTabId, setCurrentTabId] = useState("tab-1")
  const [nextTabNumber, setNextTabNumber] = useState(2)

  // Current form data is the data for the active tab
  const formData = tabsData[currentTabId]

  // Update checker name when user changes
  useEffect(() => {
    if (user?.name) {
      setTabsData((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((tabId) => {
          updated[tabId] = {
            ...updated[tabId],
            checkerName: user.name,
          }
        })
        return updated
      })
    }
  }, [user])

  // Fetch the next document number
  useEffect(() => {
    const fetchNextDocumentNumber = async () => {
      try {
        const response = await fetchWithRetry("/api/document-number", { method: "GET" }, 3)
        const data = await response.json()
        setDocumentNumber(data.documentNumber)
      } catch (error) {
        console.error("Error fetching document number:", error)
      }
    }

    fetchNextDocumentNumber()
  }, [])

  const handleTabChange = (tabId: string) => {
    setCurrentTabId(tabId)
    // Reset form state for the new tab
    setActiveTab("general")
    setSubmitted(false)
  }

  const handleNewTab = () => {
    const newTabId = `tab-${nextTabNumber}`
    setTabsData((prev) => ({
      ...prev,
      [newTabId]: createEmptyFormData(today, user?.name || "Guest User"),
    }))
    setCurrentTabId(newTabId)
    setActiveTab("general")
    setSubmitted(false)
    setNextTabNumber((prevNumber) => prevNumber + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTabsData((prev) => ({
      ...prev,
      [currentTabId]: { ...prev[currentTabId], [name]: value },
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setTabsData((prev) => ({
      ...prev,
      [currentTabId]: { ...prev[currentTabId], [name]: value },
    }))
  }

  const handleRequiredPhotoUpload = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        setTabsData((prev) => ({
          ...prev,
          [currentTabId]: {
            ...prev[currentTabId],
            requiredPhotos: {
              ...prev[currentTabId].requiredPhotos,
              [type]: {
                id: crypto.randomUUID(),
                file,
                preview: event.target?.result as string,
              },
            },
          },
        }))
      }

      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = (type: string) => (imageData: string) => {
    // Convert base64 to file
    fetch(imageData)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" })

        setTabsData((prev) => ({
          ...prev,
          [currentTabId]: {
            ...prev[currentTabId],
            requiredPhotos: {
              ...prev[currentTabId].requiredPhotos,
              [type]: {
                id: crypto.randomUUID(),
                file,
                preview: imageData,
              },
            },
          },
        }))
      })
  }

  const handleCameraCaptureForPhoto = (type: string, index?: number) => (imageData: string) => {
    fetch(imageData)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" })

        if (index !== undefined) {
          // Handle product photos
          setTabsData((prev) => {
            const currentData = prev[currentTabId]
            const newProducts = [...currentData.photos.products]
            newProducts[index] = {
              id: currentData.photos.products[index].id,
              file,
              preview: imageData,
            }
            return {
              ...prev,
              [currentTabId]: {
                ...currentData,
                photos: {
                  ...currentData.photos,
                  products: newProducts,
                },
              },
            }
          })
        } else {
          // Handle other photos
          setTabsData((prev) => ({
            ...prev,
            [currentTabId]: {
              ...prev[currentTabId],
              photos: {
                ...prev[currentTabId].photos,
                [type]: {
                  id: crypto.randomUUID(),
                  file,
                  preview: imageData,
                },
              },
            },
          }))
        }
      })
  }

  const handleDeleteRequiredPhoto = (type: string) => {
    setTabsData((prev) => ({
      ...prev,
      [currentTabId]: {
        ...prev[currentTabId],
        requiredPhotos: {
          ...prev[currentTabId].requiredPhotos,
          [type]: null,
        },
      },
    }))
  }

  const handlePhotoUpload = (type: string, index?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        if (index !== undefined) {
          // Handle product photos
          setTabsData((prev) => {
            const currentData = prev[currentTabId]
            const newProducts = [...currentData.photos.products]
            newProducts[index] = {
              id: currentData.photos.products[index].id,
              file,
              preview: event.target?.result as string,
            }
            return {
              ...prev,
              [currentTabId]: {
                ...currentData,
                photos: {
                  ...currentData.photos,
                  products: newProducts,
                },
              },
            }
          })
        } else {
          // Handle other photos
          setTabsData((prev) => ({
            ...prev,
            [currentTabId]: {
              ...prev[currentTabId],
              photos: {
                ...prev[currentTabId].photos,
                [type]: {
                  id: crypto.randomUUID(),
                  file,
                  preview: event.target?.result as string,
                },
              },
            },
          }))
        }
      }

      reader.readAsDataURL(file)
    }
  }

  const handleDeletePhoto = (type: string, index?: number) => {
    if (index !== undefined) {
      // Handle product photos
      setTabsData((prev) => {
        const currentData = prev[currentTabId]
        const newProducts = [...currentData.photos.products]
        newProducts[index] = {
          id: currentData.photos.products[index].id,
          file: null,
          preview: null,
        }
        return {
          ...prev,
          [currentTabId]: {
            ...currentData,
            photos: {
              ...currentData.photos,
              products: newProducts,
            },
          },
        }
      })
    } else {
      // Handle other photos
      setTabsData((prev) => ({
        ...prev,
        [currentTabId]: {
          ...prev[currentTabId],
          photos: {
            ...prev[currentTabId].photos,
            [type]: null,
          },
        },
      }))
    }
  }

  const isGeneralInfoValid = () => {
    const { customerName, vehicleType, vehicleNumber } = formData

    if (!customerName || !vehicleType || !vehicleNumber) {
      return false
    }

    // Pastikan Container Number diisi jika Vehicle Type mengandung kata "Container"
    if (vehicleType.includes("Container") && !formData.containerNumber) {
      return false
    }

    return true
  }

  const isRequiredPhotosValid = () => {
    const { requiredPhotos } = formData
    return (
      requiredPhotos.frontView !== null &&
      requiredPhotos.frontLeftSide !== null &&
      requiredPhotos.frontRightSide !== null &&
      requiredPhotos.seal !== null &&
      requiredPhotos.backBeforeOpen !== null &&
      requiredPhotos.rightSide !== null &&
      requiredPhotos.leftSide !== null
    )
  }

  const isTransactionPhotosValid = () => {
    const { transactionType, photos } = formData

    if (transactionType === "Inbound") {
      return photos.beforeUnloading !== null && photos.afterUnloading !== null
    } else {
      return photos.beforeLoading !== null && photos.afterLoading !== null
    }
  }

  const isPhotosValid = () => {
    return isRequiredPhotosValid() && isTransactionPhotosValid()
  }

  const isFormValid = () => {
    return isGeneralInfoValid() && isPhotosValid()
  }

  const getCompletionPercentage = () => {
    let total = 0
    let completed = 0

    // General info (6 fields) - Removed warehouseName
    total += 6
    if (formData.date) completed += 1
    if (formData.plant) completed += 1
    if (formData.customerName) completed += 1
    if (formData.vehicleType) completed += 1
    if (formData.vehicleNumber) completed += 1
    if (formData.vehicleType !== "Container" || formData.containerNumber) completed += 1

    // Required photos (7 photos)
    total += 7
    if (formData.requiredPhotos.frontView) completed += 1
    if (formData.requiredPhotos.frontLeftSide) completed += 1
    if (formData.requiredPhotos.frontRightSide) completed += 1
    if (formData.requiredPhotos.seal) completed += 1
    if (formData.requiredPhotos.backBeforeOpen) completed += 1
    if (formData.requiredPhotos.rightSide) completed += 1
    if (formData.requiredPhotos.leftSide) completed += 1

    // Transaction photos (2 photos)
    total += 2
    if (formData.transactionType === "Inbound") {
      if (formData.photos.beforeUnloading) completed += 1
      if (formData.photos.afterUnloading) completed += 1
    } else {
      if (formData.photos.beforeLoading) completed += 1
      if (formData.photos.afterLoading) completed += 1
    }

    return Math.round((completed / total) * 100)
  }

  // Ubah fungsi handleSaveDraft untuk menggunakan fetchWithRetry
  const handleSaveDraft = async () => {
    setLoading(true)

    try {
      const response = await fetchWithRetry(
        "/api/loader-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            status: "draft",
            documentNumber: documentNumber,
          }),
        },
        3,
      )

      const data = await response.json()

      // Show success dialog
      setSuccessDialogContent({
        title: "Draft Tersimpan",
        description: "Draft form permintaan loader berhasil disimpan. Anda dapat melanjutkan pengisian form nanti.",
      })
      setShowSuccessDialog(true)
    } catch (error) {
      console.error("Error saving draft:", error)
      setErrorDialog({
        open: true,
        title: "Gagal Menyimpan Draft",
        message: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan draft",
      })
    } finally {
      setLoading(false)
    }
  }

  // Ubah fungsi handleSubmit untuk menggunakan fetchWithRetry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid()) {
      setErrorDialog({
        open: true,
        title: "Form Belum Lengkap",
        message: "Mohon lengkapi semua data yang diperlukan sebelum mengirim form.",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetchWithRetry(
        "/api/loader-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            status: "submitted",
            documentNumber: documentNumber,
          }),
        },
        3,
      )

      const data = await response.json()

      setSubmitted(true)

      // Show success dialog
      setSuccessDialogContent({
        title: "Form Berhasil Dikirim",
        description: "Form permintaan loader berhasil dikirim. Anda dapat mencetak dokumen ini.",
      })
      setShowSuccessDialog(true)

      // Fetch new document number for next submission
      fetchNextDocumentNumber()
    } catch (error) {
      console.error("Error submitting form:", error)
      setErrorDialog({
        open: true,
        title: "Gagal Mengirim Form",
        message: error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim form",
      })
    } finally {
      setLoading(false)
    }
  }

  // Ubah fungsi fetchNextDocumentNumber untuk menggunakan fetchWithRetry
  const fetchNextDocumentNumber = async () => {
    try {
      const response = await fetchWithRetry("/api/document-number", { method: "GET" }, 3)
      const data = await response.json()
      setDocumentNumber(data.documentNumber)
    } catch (error) {
      console.error("Error fetching document number:", error)
    }
  }

  const handlePrint = () => {
    // In a real app, this would generate a PDF
    alert("Mencetak dokumen...")
  }

  const completionPercentage = getCompletionPercentage()

  return (
    <FormTabSystem onTabChange={handleTabChange} onNewTab={handleNewTab}>
      <form onSubmit={handleSubmit}>
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Form Permintaan Loader</h2>
              <p className="text-gray-500 text-sm">Lengkapi semua informasi yang diperlukan</p>
            </div>
            <div className="w-full md:w-1/3">
              <div className="flex justify-between mb-1 text-sm">
                <span>Progress</span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <FileText size={16} />
              <span className="hidden sm:inline">Informasi Umum</span>
              <span className="sm:hidden">Info</span>
              {isGeneralInfoValid() && <Badge className="ml-auto bg-green-500">✓</Badge>}
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <ImageIcon size={16} />
              <span className="hidden sm:inline">Upload Foto</span>
              <span className="sm:hidden">Foto</span>
              {isPhotosValid() && <Badge className="ml-auto bg-green-500">✓</Badge>}
            </TabsTrigger>
            <TabsTrigger value="signature" className="flex items-center gap-2">
              <ClipboardSignature size={16} />
              <span className="hidden sm:inline">Konfirmasi</span>
              <span className="sm:hidden">Konfirmasi</span>
              {submitted && <Badge className="ml-auto bg-green-500">✓</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralInfoTab
              formData={formData}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onNextTab={() => setActiveTab("photos")}
              plants={PLANTS}
              vehicleTypes={VEHICLE_TYPES}
            />
          </TabsContent>

          <TabsContent value="photos">
            <PhotosTab
              formData={formData}
              onRequiredPhotoUpload={handleRequiredPhotoUpload}
              onPhotoUpload={handlePhotoUpload}
              onDeleteRequiredPhoto={handleDeleteRequiredPhoto}
              onDeletePhoto={handleDeletePhoto}
              onPrevTab={() => setActiveTab("general")}
              onNextTab={() => setActiveTab("signature")}
              onCameraCapture={handleCameraCapture}
              onCameraCaptureForPhoto={handleCameraCaptureForPhoto}
            />
          </TabsContent>

          <TabsContent value="signature">
            <SignatureTab
              formData={formData}
              isFormValid={() => isFormValid()}
              isRequiredPhotosValid={() => isRequiredPhotosValid()}
              isTransactionPhotosValid={() => isTransactionPhotosValid()}
              isGeneralInfoValid={() => isGeneralInfoValid()}
              loading={loading}
              submitted={submitted}
              onPrevTab={() => setActiveTab("photos")}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
              onPrint={handlePrint}
              documentNumber={documentNumber}
            />
          </TabsContent>
        </Tabs>
      </form>

      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title={successDialogContent.title}
        description={successDialogContent.description}
      />

      {/* Error Dialog */}
      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {errorDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{errorDialog.message}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setErrorDialog((prev) => ({ ...prev, open: false }))}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormTabSystem>
  )
}
