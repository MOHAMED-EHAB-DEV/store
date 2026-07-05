"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ChevronRight } from "@/components/ui/svgs/icons/ChevronRight";
import { Grid } from "@/components/ui/svgs/icons/Grid";
import { getCategoryIcon } from "@/components/ui/svgs/CategoriesIcons";
import { ICategory } from "@/types";

interface CategoriesCarouselProps {
  categories: ICategory[];
}

export default function CategoriesCarousel({
  categories,
}: CategoriesCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (!categories || categories.length === 0) return null;

  return (
    <div className="relative max-w-[1400px] mx-auto w-full">
      {/* Navigation Buttons (hidden on mobile) */}
      <button
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
        className={`absolute start-4 sm:start-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-card/80 backdrop-blur-md border border-border/50 text-white shadow-xl transition-all duration-300 hover:bg-card hover:border-accent hover:scale-110 disabled:opacity-0 disabled:pointer-events-none`}
        aria-label="Previous categories"
      >
        <ChevronRight className="w-6 h-6 rotate-180" />
      </button>

      <button
        onClick={scrollNext}
        disabled={nextBtnDisabled}
        className={`absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-card/80 backdrop-blur-md border border-border/50 text-white shadow-xl transition-all duration-300 hover:bg-card hover:border-accent hover:scale-110 disabled:opacity-0 disabled:pointer-events-none`}
        aria-label="Next categories"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Embla Viewport */}
      <div
        className="overflow-hidden px-4 sm:px-8 md:px-16 py-8"
        ref={emblaRef}
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        }}
      >
        <div className="flex gap-4 md:gap-6 touch-pan-y">
          {categories.map((category) => {
            const Icon = category.Icon || getCategoryIcon(category.slug);
            return (
              <div
                key={category._id}
                className="flex-[0_0_auto] w-[240px] sm:w-[260px]"
              >
                <Link
                  href={`/templates/category/${category.slug}`}
                  className="group relative flex flex-col h-[280px] p-6 rounded-3xl bg-card/40 backdrop-blur-md border border-border/50 overflow-hidden transition-all duration-500 hover:bg-card/60 hover:border-accent/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:hover:shadow-none"
                >
                  {/* Bottom gradient bar that appears on hover */}
                  {/* <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-linear-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" /> */}

                  {/* Large Background Icon */}
                  <div className="absolute -rotate-12 top-4/7 -end-14 w-44 h-44 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 pointer-events-none select-none text-white">
                    <Icon className="w-full h-full drop-shadow-2xl" />
                  </div>

                {/* Top Bar: Permanent Icon + Template Count */}
                <div className="relative z-10 flex items-start justify-between w-full mb-auto">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white/70 group-hover:text-accent group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors duration-300 shadow-inner">
                    <Grid className="w-6 h-6" />
                  </div>

                  <div className="flex items-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
                    <span className="text-xs font-semibold tracking-wide text-white/90">
                      {category.templateCount}{" "}
                      {category.templateCount === 1 ? "Template" : "Templates"}
                    </span>
                  </div>
                </div>

                {/* Bottom Content: Name & CTA */}
                <div className="relative z-10 w-full mt-4 flex flex-col items-start text-left">
                  <h3 className="text-2xl font-bold text-white mb-2 leading-tight tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">
                    {category.name}
                  </h3>

                  <div className="flex items-center text-sm font-medium text-accent opacity-0 -translate-x-1/2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-75">
                    Browse
                    <svg
                      className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
