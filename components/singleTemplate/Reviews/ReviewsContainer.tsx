"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {Star} from "@/components/ui/svgs/Icons";
import {formatCount} from "@/lib/utils";
import RatingDistribution from "@/components/singleTemplate/Reviews/RatingDistribution";
import AddReview from "@/components/Dialogs/AddReview";
import {sonnerToast} from "@/components/ui/sonner";
import {useUser} from "@/context/UserContext";
import {useRouter} from "next/navigation";

interface Review {
    _id: string;
    user: {
        name: string;
        avatar?: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
}

const ReviewsContainer = ({ templateId, averageRating, reviewCount }: { templateId: string, averageRating: number, reviewCount: number }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [userReviewed, setUserReviewed] = useState(false);

    const {purchasedTemplates, user} = useUser();
    const router = useRouter();

    const addAccess =
        ( !userReviewed && purchasedTemplates.some((id) => id === templateId) ) ||
        user?.role === "admin";

    const loadReviews = async (pageNumber: number) => {
        try {
            setLoading(true);
            const res = await fetch(
                `/api/reviews?templateId=${templateId}&page=${pageNumber}&limit=6`
            );
            const data = await res.json();

            if (data.reviews.length < 6) {
                setHasMore(false);
            }

            if (pageNumber === 1) {
                setReviews(data.reviews);
            } else {
                setReviews((prev) => [...prev, ...data.reviews]);
            }
        } catch (err) {
            console.error("Error loading reviews", err);
        } finally {
            setLoading(false);
        }
    };

    const checkUserReviewStatus = async () => {
        try {
            const res = await fetch(`/api/reviews/status?templateId=${templateId}&userId=${user?._id}`);
            const data = await res.json();
            setUserReviewed(data.reviewed);
        } catch (err) {
            console.error("Error checking review status", err);
        }
    };

    const getRatingBreakdown = (reviews: Review[]) => {
        const counts: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
        reviews.forEach((r) => {
            counts[r.rating.toString()] = (counts[r.rating.toString()] || 0) + 1;
        });
        return counts;
    };

    useEffect(() => {
        loadReviews(1);
        if (user?._id && templateId) {
            checkUserReviewStatus();
        }
    }, [templateId]);

    const handleShowMore = async () => {
        const nextPage = page + 1;
        setPage(nextPage);
        await loadReviews(nextPage);
    };

    const handleAddReview = async (review: string, templateId: string, rating: number) => {
        try {
            const response = await fetch(`/api/reviews`, {
                method: 'POST',
                body: JSON.stringify({
                    comment: review,
                    rating,
                    templateId,
                })
            });
            const data = await response.json();

            if (data.success) {
                sonnerToast.success(data.message || "Review added successfully!");
                router.refresh();
                setReviews((prev) => [data.review, ...prev]);
                setUserReviewed(true);
            } else
                sonnerToast.error(data.message || "Failed to add review");
        } catch (err) {
            sonnerToast.error("Error while adding your review, please try again.");
            console.log(err);
        }
    }

    return (
        <div className="mt-8">
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold pb-4 mb-4 border-b border-b-white/50 flex items-center gap-3">
                Reviews
                {/*<span className="text-gray-400 text-xs sm:text-sm">*/}
                {/*    {reviewCount ?? 0} reviews*/}
                {/*</span>*/}
            </h2>

            <div className="grid grid-cols-[auto_auto_1fr] items-center gap-8 px-5 w-full">
                <div className="flex flex-col gap-2 px-8 items-center">
                    <div className="text-lg font-semibold">{averageRating?.toFixed(1)}</div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(averageRating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-600"
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-gray-400 text-xs sm:text-sm">
                        {formatCount(reviewCount ?? 0)} reviews
                    </span>
                </div>
                <div className="border-r h-full border-r-white/50" />
                <RatingDistribution
                    stats={{
                        averageRating: averageRating as number,
                        totalReviews: reviewCount,
                        ratingBreakdown: getRatingBreakdown(reviews),
                    }}
                />
            </div>

            {reviews.length === 0 && !loading && (
                <p className="text-gray-400">No reviews yet.</p>
            )}

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div
                        key={review._id}
                        className="p-4 w-3/4"
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                {review.user.avatar && (
                                    <Image
                                        src={review.user.avatar}
                                        alt={review.user.name}
                                        className="w-8 h-8 rounded-full"
                                        width={32}
                                        height={32}
                                    />
                                )}
                                <span className="font-medium">{review.user.name}</span>
                            </div>
                            <span className="flex items-center gap-2">
                                {/*{"★".repeat(review.rating)}*/}
                                {/*{"☆".repeat(5 - review.rating)}*/}
                                {/*{review.rating}*/}
                                {review.rating}
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 text-yellow-400 fill-current`}
                                    />
                                ))}
                                {[...Array(5-review.rating)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 text-gray-600`}
                                    />
                                ))}
                            </span>
                        </div>
                        <p className="mt-2 text-gray-300">{review.comment}</p>
                        <p className="mt-1 text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Show more button */}
            {hasMore && reviews.length > 0 && (
                <button
                    onClick={handleShowMore}
                    disabled={loading}
                    className="mt-4 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
                >
                    {loading ? "Loading..." : "Show More"}
                </button>
            )}

            {addAccess && <AddReview templateId={templateId} handleAddReview={handleAddReview} />}
        </div>
    );
};

export default ReviewsContainer;
