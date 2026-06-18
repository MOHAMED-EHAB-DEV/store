import { ArrowLeft } from "@/components/ui/svgs/icons/ArrowLeft";
import { Calendar } from "@/components/ui/svgs/icons/Calendar";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { Tag } from "@/components/ui/svgs/icons/Tag";

export default function Loading() {
    return (
        <main className="min-h-screen min-w-6xl py-36 text-gray-200 animate-pulse">
            {/* Hero Section Skeleton */}
            <div className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gray-950">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent rounded-md" />
                </div>

                <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center space-y-6">
                    <div className="inline-flex items-center text-gray-600 mb-4 text-sm font-medium uppercase tracking-wider bg-gray-900/30 px-4 py-2 rounded-full border border-gray-800/50">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
                    </div>

                    <div className="h-10 md:h-14 lg:h-16 bg-gray-800/60 rounded-xl w-3/4 mx-auto" />
                    <div className="h-10 md:h-14 lg:h-16 bg-gray-800/60 rounded-xl w-1/2 mx-auto" />

                    <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-700" />
                            <div className="h-4 w-24 bg-gray-800/50 rounded" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-700" />
                            <div className="h-4 w-20 bg-gray-800/50 rounded" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 lg:flex gap-12 max-w-7xl">
                {/* Article Skeleton */}
                <article className="lg:w-2/3 space-y-10">
                    <div className="space-y-4">
                        <div className="h-4 w-full bg-gray-800/40 rounded" />
                        <div className="h-4 w-[95%] bg-gray-800/40 rounded" />
                        <div className="h-4 w-[90%] bg-gray-800/40 rounded" />
                        <div className="h-4 w-[98%] bg-gray-800/40 rounded" />
                        <div className="h-4 w-[85%] bg-gray-800/40 rounded" />
                    </div>

                    <div className="space-y-6 pt-6">
                        <div className="h-8 w-1/3 bg-gray-800/60 rounded" />
                        <div className="space-y-4">
                            <div className="h-4 w-full bg-gray-800/40 rounded" />
                            <div className="h-4 w-[92%] bg-gray-800/40 rounded" />
                            <div className="h-4 w-[88%] bg-gray-800/40 rounded" />
                        </div>
                    </div>

                    <div className="space-y-4 pt-6">
                        <div className="h-4 w-full bg-gray-800/40 rounded" />
                        <div className="h-4 w-[96%] bg-gray-800/40 rounded" />
                        <div className="h-4 w-[90%] bg-gray-800/40 rounded" />
                    </div>

                    {/* Tags Skeleton */}
                    <div className="mt-12 pt-8 border-t border-gray-800">
                        <div className="flex items-center gap-2 mb-4 text-gray-700">
                            <Tag className="w-4 h-4" />
                            <div className="h-4 w-28 bg-gray-800/40 rounded" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-8 w-20 bg-gray-800/40 rounded-full border border-gray-800/50" />
                            ))}
                        </div>
                    </div>
                </article>

                {/* Aside Skeleton */}
                <aside className="lg:w-1/3 mt-12 lg:mt-0 space-y-8 h-fit">
                    <div className="p-6 rounded-2xl bg-gray-900/30 border border-gray-800 backdrop-blur-sm">
                        <div className="h-7 w-32 bg-gray-800/60 rounded mb-6" />
                        <div className="space-y-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-20 h-20 rounded-lg bg-gray-800/60 shrink-0" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 w-full bg-gray-800/50 rounded" />
                                        <div className="h-4 w-2/3 bg-gray-800/50 rounded" />
                                        <div className="h-3 w-1/3 bg-gray-800/30 rounded mt-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/10 to-pink-900/5 border border-purple-500/10 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl opacity-50" />
                        <div className="h-7 w-32 bg-gray-800/60 rounded mx-auto mb-3" />
                        <div className="h-4 w-48 bg-gray-800/40 rounded mx-auto mb-6" />
                        <div className="h-11 w-full bg-gray-800/60 rounded-lg" />
                    </div>
                </aside>
            </div>
        </main>
    );
}
