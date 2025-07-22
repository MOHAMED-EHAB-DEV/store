"use client";

import Image from 'next/image';

const WhyUs = () => {
    return (
        <div className="flex flex-col mx-auto md:flex-row items-center justify-center w-full h-full gap-28">
            <div className="flex flex-col gap-4 md:w-1/2 w-full h-full md:h-1/2">
                <h1 className="md:text-4xl font-bold text-2xl font-paras">
                    Stop stressing over your business website.
                </h1>
                <p className="text-secondary text-base md:text-lg">
                    Freelancers take weeks and cost a lot. DIY builders eat your time. Generic templates don&apos;t
                    convert. Let&apos;s fix that.
                </p>
                <ul className="text-secondary text-base md:text-lg list-disc pl-5 space-y-1">
                    <li>Professionally designed, conversion‑ready layouts.</li>
                    <li>Easy to customize without fighting the builder.</li>
                    <li>Responsive out of the box—desktop to mobile.</li>
                </ul>
                <span className="font-bold text-xl tracking-wide md:text-2xl font-paras">
                    Build smarter. Launch sooner.
                </span>
            </div>
            <div className="flex items-center justify-center w-full md:w-1/4">
                <Image
                    src="/assets/Icons/cursor.avif"
                    alt="Cursor Icon"
                    width={350}
                    height={350}
                    className="w-1/2 md:w-full"
                />
            </div>
        </div>
    );
};

export default WhyUs;
