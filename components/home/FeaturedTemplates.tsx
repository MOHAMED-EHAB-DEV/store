import {Badge} from '@/components/ui/badge';
import Link from "next/link";
import {Star} from '@/components/ui/svgs/Icons';
import Template from "@/components/shared/Template";

async function getTemplates() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL : '/'}api/template/popular?limit=4`, {
            method: "GET",
            next: {revalidate: 24 * 60 * 60}, // Revalidates in 24 hours
        });
        const data = await response.json();

        if (data?.success) {
            return data?.data;
        } else {
            return [];
        }
    } catch (err) {
        console.log(`error getting templates: ${err}`)
        return [];
    }
}

const FeaturedTemplates = async () => {
    const templates: ITemplate[] = await getTemplates();
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-16">
            {/* Section Header */}
            <div className="text-center mb-16">
                <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none px-4 py-2">
                    <Star className="w-4 h-4 mr-2"/>
                    Featured Templates
                </Badge>
                <h2 className="text-4xl header opacity-0 md:text-6xl font-bold text-white mb-6 font-paras">
                    Handpicked{' '}
                    <span
                        className="relative">
                        Premium
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-md rounded-lg"/>
                    </span>{' '}
                    Templates
                </h2>
                <p className="text-gray-300 header opacity-0 text-lg md:text-xl max-w-2xl mx-auto">
                    Discover our most popular and highest-rated templates, crafted with attention to detail and
                    optimized for performance.
                </p>
            </div>

            {/* Templates Grid */}
            {!templates || templates.length === 0 ?
                <div className="flex items-center justify-center">
                    <span className="text-secondary opacity-70 font-medium text-md text-center w-full self-center">Sorry, We couldn’t find any templates at the moment. Please check back later or Contact our Support.</span>
                </div>
                : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {templates.map((template, idx) => (
                            <Template template={template} idx={idx} key={template._id}/>
                        ))}
                    </div>
                )
            }

            {/* View All Button */}
            <div className="text-center mt-12">
                <Link href="/templates"
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                    View All Templates
                </Link>
            </div>
        </div>
    );
};

export default FeaturedTemplates;