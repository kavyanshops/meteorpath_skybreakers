import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../ui/Badge';
import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

export function Navbar() {
    const location = useLocation();
    const [isLive, setIsLive] = useState(false);

    // Simple health check polling to simulate "Live" status
    useEffect(() => {
        const checkHealth = async () => {
            try {
                await apiClient.get('/health');
                setIsLive(true);
            } catch {
                setIsLive(false);
            }
        };
        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const links = [
        { name: 'Catalogue', path: '/events' },
        { name: 'Compare', path: '/compare' },
        { name: 'Live Feed', path: '/live-feed' },
        { name: 'About', path: '/about' },
    ];

    return (
        <nav className="sticky top-0 z-50 h-16 w-full border-b border-subtle bg-deep/85 backdrop-blur-[20px] saturate-180">
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">

                {/* Logo Left */}
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    {/* SVG CSS Icon for Meteor */}
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        <div className="absolute top-1.5 right-1.5 w-6 h-[2px] bg-gradient-to-r from-white to-transparent -rotate-45 origin-right" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="font-display font-bold text-xl text-primary tracking-tight">MeteorPath</span>
                        <span className="px-1.5 py-0.5 rounded bg-accent-primary/10 text-accent-primary text-[10px] font-mono uppercase tracking-widest border border-accent-primary/20">
                            Beta
                        </span>
                    </div>
                </Link>

                {/* Nav Links Center */}
                <div className="hidden md:flex items-center gap-8">
                    {links.map((link) => {
                        const isActive = location.pathname.startsWith(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    "relative py-2 text-sm transition-colors",
                                    isActive ? "text-primary font-medium" : "text-secondary hover:text-primary"
                                )}
                            >
                                {link.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute left-0 right-0 -bottom-[19px] h-[2px] bg-accent-primary shadow-glow-teal"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Status Right */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-default">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isLive ? "bg-status-warning shadow-[0_0_8px_var(--status-warning)] animate-pulse-ring" : "bg-muted"
                        )} />
                        <span className="text-xs font-mono uppercase text-secondary">
                            {isLive ? 'Live Sync' : 'Offline'}
                        </span>
                    </div>
                </div>

            </div>
        </nav>
    );
}
