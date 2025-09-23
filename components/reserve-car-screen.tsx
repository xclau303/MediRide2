"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Car, ShipWheelIcon as Wheelchair, Stethoscope } from "lucide-react"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface ReserveCarScreenProps {
  onNavigate: (screen: Screen) => void
  goBack: () => void
}

export function ReserveCarScreen({ onNavigate, goBack }: ReserveCarScreenProps) {
  const [selectedCarType, setSelectedCarType] = useState<string | null>(null)

  const carTypes = [
    {
      id: "sedan",
      name: "Standard Sedan",
      description: "Comfortable and economical.",
      icon: <Car className="h-6 w-6 text-blue-600" />,
      price: "$18.00",
    },
    {
      id: "wheelchair-van",
      name: "Wheelchair Van",
      description: "Equipped for wheelchair accessibility.",
      icon: <Wheelchair className="h-6 w-6 text-blue-600" />,
      price: "$35.00",
    },
    {
      id: "medical-van",
      name: "Medical Van",
      description: "For patients requiring medical assistance.",
      icon: <Stethoscope className="h-6 w-6 text-blue-600" />,
      price: "$50.00",
    },
  ]

  const handleSelectCar = (id: string) => {
    setSelectedCarType(id)
  }

  const handleConfirmReservation = () => {
    if (selectedCarType) {
      onNavigate("reservation-confirmed")
    } else {
      alert("Please select a car type.")
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Reserve Your Car</h1>

          <div className="space-y-4 mb-8">
            {carTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer ${
                  selectedCarType === type.id ? "border-blue-600 ring-2 ring-blue-600" : "border-gray-200"
                }`}
                onClick={() => handleSelectCar(type.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-full">{type.icon}</div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{type.name}</h2>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-lg font-bold text-gray-900">{type.price}</p>
                    {selectedCarType === type.id && <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleConfirmReservation}
            disabled={!selectedCarType}
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium disabled:bg-gray-300"
          >
            Confirm Reservation
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
