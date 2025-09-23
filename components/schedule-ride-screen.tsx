"use client"

import { useState } from "react"
import { Calendar, Clock } from "lucide-react"
import { BackButton } from "./back-button"

interface ScheduleRideScreenProps {
  onNavigate: (screen: string, data?: any) => void
  pickupLocation?: string
  dropoffLocation?: string
  goBack: () => void
}

export function ScheduleRideScreen({ onNavigate, pickupLocation, dropoffLocation, goBack }: ScheduleRideScreenProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")

  // Generate next 7 days
  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push({
        value: date.toISOString().split("T")[0],
        label:
          i === 0
            ? "Today"
            : i === 1
              ? "Tomorrow"
              : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      })
    }
    return dates
  }

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        slots.push({ value: time, label: displayTime })
      }
    }
    return slots
  }

  const dates = generateDates()
  const timeSlots = generateTimeSlots()

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      onNavigate("choose-ride", {
        pickupLocation,
        dropoffLocation,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        isScheduled: true,
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center">
          <BackButton onClick={goBack} />
          <h1 className="text-xl font-semibold text-gray-900 ml-4">Choose Time & Date</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Route Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">{pickupLocation || "Pickup location"}</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">{dropoffLocation || "Dropoff location"}</span>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Select Date</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {dates.map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  selectedDate === date.value
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">{date.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Select Time</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {timeSlots.map((slot) => (
              <button
                key={slot.value}
                onClick={() => setSelectedTime(slot.value)}
                className={`p-2 rounded-lg border text-sm text-center transition-colors ${
                  selectedTime === slot.value
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <div className="max-w-sm mx-auto">
          <button
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              selectedDate && selectedTime
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
