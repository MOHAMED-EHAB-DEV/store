"use client";

import PageHeader from "@/components/Dashboard/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Globe } from "@/components/ui/svgs/icons/Globe";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { Navigation } from "@/components/ui/svgs/icons/Navigation";
import { History } from "@/components/ui/svgs/icons/History";
import { MousePointer2 } from "@/components/ui/svgs/icons/MousePointer2";

interface Visitor {
    _id: string;
    visitorId: string;
    firstVisit: string;
    lastVisit: string;
    userAgent?: string;
    ipHash?: string;
    pathHistory: {
        path: string;
        timestamp: string;
    }[];
    visitCount: number;
}

interface AdminVisitorDetailsClientProps {
    visitor: Visitor;
}

export default function AdminVisitorDetailsClient({
    visitor,
}: AdminVisitorDetailsClientProps) {
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title={`Visitor: ${visitor.visitorId.substring(0, 8)}...`}
                description="Analyze visitor behavior and path history"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Analytics", href: "/admin/analytics" },
                    { label: "Visitor Details" },
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats & Overview */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Globe className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Visitor Overview</h3>
                                <p className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">{visitor.visitorId}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Total Visits</span>
                                <span className="text-lg font-black text-blue-400">{visitor.visitCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">First Seen</span>
                                <span className="text-xs text-gray-300">{new Date(visitor.firstVisit).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Last Activity</span>
                                <span className="text-xs text-gray-300">{new Date(visitor.lastVisit).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="pt-2">
                             <p className="text-[10px] text-gray-500 uppercase mb-2 font-bold tracking-widest">Device / Browser</p>
                             <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-[10px] font-mono text-gray-400 leading-relaxed italic">
                                {visitor.userAgent || 'Unknown User Agent'}
                             </div>
                        </div>
                    </div>
                </div>

                {/* Journey / Path History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <History className="w-5 h-5 text-purple-400" />
                            <h3 className="text-xl font-bold text-white tracking-tight">User Journey</h3>
                            <Badge variant="outline" className="ml-auto bg-purple-500/10 text-purple-400 border-purple-500/20">
                                {visitor.pathHistory.length} Steps
                            </Badge>
                        </div>

                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-purple-500/50 before:via-blue-500/20 before:to-transparent">
                            {visitor.pathHistory.slice().reverse().map((item, index) => (
                                <div key={index} className="relative flex items-center justify-between gap-6 pl-12 group">
                                    <div className="absolute left-0 grid place-content-center w-10 h-10 rounded-full border-4 border-[#0a0a0a] bg-gray-900 group-hover:scale-110 transition-transform duration-300">
                                        {index === 0 ? (
                                            <MousePointer2 className="w-4 h-4 text-purple-400" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-gray-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.07] transition-all cursor-default group-hover:border-white/10">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                                                {item.path === '/' ? 'Home Page' : item.path.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || item.path}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono uppercase tracking-tighter">
                                                <Clock className="w-3 h-3" />
                                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground tracking-tighter font-mono">{item.path}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
