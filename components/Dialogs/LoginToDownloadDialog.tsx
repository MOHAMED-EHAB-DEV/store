"use client";

import { Modal, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Lock } from "@/components/ui/svgs/icons/Lock";

interface LoginToDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginToDownloadDialog({ isOpen, onClose }: LoginToDownloadDialogProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };
  
  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md p-0 overflow-hidden border border-white/10 bg-[#0d0f19]/90 backdrop-blur-xl rounded-2xl shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150px] bg-gradient-to-b from-purple-500/20 via-pink-500/10 to-transparent blur-3xl -z-10" />
        
        <div className="p-8 flex flex-col items-center text-center relative z-10">
          {/* Icon Container */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-40 rounded-full animate-pulse" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-black/50 border border-white/10 shadow-inner">
              <Lock className="w-8 h-8 text-white/90" />
            </div>
          </div>

          <h2 className="text-3xl font-bold font-paras tracking-tight text-white mb-2">
            Login Required
          </h2>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
            Please log in or create an account to download this template. Join our community to access exclusive resources, updates, and more!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              aria-label="Login" 
              onClick={handleLogin} 
              className="flex-1 btn-primary cursor-pointer"
            >
              Log in
            </Button>
            <Button 
              aria-label="Create Account" 
              onClick={handleRegister} 
              variant="outline"
              className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              Create Account
            </Button>
          </div>
          
          <button 
            onClick={onClose}
            className="mt-6 text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer"
          >
            Maybe later
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
}