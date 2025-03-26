"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import {
  ArrowLeft,
  Clock,
  Lock,
  MessageSquare,
  ImageIcon,
  Pencil,
  Trash,
} from "lucide-react";
import type { TimeCapsule } from "@/types/time-capsule";
import {
  getCapsuleById,
  openCapsule as markCapsuleOpened,
  deleteCapsule,
} from "@/lib/storage-utils";
import { DeleteDialog } from "@/components/delete-dialog";

export default function CapsuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [capsule, setCapsule] = useState<TimeCapsule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundCapsule = getCapsuleById(params.id as string);

    if (foundCapsule) {
      setCapsule(foundCapsule);
    }

    setLoading(false);
  }, [params.id]);

  const calculateTimeRemaining = (openDate: Date) => {
    const now = new Date();
    const diff = openDate.getTime() - now.getTime();

    if (diff <= 0) return "Ready to open!";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} remaining`;
    } else {
      return `${hours} hour${hours !== 1 ? "s" : ""} remaining`;
    }
  };

  const canOpen = (openDate: Date) => {
    return new Date() >= new Date(openDate);
  };

  const handleOpenCapsule = () => {
    if (!capsule) return;

    markCapsuleOpened(capsule.id);

    setCapsule({ ...capsule, isOpened: true });

    alert("Time capsule opened successfully!");
  };

  const handleEditCapsule = () => {
    if (!capsule) return;
    router.push(`/capsules/edit/${capsule.id}`);
  };

  const handleDeleteCapsule = () => {
    if (!capsule) return;

    deleteCapsule(capsule.id);

    if (capsule.isOpened) {
      router.push("/capsules/opened");
    } else {
      router.push("/capsules/pending");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center px-4 sm:px-0 w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            Capsule Not Found
          </h1>
          <p className="mb-6 text-muted-foreground">
            The time capsule you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.back()} className="mx-auto">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-[95%] sm:max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex justify-start mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg sm:text-xl break-words">
                {capsule.title}
              </CardTitle>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {!capsule.isOpened && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditCapsule}
                    className="h-8"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                )}
                <DeleteDialog
                  title="Delete Time Capsule"
                  description="Are you sure you want to delete this time capsule? This action cannot be undone."
                  onDelete={handleDeleteCapsule}
                  trigger={
                    <Button variant="outline" size="sm" className="h-8">
                      <Trash className="h-3.5 w-3.5 mr-1.5" />
                      Delete
                    </Button>
                  }
                />
              </div>
            </div>
            <CardDescription>
              Created on {format(new Date(capsule.createdAt), "PPP")}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-4">
            <div className="flex items-center gap-2 mb-4">
              {capsule.type === "message" ? (
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground capitalize">
                {capsule.type} Capsule
              </span>
            </div>

            {capsule.isOpened ? (
              capsule.type === "message" ? (
                <div className="bg-muted/30 rounded-md p-3 sm:p-4">
                  <p className="whitespace-pre-wrap">{capsule.content}</p>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-md p-3 sm:p-4 flex items-center justify-center">
                  <img
                    src={capsule.content || "/placeholder.svg"}
                    alt={capsule.title}
                    className="max-h-[250px] sm:max-h-[350px] md:max-h-[400px] w-auto object-contain rounded"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=300&width=400";
                    }}
                  />
                </div>
              )
            ) : (
              <div className="bg-muted/50 rounded-md p-4 sm:p-8 flex items-center justify-center min-h-[150px] sm:min-h-[200px]">
                <div className="flex flex-col items-center text-center px-2">
                  <Lock className="h-8 w-8 sm:h-12 sm:w-12 mb-3 sm:mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm sm:text-base mb-1 sm:mb-2">
                    This capsule will be available on{" "}
                    {format(new Date(capsule.openDate), "PPP")}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {calculateTimeRemaining(new Date(capsule.openDate))}
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          {!capsule.isOpened && (
            <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0 border-t pt-4">
              <div className="flex items-center gap-2 text-sm order-2 sm:order-1">
                <Clock className="h-4 w-4" />
                {calculateTimeRemaining(new Date(capsule.openDate))}
              </div>
              <Button
                disabled={!canOpen(capsule.openDate)}
                onClick={handleOpenCapsule}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Open Capsule
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
