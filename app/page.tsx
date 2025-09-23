"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SplashScreen } from "@/components/splash-screen"
import { WelcomeScreen } from "@/components/welcome-screen"
import { LoginScreen } from "@/components/login-screen"
import { SignUpScreen } from "@/components/signup-screen"
import { PersonalInfoScreen } from "@/components/personal-info-screen"
import { LocationScreen } from "@/components/location-screen"
import { VerificationScreen } from "@/components/verification-screen"
import { InsuranceScreen } from "@/components/insurance-screen"
import { GuardianScreen } from "@/components/guardian-screen"
import { DashboardScreen } from "@/components/dashboard-screen"
import { ResetPasswordScreen } from "@/components/reset-password-screen"
import { ResetConfirmScreen } from "@/components/reset-confirm-screen"
import { SetLocationScreen } from "@/components/set-location-screen"
import { ScheduleRideScreen } from "@/components/schedule-ride-screen"
import { ChooseRideScreen } from "@/components/choose-ride-screen"
import { BookLaterScreen } from "@/components/book-later-screen"
import { PickupConfirmationScreen } from "@/components/pickup-confirmation-screen"
import { ChangePickupScreen } from "@/components/change-pickup-screen"
import { WaitingForRideScreen } from "@/components/waiting-for-ride-screen"
import { DuringRideScreen } from "@/components/during-ride-screen"
import { RideActivityScreen } from "@/components/ride-activity-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { GuardianInfoScreen } from "@/components/guardian-info-screen"
import { ReserveCarScreen } from "@/components/reserve-car-screen"
import { SavePlaceScreen } from "@/components/save-place-screen"
import { AddPlaceScreen } from "@/components/add-place-screen"
import { ReservationDetailsScreen } from "@/components/reservation-details-screen"
import { ReservationConfirmedScreen } from "@/components/reservation-confirmed-screen"
import { SavedPlacesScreen } from "@/components/saved-places-screen"
import { RideDeniedDetailsScreen } from "@/components/ride-denied-details-screen"
import { EditProfileScreen } from "@/components/edit-profile-screen"
import { FAQScreen } from "@/components/faq-screen"
import { ChatSupportScreen } from "@/components/chat-support-screen"
import { DriverChatScreen } from "@/components/driver-chat-screen"
import { SupportScreen } from "@/components/support-screen"
import { PostRideScreen } from "@/components/post-ride-screen"
import { MapLocationScreen } from "@/components/map-location-screen"
import { ConfirmLocationScreen } from "@/components/confirm-location-screen"
import type { RideSimulation } from "@/types/driver"

export type Screen =
  | "splash"
  | "welcome"
  | "login"
  | "signup"
  | "personal-info"
  | "location"
  | "verification"
  | "insurance"
  | "guardian"
  | "guardian-info"
  | "dashboard"
  | "reset-password"
  | "reset-confirm"
  | "set-location"
  | "confirm-location"
  | "schedule-ride"
  | "choose-ride"
  | "book-later"
  | "pickup-confirmation"
  | "change-pickup"
  | "waiting-for-ride"
  | "during-ride"
  | "post-ride"
  | "ride-activity"
  | "profile"
  | "reserve-car"
  | "save-place"
  | "add-place"
  | "reservation-details"
  | "reservation-confirmed"
  | "saved-places"
  | "ride-denied-details"
  | "edit-profile"
  | "faq"
  | "chat-support"
  | "driver-chat"
  | "support"
  | "map-location"

interface ScreenState {
  name: Screen
  data?: any
}

