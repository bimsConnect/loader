"use client"

import type React from "react"

import { Building, Calendar, FileText, Truck, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight } from "lucide-react"
import type { FormData } from "@/types/loader-form"

interface GeneralInfoTabProps {
  formData: FormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectChange: (name: string, value: string) => void
  onNextTab: () => void
  plants: string[]
  vehicleTypes: string[]
}

export function GeneralInfoTab({
  formData,
  onInputChange,
  onSelectChange,
  onNextTab,
  plants,
  vehicleTypes,
}: GeneralInfoTabProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <FileText className="h-5 w-5 text-blue-600" />
          Informasi Umum
        </CardTitle>
        <CardDescription>Masukkan informasi dasar permintaan loader</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              Tanggal
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              readOnly
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plant" className="flex items-center gap-2">
              <Building size={16} className="text-gray-500" />
              Plant
            </Label>
            <Select value={formData.plant} onValueChange={(value) => onSelectChange("plant", value)}>
              <SelectTrigger id="plant" className="border-gray-200">
                <SelectValue placeholder="Pilih plant" />
              </SelectTrigger>
              <SelectContent>
                {plants.map((plant) => (
                  <SelectItem key={plant} value={plant}>
                    {plant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerName" className="flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            Nama Customer
          </Label>
          <Input
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={onInputChange}
            placeholder="Masukkan nama customer"
            className="border-gray-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="vehicleType" className="flex items-center gap-2">
              <Truck size={16} className="text-gray-500" />
              Tipe Kendaraan
            </Label>
            <Select value={formData.vehicleType} onValueChange={(value) => onSelectChange("vehicleType", value)}>
              <SelectTrigger id="vehicleType" className="border-gray-200">
                <SelectValue placeholder="Pilih tipe kendaraan" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleNumber" className="flex items-center gap-2">
              <Truck size={16} className="text-gray-500" />
              No Polisi Kendaraan
            </Label>
            <Input
              id="vehicleNumber"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={onInputChange}
              placeholder="Masukkan nomor polisi"
              className="border-gray-200"
            />
          </div>
        </div>

        {formData.vehicleType === "Container" && (
          <div className="space-y-2">
            <Label htmlFor="containerNumber" className="flex items-center gap-2">
              <Truck size={16} className="text-gray-500" />
              No Container
            </Label>
            <Input
              id="containerNumber"
              name="containerNumber"
              value={formData.containerNumber}
              onChange={onInputChange}
              placeholder="Masukkan nomor container"
              className="border-gray-200"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="warehouseName" className="flex items-center gap-2">
            <Building size={16} className="text-gray-500" />
            Nama Gudang
          </Label>
          <Input
            id="warehouseName"
            name="warehouseName"
            value={formData.warehouseName}
            onChange={onInputChange}
            placeholder="Masukkan nama gudang"
            className="border-gray-200"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Truck size={16} className="text-gray-500" />
            Tipe Transaksi
          </Label>
          <RadioGroup
            value={formData.transactionType}
            onValueChange={(value) => onSelectChange("transactionType", value as "Inbound" | "Outbound")}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-md border border-gray-200">
              <RadioGroupItem value="Inbound" id="inbound" />
              <Label htmlFor="inbound">Inbound</Label>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-md border border-gray-200">
              <RadioGroupItem value="Outbound" id="outbound" />
              <Label htmlFor="outbound">Outbound</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 pb-6">
        <div></div>
        <Button type="button" variant="default" onClick={onNextTab} className="bg-blue-600 hover:bg-blue-700">
          Lanjut
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
