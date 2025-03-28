"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import {
  MessageSquare,
  ImageIcon,
  Plus,
  Mail,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import type { TimeCapsule } from "@/types/time-capsule";
import { getOpenedCapsules, getAllCapsules } from "@/lib/storage-utils";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OpenedCapsulesPage() {
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
      const openedCapsules = getOpenedCapsules();

      openedCapsules.sort((a: TimeCapsule, b: TimeCapsule) => {
        const dateA =
          a.openDate instanceof Date ? a.openDate : new Date(a.openDate);
        const dateB =
          b.openDate instanceof Date ? b.openDate : new Date(b.openDate);
        return dateB.getTime() - dateA.getTime();
      });

      setCapsules(openedCapsules);
    } catch (error) {
      console.error("Error loading opened time capsules:", error);
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
            localStorage.getItem("tempDeletedOpenedCapsules") || "{}"
          );
          tempDeletedCapsules[id] = capsuleCopy;
          localStorage.setItem(
            "tempDeletedOpenedCapsules",
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
                localStorage.getItem("tempDeletedOpenedCapsules") || "{}"
              );
              delete tempDeletedCapsules[id];
              localStorage.setItem(
                "tempDeletedOpenedCapsules",
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
            localStorage.getItem("tempDeletedOpenedCapsules") || "{}"
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
          return dateB.getTime() - dateA.getTime();
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
            localStorage.getItem("tempDeletedOpenedCapsules") || "{}"
          );
          delete tempDeletedCapsules[id];
          localStorage.setItem(
            "tempDeletedOpenedCapsules",
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
              Opened Time Capsules
            </h1>
            <Link href="/capsules/create" className="w-full sm:w-auto self-center sm:self-auto">
              <Button className="gap-2 w-full sm:min-w-[160px] sm:justify-center">
                <Plus className="h-4 w-4" />
                Create New
              </Button>
            </Link>
          </div>

          {capsules.length === 0 ? (
            <div className="text-center py-12 px-4 bg-muted/20 rounded-lg">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                No Opened Capsules
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't opened any time capsules yet. When you open your
                capsules, they'll appear here.
              </p>
              <Link href="/capsules/pending" className="block w-full sm:w-auto sm:inline-block">
                <Button className="w-full sm:min-w-[160px] sm:justify-center">
                  View Pending Capsules
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {capsules.map((capsule) => (
                <Card key={capsule.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {capsule.type === "message" ? (
                          <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                        )}
                        <CardTitle className="break-words line-clamp-1">
                          {capsule.title}
                        </CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 ml-auto sm:ml-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
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
                    <CardDescription className="text-sm">
                      <div className="flex flex-wrap gap-x-2">
                        <span>
                          Created: {format(new Date(capsule.createdAt), "PP")}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          Opened: {format(new Date(capsule.openDate), "PP")}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {capsule.type === "message" ? (
                      <div className="bg-muted/30 rounded-md p-3 sm:p-4">
                        <p className="whitespace-pre-wrap break-words">
                          {capsule.content}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-muted/30 rounded-md p-2 sm:p-4 flex items-center justify-center">
                        <img
                          src={capsule.content || "/placeholder.svg"}
                          alt={capsule.title}
                          className="max-h-[200px] sm:max-h-[300px] md:max-h-[400px] w-auto object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.src =
                              "/placeholder.svg?height=300&width=400";
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
