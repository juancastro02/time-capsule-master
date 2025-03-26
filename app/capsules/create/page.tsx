"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { saveNewCapsule } from "@/lib/storage-utils"

export default function CreateCapsulePage() {
  const router = useRouter()
  const { toast } = useToastContext()
  const [date, setDate] = useState<Date>()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [activeTab, setActiveTab] = useState("message")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!date || !title || (activeTab === "message" && !message) || (activeTab === "image" && !imageUrl)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      })
      setIsSubmitting(false)
      return
    }

    const newCapsule = {
      id: Date.now().toString(),
      title,
      createdAt: new Date(),
      openDate: date,
      type: activeTab as "message" | "image",
      content: activeTab === "message" ? message : imageUrl,
      isOpened: false,
    }

    try {
      saveNewCapsule(newCapsule)

      toast({
        variant: "success",
        title: "Success!",
        description: "Time capsule created successfully",
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
      console.error("Error saving time capsule:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error saving your time capsule. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-screen-md">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <Button variant="ghost" size="sm" className="self-start mb-4 gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-center">Create a New Time Capsule</h1>
          <p className="text-muted-foreground text-center mt-2 max-w-md">
            Save messages or images for your future self to discover
          </p>
        </div>

        <Card className="shadow-sm mx-auto w-full">
          <CardHeader className="text-center">
            <CardTitle>New Time Capsule</CardTitle>
            <CardDescription className="mx-auto max-w-md">
              Create a message or upload a photo to send to your future self
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
                      disabled={(date) => date < new Date()}
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
                      Creating...
                    </span>
                  ) : (
                    "Create Time Capsule"
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

