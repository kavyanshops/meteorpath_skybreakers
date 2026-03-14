import { Search, ChevronDown } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import * as Slider from '@radix-ui/react-slider';
import { UseEventsParams } from '../../hooks/useEvents';
import { useState } from 'react';

interface FilterBarProps {
    filters: UseEventsParams;
    setFilters: (f: UseEventsParams) => void;
}

export function FilterBar({ filters, setFilters }: FilterBarProps) {
    const [localSearch, setLocalSearch] = useState(filters.search || '');

    const handleApply = () => {
        setFilters({ ...filters, search: localSearch });
    };

    const handleReset = () => {
        setLocalSearch('');
        setFilters({ page: 1, pageSize: 25 });
    };

    return (
        <div className="w-72 shrink-0 bg-surface border-r border-subtle flex flex-col h-[calc(100vh-64px)] overflow-y-auto hidden md:flex">
            <div className="p-5 border-b border-subtle">
                <h2 className="text-secondary font-mono text-sm uppercase tracking-widest mb-4">Filters</h2>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="Search Region or ID..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        className="w-full bg-void border border-default rounded-md py-2 pl-9 pr-3 text-sm text-primary focus:outline-none focus:border-accent-primary focus:shadow-glow-teal transition-all placeholder:text-muted"
                    />
                </div>
            </div>

            {/* Network Select */}
            <div className="p-5 border-b border-subtle">
                <label className="text-[10px] text-muted font-mono uppercase tracking-widest mb-2 block">Network</label>
                <Select.Root
                    value={filters.network || 'all'}
                    onValueChange={(val) => setFilters({ ...filters, network: val === 'all' ? null : val, page: 1 })}
                >
                    <Select.Trigger className="w-full bg-void border border-default rounded-md px-3 py-2 text-sm text-primary flex items-center justify-between focus:outline-none focus:border-accent-primary data-[state=open]:border-accent-primary">
                        <Select.Value />
                        <Select.Icon><ChevronDown className="w-4 h-4 text-accent-primary" /></Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                        <Select.Content className="bg-elevated border border-default rounded-md shadow-lg overflow-hidden z-50">
                            <Select.Viewport>
                                {['all', 'GMN', 'NASA', 'AMS', 'FRIPON'].map((n) => (
                                    <Select.Item key={n} value={n} className="px-3 py-2 text-sm text-primary cursor-pointer hover:bg-surface focus:bg-surface focus:outline-none data-[state=checked]:text-accent-primary data-[state=checked]:font-medium">
                                        <Select.ItemText>{n === 'all' ? 'All Networks' : n}</Select.ItemText>
                                    </Select.Item>
                                ))}
                            </Select.Viewport>
                        </Select.Content>
                    </Select.Portal>
                </Select.Root>
            </div>

            {/* Velocity Range (Simplified for demo) */}
            <div className="p-5 border-b border-subtle">
                <label className="text-[10px] text-muted font-mono uppercase tracking-widest mb-4 block">Entry Velocity (km/s)</label>
                <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5"
                    defaultValue={[0, 80]}
                    max={80}
                    step={1}
                    onValueCommit={([min, max]) => setFilters({ ...filters, minVelocity: min, maxVelocity: max, page: 1 })}
                >
                    <Slider.Track className="bg-elevated relative grow rounded-full h-[3px]">
                        <Slider.Range className="absolute bg-gradient-teal rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-void border-2 border-accent-primary rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)] focus:outline-none focus:scale-110 transition-transform cursor-grab" aria-label="Min velocity" />
                    <Slider.Thumb className="block w-4 h-4 bg-void border-2 border-accent-primary rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)] focus:outline-none focus:scale-110 transition-transform cursor-grab" aria-label="Max velocity" />
                </Slider.Root>
                <div className="flex justify-between mt-3 text-xs font-mono text-secondary">
                    <span>{filters.minVelocity ?? 0}</span>
                    <span>{filters.maxVelocity ?? 80}</span>
                </div>
            </div>

            {/* Buttons */}
            <div className="p-5 mt-auto flex flex-col gap-3">
                <button
                    onClick={handleApply}
                    className="w-full py-2.5 bg-accent-primary hover:bg-accent-primary-dim text-void rounded-md font-medium transition-colors shadow-glow-teal active:scale-95"
                >
                    Apply Filters
                </button>
                <button
                    onClick={handleReset}
                    className="w-full py-2.5 bg-transparent border border-default hover:bg-elevated text-secondary rounded-md font-medium transition-colors active:scale-95"
                >
                    Reset All
                </button>
            </div>
        </div>
    );
}
