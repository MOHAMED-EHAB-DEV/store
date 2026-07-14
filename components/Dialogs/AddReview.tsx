"use client";

import { useState } from "react";
import {
    Modal,
    ModalContent,
} from "@/components/ui/Modal";
import { Star } from "@/components/ui/svgs/icons/Star";

interface AddReviewProps {
    templateId: string;
    handleAddReview: (review: string, templateId: string, rating: number) => void;
}

const AddReview = ({ templateId, handleAddReview }: AddReviewProps) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [open, setOpen] = useState(false);

    const handleSubmit = () => {
        if (!rating || !comment.trim()) return;
        handleAddReview(comment, templateId, rating);
        setComment("");
        setRating(0);
        setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 rounded-lg font-medium text-sm active:scale-[0.98]"
            >
                Add Review
            </button>
            <Modal open={open} onOpenChange={setOpen}>
                <ModalContent className="border border-white/10 outline-none focus:outline-none focus:border-none bg-[#15161b] text-white rounded-2xl max-w-md overflow-hidden p-6">
                    <h3 className="text-lg font-bold mb-1 bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                        How was this template? ⭐
                    </h3>
                    <p className="text-gray-400 text-xs mb-3">
                        Your review helps fellow developers — it only takes a moment.
                    </p>

                    <div className="flex justify-center gap-2 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-transform hover:scale-125 duration-150"
                            >
                                <Star
                                    className={`w-8 h-8 transition-colors ${
                                        star <= (hoverRating || rating)
                                            ? "text-yellow-400 fill-current drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]"
                                            : "text-gray-600"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-gray-500 text-xs mb-3 h-4">
                        {rating === 0
                            ? "Tap a star to rate"
                            : rating <= 2
                                ? "We appreciate your honesty 🙏"
                                : rating <= 4
                                    ? "Glad you liked it! 💜"
                                    : "Amazing! You made our day! 🔥"}
                    </p>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your review here..."
                        className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white resize-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 mb-4 text-sm placeholder:text-gray-500"
                        rows={4}
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={!rating || !comment.trim()}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-40 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 active:scale-[0.98]"
                    >
                        Share Your Review 💬
                    </button>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AddReview;