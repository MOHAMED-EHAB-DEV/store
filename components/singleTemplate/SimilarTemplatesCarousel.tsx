"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import SimilarTemplate from "@/components/shared/Template";
import { ITemplate } from "@/lib/validations/template";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeft";
import { ChevronRight } from "@/components/ui/svgs/icons/ChevronRight";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";

interface SimilarTemplatesCarouselProps {
  similarTemplates: ITemplate[];
}

export default function SimilarTemplatesCarousel({
  similarTemplates,
}: SimilarTemplatesCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!similarTemplates || similarTemplates.length === 0) return null;

  return (
    <section
      aria-labelledby="similar-templates-heading"
      className="flex flex-col gap-6 w-screen relative left-1/2 -translate-x-1/2 px-4 sm:px-6 lg:px-12 mt-8 overflow-hidden"
    >
      {/* Header aligned with page max width */}
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        <div>
          <h2
            id="similar-templates-heading"
            className="text-2xl sm:text-3xl font-bold font-paras text-white"
          >
            You Might Also Like
          </h2>
          <p className="text-gray-400 text-sm">
            Hand-crafted templates from matching categories and tech stacks.
          </p>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            aria-label="Previous template slide"
            className="size-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            aria-label="Next template slide"
            className="size-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Full-Width Fluid dragFree Carousel without shadow overlay */}
      <div className="w-full">
        <div className="overflow-hidden w-full max-w-7xl mx-auto" ref={emblaRef}>
          <div className="flex gap-6 touch-pan-y select-none py-1">
            {similarTemplates.map((temp) => (
              <div
                key={temp._id}
                className="flex-[0_0_85%] sm:flex-[0_0_46%] lg:flex-[0_0_32%] min-w-0"
              >
                <SimilarTemplate template={temp} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      {scrollSnaps.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-2">
          {scrollSnaps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`size-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === selectedIndex
                  ? "bg-purple-400 w-6"
                  : "bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Browse All Link */}
      <div className="flex justify-center pt-2">
        <Link
          href="/templates"
          aria-label="Browse all available templates"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-white text-sm font-semibold hover:border-white/30 transition-all duration-300"
        >
          <span>Explore All Templates</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
