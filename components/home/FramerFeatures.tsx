'use client';

import { useRef, useState, useEffect, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Framer, Layers } from "lucide-react";
import Image from "next/image";
import { featuresBusinessSales } from "@/constants";
import VerticalMarquee from "@/components/ui/marquee";

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

    return (
        <section className="flex flex-col w-full h-full items-center justify-center gap-6">
            {/* Header Section */}
            <div className="flex flex-col items-center justify-center gap-2">
                <Badge
                    variant="outline"
                    className="bg-transparent relative hover:shadow-[0_0_25px_#746D91]"
                >
                    <Framer className="w-10 h-10" />
                    Framer Templates
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shine" />
                </Badge>

                <h1 className="text-xl md:text-4xl text-white font-paras font-bold w-full md:w-4/5 text-center">
                    Ship Websites Faster with Framer
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] w-full gap-6 px-6 md:px-20">
                {/* Left Content */}
                <div className="grid gap-6 auto-rows-auto">
                    {/* Pricing Card */}
                    <div
                        className="flex flex-col gap-8 border w-full p-12 justify-center rounded-lg bg-dark"
                        style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                        ref={scrollableRef}
                    >
                        <div className="flex flex-col gap-7">
                            <div className="flex gap-6 w-full items-center">
                                <div className="flex text-xl opacity-[0.24] text-white gap-1 w-1/2">
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
                                        5000$+
                                    </span>
                                    <div
                                        className={`${
                                            isVisible ? "w-full md:w-[80%]" : "w-0"
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
                                        className={`${
                                            isVisible ? "w-[75%]" : "w-0"
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
                                Create pixel-perfect designs without breaking the bank. Our pre-built
                                Framer templates cost a fraction of hiring a professional designer.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-5">
                        <div
                            className="relative flex flex-col justify-end w-full md:w-1/2 h-[50dvh] rounded-lg overflow-hidden border p-6"
                            style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                        >
                            <video
                                src="/assets/Videos/framer.mp4"
                                muted
                                loop
                                autoPlay
                                className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
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
                            className="relative flex flex-col justify-end gap-4 border rounded-lg w-full md:w-1/2 h-[50dvh] overflow-hidden bg-dark p-6"
                            style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                        >
                            <video
                                src="/assets/Videos/framer-demo.mp4"
                                autoPlay
                                loop
                                muted
                                className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <div className="relative z-10">
                                <h1 className="text-white font-paras font-bold text-xl md:text-3xl">
                                    Lightning-Fast Launch
                                </h1>
                                <p className="text-secondary font-medium text-base md:text-lg">
                                    From concept to live site in <b>days, not months</b>. Start building,
                                    customize with ease, and hit publish without delays.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full grid gap-6 auto-rows-auto">
                    <div
                        className="flex w-full p-7 flex-col justify-center gap-2 border bg-dark rounded-lg"
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
                        className="p-6 flex flex-col border justify-center gap-3 bg-dark rounded-lg"
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
        </section>
    );
};

export default FramerFeatures;
