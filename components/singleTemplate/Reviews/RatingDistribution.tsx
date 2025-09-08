import React from "react";

interface RatingStats {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: Record<string, number>;
}

const RatingDistribution = ({ stats }: { stats: RatingStats }) => {
    const { totalReviews, ratingBreakdown } = stats;

    return (
        <div className="space-y-2 px-4">
            {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = ratingBreakdown?.[star.toString()] || 0;
                const percentage = totalReviews ? (count / totalReviews) * 100 : 0;

                return (
                    <div key={star} className="flex items-center gap-2">
                        <div className="flex-1 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="w-6 text-sm text-gray-300">{star.toFixed(1)}</span>
                        <span className="w-10 text-sm text-gray-400 text-right">
                          {count}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default RatingDistribution;
