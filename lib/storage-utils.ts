import type { TimeCapsule } from "@/types/time-capsule"

// Get all time capsules from localStorage
export function getAllCapsules(): TimeCapsule[] {
  if (typeof window === "undefined") return []

  try {
    const storedCapsulesString = localStorage.getItem("timeCapsules")
    if (!storedCapsulesString) return []

    const capsules = JSON.parse(storedCapsulesString)
    return capsules.map((capsule: any) => ({
      ...capsule,
      createdAt: new Date(capsule.createdAt),
      openDate: new Date(capsule.openDate),
    }))
  } catch (error) {
    console.error("Error getting time capsules:", error)
    return []
  }
}

// Save a new time capsule
export function saveNewCapsule(capsule: TimeCapsule): void {
  if (typeof window === "undefined") return

  try {
    const existingCapsules = getAllCapsules()

    // Ensure dates are properly serialized for storage
    const capsuleToSave = {
      ...capsule,
      createdAt: capsule.createdAt.toISOString(),
      openDate: capsule.openDate.toISOString(),
    }

    localStorage.setItem("timeCapsules", JSON.stringify([...existingCapsules, capsuleToSave]))
  } catch (error) {
    console.error("Error saving time capsule:", error)
  }
}

// Update a time capsule
export function updateCapsule(updatedCapsule: TimeCapsule): void {
  if (typeof window === "undefined") return

  try {
    const existingCapsules = getAllCapsules()
    const updatedCapsules = existingCapsules.map((capsule) =>
      capsule.id === updatedCapsule.id
        ? {
            ...updatedCapsule,
            createdAt: updatedCapsule.createdAt.toISOString(),
            openDate: updatedCapsule.openDate.toISOString(),
          }
        : capsule,
    )
    localStorage.setItem("timeCapsules", JSON.stringify(updatedCapsules))
  } catch (error) {
    console.error("Error updating time capsule:", error)
  }
}

// Delete a time capsule
export function deleteCapsule(id: string): void {
  if (typeof window === "undefined") return

  try {
    const existingCapsules = getAllCapsules()
    const filteredCapsules = existingCapsules.filter((capsule) => capsule.id !== id)
    localStorage.setItem("timeCapsules", JSON.stringify(filteredCapsules))
  } catch (error) {
    console.error("Error deleting time capsule:", error)
  }
}

// Get pending (unopened) capsules
export function getPendingCapsules(): TimeCapsule[] {
  return getAllCapsules().filter((capsule) => !capsule.isOpened)
}

// Get opened capsules
export function getOpenedCapsules(): TimeCapsule[] {
  return getAllCapsules().filter((capsule) => capsule.isOpened)
}

// Get a specific capsule by ID
export function getCapsuleById(id: string): TimeCapsule | null {
  const capsule = getAllCapsules().find((capsule) => capsule.id === id)
  return capsule || null
}

// Mark a capsule as opened
export function openCapsule(id: string): void {
  const capsule = getCapsuleById(id)
  if (!capsule) return

  updateCapsule({ ...capsule, isOpened: true })
}

