"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  onClick: () => void
}

export function BackButton({ onClick, className, ...props }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn("absolute top-4 left-4 z-10", className)}
      {...props}
    >
      <ChevronLeft className="h-6 w-6" />
      <span className="sr-only">Go back</span>
    </Button>
  )
}
