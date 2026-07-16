"use client";

import { Badge } from "@/components/ui/badge";
import { Code } from "@/components/ui/svgs/icons/Code";
import { Coffee } from "@/components/ui/svgs/icons/Coffee";
import { Sparkles } from "@/components/ui/svgs/icons/Sparkles";
import CountUp from "../ui/CountUp";
import Link from "next/link";
import { stats, skills, badges } from "@/constants";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { IconRenderer } from '@/components/ui/svgs/IconRenderer';

const AboutMe = () => {
  useGSAP(() => {
    // Animate header
    gsap.from(".about-header", {
      scrollTrigger: {
        trigger: ".about-header",
        start: "top 65%",
        toggleActions: "play none none none",
      },
      y: 40,
      opacity: 0,
      duration: 1.5,
      ease: "power3.out",
    });

    // Animate all cards
    gsap.from(".about-card", {
      scrollTrigger: {
        trigger: ".about-card",
        start: "top 75%",
        toggleActions: "play none none none",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power2.out",
    });
  }, []);
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4 items-center justify-center">
      <div className="text-center mb-16 about-header">
        <Badge className="mb-4 transition-shadow duration-400 hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] bg-linear-to-r from-green-500 to-teal-500 text-white border-none px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          Proof of Skill
        </Badge>
        <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white mb-6 font-paras">
          Your{" "}
          <span className="bg-linear-to-r from-green-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Technical Partner
          </span>
        </h2>
        <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
          I don&apos;t just build templates—I build high-performance web applications that convert. When you hire me for a custom build, you get engineering excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-3xl glass-strong p-8 about-card">
            <div className="absolute inset-0 bg-linear-to-br from-green-500/20 via-teal-500/20 to-cyan-500/20"></div>
            <div className="relative z-10 flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                ME
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Mohammed Ehab</h3>
                <p className="text-teal-400 font-medium">
                  Full-Stack Developer • Performance Obsessed
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Coffee className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300 text-sm">
                    Fueled by coffee & creativity
                  </span>
                </div>
              </div>
            </div>

            <div className="text-gray-300 leading-relaxed relative z-10 space-y-4">
              <p>
                Instead of guessing what works, let my results speak for themselves. I specialize in turning slow, bloated websites into lightning-fast, high-converting platforms.
              </p>
              {/* <ul className="space-y-3 mt-4 text-white font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">🚀</span> 
                  <span> LCP 4.1s → 1.3s for SaaS client</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">📈</span> 
                  <span> Increased conversion by 42% for e-commerce client</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400">⚡</span> 
                  <span> Perfect 100/100 Lighthouse score on complex dashboard</span>
                </li>
              </ul> */}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl glass-strong p-4 hover:scale-105 transition-all duration-300"
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${badge.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                  ></div>
                  <div className="relative z-10 text-center">
                    <div
                      className={`w-12 h-12 mx-auto mb-2 rounded-full bg-linear-to-br ${badge.gradient} flex items-center justify-center`}
                    >
                      <IconRenderer name={Icon as string} className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white text-sm font-medium">
                      {badge.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="about-card relative overflow-hidden rounded-2xl glass-strong p-6 w-full mx-auto">
            <div className="absolute inset-0 bg-linear-to-br from-green-500/20 to-teal-500/20"></div>
            <div className="relative z-10 text-center">
              <h4 className="text-xl font-bold text-white mb-3">
                Need a Custom Build?
              </h4>
              <p className="text-gray-300 mb-4">
                Let&apos;s discuss your project requirements and how I can help.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/support?category=general"
                  className="flex-1 bg-linear-to-r from-green-500 to-teal-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                >
                  Book a Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl glass-strong p-6 group hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 text-center">
                    <IconRenderer name={Icon as string} className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                    {/* <div className="text-3xl font-bold text-white mb-1">{stat.value}</div> */}
                    <div className="text-3xl flex justify-center items-center gap-[0.5px] font-bold text-white mb-1">
                      <CountUp
                        from={0}
                        to={parseInt(
                          stat.value.replace(/\D/g, "").replace("K", "000"),
                        )}
                        direction="up"
                        duration={2}
                      />
                      {stat.value.includes("%") && "%"}
                      {stat.value.includes("K") && "K"}
                      {stat.value.includes("+") && "+"}
                    </div>
                    <div className="text-gray-300 text-sm">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="about-card relative overflow-hidden rounded-3xl glass-strong p-8">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Code className="w-6 h-6 text-blue-400" />
                Technical Skills
              </h3>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={index} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">
                        {skill.name}
                      </span>
                      <span className="text-gray-300 text-sm">
                        <CountUp
                          from={0}
                          to={skill.level}
                          direction="up"
                          duration={2}
                        />
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-linear-to-r ${skill.color} rounded-full transition-all duration-1000 ease-out group-hover:animate-pulse`}
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
