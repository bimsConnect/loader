"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
  const [customerSuggestions, setCustomerSuggestions] = useState<string[]>([])
  const [vehicleNumberSuggestions, setVehicleNumberSuggestions] = useState<string[]>([])
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false)
  const [showVehicleNumberSuggestions, setShowVehicleNumberSuggestions] = useState(false)

  // Load saved suggestions from localStorage on component mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem("savedCustomers")
    const savedVehicleNumbers = localStorage.getItem("savedVehicleNumbers")

    if (savedCustomers) {
      setCustomerSuggestions(JSON.parse(savedCustomers))
    }

    if (savedVehicleNumbers) {
      setVehicleNumberSuggestions(JSON.parse(savedVehicleNumbers))
    }
  }, [])

  // Save new values to localStorage and update suggestions
  const handleCustomerBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (value && !customerSuggestions.includes(value)) {
      const newSuggestions = [...customerSuggestions, value]
      setCustomerSuggestions(newSuggestions)
      localStorage.setItem("savedCustomers", JSON.stringify(newSuggestions))
    }
    setShowCustomerSuggestions(false)
  }

  const handleVehicleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (value && !vehicleNumberSuggestions.includes(value)) {
      const newSuggestions = [...vehicleNumberSuggestions, value]
      setVehicleNumberSuggestions(newSuggestions)
      localStorage.setItem("savedVehicleNumbers", JSON.stringify(newSuggestions))
    }
    setShowVehicleNumberSuggestions(false)
  }

  const handleCustomerFocus = () => {
    setShowCustomerSuggestions(true)
  }

  const handleVehicleNumberFocus = () => {
    setShowVehicleNumberSuggestions(true)
  }

  const selectCustomerSuggestion = (suggestion: string) => {
    const event = {
      target: {
        name: "customerName",
        value: suggestion,
      },
    } as React.ChangeEvent<HTMLInputElement>

    onInputChange(event)
    setShowCustomerSuggestions(false)
  }

  const selectVehicleNumberSuggestion = (suggestion: string) => {
    const event = {
      target: {
        name: "vehicleNumber",
        value: suggestion,
      },
    } as React.ChangeEvent<HTMLInputElement>

    onInputChange(event)
    setShowVehicleNumberSuggestions(false)
  }

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

        <div className="space-y-2 relative">
          <Label htmlFor="customerName" className="flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            Nama Customer
          </Label>
          <Input
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={onInputChange}
            onFocus={handleCustomerFocus}
            onBlur={handleCustomerBlur}
            placeholder="Masukkan nama customer"
            className="border-gray-200"
            autoComplete="off"
          />
          {showCustomerSuggestions && customerSuggestions.length > 0 && formData.customerName && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {customerSuggestions
                .filter(
                  (suggestion) =>
                    suggestion.toLowerCase().includes(formData.customerName.toLowerCase()) &&
                    suggestion.toLowerCase() !== formData.customerName.toLowerCase(),
                )
                .map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                    onMouseDown={() => selectCustomerSuggestion(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
            </div>
          )}
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

          <div className="space-y-2 relative">
            <Label htmlFor="vehicleNumber" className="flex items-center gap-2">
              <Truck size={16} className="text-gray-500" />
              No Polisi Kendaraan
            </Label>
            <Input
              id="vehicleNumber"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={onInputChange}
              onFocus={handleVehicleNumberFocus}
              onBlur={handleVehicleNumberBlur}
              placeholder="Masukkan nomor polisi"
              className="border-gray-200"
              autoComplete="off"
            />
            {showVehicleNumberSuggestions && vehicleNumberSuggestions.length > 0 && formData.vehicleNumber && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {vehicleNumberSuggestions
                  .filter(
                    (suggestion) =>
                      suggestion.toLowerCase().includes(formData.vehicleNumber.toLowerCase()) &&
                      suggestion.toLowerCase() !== formData.vehicleNumber.toLowerCase(),
                  )
                  .map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                      onMouseDown={() => selectVehicleNumberSuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {formData.vehicleType.includes("Container") && (
          <div className="space-y-2">
            <Label htmlFor="containerNumber" className="flex items-center gap-2">
              <Truck size={16} className="text-gray-500" />
              No Container <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="containerNumber"
              name="containerNumber"
              value={formData.containerNumber}
              onChange={onInputChange}
              placeholder="Masukkan nomor container"
              className="border-gray-200"
              required={formData.vehicleType.includes("Container")}
            />
          </div>
        )}

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
