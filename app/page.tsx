import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, Mail, Plus } from "lucide-react"

export default function Home() {
  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Digital Time Capsule
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Send messages and memories to your future self
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            <div className="bg-card rounded-lg border shadow-sm p-5 sm:p-6 md:p-8 flex flex-col">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-4 text-center sm:text-left">
                <Clock className="h-8 w-8 text-primary shrink-0" />
                <h2 className="text-xl sm:text-2xl font-semibold">Pending Capsules</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-center sm:text-left flex-grow">
                View all your scheduled time capsules that are waiting to be opened in the future.
              </p>
              <Link href="/capsules/pending" className="w-full">
                <Button variant="outline" className="w-full">
                  View Pending Capsules
                </Button>
              </Link>
            </div>

            <div className="bg-card rounded-lg border shadow-sm p-5 sm:p-6 md:p-8 flex flex-col">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-4 text-center sm:text-left">
                <Mail className="h-8 w-8 text-primary shrink-0" />
                <h2 className="text-xl sm:text-2xl font-semibold">Opened Capsules</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-center sm:text-left flex-grow">
                Revisit messages from your past self that have already been delivered.
              </p>
              <Link href="/capsules/opened" className="w-full">
                <Button variant="outline" className="w-full">
                  View Opened Capsules
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 md:mt-16 text-center">
            <Link href="/capsules/create">
              <Button size="lg" className="gap-2 px-6 py-6 h-auto text-base sm:text-lg">
                <Plus className="h-5 w-5" />
                Create New Time Capsule
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

