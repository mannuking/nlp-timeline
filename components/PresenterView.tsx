'use client';

/**
 * PresenterView — full-screen presenter that shows the SAME content shape
 * as the year-card modal, just bigger and full-screen. Both modes share the
 * same data: year, title, author, summary, why, and the 4 structured sections
 * (1. CS / Tech, 2a. Research, 2b. Apps, 3. Extras) with full bullets.
 *
 * Use cases:
 *   - desktop 1920×1080
 *   - laptop 1280×720
 *   - classroom projector
 *
 * Layout uses clamp() so fonts scale fluidly without overflow. The whole
 * content area is scrollable if a year has many bullets — bottom nav is
 * anchored so it never overlaps content.
 */

import { motion } from 'framer-motion';
// (useEffect not used here — body scroll lock is handled by parent page)
import type { Milestone, Era, YearContent } from './YearCard';

type Props = {
  year: number;
  milestone: Milestone | null;
  era: Era | null;
  yearContent: YearContent | undefined;
  onPrev: () => void;
  onNext: () => void;
};

// Inline citation highlighter (matches YearCard)
function highlightCitations(text: string): string {
  return text.replace(
    /(\((?:[^()]*?(?:Wikipedia|arxiv|ACL|aclanthology|NYT|Nature|Science|Source)[^()]*?)\))/gi,
    '<span class="cite-pill">$1</span>',
  );
}

// Inline section used inside PresenterView — same shape as YearCard sections
function Section({
  number,
  title,
  bullets,
  fallback,
}: {
  number: string;
  title: string;
  bullets: string[] | undefined;
  fallback?: string;
}) {
  const hasBullets = bullets && bullets.length > 0;
  if (!hasBullets && !fallback) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-left"
    >
      <div className="flex items-baseline gap-3 mb-3">
        <span
          className="font-display font-light leading-none text-maroon"
          style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}
        >
          {number}
        </span>
        <h3
          className="font-display font-light text-neu-text leading-snug"
          style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.35rem)' }}
        >
          {title}
        </h3>
      </div>
      {hasBullets ? (
        <ul className="space-y-2 pl-7 sm:pl-9">
          {bullets!.map((b, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.03, duration: 0.3 }}
              className="relative text-neu-text leading-relaxed before:content-['—'] before:absolute before:-left-4 sm:before:-left-6 before:text-neu-muted"
              style={{ fontSize: 'clamp(0.9rem, 1.3vw, 1.05rem)' }}
              dangerouslySetInnerHTML={{ __html: highlightCitations(b) }}
            />
          ))}
        </ul>
      ) : (
        <p className="text-neu-muted italic pl-7 sm:pl-9 text-sm">{fallback}</p>
      )}
    </motion.div>
  );
}

export default function PresenterView({ year, milestone, era, yearContent, onPrev, onNext }: Props) {
  const title = milestone?.title || `${year} in NLP`;
  const author = milestone?.author || '';
  const summary = milestone?.summary || '';
  const why = milestone?.why_it_mattered || '';

  const cs = yearContent?.cs_highlights ?? [];
  const nr = yearContent?.nlp_research ?? [];
  const na = yearContent?.nlp_applications ?? [];
  const ex = yearContent?.extras ?? [];

  // Count of structured bullets — used to skip the structured section when
  // there's no content at all
  const hasStructured = cs.length + nr.length + na.length + ex.length > 0;
  // Count of milestone content — used to skip the milestone section when empty
  const hasMilestone = !!(title || author || summary || why);

  // Body-scroll lock is now handled by the parent page component
  // (app/page.tsx) so the cleanup fires reliably on every state change,
  // regardless of AnimatePresence exit animation timing. The previous
  // per-component useEffect here was leaving the page stuck after the
  // presenter closed, requiring a manual refresh to restore scroll.

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: '#E0E5EC' }}
    >
      {/* Scrollable content area — single scroll context */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
          {/* Header block — year + era + title + author + summary + why */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
              <span
                className="font-display font-light leading-none year-button"
                style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', color: 'var(--maroon-500)' }}
              >
                {year}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
              {era && (
                <span
                  className="neu-tag text-xs font-semibold"
                  style={{ color: era.color }}
                >
                  {era.label}
                </span>
              )}
              <span className="neu-tag-maroon text-xs">Presenter Mode</span>
            </div>

            {title && (
              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="font-display font-light text-neu-text leading-tight mb-2"
                style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.25rem)' }}
              >
                {title}
              </motion.h2>
            )}
            {author && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="text-neu-muted font-light mb-4"
                style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)' }}
              >
                {author}
              </motion.p>
            )}
            {summary && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-neu-text leading-relaxed max-w-2xl mx-auto mb-3"
                style={{ fontSize: 'clamp(0.95rem, 1.35vw, 1.05rem)' }}
              >
                {summary}
              </motion.p>
            )}
            {why && (
              <motion.blockquote
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="font-serif italic text-neu-muted max-w-2xl mx-auto"
                style={{ fontSize: 'clamp(0.85rem, 1.15vw, 0.95rem)' }}
              >
                &ldquo;{why}&rdquo;
              </motion.blockquote>
            )}
          </motion.div>

          {/* Structured sections — same as YearCard "Year in Review" view */}
          {hasStructured && (
            <div className="space-y-7 mt-8">
              <Section
                number="1."
                title="Top CS / Advanced Tech of the Year"
                bullets={cs}
                fallback="No major CS tech recorded for this year."
              />
              <div>
                <div className="flex items-baseline gap-3 mb-3">
                  <span
                    className="font-display font-light leading-none text-maroon"
                    style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}
                  >
                    2.
                  </span>
                  <h3
                    className="font-display font-light text-neu-text leading-snug"
                    style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.35rem)' }}
                  >
                    NLP Highlights
                  </h3>
                </div>
                <div className="pl-7 sm:pl-9 space-y-6 mt-4">
                  <Section
                    number="2a."
                    title="Research"
                    bullets={nr}
                    fallback="Few public NLP research breakthroughs recorded for this year."
                  />
                  <Section
                    number="2b."
                    title="Applications"
                    bullets={na}
                    fallback="No major NLP applications or deployed systems recorded for this year."
                  />
                </div>
              </div>
              <Section
                number="3."
                title="Extras & Notable Context"
                bullets={ex}
              />
            </div>
          )}

          {/* When neither hasStructured nor hasMilestone — at least show a placeholder */}
          {!hasStructured && !hasMilestone && (
            <p className="text-center text-neu-muted italic">
              No content recorded for {year} yet.
            </p>
          )}
        </div>
      </div>

      {/* Bottom nav — anchored, doesn't overlap content */}
      <div className="flex-shrink-0 border-t border-neu-dark/15 bg-[#E0E5EC]">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
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