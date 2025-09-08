export default function Loading() {
  return (
    <div className="pt-36 sm:pt-46 md:pt-36 w-full">
        <div className="flex flex-col gap-10 px-4 sm:px-6 lg:px-16 py-10 w-screen text-white animate-pulse">
            {/* Top Section */}
            <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr_22%] gap-8 items-start">
                {/* Thumbnail */}
                <div className="flex justify-center lg:justify-start">
                    <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[350px] h-64 sm:h-72 md:h-80 bg-gray-700/40 rounded-xl shadow-lg"></div>
                </div>

                {/* Template Info */}
                <div className="flex flex-col gap-6">
                    {/* Title + Price */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="h-8 w-40 bg-gray-700/50 rounded"></div>
                        <div className="h-7 w-20 bg-gray-700/40 rounded"></div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-700/30 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-700/30 rounded"></div>
                        <div className="h-4 w-2/3 bg-gray-700/30 rounded"></div>
                    </div>

                    {/* Tags */}
                    <div>
                        <div className="h-4 w-16 bg-gray-700/40 rounded mb-2"></div>
                        <div className="flex flex-wrap gap-2">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-6 w-20 bg-gray-700/30 rounded-md"
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <div className="h-4 w-24 bg-gray-700/40 rounded mb-2"></div>
                        <div className="flex flex-wrap gap-2">
                            {[...Array(2)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-6 w-24 bg-gray-700/30 rounded-md"
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Built With */}
                    <div>
                        <div className="h-4 w-24 bg-gray-700/40 rounded mb-2"></div>
                        <div className="h-6 w-20 bg-gray-700/30 rounded-lg"></div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex flex-row flex-wrap lg:flex-col justify-center gap-16 lg:justify-start lg:gap-6 items-center lg:items-center">
                    {/* Rating */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-5 h-5 bg-gray-600/40 rounded-sm"
                                ></div>
                            ))}
                        </div>
                        <div className="h-4 w-8 bg-gray-700/40 rounded"></div>
                        <div className="h-3 w-20 bg-gray-700/30 rounded"></div>
                    </div>

                    {/* Downloads */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-5 h-5 bg-gray-600/40 rounded-sm"></div>
                        <div className="h-3 w-20 bg-gray-700/30 rounded"></div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3 w-full max-w-[250px]">
                        <div className="h-12 w-full bg-gray-700/50 rounded-xl"></div>
                        <div className="h-12 w-full bg-gray-700/30 rounded-xl"></div>
                    </div>
                </div>
            </div>

            {/* Content Placeholder */}
            <div className="space-y-3">
                <div className="h-4 w-3/4 bg-gray-700/30 rounded"></div>
                <div className="h-4 w-full bg-gray-700/30 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-700/30 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-700/30 rounded"></div>
            </div>

            {/* Similar Templates */}
            <div className="flex flex-col items-center gap-6">
                <div className="h-6 w-48 bg-gray-700/40 rounded"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-56 bg-gray-700/30 rounded-2xl"
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}
