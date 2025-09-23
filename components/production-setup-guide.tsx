"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export function ProductionSetupGuide() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Production Setup Guide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="text-green-500" />
          <p>Set up environment variables (e.g., API keys).</p>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="text-green-500" />
          <p>Configure database connection.</p>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="text-green-500" />
          <p>Implement authentication (e.g., NextAuth.js).</p>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="text-green-500" />
          <p>Deploy to Vercel.</p>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="text-green-500" />
          <p>Monitor logs and performance.</p>
        </div>
      </CardContent>
    </Card>
  )
}
