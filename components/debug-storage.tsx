"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugStorage() {
  const [capsules, setCapsules] = useState<any[]>([])
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const storedCapsules = localStorage.getItem("timeCapsules")
    if (storedCapsules) {
      try {
        setCapsules(JSON.parse(storedCapsules))
      } catch (e) {
        console.error("Error parsing capsules:", e)
        setCapsules([])
      }
    }
  }, [showDebug])

  const clearStorage = () => {
    localStorage.removeItem("timeCapsules")
    setCapsules([])
    alert("Storage cleared!")
  }

  const refreshData = () => {
    const storedCapsules = localStorage.getItem("timeCapsules")
    if (storedCapsules) {
      try {
        setCapsules(JSON.parse(storedCapsules))
      } catch (e) {
        console.error("Error parsing capsules:", e)
        setCapsules([])
      }
    }
  }

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button variant="outline" size="sm" onClick={() => setShowDebug(true)} className="opacity-50 hover:opacity-100">
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Storage Debug</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-xs">
          <div className="mb-2">
            <strong>Capsules in Storage:</strong> {capsules.length}
          </div>
          <div className="max-h-40 overflow-auto mb-2">
            <pre className="text-xs">{JSON.stringify(capsules, null, 2)}</pre>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={clearStorage}>
              Clear Storage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

