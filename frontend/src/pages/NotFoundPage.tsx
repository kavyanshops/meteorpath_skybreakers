import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Network } from 'lucide-react';

export function NotFoundPage() {
    return (
        <PageWrapper className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="relative mb-8">
                <Network className="w-24 h-24 text-muted opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center bg-deep/50 backdrop-blur-[2px]">
                    <span className="font-display font-bold text-4xl text-status-error tracking-tighter">404</span>
                </div>
            </div>

            <h1 className="font-display text-2xl font-semibold mb-4 text-primary">Lost in Space</h1>
            <p className="text-secondary max-w-md mb-8 leading-relaxed">
                The trajectory you're looking for doesn't exist in our database. It may have burned up in the atmosphere or the link is broken.
            </p>

            <Link
                to="/"
                className="px-6 py-3 rounded-md bg-accent-primary text-void font-medium hover:bg-accent-primary-dim transition-colors shadow-glow-teal hover:scale-105 active:scale-95 flex items-center gap-2"
            >
                Return to Base
            </Link>
        </PageWrapper>
    );
}
