export default function Loading() {
  return (
    <div className="pt-36 sm:pt-46 md:pt-36">
        <div className="flex flex-col lg:flex-row gap-8 w-full animate-pulse">
            {/* Left side (Image preview) */}
            <div className="w-full lg:w-[45%] rounded-2xl overflow-hidden bg-gray-800/30 relative">
                <div className="h-72 sm:h-96 w-full bg-gray-700/40"></div>
            </div>

            {/* Right side (Details) */}
            <div className="flex-1 space-y-6">
                {/* Title + Price */}
                <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                        <div className="h-7 w-40 bg-gray-700/50 rounded"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-gray-700/30 rounded"></div>
                            <div className="h-4 w-5/6 bg-gray-700/30 rounded"></div>
                            <div className="h-4 w-3/5 bg-gray-700/30 rounded"></div>
                        </div>
                    </div>
                    <div className="h-8 w-16 bg-gray-700/50 rounded"></div>
                </div>

                {/* Rating + Downloads */}
                <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-5 h-5 bg-gray-600/40 rounded-sm"
                            ></div>
                        ))}
                    </div>
                    <div className="h-4 w-10 bg-gray-700/40 rounded"></div>
                    <div className="h-4 w-24 bg-gray-700/30 rounded"></div>
                </div>

                {/* Tags */}
                <div className="flex gap-2 flex-wrap">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-6 w-20 bg-gray-700/30 rounded-full"
                        ></div>
                    ))}
                </div>

                {/* Categories */}
                <div className="flex gap-2 flex-wrap">
                    {[...Array(2)].map((_, i) => (
                        <div
                            key={i}
                            className="h-6 w-24 bg-gray-700/30 rounded-md"
                        ></div>
                    ))}
                </div>

                {/* Built With */}
                <div className="h-6 w-16 bg-gray-700/40 rounded-md"></div>

                {/* Buttons */}
                <div className="flex gap-4">
                    <div className="h-12 w-32 bg-gray-700/50 rounded-xl"></div>
                    <div className="h-12 w-28 bg-gray-700/30 rounded-xl"></div>
                </div>
            </div>
        </div>
    </div>
  );
}
