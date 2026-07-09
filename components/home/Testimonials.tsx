'use client';
import { testimonials } from "@/constants";
import dynamic from "next/dynamic";

const HorizontialMarquee = dynamic(() => import("@/components/ui/marquee"), {ssr: false});

export default function Testimonials() {
    return (
        <section className="testimonials-section relative z-10 p-6 py-16">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">
                        Loved by <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">Creators Worldwide</span>
                    </h2>
                </div>

                {/* <div className="relative overflow-hidden">
                    <HorizontialMarquee
                        items={testimonials}
                        speed={20}
                        direction="right"
                        className="py-8"
                    />
                </div> */}
            </div>
        </section>
    );
};
