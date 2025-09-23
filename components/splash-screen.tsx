"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <Image
          src="/images/mediride-logo-full.png"
          alt="MediRide Logo"
          width={200}
          height={200}
          priority
          className="mb-4"
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xl font-semibold text-gray-700"
        >
          Your Health, Our Priority
        </motion.p>
      </motion.div>
    </div>
  )
}
