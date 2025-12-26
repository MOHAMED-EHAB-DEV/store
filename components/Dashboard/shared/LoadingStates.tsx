export function StatCardSkeleton() {
    return (
        <div className="glass rounded-xl p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-24 mb-2" />
                    <div className="h-8 bg-white/10 rounded w-16 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-32" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-lg" />
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <th key={i} className="p-4">
                                    <div className="h-4 bg-white/10 rounded w-20 animate-pulse" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {Array.from({ length: rows }).map((_, i) => (
                            <tr key={i}>
                                {[1, 2, 3, 4, 5].map((j) => (
                                    <td key={j} className="p-4">
                                        <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="glass rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-48 mb-4" />
            <div className="h-64 bg-white/5 rounded-lg" />
        </div>
    );
}

export function PageSkeleton() {
    return (
        <div className="p-6 space-y-6">
            {/* Header Skeleton */}
            <div className="animate-pulse">
                <div className="h-8 bg-white/10 rounded w-64 mb-2" />
                <div className="h-4 bg-white/10 rounded w-48" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>

            {/* Chart Skeleton */}
            <ChartSkeleton />

            {/* Table Skeleton */}
            <TableSkeleton />
        </div>
    );
}

export function ErrorState({
    title = "Something went wrong",
    message = "We encountered an error loading this page. Please try again.",
    onRetry
}: {
    title?: string;
    message?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="p-6">
            <div className="glass rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="w-8 h-8 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                <p className="text-muted-foreground mb-6">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}
