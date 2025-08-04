'use client';

import {useEffect, useRef} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import { Star } from "lucide-react";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
    {
        name: "Sarah Johnson",
        role: "Product Designer",
        text: "This service transformed our workflow and saved us countless hours!",
        avatar: "/assets/images/client1.png",
    },
    {
        name: "Mike Anderson",
        role: "Developer",
        text: "The UI and experience were smooth and intuitive. Highly recommend!",
        avatar: "/assets/images/client2.png",
    },
    {
        name: "Emily Carter",
        role: "CEO, StartUpX",
        text: "A seamless experience with great support. Worth every penny!",
        avatar: "/assets/images/client3.png",
    },
];

export default function Testimonials() {
    useEffect(() => {
        ScrollTrigger.create({
            trigger: ".testimonials-section",
            start: "top 80%",
            onEnter: () => {
                gsap.fromTo(
                    ".testimonial-card",
                    { opacity: 0, y: 60, rotation: -2 },
                    {
                        duration: 1,
                        y: 0,
                        opacity: 1,
                        rotation: 0,
                        stagger: 0.2,
                        ease: "power3.out",
                    },
                );
            },
        });
    }, []);

    return (
        <section className="testimonials-section relative z-10 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">
                        Loved by <span className="text-gradient">Creators Worldwide</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={testimonial.name}
                            className="testimonial-card glass p-6 rounded-2xl transition-all duration-500"
                        >
                            <div className="flex items-center mb-4">
                                <div
                                    className="w-12 h-12 bg-gradient-to-r from-gold to-yellow-400 rounded-full flex items-center justify-center text-black font-bold mr-4"
                                >
                                    <Image
                                        src={testimonial.avatar}
                                        alt="Testimonials"
                                        width={48}
                                        height={48}
                                        placeholder="blur"
                                    />
                                </div>
                                <div>
                                    <div className="font-semibold text-white">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        {testimonial.role}
                                    </div>
                                </div>
                                <div className="ml-auto flex text-gold">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current"/>
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-300">{testimonial.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
