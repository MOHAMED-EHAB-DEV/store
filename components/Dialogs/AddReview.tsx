"use client";

import { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalDescription,
    ModalHeader,
    ModalTitle,
} from "@/components/ui/Modal";
import { Star } from "@/components/ui/svgs/icons/Star";

interface AddReviewProps {
    templateId: string;
    handleAddReview: (review: string, templateId: string, rating: number) => void;
}

const AddReview = ({ templateId, handleAddReview }: AddReviewProps) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
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
            <button type="button" onClick={() => setOpen(true)} className="cursor-pointer px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 transition-colors rounded-lg">
                Add Review
            </button>
            <Modal open={open} onOpenChange={setOpen}>
                <ModalContent className="border-none outline-none focus:outline-none focus:border-none bg-[#1f1f23] text-white rounded-xl max-w-md">
                    <ModalHeader className="border-b pb-2 border-b-white/20">
                        <ModalTitle>Add Review</ModalTitle>
                        <ModalDescription className="text-gray-400">
                            Share your experience with this template
                        </ModalDescription>
                    </ModalHeader>

                {/* Rating stars */}
                <div className="flex gap-2 my-4 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className="focus:outline-none"
                            aria-label="Select rating"
                        >
                            <Star
                                className={`w-8 h-8 transition-colors ${
                                    star <= (hover || rating)
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-600"
                                }`}
                            />
                        </button>
                    ))}
                </div>

                {/* Comment input */}
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your review..."
                    className="w-full p-3 rounded-lg bg-gray-800 text-white resize-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                />

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={!rating || !comment.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-50"
                        aria-label="Submit review"
                    >
                        Submit
                    </button>
                </div>
            </ModalContent>
        </Modal>
        </>
    );
};

export default AddReview;