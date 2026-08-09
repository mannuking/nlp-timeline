import type { Metadata } from 'next';
import './globals.css';
import FirebaseAnalytics from '@/components/FirebaseAnalytics';

export const metadata: Metadata = {
  title: 'Evolution of NLP — 1950 to 2030',
  description:
    'An interactive timeline of Natural Language Processing history — from the 1950s to the present day. Built for the Introduction to NLP course, Delhi Technological University.',
  keywords: [
    'NLP',
    'Natural Language Processing',
    'AI history',
    'machine learning',
    'computational linguistics',
    'DTU',
    'Delhi Technological University',
    'timeline',
    'AI timeline',
  ],
  authors: [{ name: 'Jai Kumar Meena' }],
  openGraph: {
    title: 'Evolution of NLP — 1950 to 2030',
    description:
      'An interactive timeline of Natural Language Processing history with curated milestones, research highlights, and applications.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
