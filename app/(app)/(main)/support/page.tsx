import { Metadata } from "next";
import TicketForm from "@/components/Support/TicketForm";
import Link from "next/link";
import {ThumbsUp, Clock, Chat} from "@/components/ui/svgs/Icons";

export const metadata: Metadata = {
    title: "Contact Support | My Store",
    description: "Get help with your orders, account, or any questions. Our support team is here to assist you."
};

const supportFeatures = [
    {
        Icon: Clock,
        title: "Fast Response",
        description: "Our team responds within 24 hours"
    },
    {
        Icon: ThumbsUp,
        title: "Expert Help",
        description: "Knowledgeable team ready to assist"
    },
    {
        Icon: Chat,
        title: "Track Progress",
        description: "View your tickets in your dashboard"
    }
];

const categories = [
    { name: "General Inquiry", description: "Questions about our services" },
    { name: "Billing & Payments", description: "Payment issues and refunds" },
    { name: "Technical Issue", description: "Help with technical problems" },
    { name: "Account", description: "Login, password, and profile" }
];

export default function SupportPage() {
    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="relative py-36 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        How Can We{" "}
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                            Help You?
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Our dedicated support team is here to assist you with any questions or concerns.
                        Submit a ticket and we'll get back to you as soon as possible.
                    </p>
                </div>
            </section>

            {/* Features */}
            <section className="py-12 border-y border-white/5">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {supportFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                    <feature.Icon />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 md:py-24">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Left - Info */}
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6">
                                Submit a Support Ticket
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                Fill out the form and our team will review your request.
                                You can track the status of your tickets in your{" "}
                                <Link href="/dashboard/support" className="text-purple-400 hover:text-purple-300 underline">
                                    dashboard
                                </Link>.
                            </p>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Categories We Cover</h3>
                                {categories.map((cat, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                                        <div>
                                            <p className="font-medium text-white text-sm">{cat.name}</p>
                                            <p className="text-xs text-muted-foreground">{cat.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                <h3 className="font-semibold text-white mb-2">Already have tickets?</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    View and manage your support tickets in your dashboard.
                                </p>
                                <Link href="/dashboard/support" className="btn btn-secondary text-sm">
                                    View My Tickets
                                </Link>
                            </div>
                        </div>

                        {/* Right - Form */}
                        <div className="glass rounded-2xl p-6 md:p-8">
                            <h3 className="text-xl font-bold text-white mb-6">Create New Ticket</h3>
                            <TicketForm />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
