export interface TimeCapsule {
  id: string
  title: string
  createdAt: Date
  openDate: Date
  type: "message" | "image"
  content: string
  isOpened: boolean
}

