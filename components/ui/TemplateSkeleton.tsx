import React from 'react';

const TemplateSkeleton = () => {
    return (
        <div className="group relative overflow-hidden w-full md:w-[600px] rounded-3xl glass-strong animate-pulse">
            {/* Gradient Background Placeholder */}
            <div className="absolute inset-0 bg-linear-to-br from-gray-800/20 to-gray-700/20"></div>

            {/* Template Image Placeholder */}
            <div className="relative h-64 bg-linear-to-br from-gray-800 to-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-gray-700/30 to-gray-600/30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-600/50 rounded-lg"></div>
                </div>
            </div>

            {/* Template Info Placeholder */}
            <div className="p-6 relative z-10 space-y-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        {/* Title placeholder */}
                        <div className="h-6 bg-gray-700/50 rounded mb-2 w-3/4"></div>
                        {/* Description placeholder */}
                        <div className="h-4 bg-gray-700/30 rounded w-full mb-1"></div>
                        <div className="h-4 bg-gray-700/30 rounded w-2/3"></div>
                    </div>
                    {/* Price placeholder */}
                    <div className="h-8 w-16 bg-gray-700/50 rounded ml-4"></div>
                </div>

                {/* Rating placeholder */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-4 h-4 bg-gray-600/50 rounded-sm"></div>
                        ))}
                    </div>
                    <div className="h-4 w-8 bg-gray-700/50 rounded"></div>
                    <div className="h-4 w-20 bg-gray-700/30 rounded"></div>
                </div>

                <div className="flex justify-between items-center">
                    {/* Tags placeholder */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-6 w-16 bg-gray-700/30 rounded-full"></div>
                        ))}
                    </div>

                    {/* Action Buttons placeholder */}
                    <div className="flex gap-3">
                        <div className="h-12 w-24 bg-gray-700/50 rounded-xl"></div>
                        <div className="h-12 w-12 bg-gray-700/30 rounded-xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateSkeleton;