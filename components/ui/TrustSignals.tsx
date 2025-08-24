'use client';

import { Shield, Users, Star, Download, Zap } from '@/components/ui/svgs/Icons';

interface TrustSignal {
    icon: React.ComponentType<any>;
    text: string;
    gradient: string;
}

const trustSignals: TrustSignal[] = [
    {
        icon: Users,
        text: "10,000+ Developers",
        gradient: "from-blue-500 to-cyan-500"
    },
    {
        icon: Star,
        text: "4.9/5 Rating",
        gradient: "from-yellow-500 to-orange-500"
    },
    {
        icon: Download,
        text: "50K+ Downloads",
        gradient: "from-green-500 to-teal-500"
    },
    {
        icon: Shield,
        text: "30-Day Guarantee",
        gradient: "from-purple-500 to-pink-500"
    },
    {
        icon: Zap,
        text: "Launch in Minutes",
        gradient: "from-orange-500 to-red-500"
    }
];

interface TrustSignalsProps {
    variant?: 'horizontal' | 'vertical' | 'grid';
    className?: string;
}

const TrustSignals: React.FC<TrustSignalsProps> = ({ 
    variant = 'horizontal', 
    className = '' 
}) => {
    const getContainerClass = () => {
        switch (variant) {
            case 'vertical':
                return 'flex flex-col gap-4';
            case 'grid':
                return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4';
            default:
                return 'flex flex-wrap justify-center gap-4 md:gap-8';
        }
    };

    return (
        <div className={`${getContainerClass()} ${className}`}>
            {trustSignals.map((signal, index) => {
                const IconComponent = signal.icon;
                return (
                    <div
                        key={index}
                        className="group flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-3 hover:bg-white/10 transition-all duration-300"
                    >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${signal.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-medium text-sm whitespace-nowrap">
                            {signal.text}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default TrustSignals;
