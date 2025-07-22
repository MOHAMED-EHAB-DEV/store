import Hero from "@/components/home/Hero";
import {HeroItems} from "@/constants";
import WhyUs from "@/components/home/WhyUS";
import FramerFeatures from "@/components/home/FramerFeatures";
import CodedFeatures from "@/components/home/CodedFeatures";
import FigmaFeatures from "@/components/home/FigmaFeatures";
import Testimonials from "@/components/home/Testimonials";
import Cta from "@/components/home/CTA";

export default async function Home() {
    return (
        <div className="flex flex-col items-center justify-center gap-24">
            <div className="w-full flex flex-col items-center justify-center">
                <Hero/>
                <section className="flex flex-col md:flex-row gap-5 md:gap-10 items-center justify-center w-full">
                    {HeroItems.map(({ id, title, desc }) => (
                        <div key={id} className="flex w-full md:w-1/4 h-full flex-col gap-1 items-center justify-center text-center">
                            <h1 className="font-paras font-medium text-2xl md:text-3xl tracking-tight header">
                                {title}
                            </h1>
                            <p className="font-medium text-base text-center font-paras header text-secondary shadow-none">
                                {desc}
                            </p>
                        </div>
                    ))}
                </section>
            </div>
        {/*  Featured Templates  */}
            <WhyUs />
            <FramerFeatures />
            <CodedFeatures />
            <FigmaFeatures />
            <Testimonials />
            <Cta />
        </div>
    );
}
