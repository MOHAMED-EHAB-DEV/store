import Hero from "@/components/home/Hero";
import {HeroItems} from "@/constants";
import WhyUs from "@/components/home/WhyUS";
import FeaturedTemplates from "@/components/home/FeaturedTemplates";
import AboutMe from "@/components/home/AboutMe";
import FramerFeatures from "@/components/home/FramerFeatures";
import CodedFeatures from "@/components/home/CodedFeatures";
import FigmaFeatures from "@/components/home/FigmaFeatures";
import Testimonials from "@/components/home/Testimonials";
import Cta from "@/components/home/CTA";

export default async function Home() {
    return (
        <main className="flex flex-col items-center justify-center gap-24" role="main">
            <div className="w-full flex flex-col items-center justify-center">
                <Hero/>
                <section 
                    className="flex flex-col md:flex-row gap-5 md:gap-10 items-center justify-center w-full mt-0 md:mt-12"
                    aria-label="Key features overview"
                >
                    {HeroItems.map(({ id, title, desc }) => (
                        <article 
                            key={id} 
                            className="flex w-full md:w-1/4 h-full flex-col gap-1 items-center justify-center text-center"
                        >
                            <h2 className="font-paras font-medium text-2xl md:text-3xl tracking-tight header">
                                {title}
                            </h2>
                            <p className="font-medium text-base text-center font-paras header text-secondary shadow-none">
                                {desc}
                            </p>
                        </article>
                    ))}
                </section>
            </div>

            <FeaturedTemplates />
            <WhyUs />
            <FramerFeatures />
            <CodedFeatures />
            <FigmaFeatures />
            <AboutMe />
            <Testimonials />
            <Cta />
        </main>
    );
}
