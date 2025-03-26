"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ArrowLeft, CalendarIcon, Image, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToastContext } from "@/components/ui/toast-provider"
import { ToastAction } from "@/components/ui/toast"
import { getCapsuleById, updateCapsule } from "@/lib/storage-utils"
import type { TimeCapsule } from "@/types/time-capsule"

export default function EditCapsulePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToastContext()
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState<Date>()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [activeTab, setActiveTab] = useState("message")
  const [originalCapsule, setOriginalCapsule] = useState<TimeCapsule | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    try {
      const capsule = getCapsuleById(params.id as string)

      if (capsule) {
        setOriginalCapsule(capsule)
        setTitle(capsule.title)
        setDate(new Date(capsule.openDate))
        setActiveTab(capsule.type)

        if (capsule.type === "message") {
          setMessage(capsule.content)
        } else {
          setImageUrl(capsule.content)
        }
      }
    } catch (error) {
      console.error("Error loading time capsule:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load time capsule data.",
      })
    } finally {
      setLoading(false)
    }
  }, [params.id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!originalCapsule || !date) return

    if (!title || (activeTab === "message" && !message) || (activeTab === "image" && !imageUrl)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const updatedCapsule: TimeCapsule = {
        ...originalCapsule,
        title,
        openDate: date,
        type: activeTab as "message" | "image",
        content: activeTab === "message" ? message : imageUrl,
      }

      updateCapsule(updatedCapsule)

      toast({
        variant: "success",
        title: "Success!",
        description: "Time capsule updated successfully",
        action: (
          <ToastAction altText="View Pending" onClick={() => router.push("/capsules/pending")}>
            View Pending
          </ToastAction>
        ),
      })

      setTimeout(() => {
        router.push("/capsules/pending")
      }, 2000)
    } catch (error) {
      console.error("Error updating time capsule:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error updating your time capsule. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent"></div>
          <p className="text-lg">Loading time capsule data...</p>
        </div>
      </div>
    )
  }

  if (!originalCapsule) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center px-4 sm:px-0 w-full max-w-md space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Capsule Not Found</h1>
          <p className="mb-6 text-muted-foreground">The time capsule you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.back()} className="mx-auto">Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <section className="py-6 sm:py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-screen-md">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="self-start mb-4 gap-2" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-center">Edit Time Capsule</h1>
          <p className="text-muted-foreground text-center mt-2 max-w-md">
            Update details for your time capsule
          </p>
        </div>

        <Card className="shadow-sm mx-auto w-full">
          <CardHeader className="text-center pb-4">
            <CardTitle>Edit "{title}"</CardTitle>
            <CardDescription className="mx-auto max-w-md">
              Make changes to your time capsule before it opens
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-center block">Title</Label>
                <Input
                  id="title"
                  placeholder="Give your time capsule a name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="max-w-full mx-auto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-center block">Open Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full max-w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date() && date.toDateString() !== new Date().toDateString()}
                      className="mx-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="mt-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="message" className="flex items-center justify-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center justify-center gap-2">
                      <Image className="h-4 w-4" />
                      Image
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="message" className="space-y-2 pt-2">
                    <Label htmlFor="message" className="text-center block">Your Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Write a message to your future self..."
                      className="min-h-[150px] sm:min-h-[200px] max-w-full mx-auto resize-y"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </TabsContent>
                  
                  <TabsContent value="image" className="space-y-2 pt-2">
                    <Label htmlFor="image-url" className="text-center block">Image URL</Label>
                    <Input
                      id="image-url"
                      placeholder="Enter an image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="max-w-full mx-auto"
                    />
                    {imageUrl && (
                      <div className="mt-4 border rounded-md overflow-hidden flex justify-center items-center p-2">
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt="Preview"
                          className="max-w-full h-auto max-h-[200px] sm:max-h-[250px] object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                          }}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="pt-6 sm:pt-8 flex justify-center">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto sm:min-w-[200px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Updating...
                    </span>
                  ) : (
                    "Update Time Capsule"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

