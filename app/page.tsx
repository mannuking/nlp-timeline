'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import timelineData from '@/data/timeline.json';

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

// ---- Glossary terms (referenced from cards) ----
const GLOSSARY: Record<string, string> = {
  RNN: 'Recurrent Neural Network — processes sequences step-by-step, maintaining a hidden state.',
  LSTM: 'Long Short-Term Memory — RNN variant with gating that handles long-range dependencies.',
  'word2vec': '2013 method to learn dense word vectors from raw text (Mikolov et al., Google).',
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
function NeuCard({ children, className = '', active = false }: { children: React.ReactNode; className?: string; active?: boolean }) {
  return <div className={`${active ? 'neu-card-pressed' : 'neu-card'} ${className}`}>{children}</div>;
}

function NeuPill({ children, onClick, active = false, className = '' }: {
  children: React.ReactNode; onClick?: () => void; active?: boolean; className?: string;
}) {
  return (
    <button onClick={onClick} className={`${active ? 'neu-pill-active' : 'neu-pill'} ${className} px-5 py-2.5 text-sm font-medium tracking-wide transition-all`}>
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

// ---- Page ----
export default function Home() {
  const data = timelineData as Data;
  const [activeEra, setActiveEra] = useState<string | 'all'>('all');
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [presenterMode, setPresenterMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const timelineRef = useRef<HTMLDivElement>(null);

  // Filter milestones based on era + search
  const filteredEras = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.eras.map((era) => ({
      ...era,
      milestones: era.milestones.filter((m) => {
        if (activeEra !== 'all' && era.id !== activeEra) return false;
        if (!q) return true;
        return (
          m.title.toLowerCase().includes(q) ||
          m.author.toLowerCase().includes(q) ||
          m.summary.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
        );
      }),
    })).filter((era) => era.milestones.length > 0);
  }, [data.eras, activeEra, searchQuery]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPresenterMode((p) => !p);
      }
      if (e.key === 'Escape' && presenterMode) {
        setPresenterMode(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [presenterMode]);

  // Click milestone → open detail card
  const openMilestone = (m: Milestone) => {
    setActiveMilestone(m);
  };

  return (
    <main className="min-h-screen pb-32">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="neu-tag">{data.meta.assignment}</span>
            <span className="neu-tag">{data.meta.course}</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-neu-text leading-tight mb-4">
            {data.meta.title}
          </h1>
          <p className="text-xl text-neu-muted max-w-3xl mb-8">{data.meta.subtitle}</p>

          <div className="flex flex-wrap gap-3 items-center text-sm text-neu-muted">
            <span>{data.meta.institution}</span>
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
            {/* Era filter */}
            <div className="flex flex-wrap gap-2">
              <NeuPill active={activeEra === 'all'} onClick={() => setActiveEra('all')}>
                All Eras
              </NeuPill>
              {data.eras.map((era) => (
                <EraPill key={era.id} era={era} active={activeEra === era.id} onClick={() => setActiveEra(era.id)} />
              ))}
            </div>

            {/* Search */}
            <div className="md:ml-auto flex-1 max-w-xs">
              <input
                className="neu-input w-full"
                placeholder="Search milestones, authors, tags…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Presenter toggle */}
            <button
              onClick={() => setPresenterMode(!presenterMode)}
              className={`${presenterMode ? 'neu-card-pressed' : 'neu-card'} px-4 py-2 text-sm font-medium`}
              title="Cmd/Ctrl + P"
            >
              {presenterMode ? '✕ Exit Presenter' : '⛶ Presenter Mode'}
            </button>
          </div>
        </NeuCard>
      </section>

      {/* TIMELINE TRACK */}
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

            {/* Timeline track with nodes */}
            <div className="relative overflow-x-auto pb-8">
              <div className="flex items-center gap-2 min-w-max px-2">
                {era.milestones.map((m, i) => {
                  const isActive = activeMilestone?.title === m.title && activeMilestone?.year === m.year;
                  return (
                    <div key={`${m.year}-${m.title}`} className="flex items-center">
                      <motion.button
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        onClick={() => openMilestone(m)}
                        className={`neu-node ${isActive ? 'neu-node-active' : ''}`}
                        style={isActive ? { color: era.color } : {}}
                        title={`${m.year} — ${m.title}`}
                      >
                        {String(m.year).slice(-2)}
                      </motion.button>
                      {i < era.milestones.length - 1 && (
                        <div className="w-12 h-1 mx-1 rounded-full" style={{ background: '#D5DCE5' }} />
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

      {/* MILESTONE DETAIL CARD */}
      <AnimatePresence>
        {activeMilestone && !presenterMode && (
          <motion.section
            key={`${activeMilestone.year}-${activeMilestone.title}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex items-end md:items-center justify-center p-4 md:p-8 bg-black/20 backdrop-blur-sm"
            onClick={() => setActiveMilestone(null)}
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              className="neu-card max-w-3xl w-full p-8 md:p-10 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-neu-muted text-sm font-medium mb-1">{activeMilestone.year}</div>
                  <h3 className="font-display text-3xl md:text-4xl font-bold text-neu-text mb-2">
                    {activeMilestone.title}
                  </h3>
                  <p className="text-neu-muted">{activeMilestone.author}</p>
                </div>
                <button
                  onClick={() => setActiveMilestone(null)}
                  className="neu-pill w-10 h-10 flex items-center justify-center text-neu-muted hover:text-neu-text flex-shrink-0"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-neu-text uppercase tracking-wider mb-2">Summary</h4>
                  <p className="text-neu-text leading-relaxed">{activeMilestone.summary}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neu-text uppercase tracking-wider mb-2">Why it mattered</h4>
                  <p className="text-neu-text leading-relaxed">{activeMilestone.why_it_mattered}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neu-text uppercase tracking-wider mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeMilestone.tags.map((t) => (
                      <GlossaryChip key={t} term={t} />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neu-text uppercase tracking-wider mb-2">References</h4>
                  <div className="flex flex-col gap-2">
                    {activeMilestone.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="neu-link w-fit">
                        <span>↗</span>
                        <span>{l.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* PRESENTER MODE */}
      <AnimatePresence>
        {presenterMode && activeMilestone && (
          <motion.div
            key="presenter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-12"
            style={{ background: '#E0E5EC' }}
          >
            <div className="max-w-5xl w-full">
              <div className="text-neu-muted text-2xl font-medium mb-4">{activeMilestone.year}</div>
              <h2 className="font-display text-7xl font-bold text-neu-text mb-6">{activeMilestone.title}</h2>
              <p className="text-3xl text-neu-muted mb-12">{activeMilestone.author}</p>
              <p className="text-2xl text-neu-text leading-relaxed mb-8">{activeMilestone.summary}</p>
              <div className="text-xl text-neu-muted italic">"{activeMilestone.why_it_mattered}"</div>
              <div className="fixed bottom-12 right-12 text-neu-muted text-sm">Press Esc to exit</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-6 mt-20 pb-12">
        <NeuCard className="p-6 text-center text-neu-muted text-sm">
          <p>{data.meta.assignment} · {data.meta.course} · {data.meta.institution}</p>
          <p className="mt-1">Built with Next.js + Framer Motion + neumorphic CSS. Data sourced from Wikipedia &amp; arXiv primary papers.</p>
          <p className="mt-1">{data.meta.student} · {data.meta.instructor}</p>
        </NeuCard>
      </footer>
    </main>
  );
}