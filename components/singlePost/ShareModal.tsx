"use client";

import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/Modal";
import { LinkIcon } from "@/components/ui/svgs/icons/LinkIcon";
import { Twitter } from "@/components/ui/svgs/icons/Twitter";
import { Linkedin } from "@/components/ui/svgs/icons/Linkedin";
import { Facebook } from "@/components/ui/svgs/icons/Facebook";
import { Copy } from "@/components/ui/svgs/icons/Copy";
import { Check } from "@/components/ui/svgs/icons/Check";
import { useState } from "react";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
}

export default function ShareModal({ open, onOpenChange, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const shareLinks = [
    {
      name: "X (Twitter)",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: "hover:bg-blue-500/10 hover:text-blue-400 border-blue-500/20",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "hover:bg-blue-600/10 hover:text-blue-500 border-blue-600/20",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "hover:bg-indigo-600/10 hover:text-indigo-500 border-indigo-600/20",
    },
  ];

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-md bg-gray-950/90 backdrop-blur-xl border border-gray-800 text-white">
        <ModalHeader>
          <ModalTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Share this article</ModalTitle>
          <ModalDescription className="text-gray-400">
            Spread the word and share this content with your network.
          </ModalDescription>
        </ModalHeader>

        <div className="grid grid-cols-3 gap-4 py-6">
          {shareLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-800 bg-gray-900/50 transition-all duration-300 ${link.color} group`}
              >
                <div className="p-3 rounded-full bg-gray-800 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium mt-3 text-gray-300 group-hover:text-current">{link.name}</span>
              </a>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 w-full">
          <div className="grid flex-1 gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                readOnly
                value={url}
                className="w-full bg-gray-900/50 border border-gray-800 text-gray-300 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block pl-10 p-2.5 transition-all"
              />
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-colors flex items-center justify-center min-w-[100px]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-400" />
                <span className="text-green-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                <span className="font-medium">Copy</span>
              </>
            )}
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
}
