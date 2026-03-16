import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { PageLoader } from '../components/ui/Loader';
import { RefreshCw, Activity, Clock, Database, Radio, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

export function LiveFeedPage() {
    const [filter, setFilter] = useState('All');

    const { data: status, refetch: refetchStatus } = useQuery({
        queryKey: ['live-feed-status'],
        queryFn: () => api.getLiveFeedStatus(),
        refetchInterval: 30000
    });

    const { data: feed, isLoading, refetch: refetchFeed } = useQuery({
        queryKey: ['live-feed'],
        queryFn: () => api.getLiveFeed(50),
        refetchInterval: 15000
    });

    const filteredFeed = feed?.filter((item: any) => 
        filter === 'All' || item.network === filter
    );

    const isNew = (timeStr: string) => {
        const time = new Date(timeStr);
        const now = new Date();
        return (now.getTime() - time.getTime()) < 3600000; // < 1 hour
    };

    const amsStatus = status?.sources.find((s: any) => s.name === 'AMS')?.status === 'online';

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-8 pb-32">
            
            {/* Pulsing Status Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-4 h-4 rounded-full bg-emerald-500" />
                        <div className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-primary tracking-tight">Operations Console</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-mono text-emerald-500/80 uppercase tracking-widest">Live Sync Active</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 md:gap-8 bg-surface/30 border border-subtle p-4 rounded-2xl backdrop-blur-md">
                   <div className="flex flex-col">
                       <span className="text-[9px] font-mono text-secondary uppercase mb-1 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Last Poll</span>
                       <span className="text-xs font-mono text-primary">{new Date().toLocaleTimeString([], { hour12: false })}</span>
                   </div>
                   <div className="flex flex-col">
                       <span className="text-[9px] font-mono text-secondary uppercase mb-1 flex items-center gap-1">
                           <Radio className="w-2.5 h-2.5" /> AMS Status
                       </span>
                       <span className={cn("text-xs font-mono font-bold flex items-center gap-1", amsStatus ? "text-emerald-400" : "text-rose-400")}>
                           {amsStatus ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                           {amsStatus ? 'ONLINE' : 'OFFLINE'}
                       </span>
                   </div>
                   <div className="flex flex-col">
                       <span className="text-[9px] font-mono text-secondary uppercase mb-1 flex items-center gap-1"><Database className="w-2.5 h-2.5" /> 24h Count</span>
                       <span className="text-xs font-mono text-accent-primary font-bold">{status?.total_24h || '--'}</span>
                   </div>
                </div>
            </header>

            {/* Ingestion Stream Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-mono text-secondary uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-accent-primary" /> Ingestion Stream
                    </h2>
                    
                    {/* Filter Tabs */}
                    <div className="flex gap-1 bg-surface p-1 rounded-lg border border-subtle">
                        {['All', 'GMN', 'NASA', 'AMS'].map((net) => (
                            <button
                                key={net}
                                onClick={() => setFilter(net)}
                                className={cn(
                                    "px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-all",
                                    filter === net ? "bg-accent-primary text-void shadow-lg" : "text-secondary hover:text-primary"
                                )}
                            >
                                {net}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? <PageLoader /> : (
                    <div className="grid grid-cols-1 gap-3">
                        <AnimatePresence mode="popLayout">
                            {filteredFeed?.map((item: any) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group"
                                >
                                    <div className={cn(
                                        "relative overflow-hidden px-5 py-4 bg-surface/50 border border-subtle hover:border-accent-primary/50 transition-all rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                                        isNew(item.time_utc) && "border-l-2 border-l-teal-500 !bg-teal-500/5"
                                    )}>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-mono font-bold text-primary">{item.gmn_id || `EV_${item.id}`}</span>
                                                    {isNew(item.time_utc) && (
                                                        <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 text-[9px] font-bold uppercase tracking-tighter">New</span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-mono text-secondary">{new Date(item.time_utc).toISOString().replace('T', ' ').substring(0, 19)} UTC</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 self-end sm:self-auto">
                                            <div className="flex flex-col items-end">
                                               {item.network === 'AMS' ? (
                                                   <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-bold border border-violet-500/30 uppercase">Witness Report</span>
                                               ) : (
                                                   <div className="flex items-center gap-4">
                                                       <div className="text-right">
                                                            <div className="text-sm font-mono text-primary">{item.entry_velocity_km_s?.toFixed(1) || '--'} <span className="text-[10px] text-secondary">km/s</span></div>
                                                            <div className="text-[9px] font-mono text-secondary uppercase">Velocity</div>
                                                       </div>
                                                       <div className="text-right">
                                                            <div className="text-sm font-mono text-primary">{item.magnitude?.toFixed(1) || '--'} <span className="text-[10px] text-secondary">m</span></div>
                                                            <div className="text-[9px] font-mono text-secondary uppercase">Magnitude</div>
                                                       </div>
                                                   </div>
                                               )}
                                            </div>

                                            <div className="border-l border-subtle pl-6 flex items-center gap-4">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{item.network}</span>
                                                    {item.network === 'AMS' ? (
                                                        <span className="text-[10px] font-mono text-slate-600 italic">No traj.</span>
                                                    ) : (
                                                        <Link 
                                                            to={`/events/${item.id}`} 
                                                            className="mt-1 text-[10px] font-mono text-accent-primary hover:underline uppercase tracking-widest"
                                                        >
                                                            View Details →
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {filteredFeed?.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center bg-surface/20 border border-dashed border-subtle rounded-3xl">
                                <Radio className="w-12 h-12 text-slate-700 mb-4 animate-pulse" />
                                <span className="font-mono text-slate-500">Waiting for {filter} packets...</span>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Floating Refresh Button */}
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { refetchFeed(); refetchStatus(); }}
                className="fixed bottom-8 right-8 p-4 bg-accent-primary text-void rounded-full shadow-glow-teal z-50 group"
            >
                <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            </motion.button>
        </div>
    );
}
