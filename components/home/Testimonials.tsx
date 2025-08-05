'use client';

import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";

gsap.registerPlugin(ScrollTrigger);

const HorizontialMarquee = dynamic(() => import("../ui/marquee"), {
    ssr: false,
});

const testimonials = [
    {
        name: "Sarah Johnson",
        // role: "Product Designer",
        text: "This service transformed our workflow and saved us countless hours!",
        avatar: "/assets/images/client1.png",
        rating: 4,
    },
    {
        name: "Mike Anderson",
        // role: "Developer",
        text: "The UI and experience were smooth and intuitive. Highly recommend!",
        avatar: "/assets/images/client2.png",
        rating: 5,
    },
    {
        name: "Emily Carter",
        // role: "CEO, StartUpX",
        text: "A seamless experience with great support. Worth every penny!",
        avatar: "/assets/images/client3.png",
        rating: 4,
    },
];

export default function Testimonials() {
    return (
        <section className="testimonials-section relative z-10 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">
                        Loved by <span className="text-gradient">Creators Worldwide</span>
                    </h2>
                </div>

                <div className="w-full grid grid-rows-3 gap-2">
                    <HorizontialMarquee items={testimonials} />
                    <HorizontialMarquee items={testimonials} direction="left" />
                    <HorizontialMarquee items={testimonials} />
                </div>
            </div>
        </section>
    );
}
