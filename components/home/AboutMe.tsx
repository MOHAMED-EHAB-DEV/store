"use client";

import { useRef } from "react";
import { Code2 } from "@/components/ui/svgs/icons/Code2";
import { Sparkles } from "@/components/ui/svgs/icons/Sparkles";
import { Zap } from "@/components/ui/svgs/icons/Zap";
import { Shield } from "@/components/ui/svgs/icons/Shield";
import { Rocket } from "@/components/ui/svgs/icons/Rocket";
import { Award } from "@/components/ui/svgs/icons/Award";
import { ArrowRight } from "@/components/ui/svgs/icons/ArrowRight";
import { CheckCircle } from "@/components/ui/svgs/icons/CheckCircle";
import CountUp from "../ui/CountUp";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getImageProps } from "@/lib/utils/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STATS_DATA = [
  {
    label: "Years of Production Experience",
    isCountUp: true,
    numValue: 4,
    suffix: "+",
    icon: Award,
    accent: "emerald",
  },
  {
    label: "SEO & Core Web Vitals Rating",
    isCountUp: false,
    textValue: "A+",
    icon: Sparkles,
    accent: "cyan",
  },
] as const;

const SKILLS_DATA = [
  { name: "Next.js 16 & React 19 (Server Components)", level: 99 },
  { name: "TypeScript & Scalable Architecture", level: 98 },
  { name: "Tailwind CSS v4 & Precision UI Design", level: 99 },
  { name: "Node.js, Express & Serverless APIs", level: 96 },
  { name: "GSAP Motion, Micro-Interactions & UX", level: 95 },
  { name: "Databases (MongoDB, PostgreSQL, Redis)", level: 94 },
] as const;

const SUPERPOWERS = [
  {
    title: "Clean Architecture",
    desc: "Modular, zero-bloat & scalable code",
    icon: Code2,
  },
  {
    title: "Enterprise Grade",
    desc: "100/100 Lighthouse & strict typing",
    icon: Shield,
  },
  {
    title: "Modern Stack",
    desc: "Next.js 16, React 19 & Tailwind v4",
    icon: Rocket,
  },
] as const;

const TECH_TAGS = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "GSAP",
  "MongoDB/PostgreSQL/Redis",
  "REST APIs",
  "Socket IO",
  "SEO & Core Web Vitals",
];

