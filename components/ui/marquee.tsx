'use client';

import {motion, useAnimationControls} from 'framer-motion';
import Image from 'next/image';
import {useEffect, useMemo, useRef} from 'react';
import {Star} from "@/components/ui/svgs/Icons";
import {cn} from "@/lib/utils";

interface VerticalMarqueeProps {
    items: { iconPath: string; text: string }[];
    speed?: number;
    height?: string;
    className?: string;
    direction?: 'up' | 'down';
}

export function VerticalMarquee(
    {
        items,
        speed = 0.5,
        height = 'h-32 md:h-40',
        className = '',
        direction = 'up',
    }: VerticalMarqueeProps) {
    const marqueeItems = useMemo(() => [...items, ...items], [items]);
    const controls = useAnimationControls();

    const startAnimation = () => {
        controls.start({
            y: direction === 'up' ? ['0%', '-50%'] : ['-50%', '0%'],
            transition: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: speed,
                ease: 'linear',
            },
        });
    };

    useEffect(() => {
        startAnimation();
    }, [direction, speed]);

    return (
        <div
            className={`relative w-full overflow-hidden ${height} ${className}`}
            onMouseEnter={() => controls.stop()}
            onMouseLeave={() => startAnimation()}
            style={{
                WebkitMaskImage: "linear-gradient(rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 25%, rgb(0, 0, 0) 75%, rgba(0, 0, 0, 0) 100%)"
            }}
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-dark to-transparent"/>
            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-dark to-transparent"/>

            <motion.div
                className="flex flex-col gap-4 py-2 will-change-transform"
                animate={controls}
            >
                {marqueeItems.map(({iconPath, text}, i) => (
                    <span key={i} className="flex items-center w-full shrink-0">
                        <Image
                            src={iconPath}
                            alt=""
                            className="xl:size-12 md:size-10 size-7 md:p-2 p-1 rounded-full bg-white-50"
                            width={28}
                            height={28}
                        />
                        <span
                            className="whitespace-nowrap w-full bg-primary px-3 py-2 rounded-full font-medium text-sm">
                          {text}
                        </span>
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

interface HorizontialMarqueeProps {
    items: { avatar: string; name: string; text: string; rating: Number; }[];
    speed?: number;
    height?: string;
    className?: string;
    direction?: 'left' | 'right';
}

export function HorizontialMarquee(
    {
        items,
        speed = 20,
        height = "h-32 md:h-40",
        className = "",
        direction = "right",
    }: HorizontialMarqueeProps) {
    const animationClasses = direction === "left" ? "animate-left-infinite-scroll" : "animate-right-infinite-scroll";
    return (
        <div
            className={cn("w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_32px,_black_calc(100%-32px),transparent_100%)] md:[mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]", className)}>
            <div className={cn(animationClasses, `flex items-center gap-4 justify-center md:justify-start`)}>
                {[...items, ...items, ...items, ...items, ...items, ...items, ...items, ...items].map((testimonial, i) => (
                    <div
                        key={i}
                        className="testimonial-card flex flex-col justify-center items-center gap-5 w-80 h-58 glass p-6 rounded-2xl transition-all duration-500"
                    >
                        <div className="flex gap-4 justify-center items-center">
                            <div className="flex gap-2 justify-center items-center">
                                <div
                                    className="w16 relative  bg-gradient-to-r from-gold to-yellow-400 rounded-full flex items-center justify-center text-black font-bold mr-4"
                                >
                                    <Image
                                        src={testimonial.avatar}
                                        alt="Testimonials"
                                        width={58}
                                        height={58}
                                    />
                                </div>
                                <div className="font-semibold text-sm text-white">
                                    {testimonial.name}
                                </div>
                            </div>
                            <div>
                                {/*<div className="text-gray-400 text-sm">*/}
                                {/*    {testimonial.role}*/}
                                {/*</div>*/}
                            </div>
                            <div className="ml-auto flex text-gold">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current"/>
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-300">{testimonial.text}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}