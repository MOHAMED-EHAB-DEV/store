'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronUp } from "@/components/ui/svgs/icons/ChevronUp";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const toggleVisibility = () => {
            const visible = window.scrollY > 300;
            if (visible) {
                setIsRendered(true);
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    useGSAP(() => {
        if (isVisible && buttonRef.current) {
            gsap.set(buttonRef.current, { y: 80, opacity: 0 });
            gsap.to(buttonRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power2.out",
            });
        } else if (!isVisible && isRendered && buttonRef.current) {
            gsap.to(buttonRef.current, {
                y: 80,
                opacity: 0,
                duration: 0.6,
                ease: "power2.in",
                onComplete: () => {
                    setIsRendered(false);
                }
            });
        }
    }, [isVisible]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        gsap.to(e.currentTarget, {
            scale: 1.05,
            duration: 0.2,
            overwrite: "auto",
        });
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        gsap.to(e.currentTarget, {
            scale: 1,
            duration: 0.2,
            overwrite: "auto",
        });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        gsap.to(e.currentTarget, {
            scale: 0.95,
            duration: 0.1,
            overwrite: "auto",
        });
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
        gsap.to(e.currentTarget, {
            scale: 1.05,
            duration: 0.1,
            overwrite: "auto",
        });
    };

    if (!isRendered) return null;

    return (
        <button
            ref={buttonRef}
            onClick={scrollToTop}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className="fixed bottom-6 end-6 z-50 p-4 bg-transparent text-white rounded-full transition-all hover:-translate-y-1 active:scale-95"
            aria-label="Back to top"
        >
            <ChevronUp className="w-6 h-6" />
        </button>
    );
};

export default BackToTop;