const AboutMe = () => {
  const containerRef = useRef<HTMLElement>(null);
  const profileCardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) return;

      ScrollTrigger.refresh();

      // Master entrance timeline triggered when section comes into view
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          once: true,
        },
      });

      // 1. Header reveal
      masterTl.fromTo(
        ".about-header",
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      );

      // 2. Main Profile Card entrance with smooth scale & 3D tilt
      masterTl.fromTo(
        ".main-profile-card",
        { y: 50, scale: 0.95, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.85, ease: "power3.out" },
        "-=0.5",
      );

      // 3. Avatar spring bounce
      masterTl.fromTo(
        ".profile-avatar",
        { scale: 0, rotation: -25, opacity: 0 },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.9,
          ease: "elastic.out(1, 0.5)",
        },
        "-=0.5",
      );

      // 4. Stagger profile details
      masterTl.fromTo(
        ".profile-stagger-item",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
        "-=0.4",
      );

      // 5. Left Column sub-cards (Badges & CTA)
      masterTl.fromTo(
        ".about-card-left",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" },
        "-=0.4",
      );

      // 6. Right Column Stats Cards
      masterTl.fromTo(
        ".about-stat-card",
        { y: 30, scale: 0.92, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.6",
      );

      // 7. Right Column Skills Card
      masterTl.fromTo(
        ".skills-card",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.4",
      );

      // 8. Skill progress bars expansion
      masterTl.fromTo(
        ".skill-bar-fill",
        { width: "0%" },
        {
          width: (i, target: HTMLElement) =>
            target.getAttribute("data-level") || "100%",
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.08,
        },
        "-=0.4",
      );

      // Continuous ambient avatar floating glow pulse
      gsap.to(".avatar-ambient-glow", {
        scale: 1.3,
        opacity: 0.8,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: containerRef },
  );

  // Interactive 3D Card Tilt on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!profileCardRef.current) return;
    const rect = profileCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(profileCardRef.current, {
      rotateY: x * 0.03,
      rotateX: -y * 0.03,
      duration: 0.4,
      ease: "power1.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    if (!profileCardRef.current) return;
    gsap.to(profileCardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.7,
      ease: "power2.out",
    });
  };

  const { imgProps } = getImageProps({
    quality: 100,
    src: "https://res.cloudinary.com/ju8d58lo/image/upload/v1786699580/WhatsApp_Image_2025-06-10_at_14.24.00_3db9c39e_nyyesf.jpg",
  });

  return (
    <section
      ref={containerRef}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20 relative overflow-hidden"
      aria-labelledby="aboutme-title"
    >
      {/* Ambient background glows with unified palette */}
      <div
        className="pointer-events-none absolute top-1/3 start-0 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-1/3 end-0 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px]"
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="text-center mb-14 md:mb-18 about-header relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono font-semibold tracking-wide text-emerald-400 mb-4 shadow-sm">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Engineering & Craftsmanship
        </div>

        <h2
          id="aboutme-title"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 font-paras tracking-tight leading-tight"
        >
          Your Dedicated{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Technical Partner
          </span>
        </h2>

        <p className="text-neutral-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Bridging sleek aesthetics with enterprise architecture. Every template
          and custom application is built for maximum speed, bulletproof
          reliability, and conversion.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
        {/* Left Column (Span 6) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Developer Profile & Philosophy Card */}
          <div
            ref={profileCardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="main-profile-card will-change-transform rounded-3xl bg-[#0e1017]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-xl hover:border-white/20 transition-colors duration-300 shadow-2xl relative overflow-hidden"
          >
            {/* Subtle top highlight */}
            <div
              className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
              aria-hidden="true"
            />

            {/* Profile Identity Bar */}
            <div className="flex items-center gap-4 sm:gap-5 mb-6 pb-6 border-b border-white/[0.08]">
              {/* Profile Avatar Image with Glowing Border */}
              <div className="relative shrink-0">
                <div
                  className="avatar-ambient-glow pointer-events-none absolute -inset-2 bg-emerald-500/20 rounded-2xl blur-lg"
                  aria-hidden="true"
                />
                <img
                  {...imgProps}
                  alt="Mohammed Ehab"
                  width={72}
                  height={72}
                  loading="lazy"
                  decoding="async"
                  className="profile-avatar will-change-transform relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                />
                <div
                  className="absolute -bottom-1 -end-1 w-5 h-5 rounded-full bg-[#0e1017] border border-white/10 flex items-center justify-center"
                  title="Verified Creator"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* Title & Status */}
              <div>
                <div className="profile-stagger-item flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold font-paras text-white tracking-tight">
                    Mohammed Ehab
                  </h3>
                </div>
                <p className="profile-stagger-item text-emerald-400 text-xs sm:text-sm font-medium mt-0.5">
                  Senior Full-Stack Architect & UI Engineer
                </p>
                <div className="profile-stagger-item inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Available for Custom Development
                </div>
              </div>
            </div>

            {/* Philosophy Text */}
            <p className="profile-stagger-item text-neutral-300 text-sm sm:text-base leading-relaxed mb-6">
              I specialize in turning slow, generic websites into
              high-performance web applications that convert. When you build
              with my templates or hire me for custom development, you receive
              senior-level code ownership and zero technical debt.
            </p>

            {/* 3 Core Pillars */}
            <div className="space-y-3 pt-2">
              <div className="profile-stagger-item flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-paras">
                    Sub-Second LCP & 100% Lighthouse
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Optimized assets, minimal bundle footprint, and zero layout
                    shift for top SEO ranking.
                  </p>
                </div>
              </div>

              <div className="profile-stagger-item flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-paras">
                    End-to-End Type Safety & Modularity
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Strict TypeScript schemas, server actions, and clean
                    component interfaces.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Superpower Badges */}
          <div className="about-card-left grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUPERPOWERS.map((power) => {
              const Icon = power.icon;
              return (
                <div
                  key={power.title}
                  className="rounded-2xl bg-[#0e1017]/80 border border-white/10 p-4 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold font-paras text-white tracking-tight mb-0.5">
                    {power.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    {power.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Custom Build CTA Banner */}
          <div className="about-card-left rounded-3xl bg-gradient-to-br from-[#12131a] via-[#101218] to-[#0e1017] border border-white/10 p-6 sm:p-7 relative overflow-hidden backdrop-blur-xl">
            <div
              className="pointer-events-none absolute top-0 end-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[70px]"
              aria-hidden="true"
            />
            <div className="relative z-10">
              <h4 className="text-lg sm:text-xl font-bold font-paras text-white mb-2">
                Need a Tailored Custom Build?
              </h4>
              <p className="text-neutral-400 text-xs sm:text-sm mb-5 leading-relaxed">
                Whether you need a template adapted to your backend or a bespoke
                full-stack app from scratch, let&apos;s build it.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/custom-development"
                  aria-label="Request custom build project"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Request Custom Build
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/support?category=general"
                  aria-label="Book a direct consultation"
                  className="inline-flex items-center justify-center text-sm font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-xl transition-all duration-300"
                >
                  Direct Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Span 6) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* 2-Stat Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STATS_DATA.map((item) => {
              const Icon = item.icon;
              const isEmerald = item.accent === "emerald";
              return (
                <div
                  key={item.label}
                  className={`about-stat-card rounded-2xl bg-[#0e1017]/90 border border-white/10 p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group shadow-xl ${
                    isEmerald
                      ? "hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]"
                      : "hover:border-cyan-500/30 hover:bg-cyan-500/[0.02]"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105 ${
                      isEmerald
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/15"
                        : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/15"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight flex items-baseline gap-0.5">
                      {item.isCountUp ? (
                        <>
                          <CountUp
                            from={0}
                            to={item.numValue}
                            direction="up"
                            duration={2}
                          />
                          <span className="text-emerald-400">
                            {item.suffix}
                          </span>
                        </>
                      ) : (
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                          {item.textValue}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1 leading-snug">
                      {item.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Technical Stack Proficiency Card */}
          <div className="skills-card rounded-3xl bg-[#0e1017]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Subtle top glow line */}
            <div
              className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
              aria-hidden="true"
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-paras text-white tracking-tight">
                    Technical Arsenal
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Production stack proficiency & mastery
                  </p>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Unified Progress Bars */}
            <div className="space-y-4">
              {SKILLS_DATA.map((skill) => (
                <div key={skill.name} className="group">
                  <div className="flex justify-between items-center mb-1.5 text-xs sm:text-sm">
                    <span className="text-neutral-200 font-medium">
                      {skill.name}
                    </span>
                    <span className="text-emerald-400 font-mono font-semibold text-xs bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CountUp
                        from={0}
                        to={skill.level}
                        direction="up"
                        duration={2}
                      />
                      %
                    </span>
                  </div>

                  <div className="w-full bg-white/[0.06] border border-white/[0.04] rounded-full h-2 overflow-hidden p-0.5">
                    <div
                      className="skill-bar-fill h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                      data-level={`${skill.level}%`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Tech Tags */}
            <div className="mt-7 pt-5 border-t border-white/[0.08]">
              <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2.5">
                Core Technologies
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TECH_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.07] text-neutral-300 text-xs font-medium hover:border-emerald-500/30 hover:text-white transition-colors duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
