"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star } from "@/components/ui/svgs/icons/Star";
import { Heart } from "@/components/ui/svgs/icons/Heart";
import { Trash2 } from "@/components/ui/svgs/icons/Trash2";
import { Edit } from "@/components/ui/svgs/icons/Edit";
import { anyImgUrl } from "@/lib/utils/image";
import { formatCount } from "@/lib/utils";
import RatingDistribution from "@/components/singleTemplate/Reviews/RatingDistribution";
import AddReview from "@/components/Dialogs/AddReview";
import { sonnerToast } from "@/components/ui/sonner";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  helpfulCount: number;
  helpfulVotes?: string[];
  createdAt: string;
}

const ReviewsContainer = ({
  templateId,
  averageRating,
  reviewCount,
}: {
  templateId: string;
  averageRating: number;
  reviewCount: number;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userReviewed, setUserReviewed] = useState(false);

  // Edit state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const { purchasedTemplates, user } = useUser();
  const router = useRouter();

  const addAccess =
    !userReviewed && purchasedTemplates.some((id) => id === templateId);

  // Helper to sort user's review to the top
  const sortReviews = (fetchedReviews: Review[]) => {
    if (!user?._id) return fetchedReviews;
    const sorted = [...fetchedReviews];
    const userReviewIndex = sorted.findIndex((r) => r.user._id === user._id);
    if (userReviewIndex > 0) {
      const [userReview] = sorted.splice(userReviewIndex, 1);
      sorted.unshift(userReview);
    }
    return sorted;
  };

  const loadReviews = async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/reviews?templateId=${templateId}&page=${pageNumber}&limit=6`,
      );
      const data = await res.json();

      if (data.reviews?.length < 6) {
        setHasMore(false);
      }

      if (pageNumber === 1) {
        setReviews(sortReviews(data.reviews || []));
      } else {
        setReviews((prev) => sortReviews([...prev, ...(data.reviews || [])]));
      }
    } catch (err) {
      console.error("Error loading reviews", err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserReviewStatus = async () => {
    try {
      const res = await fetch(
        `/api/reviews/status?templateId=${templateId}&userId=${user?._id}`,
      );
      const data = await res.json();
      setUserReviewed(data.reviewed);
    } catch (err) {
      console.error("Error checking review status", err);
    }
  };

  const getRatingBreakdown = (reviews: Review[]) => {
    const counts: Record<string, number> = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    };
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
  }, [templateId, user?._id]);

  const handleShowMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await loadReviews(nextPage);
  };

  const handleAddReview = async (
    review: string,
    templateId: string,
    rating: number,
  ) => {
    try {
      const response = await fetch(`/api/reviews`, {
        method: "POST",
        body: JSON.stringify({
          comment: review,
          rating,
          templateId,
        }),
      });
      const data = await response.json();

      if (data.success) {
        sonnerToast.success(data.message || "Review added successfully!");
        router.refresh();
        setReviews((prev) => sortReviews([data.review, ...prev]));
        setUserReviewed(true);
      } else sonnerToast.error(data.message || "Failed to add review");
    } catch (err) {
      sonnerToast.error("Error while adding your review, please try again.");
      // console.log(err);
    }
  };

  const handleToggleHelpful = async (reviewId: string) => {
    if (!user) {
      sonnerToast.error("Please login to vote");
      return;
    }
    try {
      // Optimistic UI update
      setReviews((prev) =>
        prev.map((r) => {
          if (r._id === reviewId) {
            const hasVoted = r.helpfulVotes?.includes(user._id);
            return {
              ...r,
              helpfulCount: hasVoted
                ? Math.max(0, r.helpfulCount - 1)
                : r.helpfulCount + 1,
              helpfulVotes: hasVoted
                ? r.helpfulVotes?.filter((id) => id !== user._id)
                : [...(r.helpfulVotes || []), user._id],
            };
          }
          return r;
        }),
      );

      const response = await fetch(`/api/reviews/helpful`, {
        method: "POST",
        body: JSON.stringify({ reviewId }),
      });
      const data = await response.json();

      if (!data.success) {
        // Revert on failure by reloading
        loadReviews(1);
        sonnerToast.error(data.message || "Failed to submit vote");
      }
    } catch (err) {
      loadReviews(1);
      sonnerToast.error("Error submitting vote");
    }
  };

  const confirmDeleteReview = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      const response = await fetch(`/api/reviews?reviewId=${reviewToDelete}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        sonnerToast.success("Review deleted successfully");
        setReviews((prev) => prev.filter((r) => r._id !== reviewToDelete));
        setUserReviewed(false);
      } else {
        sonnerToast.error(data.message || "Failed to delete review");
      }
    } catch (err) {
      sonnerToast.error("Error deleting review");
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleEditSubmit = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews`, {
        method: "PUT",
        body: JSON.stringify({
          reviewId,
          comment: editComment,
          rating: editRating,
        }),
      });
      const data = await response.json();
      if (data.success) {
        sonnerToast.success("Review updated successfully");
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, ...data.review } : r)),
        );
        setEditingReviewId(null);
      } else {
        sonnerToast.error(data.message || "Failed to update review");
      }
    } catch (err) {
      sonnerToast.error("Error updating review");
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold pb-4 mb-4 border-b border-b-white/50 flex items-center gap-3">
        Reviews
      </h2>

      <div className="grid grid-cols-[auto_auto_1fr] items-center gap-8 px-5 w-full">
        <div className="flex flex-col gap-2 px-8 items-center">
          <div className="text-lg font-semibold">
            {averageRating?.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  i < Math.floor(averageRating)
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

      <div className="space-y-4 mt-4">
        {reviews.map((review) => {
          const isOwner = user?._id === review.user._id;
          const isEditing = editingReviewId === review._id;
          const hasVoted = review.helpfulVotes?.includes(user?._id || "");

          return (
            <div
              key={review._id}
              className="p-4 w-full md:w-3/4 rounded-xl border border-white/10 bg-white/5 relative"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {review.user.avatar && (
                    <Image unoptimized
                      src={anyImgUrl(review.user.avatar, {
                        width: 64,
                        quality: 80,
                      })}
                      alt={review.user.name}
                      className="w-8 h-8 rounded-full"
                      width={32}
                      height={32}
                    />
                  )}
                  <span className="font-medium">
                    {review.user.name} {isOwner && "(You)"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          onMouseEnter={() => setEditHoverRating(star)}
                          onMouseLeave={() => setEditHoverRating(0)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-4 h-4 transition-colors ${
                              star <= (editHoverRating || editRating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={`filled-${i}`}
                          className={`w-4 h-4 text-yellow-400 fill-current`}
                        />
                      ))}
                      {[...Array(5 - review.rating)].map((_, i) => (
                        <Star
                          key={`empty-${i}`}
                          className={`w-4 h-4 text-gray-600`}
                        />
                      ))}
                    </span>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="mt-4 flex flex-col gap-2">
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white resize-none focus:outline-none focus:border-purple-500"
                    rows={3}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingReviewId(null)}
                      className="px-3 py-1.5 text-sm text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditSubmit(review._id)}
                      className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 rounded text-white"
                      disabled={!editComment.trim() || !editRating}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-gray-300">{review.comment}</p>
              )}

              {!isEditing && (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <p className="text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleHelpful(review._id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        hasVoted
                          ? "text-pink-500"
                          : "text-gray-400 hover:text-pink-400"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${hasVoted ? "fill-current" : ""}`}
                      />
                      <span>{review.helpfulCount || 0}</span>
                    </button>

                    {isOwner && (
                      <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                        <button
                          onClick={() => {
                            setEditingReviewId(review._id);
                            setEditComment(review.comment);
                            setEditRating(review.rating);
                          }}
                          className="text-gray-400 hover:text-purple-400 transition-colors p-1"
                          aria-label="Edit review"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDeleteReview(review._id)}
                          className="text-gray-400 hover:text-red-400 transition-colors p-1"
                          aria-label="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && reviews.length > 0 && (
        <button
          onClick={handleShowMore}
          disabled={loading}
          aria-label="Show More Reviews"
          className="mt-6 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Show More Reviews"}
        </button>
      )}

      {addAccess && (
        <div className="mt-6">
          <AddReview
            templateId={templateId}
            handleAddReview={handleAddReview}
          />
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteReview}
        title="Delete Review"
        description="Are you sure you want to delete your review? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default ReviewsContainer;
