'use client';

import { PORTFOLIO } from '@/data/seed';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { SmartImage } from './SmartImage';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const tiles = [PORTFOLIO[0], PORTFOLIO[6], PORTFOLIO[3], PORTFOLIO[18]];
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 pt-24 pb-12 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-line bg-ink-900 lg:block">
        <div className="absolute inset-0 grid grid-cols-2 gap-3 p-3 pt-20">
          {tiles.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: i % 2 ? 40 : 0 }}
              transition={{ delay: 0.1 * i, duration: 0.8 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <SmartImage src={t.thumbnail} alt={t.title} className="h-full w-full" />
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/20" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="max-w-md text-2xl font-semibold tracking-tight">“We found our launch-film director in an afternoon. The verification signals made the decision easy.”</p>
          <p className="mt-4 text-sm text-muted">Head of Brand, Volt Motors</p>
        </div>
      </div>
    </div>
  );
}
