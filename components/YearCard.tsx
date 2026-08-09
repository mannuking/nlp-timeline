'use client';

/**
 * YearCard — the redesigned, beautiful, animated year-detail card.
 *
 * Layout (per Jai's spec):
 *   1.  Top CS / advanced tech of that year
 *   2.  NLP highlights for that year
 *       2a. Research
 *       2b. Applications
 *   3.  Open "extras" section for anything else we want to add
 *
 * Data is sourced from timeline.json (the curated milestones) + data/year-content.json
 * (the year-by-year research). When a year is in both, we merge; when it's only
 * in year-content.json, we still render the card with the structured sections;
 * when it's only in the milestone list, we fall back to the legacy summary/why.
 *
 * Animations are framer-motion: staggered card reveal, hover micro-interactions,
 * bullet reveal in cascade, inline highlight on hover for citations.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ---- Reference filtering ----
// Generic NLP community resources that appear in every milestone's link
// list but are NOT specific to that year. We hide them so each year
// card shows only the references that are actually relevant to that
// specific year/milestone. This is the "divide links by specific year"
// fix the user asked for.
const GENERIC_NLP_LABELS = [
  'Wikipedia: Natural language processing',
  'Wikipedia: History of natural language processing',
  'Wikipedia: Computational linguistics',
  'ACL Anthology',
  'ACL Anthology search',
  'Stanford NLP',
  'Stanford CS224N',
  'Stanford CS224N: NLP with Deep Learning',
  'Stanford CS224N: LMs intro',
  'Jurafsky & Martin: n-gram LMs chapter',
  'Cornell CS4740: language models',
  'ACL',
  'NAACL',
  'TACL',
  'JAIR',
  'MIT Press NLP',
  'arXiv cs.CL',
  'Papers with Code',
  'HuggingFace',
  'Google Scholar',
  'Semantic Scholar',
  'DBLP',
  'OpenReview',
  'Distill.pub',
  'Deep Learning book',
];

// Detect year-specific references. A link is "year-specific" if:
//   1. It's the primary paper / first-author page for the milestone
//   2. Its label or URL contains the year (e.g. "1997 LSTM")
//   3. It refers to a person, paper, or concept directly tied to this
//      milestone (not a generic NLP resource)
// Since we only have label + URL, we use a heuristic: drop entries whose
// label matches one of the generic archetypes above. Everything else
// is kept and ordered by score (URLs with the year rank highest).
function filterLinksForYear(links: Link[], year: number): Link[] {
  const filtered = links.filter(
    (l) => !GENERIC_NLP_LABELS.includes(l.label),
  );
  // Sort: links whose label or URL mention the year go first
  const sorted = [...filtered].sort((a, b) => {
    const aHasYear =
      a.label.includes(String(year)) || a.url.includes(String(year));
    const bHasYear =
      b.label.includes(String(year)) || b.url.includes(String(year));
    if (aHasYear && !bHasYear) return -1;
    if (!aHasYear && bHasYear) return 1;
    return 0;
  });
  // Cap at 6 to keep the card scannable
  return sorted.slice(0, 6);
}

// ---- Types ----
export type Link = { label: string; url: string };
export type Era = {
  id: string;
  label: string;
  years: string;
  color: string;
  summary: string;
  milestones?: unknown[];
};
export type Milestone = {
  year: number;
  title: string;
  author: string;
  summary: string;
  why_it_mattered: string;
  links: Link[];
  tags: string[];
};
export type YearContent = {
  cs_highlights?: string[];
  nlp_research?: string[];
  nlp_applications?: string[];
  extras?: string[];
};

type Props = {
  year: number;
  milestone: Milestone | null;
  yearContent: YearContent | undefined;
  eraColor: string | undefined;
  yearIndex: number;
  totalYears: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

// ---- Animations ----
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.96,
    transition: { duration: 0.25 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

const bulletContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const bulletVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

// ---- Section subcomponent ----
function Section({
  index,
  number,
  title,
  accent,
  bullets,
  fallback,
  variant = 'numbered',
  onCitations,
}: {
  index: number;
  number?: string;
  title: string;
  accent: string;
  bullets: string[] | undefined;
  fallback?: string;
  variant?: 'numbered' | 'sub';
  onCitations?: (cites: string[]) => void;
}) {
  const hasBullets = bullets && bullets.length > 0;
  if (!hasBullets && !fallback) return null;

  // Collect citations from every bullet in this section so the parent
  // can show a single References list at the bottom of the card.
  const allCitations: string[] = [];
  if (hasBullets) {
    for (const b of bullets!) {
      const { citations } = splitBullet(b);
      allCitations.push(...citations);
    }
    if (onCitations) onCitations(allCitations);
  }

  return (
    <motion.div
      custom={index}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {variant === 'numbered' ? (
        <div className="flex items-baseline gap-2.5 mb-2.5">
          {number && (
            <span
              className="font-display font-light leading-none"
              style={{ color: accent, fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}
            >
              {number}
            </span>
          )}
          <h4
            className="font-display font-medium text-neu-text leading-snug"
            style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)' }}
          >
            {title}
          </h4>
        </div>
      ) : (
        <div className="mb-1.5 mt-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neu-muted">
            {title}
          </span>
        </div>
      )}
      {hasBullets ? (
        <motion.ul
          variants={bulletContainerVariants}
          initial="hidden"
          animate="visible"
          className={`space-y-1.5 ${variant === 'numbered' ? 'pl-7 sm:pl-8' : 'pl-3 sm:pl-4'}`}
        >
          {bullets!.map((b, i) => {
            const { text } = splitBullet(b);
            return (
              <motion.li
                key={i}
                variants={bulletVariants}
                className="relative text-neu-text leading-relaxed text-[13px] sm:text-sm before:content-['—'] before:absolute before:-left-4 sm:before:-left-5 before:text-neu-muted before:font-semibold"
              >
                <span>{text}</span>
              </motion.li>
            );
          })}
        </motion.ul>
      ) : (
        <p className={`text-neu-muted italic text-[13px] sm:text-sm leading-relaxed ${variant === 'numbered' ? 'pl-7 sm:pl-8' : ''}`}>
          {fallback}
        </p>
      )}
    </motion.div>
  );
}

// ---- Cite highlighter (renders the parenthetical source in a subtle pill) ----
// Extract + strip citation parentheticals from a bullet so the body
// text stays clean, and the citations can be collected into a single
// References section at the bottom of the card.
//   Input:  "LISP developed by McCarthy (Wikipedia: Lisp)"
//   Output: { text: "LISP developed by McCarthy", citations: ["Wikipedia: Lisp"] }
function splitBullet(text: string): { text: string; citations: string[] } {
  const citations: string[] = [];
  // Match any parenthesised expression that looks like a citation
  // (contains Wikipedia / arXiv / ACL / etc.). To handle nested parens
  // like "(Wikipedia: Lisp (programming language))", we count parens
  // manually from the opening "(": find the closing ")" that matches.
  const result: string[] = [];
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('(', i);
    if (open === -1) {
      result.push(text.slice(i));
      break;
    }
    // Push everything before the "("
    result.push(text.slice(i, open));
    // Find the matching ")" by counting nested parens
    let depth = 1;
    let j = open + 1;
    while (j < text.length && depth > 0) {
      const ch = text[j];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      j++;
    }
    // The inner content is text[open+1 .. j-1]
    const inner = text.slice(open + 1, j - 1);
    // Check if this looks like a citation
    if (/(?:Wikipedia|arxiv|ACL|aclanthology|NYT|Nature|Science|Source|PNAS|IEEE|ACM)/i.test(inner)) {
      citations.push(inner.trim());
    } else {
      // Keep the original parens in the body text
      result[result.length - 1] = (result[result.length - 1] || '') + text.slice(open, j);
    }
    i = j;
  }
  let stripped = result.join('');
  // Clean up trailing punctuation/whitespace, leftover parens, etc.
  stripped = stripped
    .replace(/[\s,.;:]+$/, '')
    .replace(/\(\s*\)/g, '')
    .trim();
  return { text: stripped, citations };
}

// ---- Main component ----
export default function YearCard({
  year,
  milestone,
  yearContent,
  eraColor,
  yearIndex,
  totalYears,
  onClose,
  onPrev,
  onNext,
}: Props) {
  // Local state: show primary milestone content vs structured sections
  const [view, setView] = useState<'structured' | 'milestone'>('structured');

  // Collect citations from every section as it renders. We use a ref
  // (not state) so calling collectCitations does NOT trigger a re-render
  // (which would cause an infinite loop with state-based collection).
  // The body section's `key` prop on the parent forces a fresh ref every
  // time the year changes, so citations don't leak across years.
  const citationsRef = useRef<string[]>([]);
  const collectCitations = useCallback((newOnes: string[]) => {
    const seen = new Set(citationsRef.current);
    for (const c of newOnes) {
      if (!seen.has(c)) {
        seen.add(c);
        citationsRef.current.push(c);
      }
    }
  }, []);

  // Reset citations when the year changes so navigation between
  // years doesn't accumulate citations from previous years.
  const lastYearRef = useRef<number | null>(null);
  if (lastYearRef.current !== year) {
    citationsRef.current = [];
    lastYearRef.current = year;
  }

  // Mirror citationsRef.current into state so the References section
  // re-renders when the body sections collect new citations. We use
  // a state to trigger React re-renders, but the ref is the source of
  // truth. The state is updated AFTER the render commits (via a
  // useEffect below), so there's no infinite loop.
  const [citations, setCitations] = useState<string[]>([]);

  // After every render, sync the latest citations to state so the
  // References section sees the updated value. We only update state
  // when the ref's length changed (avoids infinite loop).
  useEffect(() => {
    if (citationsRef.current.length !== citations.length) {
      setCitations([...citationsRef.current]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citations.length]);

  // Body-scroll lock is now handled by the parent page component
  // (app/page.tsx) so the cleanup fires reliably on every state change,
  // regardless of AnimatePresence exit animation timing. The previous
  // per-component useEffect here was leaving the page stuck after the
  // modal closed, requiring a manual refresh to restore scroll.

  const hasStructured = useMemo(
    () =>
      !!yearContent &&
      ((yearContent.cs_highlights?.length ?? 0) +
        (yearContent.nlp_research?.length ?? 0) +
        (yearContent.nlp_applications?.length ?? 0) +
        (yearContent.extras?.length ?? 0)) >
        0,
    [yearContent],
  );

  // If no structured content and no milestone, nothing to render
  if (!milestone && !hasStructured) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={milestone?.year ?? 'year-card'}
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-2 sm:p-4 md:p-6 bg-black/30 backdrop-blur-md overflow-hidden"
        onClick={onClose}
      >
        <motion.div
          variants={cardVariants}
          onClick={(e) => e.stopPropagation()}
          className="neu-card w-full sm:max-w-2xl lg:max-w-3xl py-4 sm:py-6 md:py-7 pl-4 pr-6 sm:pl-6 sm:pr-8 md:pl-7 md:pr-9 max-h-[92vh] sm:max-h-[88vh] overflow-y-auto relative scrollbar-thin"
          style={{ scrollbarGutter: 'stable' }}
        >
          {/* Top accent ribbon — era color fades across the top */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${eraColor ?? '#8B2C2C'} 50%, transparent 100%)`,
            }}
          />

          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-5 gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className="font-display font-light year-button leading-none"
                  style={{
                    color: 'var(--maroon-500)',
                    fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                  }}
                >
                  {year}
                </span>
                {eraColor && milestone?.tags?.[0] && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(0,0,0,0.04)',
                      color: eraColor,
                    }}
                  >
                    {milestone.tags[0]}
                  </span>
                )}
                <span className="text-[10px] text-neu-muted">
                  {yearIndex + 1} / {totalYears}
                </span>
              </div>
              {milestone?.title && (
                <h3
                  className="font-display font-light text-neu-text leading-tight"
                  style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.4rem)' }}
                >
                  {milestone.title}
                </h3>
              )}
              {milestone?.author && (
                <p className="text-neu-muted mt-0.5 text-xs">{milestone.author}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="neu-pill w-9 h-9 flex items-center justify-center text-sm text-neu-muted hover:text-maroon flex-shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* View toggle — only if BOTH views have content (milestone + structured) */}
          {milestone?.title && hasStructured && (
            <div className="flex gap-1 mb-4 neu-card-pressed p-1 rounded-full w-fit">
              <button
                onClick={() => setView('structured')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  view === 'structured'
                    ? 'neu-card text-maroon'
                    : 'text-neu-muted'
                }`}
              >
                Year in Review
              </button>
              <button
                onClick={() => setView('milestone')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  view === 'milestone'
                    ? 'neu-card text-maroon'
                    : 'text-neu-muted'
                }`}
              >
                Original Milestone
              </button>
            </div>
          )}

          {/* Body */}
          <div className="space-y-5">
            {view === 'structured' && hasStructured ? (
              <>
                <Section
                  index={0}
                  number="1."
                  title="Top CS / Advanced Tech of the Year"
                  accent="var(--maroon-500)"
                  bullets={yearContent!.cs_highlights}
                  fallback="No major CS tech recorded for this year."
                  onCitations={collectCitations}
                />
                <Section
                  index={1}
                  number="2."
                  title="NLP Highlights"
                  accent="var(--maroon-500)"
                  bullets={undefined}
                />
                {/* Nested 2a / 2b — sub-headings, no big numbers */}
                <div className="pl-6 sm:pl-8 space-y-4">
                  <Section
                    index={2}
                    title="Research"
                    accent="var(--maroon-500)"
                    bullets={yearContent!.nlp_research}
                    fallback="Few public NLP research breakthroughs recorded for this year."
                    variant="sub"
                    onCitations={collectCitations}
                  />
                  <Section
                    index={3}
                    title="Applications"
                    accent="var(--maroon-500)"
                    bullets={yearContent!.nlp_applications}
                    fallback="No major NLP applications or deployed systems recorded for this year."
                    variant="sub"
                    onCitations={collectCitations}
                  />
                </div>
                <Section
                  index={4}
                  number="3."
                  title="Extras & Notable Context"
                  accent="var(--maroon-500)"
                  bullets={yearContent!.extras}
                  onCitations={collectCitations}
                />
              </>
            ) : milestone ? (
              <>
                <div>
                  <h4 className="text-[11px] font-semibold text-neu-text uppercase tracking-wider mb-1.5">
                    Summary
                  </h4>
                  <p className="text-neu-text leading-relaxed text-sm">{milestone.summary}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-neu-text uppercase tracking-wider mb-1.5">
                    Why it mattered
                  </h4>
                  <p className="text-neu-text leading-relaxed text-sm">
                    {milestone.why_it_mattered}
                  </p>
                </div>
                {milestone.tags?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-neu-text uppercase tracking-wider mb-1.5">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {milestone.tags.map((t) => (
                        <span key={t} className="neu-tag text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* References — collected from the body text. Citations
             (Wikipedia / arXiv / etc.) detected in bullet text are
             shown here, inlined with the milestone's primary links
             (filtered to year-specific entries only). */}
          {((citations.length > 0) || (milestone?.links && milestone.links.length > 0)) && (() => {
            const filteredMilestoneLinks = milestone?.links
              ? filterLinksForYear(milestone.links, milestone.year)
              : [];
            // Combine collected citations + milestone primary links
            const seen = new Set<string>();
            const items: { label: string; url?: string }[] = [];
            for (const c of citations) {
              const key = c.toLowerCase();
              if (!seen.has(key)) {
                seen.add(key);
                items.push({ label: c });
              }
            }
            for (const l of filteredMilestoneLinks) {
              const key = l.label.toLowerCase();
              if (!seen.has(key)) {
                seen.add(key);
                items.push({ label: l.label, url: l.url });
              }
            }
            if (items.length === 0) return null;
            return (
              <div className="mt-5 pt-4 border-t border-neu-dark/20">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neu-muted mb-2">
                  References{' '}
                  <span className="text-neu-text font-normal">
                    ({items.length})
                  </span>
                </h4>
                <div className="flex flex-col gap-1.5">
                  {items.map((it, i) => (
                    it.url ? (
                      <a
                        key={i}
                        href={it.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neu-link w-fit text-[11px]"
                      >
                        <span>↗</span>
                        <span>{it.label}</span>
                      </a>
                    ) : (
                      <span
                        key={i}
                        className="text-[11px] text-neu-muted italic"
                      >
                        {it.label}
                      </span>
                    )
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Footer navigation */}
          <div className="flex justify-between gap-2 pt-4 mt-5 border-t border-neu-dark/20">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onPrev}
              className="neu-pill px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5"
            >
              ← Previous
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
              className="neu-pill px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5"
            >
              Next →
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
