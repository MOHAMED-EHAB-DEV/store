"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-dark">
        <DialogHeader>
          <DialogTitle>Login to Download</DialogTitle>
          <DialogDescription>
            Please log in to your account to download this free template.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Creating an account is fast and easy. Join our community to get access to exclusive content and features!</p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" className="hover:bg-primary cursor-pointer" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleLogin} className="border-2 border-primary hover:bg-transparent cursor-pointer">
            Register a New Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}