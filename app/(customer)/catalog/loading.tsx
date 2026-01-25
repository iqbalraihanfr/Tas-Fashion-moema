import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogLoading() {
  return (
    <div className="container py-16">
       <div className="flex flex-col md:flex-row gap-20">
          {/* Sidebar Filters Skeleton */}
          <aside className="hidden md:block w-72 shrink-0 space-y-10">
             {/* Categories */}
             <div className="space-y-4">
                <Skeleton className="h-4 w-20 mb-6" />
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                ))}
             </div>
             {/* Price */}
             <div className="pt-4 border-t border-muted/20">
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
             </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
             {/* Header & Sort Skeleton */}
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-8 pb-8 border-b border-muted/30">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" /> {/* Title */}
                    <Skeleton className="h-3 w-32" /> {/* Count */}
                </div>
                <div className="flex gap-4">
                     <Skeleton className="h-4 w-12" />
                     <Skeleton className="h-4 w-12" />
                     <Skeleton className="h-4 w-12" />
                </div>
             </div>

             {/* Main Grid Skeleton */}
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex flex-col gap-4">
                      {/* Image */}
                      <Skeleton className="aspect-[3/4] w-full bg-muted/20" />
                      
                      {/* Details */}
                      <div className="space-y-2 text-center">
                          <div className="flex justify-center">
                              <Skeleton className="h-3 w-20" /> {/* Category */}
                          </div>
                          <div className="flex justify-center">
                               <Skeleton className="h-5 w-40" /> {/* Name */}
                          </div>
                          <div className="flex justify-center">
                               <Skeleton className="h-4 w-24" /> {/* Price */}
                          </div>
                      </div>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}