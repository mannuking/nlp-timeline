'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import timelineData from '@/data/timeline.json';
import yearContentData from '@/data/year-content.json';
import YearCard, { type YearContent } from '@/components/YearCard';

// ---- Types ----
type Link = { label: string; url: string };
type Milestone = {
  year: number;
  title: string;
  author: string;
  summary: string;
  why_it_mattered: string;
  links: Link[];
  tags: string[];
};
type Era = {
  id: string;
  label: string;
  years: string;
  color: string;
  summary: string;
  milestones: Milestone[];
};
type Data = {
  meta: {
    title: string;
    subtitle: string;
    assignment: string;
    course: string;
    institution: string;
    instructor: string;
    student: string;
  };
  eras: Era[];
};

// ---- Glossary terms ----
const GLOSSARY: Record<string, string> = {
  RNN: 'Recurrent Neural Network — processes sequences step-by-step, maintaining a hidden state.',
  LSTM: 'Long Short-Term Memory — RNN variant with gating that handles long-range dependencies.',
  word2vec: '2013 method to learn dense word vectors from raw text (Mikolov et al., Google).',
  seq2seq: 'Encoder-decoder neural architecture for sequence-to-sequence tasks (translation, summarization).',
  attention: 'Mechanism that lets a model focus on relevant parts of the input; foundation of transformers.',
  transformer: 'Architecture using stacked self-attention; introduced in "Attention Is All You Need" (2017).',
  RLHF: 'Reinforcement Learning from Human Feedback — alignment technique that powers ChatGPT.',
  BERT: 'Bidirectional Encoder Representations from Transformers (Google, 2018).',
  GPT: 'Generative Pre-trained Transformer — decoder-only LLM series from OpenAI (2018-).',
  MoE: 'Mixture of Experts — sparse model architecture where only some parameters activate per input.',
  NMT: 'Neural Machine Translation — translation systems built on neural networks (vs phrase-based SMT).',
  'in-context learning': 'Ability of a large LLM to perform a new task from examples in its prompt without weight updates.',
  embedding: 'A dense vector representation of a discrete item (word, sentence, image).',
  corpus: 'A large structured collection of texts used for training or evaluation.',
  'n-gram': 'A contiguous sequence of n items from a text; used in classical language models.',
};

function tooltip(term: string): string {
  return GLOSSARY[term] || `${term} — see the cards for context.`;
}

// ---- Components ----
function NeuCard({ children, className = '', active = false, accent = false }: {
  children: React.ReactNode; className?: string; active?: boolean; accent?: boolean;
}) {
  const base = accent ? 'neu-card-accent' : active ? 'neu-card-pressed' : 'neu-card';
  return <div className={`${base} ${className}`}>{children}</div>;
}

function NeuPill({ children, onClick, active = false, className = '', accent = false }: {
  children: React.ReactNode; onClick?: () => void; active?: boolean; className?: string; accent?: boolean;
}) {
  const base = active ? 'neu-pill-active' : 'neu-pill';
  const colorStyle = accent ? { color: 'var(--maroon-500)', fontWeight: 600 } : {};
  return (
    <button onClick={onClick} className={`${base} ${className} px-5 py-2.5 text-sm tracking-wide transition-all`} style={colorStyle}>
      {children}
    </button>
  );
}

function EraPill({ era, active, onClick }: { era: Era; active: boolean; onClick: () => void }) {
  return (
    <NeuPill active={active} onClick={onClick}>
      <span className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: era.color }} />
        <span>{era.label}</span>
        <span className="text-neu-muted text-xs">· {era.years}</span>
      </span>
    </NeuPill>
  );
}

