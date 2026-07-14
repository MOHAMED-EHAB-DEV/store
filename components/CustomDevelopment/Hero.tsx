"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const Hero = () => {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref");
  
  const [matchScore, setMatchScore] = useState(88);
  const [matchText, setMatchText] = useState("Your project fits our specialty");
  const scoreRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (refParam === "template-download") {
      setMatchScore(95);
      setMatchText("Template user — perfect fit");
    } else if (refParam === "blog") {
      setMatchScore(90);
      setMatchText("You know our quality");
    } else {
      setMatchScore(88);
      setMatchText("Your project fits our specialty");
    }
  }, [refParam]);

  useGSAP(() => {
    // Score counter animation
    gsap.fromTo(
      scoreRef.current,
      { innerHTML: 0 },
      {
        innerHTML: matchScore,
        duration: 2,
        snap: { innerHTML: 1 },
        ease: "power2.out",
      }
    );

    // Badge entrance
    gsap.fromTo(
      badgeRef.current,
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 1, delay: 0.5, ease: "elastic.out(1, 0.5)" }
    );

    // Title stagger
    if (titleRef.current) {
      const words = titleRef.current.querySelectorAll(".word");
      gsap.fromTo(
        words,
        { opacity: 0, y: 40, rotateX: -90 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
    }
  }, [matchScore]);

  const scrollToForm = () => {
    document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-32 md:pt-40 pb-32 px-4">


      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        <div
          ref={badgeRef}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">
            <span ref={scoreRef} className="text-green-400 font-bold">
              0
            </span>
            <span className="text-green-400 font-bold">% match</span> — {matchText}
          </span>
        </div>

        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold font-paras leading-tight mb-6 [perspective:1000px]"
        >
          <span className="word inline-block origin-bottom">We</span>{" "}
          <span className="word inline-block origin-bottom">Build</span>{" "}
          <span className="word inline-block origin-bottom text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Premium
          </span>{" "}
          <span className="word inline-block origin-bottom">Web</span>{" "}
          <span className="word inline-block origin-bottom">Experiences</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl">
          Transform your brand with a custom-developed, high-performance web application tailored to your exact specifications.
        </p>

        <button
          onClick={scrollToForm}
          className="relative group transition-transform duration-300 hover:scale-105"
        >
          <div className="absolute -inset-1 rounded-full bg-[linear-gradient(to_right,#a855f7,#ec4899,#ef4444,#eab308,#3b82f6,#06b6d4)] blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
          <div className="relative px-8 py-4 bg-white text-black font-bold rounded-full text-lg">
            Start Your Project
          </div>
        </button>
      </div>
    </section>
  );
};

export default Hero;
