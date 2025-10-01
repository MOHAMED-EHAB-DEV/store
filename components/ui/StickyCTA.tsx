'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star } from '@/components/ui/svgs/Icons';
import Link from 'next/link';

const StickyCTA = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            if (isDismissed) return;

            const currentScrollY = window.scrollY;

            if (currentScrollY > 700 && currentScrollY > lastScrollY.current) {
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isDismissed]);

    if (isDismissed) return null;

    return (
        <>
            {isVisible && (
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-linear-to-r from-purple-500 via-pink-500 to-cyan-500 py-4 px-2 shadow-2xl border-t border-white/10 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <span className="text-white font-bold text-lg">Ready to Launch?</span>
                            </div>
                            <span className="text-white/90 text-sm hidden sm:inline">
                                Join 10,000+ developers building faster with our templates
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/templates"
                                className="group bg-white text-purple-600 hover:bg-gray-100 font-bold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg"
                            >
                                <span className="flex items-center gap-2">
                                      Browse Templates
                                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </Link>
                            <button
                                onClick={() => setIsDismissed(true)}
                                className="text-white/70 hover:text-white px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
                                aria-label="Dismiss sticky CTA"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StickyCTA;
