'use client';

import { useEffect } from "react";
import {Code2} from "@/components/ui/svgs/Icons";
import SplitText from "../ui/SplitText";
import { codeFeatures } from "@/constants";

const CodedFeatures = () => {
    useEffect(() => {
        (async () => {
            const mod = await import("gsap");
            const { ScrollTrigger } = await import("gsap/ScrollTrigger");
            const { TextPlugin } = await import("gsap/TextPlugin");

            const gsap = mod.gsap || mod.default;
            gsap.registerPlugin(ScrollTrigger, TextPlugin);

            ScrollTrigger.create({
                trigger: ".code-section",
                start: "top bottom",
                end: "bottom 50%",
                onEnter: () => {
                    const codeTl = gsap.timeline();

                    const codeChars = document.querySelectorAll(".code-title .char");
                    codeTl.fromTo(
                        codeChars,
                        { opacity: 0, y: 100, rotationX: -90 },
                        {
                            duration: 0.8,
                            y: 0,
                            opacity: 1,
                            rotationX: 0,
                            stagger: 0.02,
                            ease: "power3.out",
                        }
                    );

                    codeTl.fromTo(
                        ".code-feature",
                        { opacity: 0, y: 50 },
                        {
                            duration: 1,
                            y: 0,
                            opacity: 1,
                            stagger: 0.1,
                            ease: "power2.out",
                        },
                        "-=0.3"
                    );

                    codeTl.fromTo(
                        ".code-preview",
                        { opacity: 0, y: 100 },
                        {
                            duration: 1.2,
                            y: 0,
                            opacity: 1,
                            ease: "power3.out",
                        },
                        "-=0.5"
                    );
                },
            });
        })();
    }, []);

    return (
        <section className="code-section relative z-10 px-6 py-32">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="code-title text-5xl md:text-6xl font-bold text-white mb-8 font-paras">
                        {SplitText("Production-Ready Code")}
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Skip the boilerplate and start building. Our code templates are
                        crafted by senior developers with modern frameworks, best
                        practices, and enterprise-grade architecture.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {codeFeatures.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <div
                                key={f.title}
                                className="code-feature group relative text-center rounded-xl p-px bg-glass backdrop-blur-sm hover:backdrop-blur-md transition-all duration-500"
                            >
                                <div
                                    className="h-full w-full rounded-xl bg-neutral-900/60 group-hover:bg-neutral-900/70 border border-white/10 px-5 py-8 flex flex-col shadow-[0_0_0_0_rgba(255,255,255,0)] group-hover:shadow-[0_0_32px_-8px_rgba(0,255,180,0.35)] transition-all">
                                    <div
                                        className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-linear-to-r from-emerald-400 to-teal-500 flex items-center justify-center ring-4 ring-emerald-400/20 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500">
                                        <Icon className="w-8 h-8 text-white" aria-hidden="true"/>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-3 tracking-tight">
                                        {f.title}
                                    </h3>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {f.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div
                    className="code-preview bg-white/10 border relative border-white/20 backdrop-blur-lg p-8 rounded-3xl max-w-4xl mx-auto"
                >
                    <div className="bg-gray-900 rounded-2xl p-6 font-mono text-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            </div>
                            <div className="text-xs uppercase tracking-wider text-gray-400">
                                Next.js • TypeScript
                            </div>
                        </div>
                        <div className="space-y-2 text-gray-300">
                            <div>
                                <span className="text-blue-400">import</span>{" "}
                                <span className="text-yellow-400">React</span>{" "}
                                <span className="text-blue-400">from</span>{" "}
                                <span className="text-green-400">'react'</span>
                            </div>
                            <div>
                                <span className="text-blue-400">import</span>{" "}
                                <span className="text-yellow-400">{`{ Button }`}</span>{" "}
                                <span className="text-blue-400">from</span>{" "}
                                <span className="text-green-400">'@/components'</span>
                            </div>
                            <div className="mt-4"></div>
                            <div>
                  <span className="text-purple-400">
                    export default function
                  </span>{" "}
                                <span className="text-yellow-400">Dashboard</span>() {`{`}
                            </div>
                            <div className="pl-4">
                                <span className="text-blue-400">return</span> (
                            </div>
                            <div className="pl-8">
                                &lt;<span className="text-red-400">div</span>{" "}
                                <span className="text-blue-400">className</span>=
                                <span className="text-green-400">"dashboard"</span>&gt;
                            </div>
                            <div className="pl-12">
                                &lt;<span className="text-red-400">Button</span>{" "}
                                <span className="text-blue-400">variant</span>=
                                <span className="text-green-400">"primary"</span>&gt;
                            </div>
                            <div className="pl-16">Get Started</div>
                            <div className="pl-12">
                                &lt;/<span className="text-red-400">Button</span>&gt;
                            </div>
                            <div className="pl-8">
                                &lt;/<span className="text-red-400">div</span>&gt;
                            </div>
                            <div className="pl-4">)</div>
                            <div>{`}`}</div>
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <a
                            href="/templates"
                            className="group relative inline-flex items-center justify-center bg-linear-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-400 hover:via-pink-400 hover:to-cyan-400 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
                            aria-label="Browse code templates"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Code2 className="w-5 h-5"/>
                                Browse Code Templates
                            </span>
                            <div className="absolute inset-0 bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default CodedFeatures
