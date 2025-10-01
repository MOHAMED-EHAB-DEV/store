"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";

interface ComingSoonProps {
    dateUnlocked?: Date;
    title: String;
    description: String;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ dateUnlocked, title, description }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
    });

    const floatingRef = useRef<HTMLDivElement[]>([]);

    // Countdown updater
    useEffect(() => {
        if (!dateUnlocked) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = dateUnlocked.getTime() - now;

            if (distance <= 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((distance / (1000 * 60)) % 60),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [dateUnlocked]);

    return (
        <section className="relative flex flex-col items-center justify-center min-h-[80vh] overflow-hidden rounded-2xl mx-auto max-w-4xl container w-full p-8 text-center text-white bg-gradient-radial from-indigo-900 via-slate-900 to-black">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {title}
            </h1>

            <p className="text-lg md:text-xl mb-8 text-indigo-100">
                {description}
            </p>

            {/* Countdown */}
            <div className="flex flex-wrap gap-4 justify-center">
                {Object.entries(timeLeft).map(([label, value]) => (
                    <>
                        <div
                            key={label}
                            className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 min-w-[80px] shadow-md"
                        >
                            <span className="text-3xl font-bold">{value}</span>
                            <span className="text-sm uppercase tracking-wide text-slate-300">
                                {label}
                            </span>
                        </div>
                        {label !== "minutes" && (
                            <span className="self-center flex flex-col gap-1 justify-center">
                                <div className="rounded-[1.5px] w-1 h-1 bg-white/50" />
                                <div className="rounded-[1.5px] w-1 h-1 bg-white/50" />
                            </span>
                        )}
                    </>
                ))}
            </div>

            <span className="mt-10 px-6 py-2 rounded-full font-semibold tracking-wider bg-linear-to-r from-indigo-500 to-purple-600 shadow-lg">
                #ExclusivePreview
            </span>
        </section>
    );
};

export default ComingSoon;
