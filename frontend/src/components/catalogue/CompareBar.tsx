import { X, ArrowRight } from 'lucide-react';
import { useCompareStore } from '../../store/compareStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function CompareBar() {
    const navigate = useNavigate();
    const { selectedEventIds, toggleEvent, clearSelection } = useCompareStore();
    
    // Fetch basic info for the chips (in a real app we might have this info in the store or from the catalogue data)
    // For now, we assume the catalogue already has these events or we just show the IDs.
    
    if (selectedEventIds.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            >
                <div className="bg-elevated/80 backdrop-blur-xl border border-accent-primary/30 rounded-2xl shadow-glow-teal p-4 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                        {selectedEventIds.map((id) => (
                            <div 
                                key={id}
                                className="flex items-center gap-2 bg-void border border-default px-3 py-1.5 rounded-full whitespace-nowrap group animate-in slide-in-from-left-2"
                            >
                                <span className="text-xs font-mono text-primary">EVT-{id}</span>
                                <button 
                                    onClick={() => toggleEvent(id)}
                                    className="p-0.5 hover:bg-surface rounded-full text-muted hover:text-accent-fire transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <button 
                            onClick={clearSelection}
                            className="text-xs font-mono text-muted hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            Clear
                        </button>
                        <button 
                            onClick={() => navigate(`/compare?ids=${selectedEventIds.join(',')}`)}
                            disabled={selectedEventIds.length < 2}
                            className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary-dim text-void px-5 py-2 rounded-xl font-bold transition-all disabled:opacity-50 disabled:grayscale active:scale-95"
                        >
                            Compare
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
