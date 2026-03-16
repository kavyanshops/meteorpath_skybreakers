import { useState } from 'react';
import { Grid, List } from 'lucide-react';
import { useEvents, UseEventsParams } from '../hooks/useEvents';
import { FilterBar } from '../components/catalogue/FilterBar';
import { EventTable } from '../components/catalogue/EventTable';
import { EventCard } from '../components/catalogue/EventCard';
import { PaginationBar } from '../components/catalogue/PaginationBar';
import { CompareBar } from '../components/catalogue/CompareBar';
import { PageLoader } from '../components/ui/Loader';

type ViewMode = 'table' | 'grid';

export function CataloguePage() {
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [filters, setFilters] = useState<UseEventsParams>({
        page: 1,
        pageSize: 25,
    });

    const { data, isLoading, error } = useEvents(filters);

    if (isLoading) return <PageLoader />;
    if (error) return <div className="text-status-error text-center mt-20 font-mono">Error loading events. Please try again later.</div>;

    const events = data?.events || [];
    const total = data?.total || 0;

    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
            {/* Sidebar Filters */}
            <FilterBar filters={filters} setFilters={setFilters} />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 h-full overflow-hidden bg-void relative">

                {/* Header */}
                <div className="flex-none p-6 border-b border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-deep/50 backdrop-blur-md z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <h1 className="font-display text-2xl font-bold text-primary">Event Catalogue</h1>
                        <span className="px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20 text-xs font-mono">
                            {total.toLocaleString()} events
                        </span>
                    </div>

                    <div className="flex items-center gap-1 bg-surface p-1 rounded-md border border-default">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-elevated text-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
                            title="Table View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-elevated text-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
                            title="Grid View"
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Scrolling Event View */}
                <div className="flex-1 overflow-y-auto w-full">
                    {viewMode === 'table' ? (
                        <div className="min-w-[800px] w-full">
                            <EventTable events={events} />
                        </div>
                    ) : (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-[1600px] mx-auto">
                            {events.map(event => (
                                <div key={event.id} className="h-full">
                                    <EventCard event={event} />
                                </div>
                            ))}
                            {events.length === 0 && (
                                <div className="col-span-full py-20 text-center text-muted border border-dashed border-subtle rounded-xl">
                                    No events found matching current filters.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-6 pt-0 mt-auto">
                        <PaginationBar total={total} filters={filters} setFilters={setFilters} />
                    </div>
                </div>
            </div>
            <CompareBar />
        </div>
    );
}
