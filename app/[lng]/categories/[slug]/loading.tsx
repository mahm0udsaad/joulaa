import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </main>
  )
}
