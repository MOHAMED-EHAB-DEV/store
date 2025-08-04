'use client';

import {Badge} from '@/components/ui/badge';
import {
    Code,
    Palette,
    Zap,
    Award,
    Users,
    Download,
    Star,
    Coffee,
    Heart,
    Sparkles,
    Rocket,
    Target
} from '@/components/ui/svgs/Icons';

const stats = [
    {label: "Templates Created", value: "10+", icon: Code},
    {label: "Happy Customers", value: "1K+", icon: Users},
    {label: "Downloads", value: "2K+", icon: Download},
    {label: "5-Star Reviews", value: "98%", icon: Star}
];

const skills = [
    {name: "React & Next.js", level: 95, color: "from-blue-500 to-cyan-500"},
    // {name: "UI/UX Design", level: 90, color: "from-purple-500 to-pink-500"},
    {name: "Tailwind CSS", level: 98, color: "from-green-500 to-teal-500"},
    {name: "Framer Motion", level: 85, color: "from-orange-500 to-red-500"},
    {name: "Figma Design", level: 92, color: "from-indigo-500 to-purple-500"},
    {name: "GSAP Animations", level: 88, color: "from-pink-500 to-rose-500"},
];

const badges = [
    {text: "Top Seller", icon: Award, gradient: "from-yellow-400 to-orange-500"},
    {text: "Design Expert", icon: Palette, gradient: "from-purple-500 to-pink-500"},
    {text: "Code Wizard", icon: Zap, gradient: "from-blue-500 to-cyan-500"},
    {text: "Innovation Leader", icon: Rocket, gradient: "from-green-500 to-teal-500"},
    {text: "Customer Favorite", icon: Heart, gradient: "from-red-500 to-pink-500"},
    {text: "Quality Focused", icon: Target, gradient: "from-indigo-500 to-purple-500"}
];

const AboutMe = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-16 flex flex-col gap-4 items-center justify-center">
            <div className="text-center mb-16">
                <Badge className="mb-4 bg-gradient-to-r from-green-500 to-teal-500 text-white border-none px-4 py-2">
                    <Sparkles className="w-4 h-4 mr-2"/>
                    About the Creator
                </Badge>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-paras">
                    Meet{' '}
                    <span
                        className="bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        Mohammed Ehab
                    </span>
                </h2>
                <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto">
                    Passionate Full Stack Web Developer creating Premium Templates that help businesses and creators build
                    stunning digital experiences.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="relative overflow-hidden rounded-3xl glass-strong p-8">
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-teal-500/20 to-cyan-500/20"></div>
                        <div className="relative z-10 flex items-center gap-6 mb-6">
                            <div
                                className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                                ME
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Mohammed Ehab</h3>
                                <p className="text-teal-400 font-medium">Full-Stack Developer</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Coffee className="w-4 h-4 text-yellow-400"/>
                                    <span className="text-gray-300 text-sm">Fueled by coffee & creativity</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-300 leading-relaxed relative z-10">
                            With over 5 years of experience in web development and design, I specialize in creating
                            modern, responsive templates that not only look amazing but also perform exceptionally.
                            My passion lies in bridging the gap between beautiful design and clean, efficient code.
                        </p>
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
                                        className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                                    <div className="relative z-10 text-center">
                                        <div
                                            className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${badge.gradient} flex items-center justify-center`}>
                                            <Icon className="w-6 h-6 text-white"/>
                                        </div>
                                        <p className="text-white text-sm font-medium">{badge.text}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative overflow-hidden rounded-2xl glass-strong p-6 w-full mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20"></div>
                        <div className="relative z-10 text-center">
                            <h4 className="text-xl font-bold text-white mb-3">Let's Build Something Amazing</h4>
                            <p className="text-gray-300 mb-4">
                                Ready to elevate your project with premium templates?
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300">
                                    Browse Templates
                                </button>
                                <button
                                    className="flex-1 border border-white/20 text-white py-3 px-6 rounded-xl hover:bg-white/10 transition-colors duration-200">
                                    Get in Touch
                                </button>
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
                                    <div
                                        className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative z-10 text-center">
                                        <Icon className="w-8 h-8 text-cyan-400 mx-auto mb-3"/>
                                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                        <div className="text-gray-300 text-sm">{stat.label}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative overflow-hidden rounded-3xl glass-strong p-8">
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Code className="w-6 h-6 text-blue-400"/>
                                Technical Skills
                            </h3>
                            <div className="space-y-4">
                                {skills.map((skill, index) => (
                                    <div key={index} className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-white font-medium">{skill.name}</span>
                                            <span className="text-gray-300 text-sm">{skill.level}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-1000 ease-out group-hover:animate-pulse`}
                                                style={{width: `${skill.level}%`}}
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