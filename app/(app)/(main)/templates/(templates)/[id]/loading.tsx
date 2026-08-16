export default function Loading() {
  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 md:pb-24 w-full">
      <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-white animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 bg-white/10 rounded-md" />
          <div className="h-4 w-2 bg-white/10 rounded-md" />
          <div className="h-4 w-20 bg-white/10 rounded-md" />
          <div className="h-4 w-2 bg-white/10 rounded-md" />
          <div className="h-4 w-32 bg-white/10 rounded-md" />
        </div>

        {/* 2-Column Hero Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] xl:grid-cols-[480px_1fr] gap-8 lg:gap-10 items-start w-full">
          {/* Thumbnail Skeleton */}
          <div className="w-full aspect-[16/10] max-h-[320px] sm:max-h-[360px] bg-white/[0.04] border border-white/10 rounded-2xl" />

          {/* Decision Hub Skeleton */}
          <div className="flex flex-col gap-6 w-full">
            {/* Stats Row */}
            <div className="flex items-center gap-3">
              <div className="h-6 w-24 bg-white/10 rounded-full" />
              <div className="h-6 w-28 bg-white/10 rounded-full" />
            </div>

            {/* Title & Price */}
            <div className="space-y-3">
              <div className="h-10 w-3/4 bg-white/15 rounded-xl" />
              <div className="h-7 w-36 bg-white/10 rounded-lg" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/10 rounded-md" />
              <div className="h-4 w-5/6 bg-white/10 rounded-md" />
              <div className="h-4 w-2/3 bg-white/10 rounded-md" />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-16 bg-white/10 rounded-lg" />
              <div className="h-6 w-20 bg-white/10 rounded-lg" />
              <div className="h-6 w-24 bg-white/10 rounded-lg" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="h-13 flex-1 bg-white/20 rounded-xl" />
              <div className="h-13 w-36 bg-white/10 rounded-xl" />
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="h-4 w-28 bg-white/10 rounded-md" />
              <div className="h-4 w-28 bg-white/10 rounded-md" />
              <div className="h-4 w-28 bg-white/10 rounded-md" />
              <div className="h-4 w-28 bg-white/10 rounded-md" />
            </div>
          </div>
        </div>

        {/* Feature Grid Skeleton */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="h-8 w-64 bg-white/15 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl border border-white/10 bg-white/[0.02]"
              />
            ))}
          </div>
        </div>

        {/* Similar Templates Skeleton */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="h-8 w-56 bg-white/15 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-white/[0.03] border border-white/10 rounded-2xl"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
