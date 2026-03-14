import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Globe, ScatterChart } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { HealthResponse } from '../types';
import { useEffect, useState } from 'react';

// Starfield Background Component
const Starfield = () => {
    const [stars, setStars] = useState<{ x: number; y: number; s: number; o: number }[]>([]);

    useEffect(() => {
        // Generate ~200 random stars
        const newStars = Array.from({ length: 200 }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            s: Math.random() * 2 + 1, // size 1-3px
            o: Math.random() * 0.5 + 0.1, // opacity 0.1-0.6
        }));
        setStars(newStars);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute inset-0 bg-gradient-hero" />
            {stars.map((star, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.s}px`,
                        height: `${star.s}px`,
                        opacity: star.o,
                        boxShadow: `0 0 ${star.s * 2}px rgba(255,255,255,${star.o})`
                    }}
                />
            ))}
        </div>
    );
};

// Animated Number Counter Component
const AnimatedNumber = ({ value, label }: { value: number; label: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (value === 0) return;
        const duration = 2000; // 2s
        const steps = 60;
        const stepTime = Math.abs(Math.floor(duration / steps));
        let current = 0;

        const timer = setInterval(() => {
            current += value / steps;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="flex flex-col items-center">
            <span className="font-mono text-4xl text-accent-primary font-bold tracking-tighter shadow-glow-teal inline-block drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
                {count.toLocaleString()}
            </span>
            <span className="text-muted text-[10px] font-mono uppercase tracking-widest mt-2">
                {label}
            </span>
        </div>
    );
};

export function LandingPage() {
    const { data: health } = useQuery({
        queryKey: ['health'],
        queryFn: async () => {
            const { data } = await apiClient.get<HealthResponse>('/health');
            return data;
        },
        staleTime: 60000,
    });

    return (
        <div className="w-full flex flex-col items-center">
            {/* SECTION 1: HERO */}
            <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
                <Starfield />

                <div className="max-w-4xl mx-auto flex flex-col items-center text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center"
                    >
                        <span className="text-accent-primary font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-6 inline-flex items-center gap-2 border border-accent-primary/20 bg-accent-primary/5 px-4 py-1.5 rounded-full">
                            Orion Astrathon · Multi-Station Meteor Trajectory
                        </span>

                        <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl leading-tight tracking-tighter text-white mb-6">
                            Track Meteors.<br />
                            <span className="bg-clip-text text-transparent bg-gradient-teal">
                                Reconstruct Orbits.
                            </span>
                        </h1>

                        <p className="text-secondary text-lg sm:text-xl max-w-2xl font-light mb-10 leading-relaxed">
                            Real observation data from global camera networks.
                            Triangulated trajectories, deceleration models, and
                            heliocentric orbits — accessible to everyone.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto">
                            <Link
                                to="/events"
                                className="w-full sm:w-auto px-8 py-3.5 bg-accent-primary hover:bg-accent-primary-dim text-void font-semibold rounded-lg transition-all shadow-glow-teal hover:scale-105 active:scale-95"
                            >
                                Explore Catalogue
                            </Link>
                            <a
                                href="#architecture"
                                className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-strong text-primary hover:bg-elevated font-medium rounded-lg transition-all active:scale-95"
                            >
                                View Architecture
                            </a>
                        </div>

                        {/* Live Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-24">
                            <AnimatedNumber value={health?.events_count || 0} label="Total Events" />
                            <AnimatedNumber value={1} label="Networks Integrated" />
                            <AnimatedNumber value={(health?.events_count || 0) * 4} label="Data Points" />
                        </div>
                    </motion.div>
                </div>

                {/* Soft bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-deep to-transparent pointer-events-none" />
            </section>

            {/* SECTION 2: HOW IT WORKS */}
            <section id="architecture" className="w-full max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="font-display font-bold text-3xl text-primary mb-4">The Pipeline</h2>
                    <p className="text-secondary max-w-2xl mx-auto">From raw camera sensor arrays to interactive 3D heliocentric orbits.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card hoverEffect className="p-8 flex flex-col items-start bg-gradient-card">
                        <div className="w-16 h-16 rounded-2xl bg-void border border-default flex items-center justify-center mb-6 shadow-md">
                            <Download className="w-8 h-8 text-accent-primary" />
                        </div>
                        <h3 className="font-display font-semibold text-xl text-primary mb-3">1. Ingest Data</h3>
                        <p className="text-secondary text-sm leading-relaxed">
                            Pulling nightly trajectory summaries and multi-station observations from the Global Meteor Network API into our PostgreSQL database via FastAPI.
                        </p>
                    </Card>

                    <Card hoverEffect className="p-8 flex flex-col items-start bg-gradient-card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-secondary-glow blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        <div className="w-16 h-16 rounded-2xl bg-void border border-default flex items-center justify-center mb-6 shadow-md">
                            <ScatterChart className="w-8 h-8 text-accent-secondary" />
                        </div>
                        <h3 className="font-display font-semibold text-xl text-primary mb-3">2. Reconstruct Path</h3>
                        <p className="text-secondary text-sm leading-relaxed">
                            Applying intersecting line-of-sight algorithms to calculate the atmospheric trajectory, entry velocity, and pre-atmospheric heliocentric orbit.
                        </p>
                    </Card>

                    <Card hoverEffect className="p-8 flex flex-col items-start bg-gradient-card">
                        <div className="w-16 h-16 rounded-2xl bg-void border border-default flex items-center justify-center mb-6 shadow-md">
                            <Globe className="w-8 h-8 text-status-success" />
                        </div>
                        <h3 className="font-display font-semibold text-xl text-primary mb-3">3. Explore in 3D</h3>
                        <p className="text-secondary text-sm leading-relaxed">
                            Visualizing the reconstructed meteor path over a dark-themed CesiumJS interactive globe, complete with detailed photometric and velocity metrics.
                        </p>
                    </Card>
                </div>
            </section>

            {/* SECTION 3: DATA SOURCES */}
            <section className="w-full border-t border-subtle bg-elevated/20 py-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <span className="text-[10px] text-muted font-mono uppercase tracking-[0.2em] mb-6 block">Powered by open data from</span>

                    <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
                        {['Global Meteor Network', 'NASA Fireball Network', 'American Meteor Society', 'IAU MDC'].map((source) => (
                            <div key={source} className="px-6 py-3 rounded-lg bg-surface border border-default shadow-sm hover:border-accent-primary/50 transition-colors">
                                <span className="font-display font-medium text-secondary text-sm sm:text-base">{source}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
