import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, Mail, Plus } from "lucide-react";

export default function Home() {
  return (
    <section className="py-6 sm:py-10 md:py-14">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              Digital Time Capsule
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Send messages and memories to your future self
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-5 md:p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-lg sm:text-xl font-semibold">
                  Pending Capsules
                </h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 flex-grow">
                View all your scheduled time capsules that are waiting to be
                opened in the future.
              </p>
              <Link href="/capsules/pending" className="w-full">
                <Button variant="outline" className="w-full" size="sm">
                  View Pending Capsules
                </Button>
              </Link>
            </div>

            <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-5 md:p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-lg sm:text-xl font-semibold">
                  Opened Capsules
                </h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 flex-grow">
                Revisit messages from your past self that have already been
                delivered.
              </p>
              <Link href="/capsules/opened" className="w-full">
                <Button variant="outline" className="w-full" size="sm">
                  View Opened Capsules
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 text-center">
            <Link href="/capsules/create">
              <Button size="default" className="gap-2 w-full sm:w-auto sm:px-8">
                <Plus className="h-4 w-4" />
                Create New Time Capsule
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
