import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UseEventsParams } from '../../hooks/useEvents';

interface PaginationBarProps {
    total: number;
    filters: UseEventsParams;
    setFilters: (f: UseEventsParams) => void;
}

export function PaginationBar({ total, filters, setFilters }: PaginationBarProps) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 25;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));

    const startIdx = (page - 1) * pageSize + 1;
    const endIdx = Math.min(page * pageSize, total);

    return (
        <div className="flex items-center justify-between w-full py-4 border-t border-subtle">
            <div className="text-sm text-secondary font-mono">
                Showing <span className="text-primary font-medium">{total === 0 ? 0 : startIdx}</span>–
                <span className="text-primary font-medium">{endIdx}</span> of{' '}
                <span className="text-primary font-medium">{total}</span> events
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setFilters({ ...filters, page: page - 1 })}
                    disabled={page <= 1}
                    className="p-2 bg-transparent text-secondary hover:text-primary hover:bg-surface border border-default rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-4 py-1.5 bg-surface border border-default rounded text-sm font-mono text-primary flex items-center h-full">
                    {page} <span className="text-muted mx-1">/</span> {maxPage}
                </div>

                <button
                    onClick={() => setFilters({ ...filters, page: page + 1 })}
                    disabled={page >= maxPage}
                    className="p-2 bg-transparent text-secondary hover:text-primary hover:bg-surface border border-default rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
