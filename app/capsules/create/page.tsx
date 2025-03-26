"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, Image, MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { saveNewCapsule } from "@/lib/storage-utils";

export default function CreateCapsulePage() {
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlError, setImageUrlError] = useState("");
  const [activeTab, setActiveTab] = useState("message");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateImageUrl = (url: string) => {
    if (!url) {
      setImageUrlError("");
      return false;
    }
    
    try {
      const urlObj = new URL(url);
      const isValid = urlObj.protocol === "http:" || urlObj.protocol === "https:";
      
      if (!isValid) {
        setImageUrlError("Please enter a valid http:// or https:// URL");
        return false;
      }
      
      setImageUrlError("");
      return true;
    } catch (e) {
      setImageUrlError("Please enter a valid URL");
      return false;
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    validateImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!date || !title) {
      toast.error("Validation Error", {
        description: "Please fill in title and select a date",
      });
      setIsSubmitting(false);
      return;
    }

    if (activeTab === "message" && !message) {
      toast.error("Validation Error", {
        description: "Please enter a message",
      });
      setIsSubmitting(false);
      return;
    }

    if (activeTab === "image") {
      if (!imageUrl) {
        toast.error("Validation Error", {
          description: "Please enter an image URL",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!validateImageUrl(imageUrl)) {
        toast.error("Validation Error", {
          description: "Please enter a valid image URL",
        });
        setIsSubmitting(false);
        return;
      }
    }

    const newCapsule = {
      id: Date.now().toString(),
      title,
      createdAt: new Date(),
      openDate: date,
      type: activeTab as "message" | "image",
      content: activeTab === "message" ? message : imageUrl,
      isOpened: false,
    };

    try {
      saveNewCapsule(newCapsule);

      toast.success("Success!", {
        description: "Time capsule created successfully",
        duration: 5000,
      });

      setTimeout(() => {
        router.push("/capsules/pending");
      }, 500);
    } catch (error) {
      console.error("Error saving time capsule:", error);
      toast.error("Error", {
        description:
          "There was an error saving your time capsule. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-screen-md">
        <div className="relative mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2 mb-4 sm:mb-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Create a New Time Capsule
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Save messages or images for your future self to discover
            </p>
          </div>
        </div>

        <Card className="shadow-sm mx-auto w-full">
          <CardHeader className="text-center">
            <CardTitle>New Time Capsule</CardTitle>
            <CardDescription className="mx-auto max-w-md">
              Create a message or upload a photo to send to your future self
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title" className="text-left font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Give your time capsule a name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-left font-medium">Open Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
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
              </div>

              <div className="mt-8">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger
                      value="message"
                      className="flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="flex items-center justify-center gap-2"
                    >
                      <Image className="h-4 w-4" />
                      Image
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="message" className="space-y-2 pt-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="message" className="text-left font-medium">
                        Your Message
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Write a message to your future self..."
                        className="min-h-[150px] sm:min-h-[200px] resize-y"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-2 pt-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="image-url" className="text-left font-medium">
                        Image URL
                      </Label>
                      <Input
                        id="image-url"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={handleImageUrlChange}
                        className={cn(
                          imageUrlError && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {imageUrlError && (
                        <div className="flex items-center gap-2 text-destructive text-sm mt-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>{imageUrlError}</span>
                        </div>
                      )}
                      {imageUrl && !imageUrlError && (
                        <div className="mt-4 border rounded-md overflow-hidden flex justify-center items-center p-2">
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="max-w-full h-auto max-h-[200px] sm:max-h-[250px] object-contain rounded"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/placeholder.svg?height=200&width=300";
                              if (!imageUrlError) {
                                setImageUrlError("The image couldn't be loaded. Please check the URL.");
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="pt-6 sm:pt-8 flex justify-center w-full">
                <Button
                  type="submit"
                  className="w-full sm:w-auto sm:min-w-[200px]"
                  disabled={isSubmitting || (activeTab === "image" && !!imageUrlError)}
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
  );
}
