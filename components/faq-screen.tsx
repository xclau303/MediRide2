"use client"
import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Screen } from "@/app/page"
import { BackButton } from "./back-button"

interface FAQScreenProps {
  onNavigate: (screen: Screen) => void
  goBack: () => void
}

export function FAQScreen({ onNavigate, goBack }: FAQScreenProps) {
  const faqs = [
    {
      question: "How do I book a ride?",
      answer:
        "You can book a ride directly from the dashboard by entering your destination or by scheduling a ride for a later time.",
    },
    {
      question: "Can I change my pickup location after booking?",
      answer: "Yes, you can change your pickup location from the ride details screen before the driver arrives.",
    },
    {
      question: "What if my ride is denied?",
      answer:
        "If your ride is denied, you will receive a notification with details. You can then try booking again or contact support for assistance.",
    },
    {
      question: "How do I update my insurance information?",
      answer: "You can update your insurance details in the 'Profile' section under 'Edit Profile'.",
    },
    {
      question: "Is MediRide available in my area?",
      answer:
        "MediRide is currently expanding. Please check our website or contact support for service availability in your specific location.",
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team via the 'Chat Support' option in the 'Profile' section.",
    },
  ]

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <BackButton onClick={goBack} className="mb-4" />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-medium text-gray-900 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-sm">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </div>
  )
}
