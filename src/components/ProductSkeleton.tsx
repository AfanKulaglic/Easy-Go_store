export default function ProductSkeleton() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-white/[0.05]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/[0.05] rounded w-3/4" />
        <div className="h-4 bg-white/[0.05] rounded w-1/2" />
        <div className="flex items-center justify-between">
          <div className="h-5 bg-white/[0.05] rounded w-20" />
          <div className="h-9 w-9 bg-white/[0.05] rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function ProductListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
