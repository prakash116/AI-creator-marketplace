'use client';

import type { PortfolioItem } from '@/types';
import { formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Box, Eye, Film, Heart, Image as ImageIcon, Play, Sparkles, Wand2 } from 'lucide-react';
import { Badge } from './Badge';
import { SmartImage } from './SmartImage';

export const contentIcon = {
  Video: Film,
  Image: ImageIcon,
  Animation: Sparkles,
  '3D': Box,
  'Motion Graphics': Wand2,
} as const;

export function PortfolioCard({
  item,
  onOpen,
  tall = false,
  showMeta = true,
  creatorName,
}: {
  item: PortfolioItem;
  onOpen?: (item: PortfolioItem) => void;
  tall?: boolean;
  showMeta?: boolean;
  creatorName?: string;
}) {
  const Icon = contentIcon[item.contentType] ?? ImageIcon;
  const isMotion = item.contentType === 'Video' || item.contentType === 'Animation';
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      onClick={() => onOpen?.(item)}
      className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-line bg-card text-left"
    >
      <div className={`relative overflow-hidden ${tall ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <SmartImage src={item.thumbnail} alt={item.title} className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
        <div className="absolute top-3 left-3">
          <Badge className="border-white/15 bg-black/50 text-white backdrop-blur">
            <Icon className="h-3 w-3" /> {item.contentType}
          </Badge>
        </div>
        {isMotion && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
              <Play className="ml-0.5 h-5 w-5 fill-white" />
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-semibold">{item.title}</h3>
          {creatorName && <p className="text-xs text-zinc-300">by {creatorName}</p>}
          {showMeta && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {item.tools.map((t) => (
                <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-zinc-200 backdrop-blur">
                  {t}
                </span>
              ))}
              <span className="ml-auto flex items-center gap-3 text-[11px] text-zinc-300">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {formatNumber(item.views)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" /> {formatNumber(item.likes)}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