export default function MediRideApp() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>({ name: "splash" })
  const [screenHistory, setScreenHistory] = useState<ScreenState[]>([])
  const [signupData, setSignupData] = useState({})
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    birthMonth: "01",
    birthDay: "01",
    birthYear: "1980",
    address: "123 Main St, City, State",
    phone: "(123) 456-7890",
    language: "English",
    insuranceProvider: "Health Insurance Co.",
    policyNumber: "XYZ-123456",
    expiryDate: "Dec 31, 2025",
    ridesLeft: 5,
    completedRides: 12,
  })

  const [upcomingRides, setUpcomingRides] = useState<any[]>([])
  const [selectedRideData, setSelectedRideData] = useState<any>(null)

  // Driver simulation state
  const [currentRideSimulation, setCurrentRideSimulation] = useState<RideSimulation | null>(null)

  useEffect(() => {
    if (currentScreen.name === "splash") {
      const timer = setTimeout(() => {
        setCurrentScreen({ name: "welcome" })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen.name])

  const navigateToScreen = (screen: Screen, data?: any) => {
    console.log("--- navigateToScreen called ---")
    console.log("Navigating from:", currentScreen.name)
    console.log("Navigating to:", screen)
    console.log(
      "History before update:",
      screenHistory.map((s) => s.name),
    )

    if (currentScreen.name !== screen && currentScreen.name !== "splash") {
      setScreenHistory((prevHistory) => {
        const updatedHistory = [...prevHistory, currentScreen]
        console.log(
          "History after update:",
          updatedHistory.map((s) => s.name),
        )
        return updatedHistory
      })
    } else {
      console.log("Not adding to history (same screen or splash).")
    }
    setCurrentScreen({ name: screen, data: data || {} })
    console.log("--- navigateToScreen finished ---")
  }

  const goBack = () => {
    console.log("--- goBack function triggered! ---")
    setScreenHistory((prevHistory) => {
      const newHistory = [...prevHistory]
      const lastScreen = newHistory.pop()
      console.log("Current screen before goBack:", currentScreen.name)
      console.log(
        "Screen history before pop:",
        prevHistory.map((s) => s.name),
      )
      console.log("Last screen popped:", lastScreen?.name)

      if (lastScreen) {
        setCurrentScreen(lastScreen)
        console.log("Navigating back to:", lastScreen.name)
      } else {
        setCurrentScreen({ name: "dashboard" })
        console.log("History empty, navigating to dashboard.")
      }
      console.log(
        "Screen history after pop:",
        newHistory.map((s) => s.name),
      )
      console.log("--- goBack finished ---")
      return newHistory
    })
  }

  const updateSignupData = (data: any) => {
    setSignupData((prev) => ({ ...prev, ...data }))
  }

  const updateProfileData = (data: any) => {
    setProfileData((prev) => ({ ...prev, ...data }))
  }

  const addUpcomingRide = (rideData: any) => {
    setSelectedRideData(rideData)

    const newRide = {
      id: Date.now().toString(),
      date: rideData.isScheduled
        ? rideData.scheduledDate
        : new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
      time: rideData.isScheduled
        ? rideData.scheduledTime
        : new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
      pickup: rideData.pickupLocation || "Current Location",
      dropoff: rideData.dropoffLocation || "Destination",
      status: rideData.isScheduled ? "Scheduled" : "Confirmed",
      vehicleType: rideData.vehicleType || "Car Type",
      price: rideData.price || "$15.00",
      isScheduled: rideData.isScheduled || false,
      createdAt: Date.now(),
    }

    setUpcomingRides((prev) => [newRide, ...prev].slice(0, 10))

    if (!rideData.isScheduled) {
      setProfileData((prev) => ({
        ...prev,
        ridesLeft: Math.max(0, prev.ridesLeft - 1),
      }))
    }
  }

  const cancelUpcomingRide = (rideId: string) => {
    setUpcomingRides((prev) => {
      const rideToCancel = prev.find((ride) => ride.id === rideId)

      if (rideToCancel && !rideToCancel.isScheduled) {
        const now = new Date()
        const rideTime = new Date(rideToCancel.createdAt + 10 * 60 * 1000)

        if (now < rideTime) {
          setProfileData((prevProfile) => ({
            ...prevProfile,
            ridesLeft: prevProfile.ridesLeft + 1,
          }))
        }
      }

      return prev.filter((ride) => ride.id !== rideId)
    })
  }

  const renderScreen = () => {
    switch (currentScreen.name) {
      case "splash":
        return <SplashScreen />
      case "welcome":
        return <WelcomeScreen onNavigate={navigateToScreen} />
      case "login":
        return <LoginScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "signup":
        return <SignUpScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "personal-info":
        return <PersonalInfoScreen onNavigate={navigateToScreen} onUpdateData={updateSignupData} goBack={goBack} />
      case "location":
        return <LocationScreen onNavigate={navigateToScreen} onUpdateData={updateSignupData} goBack={goBack} />
      case "verification":
        return <VerificationScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "insurance":
        return <InsuranceScreen onNavigate={navigateToScreen} onUpdateData={updateSignupData} goBack={goBack} />
      case "guardian":
        return <GuardianScreen onNavigate={navigateToScreen} onUpdateData={updateSignupData} goBack={goBack} />
      case "guardian-info":
        return <GuardianInfoScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "set-location":
        return (
          <SetLocationScreen
            onNavigate={navigateToScreen}
            initialPickup={currentScreen.data?.initialPickup}
            initialDropoff={currentScreen.data?.selectedAddress || currentScreen.data?.initialDropoff}
            goBack={goBack}
          />
        )
      case "schedule-ride":
        return (
          <ScheduleRideScreen
            onNavigate={navigateToScreen}
            pickupLocation={currentScreen.data?.pickupLocation}
            dropoffLocation={currentScreen.data?.dropoffLocation}
            goBack={goBack}
          />
        )
      case "choose-ride":
        return (
          <ChooseRideScreen
            onNavigate={navigateToScreen}
            pickupLocation={currentScreen.data?.pickupLocation}
            dropoffLocation={currentScreen.data?.dropoffLocation}
            pickupLatLng={currentScreen.data?.pickupLatLng}
            dropoffLatLng={currentScreen.data?.dropoffLatLng}
            scheduledDate={currentScreen.data?.scheduledDate}
            scheduledTime={currentScreen.data?.scheduledTime}
            isScheduled={currentScreen.data?.isScheduled}
            onBookRide={addUpcomingRide}
            goBack={goBack}
            routeInfo={currentScreen.data?.routeInfo}
            routeCoordinates={currentScreen.data?.routeCoordinates}
            // Pass driver simulation functions
            currentRideSimulation={currentRideSimulation}
            setCurrentRideSimulation={setCurrentRideSimulation}
          />
        )
      case "book-later":
        return (
          <BookLaterScreen
            onNavigate={navigateToScreen}
            goBack={goBack}
            pickupAddress={currentScreen.data?.pickupLocation}
            destinationAddress={currentScreen.data?.dropoffLocation}
            pickupLatLng={currentScreen.data?.pickupLatLng}
            dropoffLatLng={currentScreen.data?.dropoffLatLng}
          />
        )
      case "pickup-confirmation":
        return <PickupConfirmationScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "change-pickup":
        return (
          <ChangePickupScreen
            onNavigate={navigateToScreen}
            initialPickup={currentScreen.data?.initialPickup}
            goBack={goBack}
          />
        )
      case "waiting-for-ride":
        return (
          <WaitingForRideScreen
            onNavigate={navigateToScreen}
            pickupLocation={currentScreen.data?.pickupLocation}
            dropoffLocation={currentScreen.data?.dropoffLocation}
            pickupLatLng={currentScreen.data?.pickupLatLng}
            dropoffLatLng={currentScreen.data?.dropoffLatLng}
            rideSimulation={currentRideSimulation}
            setRideSimulation={setCurrentRideSimulation}
          />
        )
      case "during-ride":
        return (
          <DuringRideScreen
            onNavigate={navigateToScreen}
            pickupLocation={currentScreen.data?.pickupLocation}
            dropoffLocation={currentScreen.data?.dropoffLocation}
            pickupLatLng={currentScreen.data?.pickupLatLng}
            dropoffLatLng={currentScreen.data?.dropoffLatLng}
            rideSimulation={currentRideSimulation}
            setRideSimulation={setCurrentRideSimulation}
          />
        )
      case "post-ride":
        return (
          <PostRideScreen
            onNavigate={navigateToScreen}
            tripData={{
              pickupLocation: currentScreen.data?.pickupLocation || selectedRideData?.pickupLocation,
              dropoffLocation: currentScreen.data?.dropoffLocation || selectedRideData?.dropoffLocation,
              driverName: currentRideSimulation?.driver?.name,
              driverVehicle: currentRideSimulation?.driver
                ? `${currentRideSimulation.driver.vehicle.color} ${currentRideSimulation.driver.vehicle.make} ${currentRideSimulation.driver.vehicle.model}`
                : undefined,
              driverPlate: currentRideSimulation?.driver?.vehicle.plate,
              driverPhoto: currentRideSimulation?.driver?.avatar,
              driverRating: currentRideSimulation?.driver?.rating.toString(),
              fare:
                selectedRideData?.price ||
                currentScreen.data?.selectedRide?.price ||
                currentScreen.data?.fare ||
                "$15.00",
              distance: selectedRideData?.routeInfo?.distance
                ? `${(selectedRideData.routeInfo.distance / 1000).toFixed(1)} km`
                : currentScreen.data?.routeInfo?.distance
                  ? `${(currentScreen.data.routeInfo.distance / 1000).toFixed(1)} km`
                  : "3.2 miles",
              duration: selectedRideData?.routeInfo?.duration
                ? `${Math.round(selectedRideData.routeInfo.duration / 60)} min`
                : currentScreen.data?.routeInfo?.duration
                  ? `${Math.round(currentScreen.data.routeInfo.duration / 60)} min`
                  : "12 min",
            }}
          />
        )
      case "ride-activity":
        return <RideActivityScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "profile":
        return <ProfileScreen onNavigate={navigateToScreen} profileData={profileData} goBack={goBack} />
      case "dashboard":
        return (
          <DashboardScreen
            onNavigate={navigateToScreen}
            profileData={profileData}
            upcomingRides={upcomingRides}
            onCancelRide={cancelUpcomingRide}
          />
        )
      case "reset-password":
        return <ResetPasswordScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "reset-confirm":
        return <ResetConfirmScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "reserve-car":
        return <ReserveCarScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "save-place":
        return (
          <SavePlaceScreen
            onNavigate={navigateToScreen}
            initialAddress={currentScreen.data?.initialAddress}
            goBack={goBack}
          />
        )
      case "add-place":
        return <AddPlaceScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "reservation-details":
        return <ReservationDetailsScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "reservation-confirmed":
        return <ReservationConfirmedScreen onNavigate={navigateToScreen} reservationData={currentScreen.data} />
      case "saved-places":
        return <SavedPlacesScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "ride-denied-details":
        return (
          <RideDeniedDetailsScreen
            onNavigate={navigateToScreen}
            rideDetails={currentScreen.data?.rideDetails}
            goBack={goBack}
          />
        )
      case "edit-profile":
        return (
          <EditProfileScreen
            onNavigate={navigateToScreen}
            profileData={profileData}
            onUpdateProfileData={updateProfileData}
            goBack={goBack}
          />
        )
      case "faq":
        return <FAQScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "chat-support":
        return <ChatSupportScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "driver-chat":
        return <DriverChatScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "support":
        return <SupportScreen onNavigate={navigateToScreen} goBack={goBack} />
      case "confirm-location":
        return (
          <ConfirmLocationScreen
            onNavigate={navigateToScreen}
            pickupLocation={currentScreen.data?.pickupLocation}
            dropoffLocation={currentScreen.data?.dropoffLocation}
            pickupLatLng={currentScreen.data?.pickupLatLng}
            dropoffLatLng={currentScreen.data?.dropoffLatLng}
            scheduledDate={currentScreen.data?.scheduledDate}
            scheduledTime={currentScreen.data?.scheduledTime}
            isScheduled={currentScreen.data?.isScheduled}
            goBack={goBack}
          />
        )
      case "map-location":
        return (
          <MapLocationScreen
            onNavigate={navigateToScreen}
            locationType={currentScreen.data?.locationType}
            currentPickup={currentScreen.data?.currentPickup}
            currentDropoff={currentScreen.data?.currentDropoff}
            goBack={goBack}
          />
        )
      default:
        return <WelcomeScreen onNavigate={navigateToScreen} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
