"use client";

import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LoginToDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginToDownloadDialog({ isOpen, onClose }: LoginToDownloadDialogProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/register");
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-[425px] bg-dark">
        <ModalHeader>
          <ModalTitle>Login to Download</ModalTitle>
          <ModalDescription>
            Please log in to your account to download this free template.
          </ModalDescription>
        </ModalHeader>
        <div className="py-4">
          <p>Creating an account is fast and easy. Join our community to get access to exclusive content and features!</p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button aria-label="Cancel" variant="outline" className="hover:bg-primary cursor-pointer" onClick={onClose}>
            Cancel
          </Button>
          <Button aria-label="Register a New Account" onClick={handleLogin} className="border-2 border-primary hover:bg-transparent cursor-pointer">
            Register a New Account
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}