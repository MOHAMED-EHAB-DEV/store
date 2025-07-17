'use client';

import {useRef, useState, useEffect} from "react";
import {Badge} from "./ui/badge"
import {
    Framer,
    Layers,
} from "lucide-react";
import Image from "next/image";

const Features = () => {
    const scrollableRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    } else {
                        setIsVisible(false);
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (scrollableRef.current) {
            observer.observe(scrollableRef.current);
        }

        return () => {
            if (scrollableRef.current) {
                observer.unobserve(scrollableRef.current);
            }
        };
    }, []);


    return (
        <div className="flex flex-col w-full h-full items-center justify-center gap-4 mt-24">
            <div className="flex flex-col items-center justify-center gap-1">
                <Badge variant="outline"
                       className="bg-dark animate-shimmer relative hover:shadow-[0_0_25px_#746D91]">
                    <Framer className="w-10 h-10"/>
                    Framer Templates
                    <span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shine"/>
                </Badge>

                <h1 className="text-xl md:text-3xl text-white font-paras font-bold w-full md:w-3/5 text-center">
                    Save time, reduce costs, and ship stunning websites with ease.
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full gap-5 px-20">
                <div
                    className="grid grid-rows-1 md:grid-rows-2 w-full h-full items-center justify-center md:items-between md:justify-start gap-8 sm:gap-8 md:gap-0">
                    <div
                        className="flex flex-col gap-12 border w-[80dvw] md:w-full p-10 justify-center rounded-lg bg-dark"
                        style={{
                            borderColor: "rgba(255, 255, 255, 0.1)"
                        }} ref={scrollableRef}>
                        <div className="flex flex-col gap-7">
                            <div className="flex gap-1 md:gap-6 w-full items-center">
                                <div className="flex text-xl opacity-[0.24] text-white gap-1 w-1/2">
                                    <Layers/>
                                    <span className="font-bold text-base">Web Designer</span>
                                </div>
                                <div
                                    className="relative flex items-center justify-center w-full h-full overflow-hidden"
                                    style={{
                                        mask: "linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,1) 25.1002956081081%) add",
                                        WebkitMask: "linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,1) 25.1002956081081%) add",
                                    }}>
                                    <span className="opacity-60 z-10 text-white font-medium">5000$+</span>
                                    <div
                                        className={`${isVisible ? "w-[80%]" : "w-0"} h-6 bg-[#262626] absolute left-0 bottom-0 rounded-r-lg transition-all duration-900 ease-linear`} />
                                </div>
                            </div>
                            <div className="flex gap-6 w-full md:w-[70%] items-center">
                                <div className="flex text-white gap-2 w-full">
                                    <Framer/>
                                    <span className="font-bold text-base">Framer Templates</span>
                                </div>
                                <div
                                    className="relative flex items-center justify-center w-full h-full overflow-hidden"
                                    style={{
                                        mask: "linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,1) 25.1002956081081%) add"
                                    }}>
                                    <span className="z-10 text-white font-medium">99$</span>
                                    <div
                                        className={`${isVisible ? "w-[75%]" : "w-0"} h-6 bg-blue-700 absolute left-0 bottom-0 rounded-r-lg transition-all duration-900 ease-linear`}/>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h1 className="text-white text-2xl md:text-4xl font-paras font-bold">Premium web design at
                                fraction of the cost</h1>
                            <p className="text-secondary text-base md:text-lg font-medium">Get a premium website without
                                the premium price tag. Save thousands while still getting all the quality and features
                                your business deserves.</p>
                        </div>
                    </div>
                    <div className="flex gap-5 flex-col md:flex-row">
                        <div
                            className="relative flex flex-col justify-end w-1/2 h-[60dvh] rounded-lg overflow-hidden border p-10"
                            style={{borderColor: "rgba(255, 255, 255, 0.1)"}}
                        >
                            <video
                                src="/assets/Videos/framer.mp4"
                                muted
                                loop
                                autoPlay
                                className="absolute top-0 left-0 w-full h-full object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>

                            <div
                                className="relative z-20 flex h-1/2 md:h-full justify-center md:justify-end w-full flex-col gap-1">
                                <h1 className="text-white font-medium text-base md:text-2xl">
                                    No Coding Skills Required.
                                </h1>
                                <p className="text-secondary font-normal text-sm md:text-lg">
                                    Customize your website with simple drag-and-drop editing.
                                </p>
                            </div>
                        </div>
                        <div
                            className="relative flex flex-col justify-end gap-4 border rounded-lg w-full md:w-1/2 h-[60dvh] overflow-hidden bg-dark"
                            style={{borderColor: "rgba(255, 255, 255, 0.1)"}}
                        >
                            {/* Background Media */}
                            <video
                                src="/assets/Videos/framer-demo.mp4"
                                autoPlay
                                loop
                                muted
                                className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                            {/* Gradient overlay for readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                            {/* Content */}
                            <div className="relative z-10 p-6 md:p-10">
                                <h1 className="text-white font-paras font-bold text-xl md:text-3xl">
                                    Bring Your Website to Life
                                </h1>
                                <p className="text-secondary font-medium text-base md:text-lg">
                                    Launch stunning websites in minutes with ready-to-use templates. Simply choose,
                                    customize, and publish—no hassle, just results.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="w-full md:w-1/3 h-full md:h-1/2 grid grid-rows-1 md:grid-rows-2"></div>
            </div>
        </div>
    )
}
export default Features
