import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { PageLoader } from '../components/ui/Loader';
import { Card } from '../components/ui/Card';
import { RefreshCw, Activity, Satellite } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LiveFeedPage() {

    const { data: status, refetch: refetchStatus } = useQuery({
        queryKey: ['live-feed-status'],
        queryFn: () => api.getLiveFeedStatus(),
        refetchInterval: 30000
    });

    const { data: feed, isLoading, refetch: refetchFeed } = useQuery({
        queryKey: ['live-feed'],
        queryFn: () => api.getLiveFeed(20),
        refetchInterval: 15000
    });

    const nasaPoll = useMutation({
        mutationFn: () => api.triggerNasaIngest({ start_date: '2024-01-01', end_date: '2024-01-07' }), // mock dates
        onSuccess: () => alert('NASA Pipeline Triggered')
    });

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <div>
                   <h1 className="text-2xl text-blue-100 font-bold font-mono">Operations Console</h1>
                   <p className="text-slate-400 text-sm mt-1">Multi-network real-time meteor ingestion monitoring.</p>
                </div>
                <button onClick={() => { refetchFeed(); refetchStatus(); }} className="p-2 border border-slate-700 rounded text-slate-400 hover:text-white hover:bg-slate-800">
                   <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Network Status Nav */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-slate-300 font-mono text-sm uppercase tracking-widest border-b border-slate-800 pb-2">Network Uplinks</h2>
                    {status?.sources.map((s: any) => (
                        <Card key={s.name} className="p-4 bg-slate-900/50 border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Satellite className="w-5 h-5 text-indigo-400" />
                                <div>
                                    <div className="text-slate-200 font-mono text-sm">{s.name}</div>
                                    <div className="text-emerald-500 text-xs font-mono uppercase tracking-wider">{s.status}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-blue-400 font-bold font-mono">{s.events_ingested}</div>
                                <div className="text-slate-500 text-[10px] uppercase">Events</div>
                            </div>
                        </Card>
                    ))}

                    <div className="mt-8 border border-dashed border-slate-700 p-4 rounded bg-slate-900/20">
                        <h3 className="text-slate-400 text-xs font-mono uppercase mb-3 text-center">Manual Triggers</h3>
                        <button onClick={() => nasaPoll.mutate()} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded border border-slate-700">
                            Force NASA Bulk Sync
                        </button>
                    </div>
                </div>

                {/* Live Stream */}
                <div className="lg:col-span-2">
                    <h2 className="text-slate-300 font-mono text-sm uppercase tracking-widest border-b border-slate-800 pb-2 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" /> Ingestion Stream
                    </h2>

                    {isLoading ? <PageLoader /> : (
                        <div className="flex flex-col gap-3">
                            {feed?.map((item: any) => (
                                <Link to={`/events/${item.id}`} key={item.id} className="block group">
                                    <Card className="px-4 py-3 bg-slate-900 border-slate-800 hover:border-slate-600 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
                                            <div>
                                               <span className="text-slate-200 font-mono font-bold mr-3">{item.gmn_id || `ID_${item.id}`}</span>
                                               <span className="text-slate-500 text-xs">{new Date(item.time_utc).toISOString().replace('T', ' ').substring(0, 19)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-slate-400 text-sm font-mono">{item.network}</span>
                                            {item.magnitude && <span className="text-fuchsia-400 text-sm font-mono w-12 text-right">{item.magnitude.toFixed(1)}m</span>}
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                            {feed?.length === 0 && <div className="text-slate-500 font-mono text-center p-10 border border-dashed border-slate-800 rounded">Stream Empty</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
