'use client';

/**
 * PresenterView — full-screen, clean, fits-anywhere year presenter.
 * Designed for both desktop (1920×1080) and laptop (1280×720) screens.
 * Layout is fluid: year + title + author + summary + section counts.
 * Nav is bottom-anchored but uses safe-area and respects content height.
 */

import { motion } from 'framer-motion';
import type { Milestone, Era, YearContent } from './YearCard';

type Props = {
  year: number;
  milestone: Milestone | null;
  era: Era | null;
  yearContent: YearContent | undefined;
  onPrev: () => void;
  onNext: () => void;
};

export default function PresenterView({ year, milestone, era, yearContent, onPrev, onNext }: Props) {
  const title = milestone?.title || `${year} in NLP`;
  const author = milestone?.author || '';
  const summary = milestone?.summary || '';
  const why = milestone?.why_it_mattered || '';

  // Counts for the section summary row
  const csCount = yearContent?.cs_highlights?.length ?? 0;
  const nrCount = yearContent?.nlp_research?.length ?? 0;
  const naCount = yearContent?.nlp_applications?.length ?? 0;
  const exCount = yearContent?.extras?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#E0E5EC' }}
    >
      {/* Main content area — centered, scrollable if it doesn't fit */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-6 py-12 md:py-16">
          <div className="max-w-3xl w-full text-center">
            {/* Year + era chip */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-2 mb-4 flex-wrap"
            >
              <span
                className="font-display font-light leading-none year-button"
                style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', color: 'var(--maroon-500)' }}
              >
                {year}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center justify-center gap-2 mb-5 flex-wrap"
            >
              {era && (
                <span
                  className="neu-tag text-xs font-semibold"
                  style={{ color: era.color }}
                >
                  {era.label}
                </span>
              )}
              <span className="neu-tag-maroon text-xs">Presenter Mode</span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display font-light text-neu-text leading-tight mb-3"
              style={{ fontSize: 'clamp(1.5rem, 3.6vw, 2.5rem)' }}
            >
              {title}
            </motion.h2>

            {/* Author */}
            {author && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-neu-muted mb-6 font-light"
                style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)' }}
              >
                {author}
              </motion.p>
            )}

            {/* Summary */}
            {summary && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-neu-text leading-relaxed mb-5 max-w-2xl mx-auto"
                style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)' }}
              >
                {summary}
              </motion.p>
            )}

            {/* Why it mattered */}
            {why && (
              <motion.blockquote
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="font-serif italic text-neu-muted max-w-2xl mx-auto mb-8"
                style={{ fontSize: 'clamp(0.85rem, 1.2vw, 1rem)' }}
              >
                &ldquo;{why}&rdquo;
              </motion.blockquote>
            )}

            {/* Section counts — neat, not bulky */}
            {(csCount + nrCount + naCount + exCount) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-2 mt-6"
              >
                {csCount > 0 && (
                  <span className="neu-pill px-3 py-1.5 text-xs">
                    <span className="font-semibold text-maroon mr-1">1.</span>
                    CS / Tech <span className="text-neu-muted ml-1">· {csCount}</span>
                  </span>
                )}
                {nrCount > 0 && (
                  <span className="neu-pill px-3 py-1.5 text-xs">
                    <span className="font-semibold text-maroon mr-1">2a.</span>
                    Research <span className="text-neu-muted ml-1">· {nrCount}</span>
                  </span>
                )}
                {naCount > 0 && (
                  <span className="neu-pill px-3 py-1.5 text-xs">
                    <span className="font-semibold text-maroon mr-1">2b.</span>
                    Apps <span className="text-neu-muted ml-1">· {naCount}</span>
                  </span>
                )}
                {exCount > 0 && (
                  <span className="neu-pill px-3 py-1.5 text-xs">
                    <span className="font-semibold text-maroon mr-1">3.</span>
                    Extras <span className="text-neu-muted ml-1">· {exCount}</span>
                  </span>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav — anchored, doesn't overlap content */}
      <div className="flex-shrink-0 border-t border-neu-dark/15">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPrev}
            className="neu-pill w-11 h-11 flex items-center justify-center text-lg"
            aria-label="Previous year"
          >
            ←
          </motion.button>
          <div className="text-xs text-neu-muted text-center">
            <span className="hidden sm:inline">← / → arrow keys · </span>
            <span>Esc to exit</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="neu-pill w-11 h-11 flex items-center justify-center text-lg"
            aria-label="Next year"
          >
            →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}