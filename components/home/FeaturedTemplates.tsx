'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, ExternalLink, Code, Palette, Zap, Heart } from '@/components/ui/svgs/Icons';

const templates = [
    {
        id: 1,
        title: "SaaS Landing Pro",
        description: "Modern SaaS landing page with conversion-optimized design",
        category: "SaaS",
        price: "$49",
        rating: 4.9,
        reviews: 127,
        image: "/assets/images/template-1.jpg",
        tags: ["React", "Next.js", "Tailwind"],
        gradient: "from-blue-500 via-purple-500 to-pink-500",
        featured: true
    },
    {
        id: 2,
        title: "E-commerce Elite",
        description: "Complete e-commerce solution with modern design",
        category: "E-commerce",
        price: "$79",
        rating: 4.8,
        reviews: 89,
        image: "/assets/images/template-2.jpg",
        tags: ["React", "Stripe", "Framer"],
        gradient: "from-green-500 via-teal-500 to-blue-500",
        featured: false
    },
    {
        id: 3,
        title: "Portfolio Masterpiece",
        description: "Stunning portfolio template for creatives",
        category: "Portfolio",
        price: "$39",
        rating: 5.0,
        reviews: 203,
        image: "/assets/images/template-3.jpg",
        tags: ["Figma", "Framer", "GSAP"],
        gradient: "from-orange-500 via-red-500 to-pink-500",
        featured: true
    },
    {
        id: 4,
        title: "Agency Powerhouse",
        description: "Professional agency website with stunning animations",
        category: "Agency",
        price: "$69",
        rating: 4.7,
        reviews: 156,
        image: "/assets/images/template-4.jpg",
        tags: ["Next.js", "GSAP", "Tailwind"],
        gradient: "from-purple-500 via-indigo-500 to-blue-500",
        featured: false
    }
];

const categories = ["All", "SaaS", "E-commerce", "Portfolio", "Agency"];

const FeaturedTemplates = () => {
    const [activeCategory, setActiveCategory] = useState("All");
    const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null);

    const filteredTemplates = activeCategory === "All" 
        ? templates 
        : templates.filter(template => template.category === activeCategory);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-16">
            {/* Section Header */}
            <div className="text-center mb-16">
                <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none px-4 py-2">
                    <Star className="w-4 h-4 mr-2" />
                    Featured Templates
                </Badge>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-paras">
                    Handpicked{' '}
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                        Premium
                    </span>{' '}
                    Templates
                </h2>
                <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
                    Discover our most popular and highest-rated templates, crafted with attention to detail and optimized for performance.
                </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                            activeCategory === category
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {filteredTemplates.map((template) => (
                    <div
                        key={template.id}
                        className="group relative overflow-hidden rounded-3xl glass-strong hover:bg-white/15 transition-all duration-500 transform hover:scale-[1.02]"
                        onMouseEnter={() => setHoveredTemplate(template.id)}
                        onMouseLeave={() => setHoveredTemplate(null)}
                    >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
                        
                        {/* Featured Badge */}
                        {template.featured && (
                            <div className="absolute top-4 left-4 z-10">
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-none">
                                    <Heart className="w-3 h-3 mr-1" />
                                    Featured
                                </Badge>
                            </div>
                        )}

                        {/* Template Image Placeholder */}
                        <div className="relative h-64 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-30`}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-6xl text-white/20">
                                    {template.category === 'SaaS' && <Zap />}
                                    {template.category === 'E-commerce' && <ExternalLink />}
                                    {template.category === 'Portfolio' && <Palette />}
                                    {template.category === 'Agency' && <Code />}
                                </div>
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
                                hoveredTemplate === template.id ? 'opacity-100' : 'opacity-0'
                            }`}>
                                <button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    Preview
                                </button>
                            </div>
                        </div>

                        {/* Template Info */}
                        <div className="p-6 relative z-10">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{template.title}</h3>
                                    <p className="text-gray-300 text-sm">{template.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">{template.price}</div>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                                i < Math.floor(template.rating)
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-600'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-white font-medium">{template.rating}</span>
                                <span className="text-gray-400 text-sm">({template.reviews} reviews)</span>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {template.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="bg-white/10 text-gray-300 border-white/20">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                                    Buy Now
                                </button>
                                <button aria-label="Live Demo" className="px-4 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors duration-200">
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
                <button className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                    View All Templates
                </button>
            </div>
        </div>
    );
};

export default FeaturedTemplates;