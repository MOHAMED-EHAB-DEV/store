"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { anyImgUrl } from "@/lib/utils/image";
import { Modal, ModalContent } from "@/components/ui/Modal";

interface MessageBubbleProps {
  message: {
    _id: string;
    content: string;
    senderType: "user" | "admin";
    sender: {
      name: string;
      avatar?: string;
    };
    attachments?: string[];
    createdAt: string;
    isRead: boolean;
  };
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formattedTime = formatTime(message.createdAt);

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[80%]",
        isOwn ? "ml-auto flex-row-reverse" : "mr-auto",
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {message.sender.avatar ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={message.sender.avatar}
              alt={message.sender.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {message.sender.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col gap-1",
          isOwn ? "items-end" : "items-start",
        )}
      >
        <span className="text-sm text-white/60 px-1">
          {message.sender.name}
        </span>

        {message.content && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 [overflow-wrap:any-where]",
              isOwn
                ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                : "bg-white/10 text-white border border-white/10",
            )}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.attachments.map((url, index) => {
              const isImage =
                /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ||
                url.includes("res.cloudinary.com");

              if (isImage) {
                return <ImageAttachment key={index} url={url} index={index} />;
              }

              return (
                <a
                  key={index}
                  href={url}
                  download
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-purple-400 hover:text-purple-300 hover:bg-white/10 transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>Attachment {index + 1}</span>
                </a>
              );
            })}
          </div>
        )}
        {/* Time */}
        <span className="text-xs text-white/40 mt-1 px-1">{formattedTime}</span>
      </div>
    </div>
  );
}

function ImageAttachment({ url, index }: { url: string; index: number }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10 hover:opacity-80 transition-opacity bg-black/20 cursor-pointer"
      >
        <Image
          src={anyImgUrl(url, { width: 200, quality: 80 })}
          alt={`Attachment ${index + 1}`}
          fill
          className="object-cover pointer-events-none"
        />
      </button>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent
          showCloseButton={false}
          className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 bg-transparent border-none shadow-none overflow-hidden flex items-center justify-center"
        >
          <div
            className="relative w-[90vw] h-[80vh] sm:w-[80vw] sm:h-[80vh]"
            onClick={() => setOpen(false)}
          >
            <Image
              src={anyImgUrl(url, { width: 1200, quality: 90 })}
              alt={`Attachment ${index + 1}`}
              fill
              className="object-contain"
            />
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
