'use client';

import { PORTFOLIO } from '@/data/seed';
import type { Creator } from '@/types';
import { motion } from 'framer-motion';
import { MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { Badge, VerifiedBadge } from './Badge';
import { SmartImage } from './SmartImage';

const availabilityTone = {
  Available: 'bg-success',
  Limited: 'bg-amber-400',
  Booked: 'bg-zinc-500',
} as const;

export function CreatorCard({ creator, index = 0 }: { creator: Creator & { portfolioPreview?: string[] }; index?: number }) {
  const previews =
    creator.portfolioPreview?.length
      ? creator.portfolioPreview
      : PORTFOLIO.filter((p) => p.creatorId === creator.id).map((p) => p.thumbnail);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link
        href={`/creators/${creator.id}`}
        className="surface relative block h-full overflow-hidden transition-colors duration-300 hover:border-purple/30 hover:bg-card-2"
      >
        <div className="grid h-36 grid-cols-3 gap-0.5 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative overflow-hidden bg-card-2">
              {previews[i] && (
                <SmartImage src={previews[i]} alt="" className="h-full w-full transition-transform duration-700 group-hover:scale-110" />
              )}
            </div>
          ))}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-transparent via-transparent to-card group-hover:to-card-2" />
        </div>

        <div className="relative -mt-8 px-5 pb-5">
          <div className="flex items-end justify-between">
            <div className="relative">
              <SmartImage src={creator.avatar} alt={creator.name} className="h-16 w-16 rounded-2xl border-4 border-card group-hover:border-card-2" />
              <span className={`absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${availabilityTone[creator.availability]}`} title={creator.availability} />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{creator.rating.toFixed(1)}</span>
              <span className="text-subtle">({creator.reviews})</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-semibold">{creator.name}</h3>
              {creator.verified && <VerifiedBadge />}
            </div>
            <p className="mt-0.5 text-sm text-purple">{creator.specialization.join(' · ')}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <MapPin className="h-3 w-3" /> {creator.location}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {creator.skills.slice(0, 3).map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <div className="flex flex-wrap gap-1.5">
              {creator.tools.slice(0, 3).map((t) => (
                <Badge key={t} tone="violet">
                  {t}
                </Badge>
              ))}
              {creator.tools.length > 3 && <Badge tone="violet">+{creator.tools.length - 3}</Badge>}
            </div>
            <span className="shrink-0 pl-2 text-xs text-muted">{creator.experience}y exp</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
