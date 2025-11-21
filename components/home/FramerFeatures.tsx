'use client';

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { Badge } from "../ui/badge";
import { Framer, Layers } from "@/components/ui/svgs/Icons";
import Image from "next/image";
import { featuresBusinessSales } from "@/constants";
import { VerticalMarquee } from "@/components/ui/marquee";

const FramerFeatures = () => {
    const scrollableRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => setIsVisible(entry.isIntersecting));
            },
            { threshold: 0.2 }
        );

        if (scrollableRef.current) observer.observe(scrollableRef.current);

        return () => {
            if (scrollableRef.current) observer.unobserve(scrollableRef.current);
        };
    }, []);

    useLayoutEffect(() => {
        let ctx: gsap.Context | null = null;

        (async () => {
            const { gsap } = await import("gsap");
            const { ScrollTrigger } = await import("gsap/ScrollTrigger");
            gsap.registerPlugin(ScrollTrigger);

            ctx = gsap.context(() => {
                // Animate section header
                gsap.from(".framer-header", {
                    scrollTrigger: {
                        trigger: ".framer-header",
                        start: "top 85%",
                        end: "bottom 30%"
                    },
                    opacity: 0,
                    y: 40,
                    duration: 1,
                    ease: "power3.out",
                });

                // Animate all feature cards
                gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card, i) => {
                    gsap.from(card, {
                        scrollTrigger: {
                            trigger: card,
                            start: "top 85%",
                            end: "bottom 30%"
                        },
                        opacity: 0,
                        y: 60,
                        duration: 1,
                        delay: i * 0.1,
                        ease: "power3.out",
                    });
                });

                // Animate videos
                gsap.utils.toArray<HTMLElement>(".feature-video").forEach((video, i) => {
                    gsap.from(video, {
                        scrollTrigger: {
                            trigger: video,
                            start: "top 85%",
                            end: "bottom 30%"
                        },
                        opacity: 0,
                        scale: 0.95,
                        duration: 1.2,
                        delay: i * 0.15,
                        ease: "power3.out",
                    });
                });
            });
        })();

        return () => ctx?.revert();
    }, []);

    return (
        <section className="flex flex-col w-full h-full items-center justify-center gap-6 py-6">
            {/* Header Section */}
            <div className="flex flex-col items-center justify-center gap-2 framer-header">
                <Badge
                    variant="outline"
                    className="bg-transparent relative hover:shadow-[0_0_25px_#746D91]"
                >
                    <Framer className="w-10 h-10" />
                    Framer Templates
                    <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent animate-shine" />
                </Badge>

                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl text-white font-paras font-bold w-full md:w-4/5 text-center">
                    Ship Websites Faster with Framer
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] w-full gap-6 px-6 md:px-20">
                {/* Left Content */}
                <div className="grid gap-6 auto-rows-auto">
                    {/* Pricing Card */}
                    <div
                        className="flex flex-col gap-8 border w-full p-12 justify-center rounded-lg bg-dark feature-card"
                        style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                        ref={scrollableRef}
                    >
                        <div className="flex flex-col gap-7">
                            <div className="flex gap-6 w-full items-center">
                                <div className="flex text-xl opacity-60 text-white gap-1 w-1/2">
                                    <Layers />
                                    <span className="font-bold text-base">Web Designer</span>
                                </div>
                                <div
                                    className="relative flex items-center justify-center w-full overflow-hidden"
                                    style={{
                                        mask: "linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,1) 25.1%)",
                                        WebkitMask: "linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,1) 25.1%)",
                                    }}
                                >
                                    <span className="opacity-60 z-10 text-white font-medium">
                                        4999$+
                                    </span>
                                    <div
                                        className={`${isVisible ? "w-full md:w-[80%]" : "w-0"
                                            } h-6 bg-[#262626] absolute left-0 bottom-0 rounded-r-lg transition-all duration-900 ease-linear`}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6 w-full md:w-[70%] items-center">
                                <div className="flex text-white gap-2 w-full">
                                    <Framer />
                                    <span className="font-bold text-base">Framer Templates</span>
                                </div>
                                <div
                                    className="relative flex items-center justify-center md:justify-center w-full overflow-hidden"
                                    style={{
                                        mask: "linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,1) 25.1%)",
                                    }}
                                >
                                    <span className="z-10 text-white font-medium">99$</span>
                                    <div
                                        className={`${isVisible ? "w-[75%]" : "w-0"
                                            } h-6 bg-blue-700 absolute left-0 bottom-0 rounded-r-lg transition-all duration-900 ease-linear`}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h1 className="text-white text-2xl md:text-4xl font-paras font-bold">
                                Premium Templates at Affordable Prices
                            </h1>
                            <p className="text-secondary text-base md:text-lg font-medium">
                                Save thousands compared to hiring a designer—snap up fully designed, top-quality templates for a fraction of the price.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-5">
                        <div
                            className="relative flex flex-col justify-end w-full md:w-1/2 h-[50dvh] rounded-lg overflow-hidden border p-6 feature-video"
                            style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                        >
                            <video
                                src="/assets/Videos/framer.mp4"
                                muted
                                loop
                                autoPlay
                                className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10"></div>
                            <div className="relative z-20 flex h-1/2 md:h-full justify-center md:justify-end w-full flex-col gap-1">
                                <h1 className="text-white font-medium text-base md:text-2xl">
                                    Drag-and-Drop Simplicity
                                </h1>
                                <p className="text-secondary font-normal text-sm md:text-lg">
                                    Forget complex code. Framer’s intuitive drag-and-drop editor empowers
                                    you to design and launch with ease.
                                </p>
                            </div>
                        </div>

                        <div
                            className="relative flex flex-col justify-end gap-4 border rounded-lg w-full md:w-1/2 h-[50dvh] overflow-hidden bg-dark p-6 feature-video"
                            style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                        >
                            <video
                                src="/assets/Videos/framer-demo.mp4"
                                autoPlay
                                loop
                                muted
                                className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent"></div>
                            <div className="relative z-10">
                                <h1 className="text-white font-paras font-bold text-xl md:text-3xl">
                                    Lightning-Fast Launch
                                </h1>
                                <p className="text-secondary font-medium text-base md:text-lg">
                                    Get live in <b>days</b>, not <b>months</b>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full grid gap-6 auto-rows-auto">
                    <div
                        className="flex w-full p-7 flex-col justify-center gap-2 border bg-dark rounded-lg feature-card"
                        style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                    >
                        <div className="w-full flex items-center justify-center relative">
                            <Image
                                src="/assets/Icons/publish.webp"
                                alt="publish"
                                width={150}
                                height={150}
                            />
                            <Image
                                src="/assets/Icons/smCursor.avif"
                                alt="cursor"
                                width={25}
                                height={25}
                                className="absolute bottom-0 right-24"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h1 className="text-white font-paras font-bold text-2xl md:text-4xl">
                                Launch in days, not Months
                            </h1>
                            <p className="text-secondary font-medium text-base">
                                Skip the grueling wait and get your website up and running quickly.
                            </p>
                        </div>
                    </div>

                    <div
                        className="p-6 flex flex-col border justify-center gap-3 bg-dark rounded-lg feature-card"
                        style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                    >
                        <div className="flex flex-col gap-1">
                            <h1 className="text-white text-2xl md:text-4xl font-paras font-bold">
                                Business-Driven Design
                            </h1>
                            <p className="text-secondary text-base font-medium">
                                Every template is optimized for <b>conversions</b>, helping you turn
                                visitors into paying customers.
                            </p>
                        </div>
                        <VerticalMarquee
                            items={featuresBusinessSales}
                            speed={10}
                            height="h-32 md:h-40"
                            direction="down"
                        />
                    </div>
                </div>
            </div>

            {/* Strategic CTA */}
            <div className="text-center mt-16 px-6">
                <a
                    href="/templates?type=framer"
                    className="group relative inline-flex items-center justify-center bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-400 hover:via-purple-400 hover:to-pink-400 text-white px-12 py-5 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
                    aria-label="Browse Framer templates"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <Framer className="w-6 h-6" />
                        Explore Framer Templates
                    </span>
                    <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                </a>
            </div>
        </section>
    );
};

export default FramerFeatures;