function GlossaryChip({ term }: { term: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="neu-tag hover:text-neu-text transition-colors"
      >
        {term}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 neu-card px-4 py-2.5 text-xs text-neu-text w-56 text-left leading-relaxed"
          >
            {tooltip(term)}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

// Helper to open a year from a milestone node
function openYear(setter: (y: number | null) => void, m: Milestone) {
  setter(m.year);
}

// ---- Page ----
export default function Home() {
  const data = timelineData as Data;
  const [activeEra, setActiveEra] = useState<string | 'all'>('all');
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [presenterMode, setPresenterMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const timelineRef = useRef<HTMLDivElement>(null);

  // Year-content map (1950-2030) — built from data/year-content.json
  const yearContentMap = useMemo<Record<number, YearContent>>(() => {
    const raw = (yearContentData as unknown) as Record<string, YearContent>;
    const out: Record<number, YearContent> = {};
    for (const [k, v] of Object.entries(raw)) {
      const y = parseInt(k, 10);
      if (!isNaN(y)) out[y] = v;
    }
    return out;
  }, []);

  // Every year from 1950 to 2030
  const allYears = useMemo<number[]>(() => {
    const out: number[] = [];
    for (let y = 1950; y <= 2030; y++) out.push(y);
    return out;
  }, []);

  // Resolve milestone + era for active year
  const activeMilestoneData = useMemo<{
    milestone: Milestone | null;
    era: Era | null;
  }>(() => {
    if (activeYear === null) return { milestone: null, era: null };
    for (const era of data.eras) {
      const found = era.milestones.find((m) => m.year === activeYear);
      if (found) return { milestone: found, era };
    }
    return {
      milestone: {
        year: activeYear,
        title: '',
        author: '',
        summary: '',
        why_it_mattered: '',
        links: [],
        tags: [],
      },
      era: null,
    };
  }, [activeYear, data.eras]);

  // Filtered eras (for the timeline track) — by era + search
  const filteredEras = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.eras.map((era) => ({
      ...era,
      milestones: era.milestones.filter((m) => {
        if (activeEra !== 'all' && era.id !== activeEra) return false;
        if (!q) return true;
        const yc = yearContentMap[m.year];
        const haystack = [
          m.title, m.author, m.summary,
          (yc?.cs_highlights ?? []).join(' '),
          (yc?.nlp_research ?? []).join(' '),
          (yc?.nlp_applications ?? []).join(' '),
          (yc?.extras ?? []).join(' '),
        ].join(' ').toLowerCase();
        return haystack.includes(q);
      }),
    })).filter((era) => era.milestones.length > 0);
  }, [data.eras, activeEra, searchQuery, yearContentMap]);

  // Flat list of years that pass search + era filter (every year 1950-2030, not just milestones)
  const flatYears = useMemo<number[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    const out: number[] = [];
    for (const y of allYears) {
      // Era filter
      if (activeEra !== 'all') {
        const eraForYear = data.eras.find((era) =>
          era.milestones.some((m) => m.year === y),
        );
        if (eraForYear && eraForYear.id !== activeEra) continue;
      }
      // Search filter
      if (q) {
        const milestone = data.eras.flatMap((era) => era.milestones).find((m) => m.year === y);
        const yc = yearContentMap[y];
        const haystack = [
          milestone?.title ?? '',
          milestone?.author ?? '',
          milestone?.summary ?? '',
          (yc?.cs_highlights ?? []).join(' '),
          (yc?.nlp_research ?? []).join(' '),
          (yc?.nlp_applications ?? []).join(' '),
          (yc?.extras ?? []).join(' '),
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) continue;
      }
      out.push(y);
    }
    return out;
  }, [allYears, activeEra, searchQuery, yearContentMap, data.eras]);

  // Year nav
  const navYear = useCallback((direction: 1 | -1) => {
    if (flatYears.length === 0) return;
    if (activeYear === null) {
      setActiveYear(flatYears[0]);
      return;
    }
    const idx = flatYears.indexOf(activeYear);
    if (idx === -1) {
      setActiveYear(flatYears[0]);
      return;
    }
    const nextIdx = (idx + direction + flatYears.length) % flatYears.length;
    setActiveYear(flatYears[nextIdx]);
  }, [flatYears, activeYear]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPresenterMode((p) => !p);
        return;
      }
      if (e.key === 'Escape') {
        if (presenterMode) {
          setPresenterMode(false);
        } else if (activeYear !== null) {
          setActiveYear(null);
        }
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        if (activeYear === null) {
          setActiveYear(flatYears[0] ?? null);
        } else {
          navYear(1);
        }
      }
      if (e.key === 'ArrowLeft' || e.key === 'h') {
        e.preventDefault();
        if (activeYear !== null) navYear(-1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [presenterMode, activeYear, flatYears, navYear]);

  return (
    <main className="min-h-screen pb-32">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <div className="absolute inset-0 hero-dots pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="neu-tag-maroon">{data.meta.assignment}</span>
            <span className="neu-tag">{data.meta.course}</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-neu-text leading-tight mb-4">
            {data.meta.title}
          </h1>
          <p className="text-xl text-neu-muted max-w-3xl mb-8">{data.meta.subtitle}</p>

          <div className="flex flex-wrap gap-3 items-center text-sm text-neu-muted">
            <span className="text-maroon font-medium">{data.meta.institution}</span>
            <span>·</span>
            <span>{data.meta.instructor}</span>
            <span>·</span>
            <span>{data.meta.student}</span>
          </div>
        </motion.div>
      </section>

      {/* CONTROLS */}
      <section className="max-w-6xl mx-auto px-6 mb-12">
        <NeuCard className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <NeuPill active={activeEra === 'all'} onClick={() => setActiveEra('all')} accent={activeEra === 'all'}>
                All Eras
              </NeuPill>
              {data.eras.map((era) => (
                <EraPill key={era.id} era={era} active={activeEra === era.id} onClick={() => setActiveEra(era.id)} />
              ))}
            </div>

            <div className="md:ml-auto flex-1 max-w-xs">
              <input
                className="neu-input w-full"
                placeholder="Search milestones, year content…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setPresenterMode(!presenterMode)}
              className={`${presenterMode ? 'neu-card-pressed' : 'neu-card'} px-4 py-2 text-sm font-medium`}
              title="⌘/Ctrl + P"
              style={presenterMode ? { color: 'var(--maroon-500)' } : {}}
            >
              {presenterMode ? '✕ Exit Presenter' : '⛶ Presenter Mode'}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 items-center text-xs text-neu-muted">
            <span className="neu-tag">← / →  navigate years</span>
            <span className="neu-tag">Esc  exit</span>
            <span className="neu-tag">⌘/Ctrl + P  presenter</span>
          </div>
        </NeuCard>
      </section>

      {/* TIMELINE TRACK — milestone years as clickable nodes */}
      <section className="max-w-6xl mx-auto px-6 mb-12" ref={timelineRef}>
        {filteredEras.map((era) => (
          <motion.div
            key={era.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-14"
          >
            <div className="flex items-baseline justify-between mb-4 px-2">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-neu-text flex items-center gap-3">
                <span className="w-4 h-4 rounded-full" style={{ background: era.color }} />
                {era.label}
              </h2>
              <span className="text-neu-muted font-medium">{era.years}</span>
            </div>
            <p className="text-neu-muted mb-8 max-w-3xl">{era.summary}</p>

            <div className="relative overflow-x-auto pb-8">
              <div className="flex items-center gap-3 min-w-max px-2">
                {era.milestones.map((m, i) => {
                  const isActive = activeYear === m.year;
                  return (
                    <div key={`${m.year}-${m.title}`} className="flex items-center">
                      <motion.button
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        onClick={() => openYear(setActiveYear, m)}
                        className={`neu-node year-button ${isActive ? 'neu-node-active' : ''}`}
                        style={isActive ? { color: 'var(--maroon-500)' } : {}}
                        title={`${m.year} — ${m.title}`}
                      >
                        {m.year}
                      </motion.button>
                      {i < era.milestones.length - 1 && (
                        <div className="w-10 h-1 mx-1 rounded-full neu-track" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}

        {filteredEras.length === 0 && (
          <div className="text-center text-neu-muted py-16">
            No milestones match your search.
          </div>
        )}
      </section>

      {/* ALL-YEARS BROWSER — clickable year chips for the 81 years */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <NeuCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-neu-text">
              Browse every year, 1950 – 2030
            </h3>
            <span className="text-xs text-neu-muted">
              {flatYears.length} / 81 years
            </span>
          </div>
          <p className="text-sm text-neu-muted mb-5">
            Click any year to open its card — top CS tech, NLP research breakthroughs, NLP applications, and extras.
          </p>
          <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-2">
            {allYears.map((y) => {
              const isActive = activeYear === y;
              const inEra = data.eras.find((era) =>
                era.milestones.some((m) => m.year === y),
              );
              const inFilter = flatYears.includes(y);
              return (
                <motion.button
                  key={y}
                  whileHover={inFilter ? { scale: 1.05, y: -2 } : {}}
                  whileTap={inFilter ? { scale: 0.95 } : {}}
                  onClick={() => inFilter && setActiveYear(y)}
                  disabled={!inFilter}
                  className={`year-button px-3.5 py-2 text-xs font-semibold rounded-full transition-all ${
                    isActive
                      ? 'neu-pill-active'
                      : inFilter
                      ? 'neu-pill hover:text-maroon'
                      : 'neu-pill opacity-30 cursor-not-allowed'
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
        </NeuCard>
      </section>

      {/* YEAR DETAIL CARD — beautiful 3-section view */}
      {activeYear !== null && !presenterMode && (
        <YearCard
          milestone={activeMilestoneData.milestone?.title ? activeMilestoneData.milestone : null}
          yearContent={yearContentMap[activeYear]}
          eraColor={activeMilestoneData.era?.color}
          yearIndex={flatYears.indexOf(activeYear)}
          totalYears={flatYears.length}
          onClose={() => setActiveYear(null)}
          onPrev={() => navYear(-1)}
          onNext={() => navYear(1)}
        />
      )}

      {/* PRESENTER MODE */}
      <AnimatePresence>
        {presenterMode && activeYear !== null && (
          <motion.div
            key="presenter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-12"
            style={{ background: '#E0E5EC' }}
          >
            <div className="max-w-5xl w-full">
              <div className="flex items-center gap-3 mb-4">
                <span className="neu-tag-maroon year-button">{activeYear}</span>
                {activeMilestoneData.era && (
                  <span className="neu-tag" style={{ color: activeMilestoneData.era.color, fontWeight: 600 }}>
                    {activeMilestoneData.era.label}
                  </span>
                )}
              </div>
              <h2 className="font-display text-7xl font-bold text-neu-text mb-6">
                {activeMilestoneData.milestone?.title || `${activeYear} in NLP`}
              </h2>
              {activeMilestoneData.milestone?.author && (
                <p className="text-3xl text-neu-muted mb-12">{activeMilestoneData.milestone.author}</p>
              )}
              {activeMilestoneData.milestone?.summary && (
                <p className="text-2xl text-neu-text leading-relaxed mb-8">
                  {activeMilestoneData.milestone.summary}
                </p>
              )}
              {activeMilestoneData.milestone?.why_it_mattered && (
                <div className="text-xl text-neu-muted italic font-serif">
                  &ldquo;{activeMilestoneData.milestone.why_it_mattered}&rdquo;
                </div>
              )}
              {yearContentMap[activeYear] && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                  {yearContentMap[activeYear].cs_highlights && (
                    <div className="neu-card-pressed p-4 rounded-2xl">
                      <div className="text-maroon font-bold mb-1">1. CS / Tech</div>
                      <div className="text-sm text-neu-text">
                        {yearContentMap[activeYear].cs_highlights?.length ?? 0} entries
                      </div>
                    </div>
                  )}
                  {yearContentMap[activeYear].nlp_research && (
                    <div className="neu-card-pressed p-4 rounded-2xl">
                      <div className="text-maroon font-bold mb-1">2a. NLP Research</div>
                      <div className="text-sm text-neu-text">
                        {yearContentMap[activeYear].nlp_research?.length ?? 0} entries
                      </div>
                    </div>
                  )}
                  {yearContentMap[activeYear].nlp_applications && (
                    <div className="neu-card-pressed p-4 rounded-2xl">
                      <div className="text-maroon font-bold mb-1">2b. NLP Applications</div>
                      <div className="text-sm text-neu-text">
                        {yearContentMap[activeYear].nlp_applications?.length ?? 0} entries
                      </div>
                    </div>
                  )}
                  {yearContentMap[activeYear].extras && (
                    <div className="neu-card-pressed p-4 rounded-2xl">
                      <div className="text-maroon font-bold mb-1">3. Extras</div>
                      <div className="text-sm text-neu-text">
                        {yearContentMap[activeYear].extras?.length ?? 0} entries
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="fixed bottom-12 left-12 right-12 flex justify-between items-center">
                <button
                  onClick={() => navYear(-1)}
                  className="neu-pill w-14 h-14 flex items-center justify-center text-2xl"
                  aria-label="Previous"
                >
                  ←
                </button>
                <div className="text-neu-muted text-sm">
                  ← / → arrow keys · Esc to exit
                </div>
                <button
                  onClick={() => navYear(1)}
                  className="neu-pill w-14 h-14 flex items-center justify-center text-2xl"
                  aria-label="Next"
                >
                  →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-6 mt-20 pb-12">
        <NeuCard className="p-6 text-center text-neu-muted text-sm">
          <p>{data.meta.assignment} · {data.meta.course} · {data.meta.institution}</p>
          <p className="mt-1">
            Built with Next.js + Framer Motion + neumorphic CSS.
            Data sourced from Wikipedia &amp; arXiv primary papers (1950 – 2030).
          </p>
          <p className="mt-1">{data.meta.student} · {data.meta.instructor}</p>
        </NeuCard>
      </footer>
    </main>
  );
}