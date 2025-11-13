import { Badge } from '@/components/ui/badge';
import Link from "next/link";
import { Star } from '@/components/ui/svgs/Icons';
import Template from "@/components/shared/Template";
import TemplateSkeleton from "@/components/ui/TemplateSkeleton";
import { Suspense } from "react";
import { ITemplate } from '@/types';

async function getTemplates() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL : '/'}/api/template/featured`, {
            method: "GET",
            next: { revalidate: 24 * 60 * 60 }, // Revalidates in 24 hours
        });
        const data = await response.json();

        if (data?.success) {
            return data.data;
        } else {
            return [];
        }
    } catch (err) {
        // console.log(`error getting templates: ${err}`)
        return [];
    }
}

const FeaturedTemplates = async () => {
    const templates: ITemplate[] = await getTemplates();
    return (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24 relative">
            {/* Section Background */}
            <div className="absolute inset-0 bg-linear-to-br from-card/30 via-transparent to-card/20 rounded-3xl" />
            <div className="relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <Badge className="mb-6 bg-linear-to-r from-purple-500 to-pink-500 text-white border-none px-6 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                        <Star className="w-5 h-5 mr-2 animate-pulse" />
                        Featured Templates
                    </Badge>
                    <h2 className="header opacity-0 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-high-contrast mb-8 font-paras leading-none tracking-tight">
                        Handpicked{' '}
                        <span
                            className="relative">
                            Premium
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -inset-1 bg-linear-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-md rounded-lg" />
                        </span>{' '}
                        Templates
                    </h2>
                    <p className="text-medium-contrast header opacity-0 text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
                        Discover our most popular and highest-rated templates, crafted with attention to detail and
                        optimized for performance.
                    </p>
                </div>

                {/* Templates Grid */}
                <Suspense fallback={
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 lg:gap-12">
                        {[...Array(4)].map((_, idx) => (
                            <TemplateSkeleton key={idx} />
                        ))}
                    </div>
                }>
                    {!templates || templates.length === 0 ?
                        <div className="flex items-center justify-center">
                            <span className="text-secondary opacity-70 font-medium text-md text-center w-full self-center">Sorry, We couldn't find any templates at the moment. Please check back later or Contact our Support.</span>
                        </div>
                        : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 lg:gap-12">
                                {templates.map((template, idx) => (
                                    <Template template={template} key={template._id} />
                                ))}
                            </div>
                        )
                    }
                </Suspense>

                {/* View All Button */}
                <div className="text-center mt-16">
                    <Link href="/templates"
                        className="group relative inline-flex items-center justify-center bg-linear-to-r from-purple-500 via-pink-500 to-cyan-500 text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                        <span className="relative z-10">View All Templates</span>
                        <div className="absolute inset-0 bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedTemplates;
