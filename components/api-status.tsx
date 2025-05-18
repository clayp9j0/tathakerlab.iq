"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { checkApiAvailability } from "@/lib/api"

export function ApiStatus() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading")
  const [message, setMessage] = useState<string>("")
  const [isChecking, setIsChecking] = useState(false)
  const [apiUrl, setApiUrl] = useState<string>("")

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      // Get the API URL from the environment variable
      const url = (process.env.NEXT_PUBLIC_API_URL || "https://blue-penguin-872241.hostingersite.com").replace(
        /\/$/,
        "",
      )
      setApiUrl(url)

      // Use AbortSignal with timeout to prevent long-running request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const isAvailable = await checkApiAvailability()
      clearTimeout(timeoutId)

      if (isAvailable) {
        setStatus("online")
        setMessage("API is online and responding")
      } else {
        setStatus("offline")
        setMessage("API is currently unavailable. Using sample data instead.")
      }
    } catch (error) {
      console.error("Error checking API status:", error)
      setStatus("offline")
      // Safe handling of the error message
      setMessage(error instanceof Error ? error.message : "Failed to connect to API")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Use try/catch in the effect to prevent unhandled errors
    try {
      checkStatus()
    } catch (error) {
      console.error("Unhandled error in ApiStatus component:", error)
      setStatus("offline")
      setMessage("An unexpected error occurred while checking API status")
    }
  }, [])

  return (
    <Alert variant={status === "online" ? "default" : "destructive"}>
      <div className="flex items-center">
        {status === "online" ? (
          <CheckCircle className="h-4 w-4 mr-2" />
        ) : status === "loading" || isChecking ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <AlertCircle className="h-4 w-4 mr-2" />
        )}
        <AlertTitle>
          API Status: {status === "loading" || isChecking ? "Checking..." : status === "online" ? "Online" : "Offline"}
        </AlertTitle>
      </div>
      <AlertDescription className="flex flex-col gap-2 mt-2">
        <p>{typeof message === "string" ? message : "API status check completed"}</p>
        <p className="text-xs text-gray-500">API URL: {typeof apiUrl === "string" ? apiUrl : ""}/api/events/active</p>
        {status === "offline" && (
          <div className="mt-2">
            <p className="text-sm mb-2">
              The application is currently using sample data because the API is unavailable.
            </p>
            <Button size="sm" onClick={checkStatus} variant="outline" disabled={isChecking}>
              {isChecking ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                "Retry Connection"
              )}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

export default ApiStatus
