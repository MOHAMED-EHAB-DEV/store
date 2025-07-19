"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
    "Production‑Ready with modern stacks like Next.js and Tailwind.",
    "Performance‑Obsessed and optimized for Core Web Vitals.",
    "Integration‑Ready with Auth, DB, and APIs pre-configured.",
    "Lifetime Updates and Priority Developer Support."
];

export default function CodedTemplatesFeatures() {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const panels = gsap.utils.toArray<HTMLElement>(".panel");

        panels.forEach((panel) => {
            const text = panel.querySelector(".panel-text");

            // Pin each panel
            ScrollTrigger.create({
                trigger: panel,
                start: "top top",
                pin: true,
                pinSpacing: false,
            });

            // Animate text fade-in when panel is active
            gsap.fromTo(
                text,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: panel,
                        start: "top center",
                        toggleActions: "play reverse play reverse",
                    }
                }
            );
        });

        ScrollTrigger.refresh(); // Recalculate triggers
    }, []);

    return (
        <div ref={container} className="w-full">
            {FEATURES.map((feature, idx) => (
                <section
                    key={idx}
                    className="panel h-screen flex items-center justify-center bg-transparent px-8"
                >
                    <div className="panel-text text-center text-4xl md:text-5xl font-bold text-white max-w-3xl bg-white/10 backdrop-blur-lg rounded-xl px-8 py-6 shadow-lg">
                        “{feature}”
                    </div>
                </section>
            ))}
        </div>
    );
}
