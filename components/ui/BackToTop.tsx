'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from '@/components/ui/svgs/Icons';

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-400 hover:via-pink-400 hover:to-cyan-400 text-white rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 active:scale-95"
                    aria-label="Back to top"
                >
                    <ArrowUp className="w-6 h-6" />
                </button>
            )}
        </>
    );
};

export default BackToTop;
