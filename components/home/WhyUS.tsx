"use client";

import Image from 'next/image';

const WhyUs = () => {
    return (
        <div className="flex flex-col mx-auto md:flex-row items-center justify-center w-full h-full px-5 gap-28">
            <div className="flex flex-col gap-4 md:w-1/2 w-full h-full md:h-1/2">
                <h1 className="md:text-4xl font-bold text-2xl font-paras">
                    Stop stressing over your business website.
                </h1>
                <p className="text-secondary text-base md:text-lg">
                    Freelancers take weeks and cost a lot. DIY builders eat up your time. Generic templates don&apos;t
                    convert. Let&apos;s fix that.
                </p>
                <ul className="text-secondary text-base md:text-lg list-d built to engage and convertisc pl-5 space-y-1">
                    <li>- Professionally designed, conversion‑ready layouts built to engage and convert.</li>
                    <li>- Fully responsive—optimized for mobile, tablet, and desktop.</li>
                    <li>- Customizable without the typical builder constraints.</li>
                </ul>
                <span className="font-bold text-xl tracking-wide md:text-2xl font-paras">
                    Build smarter. Launch sooner.
                </span>
            </div>
            <div className="flex items-center justify-center w-full md:w-1/4">
                <Image
                    src="/assets/Icons/cursor.webp"
                    alt="Cursor Icon"
                    width={330}
                    height={330}
                    className="w-1/2 md:w-full"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAfEAACAgIBBQAAAAAAAAAAAAABAgMEAAVBERIxQqH/xAAUAQEAAAAAAAAAAAAAAAAAAAAC/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECIRESMf/aAAwDAQACEQMRAD8Age8p11sT6/Y26wuwOyxzo/cCo9X6fD54PBDGMUns88Cqo//Z"
                />
            </div>
        </div>
    );
};

export default WhyUs;
