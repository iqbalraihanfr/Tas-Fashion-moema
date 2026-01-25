import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="container pt-12 pb-24">
      {/* Breadcrumb Skeleton */}
      <div className="mb-12 flex gap-2">
         <Skeleton className="h-3 w-16" />
         <Skeleton className="h-3 w-16" />
         <Skeleton className="h-3 w-32" />
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Left: Image Gallery Skeleton */}
        <div className="flex-1 lg:w-[60%]">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Main Hero Image */}
               <Skeleton className="md:col-span-2 aspect-[4/3] w-full bg-muted/20" />
               {/* Secondary Images */}
               <Skeleton className="aspect-square w-full bg-muted/20" />
               <Skeleton className="aspect-square w-full bg-muted/20" />
           </div>
        </div>

        {/* Right: Product Info Skeleton */}
        <div className="lg:w-[35%] lg:sticky lg:top-24 h-fit space-y-8">
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" /> {/* Title */}
            <Skeleton className="h-6 w-1/4" />     {/* Price */}
          </div>

          {/* Color Selection Skeleton */}
          <div>
            <Skeleton className="h-3 w-20 mb-3" />
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full" /> {/* Add to Bag */}
            <div className="grid grid-cols-2 gap-3">
               <Skeleton className="h-12 w-full" />
               <Skeleton className="h-12 w-full" />
            </div>
          </div>

          {/* Accordion Skeleton */}
          <div className="pt-6 border-t border-muted/20 space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-20 w-full bg-muted/10" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
