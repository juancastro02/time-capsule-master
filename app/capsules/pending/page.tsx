"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Clock,
  Lock,
  MessageSquare,
  ImageIcon,
  Plus,
  Pencil,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  getPendingCapsules,
  openCapsule,
  getAllCapsules,
} from "@/lib/storage-utils";
import type { TimeCapsule } from "@/types/time-capsule";

export default function PendingCapsulesPage() {
  const router = useRouter();
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletedCapsules, setDeletedCapsules] = useState<{
    [key: string]: TimeCapsule | null;
  }>({});
  const [deletionTimers, setDeletionTimers] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});

  const loadCapsules = () => {
    try {
      const pendingCapsules = getPendingCapsules();
      pendingCapsules.sort(
        (a, b) => a.openDate.getTime() - b.openDate.getTime()
      );
      setCapsules(pendingCapsules);
    } catch (error) {
      console.error("Error loading time capsules:", error);
      setCapsules([]);
      toast.error("Error", {
        description: "Failed to load time capsules.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapsules();

    return () => {
      Object.values(deletionTimers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const calculateTimeRemaining = (openDate: Date | string) => {
    const now = new Date();

    const dateObj = openDate instanceof Date ? openDate : new Date(openDate);

    const diff = dateObj.getTime() - now.getTime();

    if (diff <= 0) return "Ready to open!";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} remaining`;
    } else {
      return `${hours} hour${hours !== 1 ? "s" : ""} remaining`;
    }
  };

  const handleOpenCapsule = (id: string) => {
    try {
      const capsuleToOpen = capsules.find((capsule) => capsule.id === id);
      if (!capsuleToOpen) return;

      openCapsule(id);
      setCapsules((prev) => prev.filter((capsule) => capsule.id !== id));

      toast.success("Capsule opened!", {
        description: `"${capsuleToOpen.title}" has been moved to Opened Capsules`,
        action: {
          label: "View",
          onClick: () => router.push("/capsules/opened"),
        },
      });
    } catch (error) {
      console.error("Error opening time capsule:", error);
      toast.error("Error", {
        description: "There was an error opening your time capsule.",
      });
    }
  };

  const handleDeleteCapsule = (id: string) => {
    try {
      const capsuleToDelete = capsules.find((capsule) => capsule.id === id);

      if (!capsuleToDelete) {
        toast.error("Error", {
          description: "Could not find the capsule to delete.",
        });
        return;
      }

      const capsuleCopy = JSON.parse(JSON.stringify(capsuleToDelete));

      setCapsules((prev) => prev.filter((capsule) => capsule.id !== id));

      setDeletedCapsules((prev) => ({ ...prev, [id]: capsuleCopy }));

      if (typeof window !== "undefined") {
        try {
          const tempDeletedCapsules = JSON.parse(
            localStorage.getItem("tempDeletedCapsules") || "{}"
          );
          tempDeletedCapsules[id] = capsuleCopy;
          localStorage.setItem(
            "tempDeletedCapsules",
            JSON.stringify(tempDeletedCapsules)
          );
        } catch (e) {
          console.error("Error saving deleted capsule backup:", e);
        }
      }

      const timer = setTimeout(() => {
        try {
          const allCapsules = getAllCapsules();

          const updatedCapsules = allCapsules.filter(
            (capsule) => capsule.id !== id
          );

          if (typeof window !== "undefined") {
            localStorage.setItem(
              "timeCapsules",
              JSON.stringify(updatedCapsules)
            );

            try {
              const tempDeletedCapsules = JSON.parse(
                localStorage.getItem("tempDeletedCapsules") || "{}"
              );
              delete tempDeletedCapsules[id];
              localStorage.setItem(
                "tempDeletedCapsules",
                JSON.stringify(tempDeletedCapsules)
              );
            } catch (e) {
              console.error("Error removing capsule from backup:", e);
            }
          }

          setDeletionTimers((prev) => {
            const newTimers = { ...prev };
            delete newTimers[id];
            return newTimers;
          });

          setDeletedCapsules((prev) => {
            const newDeleted = { ...prev };
            delete newDeleted[id];
            return newDeleted;
          });
        } catch (error) {
          console.error("Error in delayed deletion:", error);
        }
      }, 5000);

      setDeletionTimers((prev) => ({ ...prev, [id]: timer }));

      toast("Time capsule deleted", {
        description: `"${capsuleCopy.title}" has been deleted`,
        action: {
          label: "Undo",
          onClick: () => handleUndoDelete(id),
        },
        duration: 5000,
      });
    } catch (error) {
      console.error("Error deleting capsule:", error);
      toast.error("Error", { description: "Failed to delete time capsule." });
    }
  };

  const handleUndoDelete = (id: string) => {
    try {
      let capsuleToRestore = deletedCapsules[id];

      if (!capsuleToRestore && typeof window !== "undefined") {
        try {
          const tempDeletedCapsules = JSON.parse(
            localStorage.getItem("tempDeletedCapsules") || "{}"
          );
          capsuleToRestore = tempDeletedCapsules[id];

          if (capsuleToRestore) {
            capsuleToRestore.createdAt = new Date(capsuleToRestore.createdAt);
            capsuleToRestore.openDate = new Date(capsuleToRestore.openDate);
          }
        } catch (e) {
          console.error("Error retrieving from localStorage backup:", e);
        }
      }

      if (!capsuleToRestore) {
        console.error("Cannot restore - capsule not found in any backup");
        toast.error("Error", {
          description:
            "Could not restore the capsule. The undo period may have expired.",
        });
        return;
      }

      const timer = deletionTimers[id];
      if (timer) {
        clearTimeout(timer);
      }

      setCapsules((prev) => {
        const updatedCapsules = [...prev, capsuleToRestore];
        return updatedCapsules.sort((a, b) => {
          const dateA =
            a.openDate instanceof Date ? a.openDate : new Date(a.openDate);
          const dateB =
            b.openDate instanceof Date ? b.openDate : new Date(b.openDate);
          return dateA.getTime() - dateB.getTime();
        });
      });

      setDeletedCapsules((prev) => {
        const newDeleted = { ...prev };
        delete newDeleted[id];
        return newDeleted;
      });

      setDeletionTimers((prev) => {
        const newTimers = { ...prev };
        delete newTimers[id];
        return newTimers;
      });

      if (typeof window !== "undefined") {
        try {
          const tempDeletedCapsules = JSON.parse(
            localStorage.getItem("tempDeletedCapsules") || "{}"
          );
          delete tempDeletedCapsules[id];
          localStorage.setItem(
            "tempDeletedCapsules",
            JSON.stringify(tempDeletedCapsules)
          );
        } catch (e) {
          console.error("Error clearing localStorage backup:", e);
        }
      }

      toast.success("Time capsule restored", {
        description: `"${capsuleToRestore.title}" has been restored successfully`,
      });
    } catch (error) {
      console.error("Error restoring capsule:", error);
      toast.error("Error", { description: "Failed to restore time capsule." });
    }
  };

  const handleEditCapsule = (id: string) => {
    router.push(`/capsules/edit/${id}`);
  };

  const canOpen = (openDate: Date | string) => {
    const dateObj = openDate instanceof Date ? openDate : new Date(openDate);
    return new Date() >= dateObj;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent"></div>
          <p className="text-lg">Loading capsules...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-6 sm:py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
              Pending Time Capsules
            </h1>
            <Link href="/capsules/create" className="w-full sm:w-auto self-center sm:self-auto">
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Create New
              </Button>
            </Link>
          </div>

          {capsules.length === 0 ? (
            <div className="text-center py-12 px-4 bg-muted/20 rounded-lg">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                No Pending Capsules
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You don't have any time capsules waiting to be opened.
              </p>
              <Link href="/capsules/create" className="block w-full sm:w-auto sm:inline-block">
                <Button className="w-full sm:w-auto">Create Your First Time Capsule</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              {capsules.map((capsule) => (
                <Card
                  key={capsule.id}
                  className="overflow-hidden flex flex-col"
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <CardTitle className="text-lg break-words line-clamp-1 text-center sm:text-left">
                        {capsule.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 justify-center sm:justify-end">
                        <Badge
                          variant={
                            canOpen(capsule.openDate) ? "default" : "outline"
                          }
                          className="h-6 flex items-center"
                        >
                          {canOpen(capsule.openDate) ? "Ready" : "Locked"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                              className="w-full"
                              onClick={() => handleEditCapsule(capsule.id)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="w-full text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <DeleteDialog
                                title="Delete Time Capsule"
                                description="Are you sure you want to delete this time capsule? This action cannot be undone."
                                onDelete={() => handleDeleteCapsule(capsule.id)}
                                trigger={
                                  <div className="flex items-center w-full">
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                  </div>
                                }
                              />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardDescription className="text-center sm:text-left">
                      Created on {format(new Date(capsule.createdAt), "PPP")}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-2 mb-4 justify-center sm:justify-start">
                      {capsule.type === "message" ? (
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground capitalize">
                        {capsule.type} Capsule
                      </span>
                    </div>

                    <div className="bg-muted/50 rounded-md p-3 sm:p-4 flex items-center justify-center min-h-[100px] sm:min-h-[120px]">
                      <div className="flex flex-col items-center text-center px-2">
                        <Lock className="h-8 w-8 mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          This capsule will be available on{" "}
                          {format(new Date(capsule.openDate), "PPP")}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0 border-t pt-4 mt-auto">
                    <div className="flex items-center gap-2 text-sm order-2 sm:order-1 justify-center sm:justify-start w-full sm:w-auto">
                      <Clock className="h-4 w-4" />
                      {calculateTimeRemaining(capsule.openDate)}
                    </div>
                    <Button
                      disabled={!canOpen(capsule.openDate)}
                      onClick={() => handleOpenCapsule(capsule.id)}
                      className="order-1 sm:order-2 w-full sm:w-auto"
                    >
                      Open Capsule
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
