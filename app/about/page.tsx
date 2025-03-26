import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, MessageSquare, ImageIcon } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">About Digital Time Capsule</h1>

        <div className="prose dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-center mb-8">
            Send messages and photos to your future self, to be opened at a date you choose.
          </p>

          <h2>What is a Digital Time Capsule?</h2>
          <p>
            A digital time capsule is a way to preserve your thoughts, feelings, and memories for your future self.
            Unlike physical time capsules that might deteriorate over time, digital time capsules ensure your messages
            and photos remain intact until you're ready to revisit them.
          </p>

          <h2>How It Works</h2>
          <p>
            Our platform allows you to create time capsules containing messages or photos that will be "locked" until a
            future date of your choosing. When that date arrives, your time capsule becomes available to open, allowing
            you to rediscover your past thoughts and memories.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-medium mb-2">Write Messages</h3>
                <p className="text-muted-foreground">
                  Capture your thoughts, goals, and feelings to revisit in the future.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <ImageIcon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-medium mb-2">Save Photos</h3>
                <p className="text-muted-foreground">
                  Preserve visual memories to see how things have changed over time.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Clock className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-medium mb-2">Set Future Dates</h3>
                <p className="text-muted-foreground">
                  Choose when your capsule will be available to open, from days to years in the future.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Create Your First Time Capsule?</h2>
          <p className="text-muted-foreground mb-6">
            Start preserving your memories and messages for your future self today.
          </p>
          <Link href="/capsules/create">
            <Button size="lg">Create a Time Capsule</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

