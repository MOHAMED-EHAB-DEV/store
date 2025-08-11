'use client';

import dynamic from "next/dynamic";
import TestimonialItem from "@/components/ui/TestimonialItem";
import { testimonials } from "@/constants";

const InfiniteScroll = dynamic(() => import("../ui/InfiniteScroll"), {
    ssr: false,
});

const items = testimonials.map((t: {avatar: string, text: string, rating: Number, name: string}) => ({
    content: <TestimonialItem {...t} />,
}));

export default function Testimonials() {
    return (
        <section className="testimonials-section relative z-10 p-6 mb-[330px]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">
                        Loved by <span className="text-gradient">Creators Worldwide</span>
                    </h2>
                </div>

                <div className="h-[250px] mt-54 relative">
                    <InfiniteScroll
                        items={items}
                        isTilted={true}
                        tiltDirection='left'
                        autoplay={true}
                        autoplaySpeed={0.3}
                        autoplayDirection="down"
                        pauseOnHover={true}
                    />
                </div>
            </div>
        </section>
    );
};
