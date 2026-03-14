export function Footer() {
    return (
        <footer className="w-full border-t border-subtle bg-deep py-8 text-center mt-auto">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">

                <div className="flex flex-col items-center md:items-start">
                    <span className="font-display font-bold text-primary">MeteorPath <span className="text-secondary opacity-50 font-normal">© {new Date().getFullYear()}</span></span>
                    <span className="text-xs text-muted mt-1">Multi-station meteor trajectory reconstruction</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-muted uppercase tracking-wider">
                    <span>Data Sources:</span>
                    {['GMN', 'NASA', 'AMS', 'FRIPON'].map((src) => (
                        <span key={src} className="hover:text-primary transition-colors cursor-pointer">{src}</span>
                    ))}
                </div>

            </div>
        </footer>
    );
}
