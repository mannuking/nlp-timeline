'use client';

/**
 * YearBrowser — collapsible year-chip browser. By default collapsed (the user
 * complained about "all years piled in a big ugly box"). Clicking the trigger
 * reveals all 81 year chips. Picking a year opens the year card.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { Era } from './YearCard'; // re-using type for color reference

type Props = {
  allYears: number[];
  flatYears: number[];
  activeYear: number | null;
  onPick: (y: number) => void;
  eraForYear: (y: number) => Era | undefined;
};

export default function YearBrowser({ allYears, flatYears, activeYear, onPick, eraForYear }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="max-w-5xl mx-auto px-6 mb-12">
      <div className="neu-card overflow-hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full px-5 py-3 flex items-center justify-between gap-4 hover:bg-black/5 transition-colors"
          aria-expanded={open}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-maroon uppercase tracking-wider">
              Browse every year
            </span>
            <span className="text-xs text-neu-muted">
              {flatYears.length} / 81 years
            </span>
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-neu-muted text-sm"
          >
            ▾
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-2">
                <p className="text-xs text-neu-muted mb-4">
                  Click any year to open its card — top CS tech, NLP research breakthroughs, NLP applications, and extras.
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pr-2">
                  {allYears.map((y) => {
                    const isActive = activeYear === y;
                    const inEra = eraForYear(y);
                    const inFilter = flatYears.includes(y);
                    return (
                      <motion.button
                        key={y}
                        whileHover={inFilter ? { scale: 1.06, y: -1 } : {}}
                        whileTap={inFilter ? { scale: 0.95 } : {}}
                        onClick={() => inFilter && onPick(y)}
                        disabled={!inFilter}
                        className={`year-button px-2.5 py-1.5 text-[11px] font-semibold rounded-full transition-all ${
                          isActive
                            ? 'neu-pill-active'
                            : inFilter
                            ? 'neu-pill hover:text-maroon'
                            : 'neu-pill opacity-25 cursor-not-allowed'
                        }`}
                        style={
                          isActive
                            ? { color: 'var(--maroon-500)' }
                            : inFilter && inEra
                            ? { color: inEra.color }
                            : {}
                        }
                        title={`${y} — ${inEra?.label ?? 'No milestone'}`}
                      >
                        {y}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}