"use client"
import { motion } from "framer-motion"
import {
  Home,
  Car,
  History,
  User,
  Edit,
  Calendar,
  FileText,
  MapPin,
  Phone,
  Globe,
  HelpCircle,
  ChevronRight,
  X,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void
  profileData: any // Added profileData prop
  goBack: () => void
}

export function ProfileScreen({ onNavigate, profileData, goBack }: ProfileScreenProps) {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <BackButton onClick={goBack} />
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* User Info */}
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gray-200 text-gray-600 text-lg">
                {profileData.firstName?.charAt(0).toUpperCase() || "J"}
                {profileData.lastName?.charAt(0).toUpperCase() || "D"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profileData.firstName || "John"} {profileData.lastName || "Doe"}
              </h2>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Insurance Information</h3>
                <p className="text-sm text-gray-600">Manage your insurance details</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full bg-transparent"
                onClick={() => onNavigate("edit-profile")}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🩺</div>
                  <p className="font-medium text-gray-900">Provider</p>
                </div>
                <p className="text-gray-900">{profileData.insuranceProvider || "Health Insurance Co."}</p>
              </div>
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <p className="font-medium text-gray-900">Policy Number</p>
                </div>
                <p className="text-gray-900">{profileData.policyNumber || "XYZ-123456"}</p>
              </div>
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <p className="font-medium text-gray-900">Expiry Date</p>
                </div>
                <p className="text-gray-900">{profileData.expiryDate || "Dec 31, 2025"}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-600">Update your details</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full bg-transparent"
                onClick={() => onNavigate("edit-profile")}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <p className="font-medium text-gray-900">Birthdate</p>
                </div>
                <p className="text-gray-900">
                  {profileData.birthMonth && profileData.birthDay && profileData.birthYear
                    ? `${profileData.birthMonth}/${profileData.birthDay}/${profileData.birthYear}`
                    : "Jan 1, 1980"}
                </p>
              </div>
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-xs text-gray-500">Home Address</p>
                  </div>
                </div>
                <p className="text-gray-900 text-right">{profileData.address || "123 Main St, City, State"}</p>
              </div>
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <p className="font-medium text-gray-900">Phone Number</p>
                </div>
                <p className="text-gray-900">{profileData.phone || "(123) 456-7890"}</p>
              </div>
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <p className="font-medium text-gray-900">Preferred Language</p>
                </div>
                <p className="text-gray-900">{profileData.language || "English"}</p>
              </div>
            </div>
          </div>

          {/* Support Links */}
          <div className="mb-20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account & Support</h3>
            <div className="space-y-4">
              <div
                className="flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                onClick={() => onNavigate("saved-places")}
              >
                <MapPin className="h-5 w-5 text-gray-600" />
                <p className="font-medium text-gray-900">Saved Places</p>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
              </div>
              <div
                className="flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                onClick={() => onNavigate("reset-password")}
              >
                <FileText className="h-5 w-5 text-gray-600" />
                <p className="font-medium text-gray-900">Change Password</p>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
              </div>
              <div
                className="flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                onClick={() => onNavigate("support")} // Navigate to new support screen
              >
                <HelpCircle className="h-5 w-5 text-gray-600" />
                <p className="font-medium text-gray-900">Help & Support</p>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
              </div>
              <div
                className="flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                onClick={() => onNavigate("welcome")} // Log out
              >
                <LogOut className="h-5 w-5 text-red-600" />
                <p className="font-medium text-red-600">Log Out</p>
                <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-2">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Home className="h-6 w-6 mb-1" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => onNavigate("set-location")} // Navigate to set-location for booking
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Car className="h-6 w-6 mb-1" />
            <span className="text-xs">Book</span>
          </button>
          <button
            onClick={() => onNavigate("ride-activity")}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <History className="h-6 w-6 mb-1" />
            <span className="text-xs">Activity</span>
          </button>
          <button onClick={() => onNavigate("profile")} className="flex flex-col items-center text-blue-600">
            <User className="h-6 w-6 mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
