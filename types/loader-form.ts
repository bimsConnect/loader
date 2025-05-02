export type PhotoType = {
  id: string
  file: File | null
  preview: string | null
}

export type RequiredPhotos = {
  frontView: PhotoType | null
  frontLeftSide: PhotoType | null
  frontRightSide: PhotoType | null
  seal: PhotoType | null
  backBeforeOpen: PhotoType | null
  rightSide: PhotoType | null
  leftSide: PhotoType | null
}

export type FormData = {
  date: string
  plant: string
  customerName: string
  vehicleType: string
  vehicleNumber: string
  containerNumber: string
  warehouseName: string
  transactionType: "Inbound" | "Outbound"
  requiredPhotos: RequiredPhotos
  photos: {
    beforeUnloading: PhotoType | null
    afterUnloading: PhotoType | null
    beforeLoading: PhotoType | null
    afterLoading: PhotoType | null
    products: PhotoType[]
  }
  checkerName: string
}
