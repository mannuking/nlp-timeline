import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Evolution of NLP — 1962 to 2026',
  description: 'An interactive timeline of Natural Language Processing history. Assignment 1, NLP, DTU.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}