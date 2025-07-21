import Hero from "@/components/Hero";
import {HeroItems} from "@/constants";
import WhyUs from "@/components/WhyUS";
import FramerFeatures from "@/components/FramerFeatures";
import CodedFeatures from "@/components/CodedFeatures";
import FigmaFeatures from "@/components/FigmaFeatures";
import Testimonials from "@/components/Testimonials";

export default async function Home() {
    return (
        <>
            <Hero/>
            <section className="flex flex-col md:flex-row gap-5 md:gap-10 items-center justify-center w-full mt-16">
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
        {/*  Featured Templates  */}
            <WhyUs />
            <FramerFeatures />
            <CodedFeatures />
            <FigmaFeatures />
            <Testimonials />
        </>
    );
}
