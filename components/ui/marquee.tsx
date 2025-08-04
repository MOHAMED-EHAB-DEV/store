'use client';

import {motion, useAnimationControls} from 'framer-motion';
import Image from 'next/image';
import {useEffect, useMemo} from 'react';

interface VerticalMarqueeProps {
    items: { iconPath: string; text: string }[];
    speed?: number;
    height?: string;
    className?: string;
    direction?: 'up' | 'down';
}

export default function VerticalMarquee(
    {
        items,
        speed = 20,
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
