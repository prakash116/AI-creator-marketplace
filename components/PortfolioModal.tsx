'use client';

import type { PortfolioItem } from '@/types';
import { formatDate, formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Calendar, Eye, Heart } from 'lucide-react';
import { Badge } from './Badge';
import { Modal } from './Modal';
import { contentIcon } from './PortfolioCard';
import { SmartImage } from './SmartImage';

export function PortfolioModal({ item, onClose, creatorName }: { item: PortfolioItem | null; onClose: () => void; creatorName?: string }) {
  const Icon = item ? contentIcon[item.contentType] : null;
  return (
    <Modal open={!!item} onClose={onClose} maxWidth="max-w-4xl">
      {item && Icon && (
        <div>
          <motion.div initial={{ scale: 1.04, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="relative aspect-video overflow-hidden bg-black">
            <SmartImage src={item.mediaUrl} alt={item.title} className="h-full w-full" />
          </motion.div>
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_220px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="violet">
                  <Icon className="h-3 w-3" /> {item.contentType}
                </Badge>
                {item.tags.map((t) => (
                  <Badge key={t}>#{t}</Badge>
                ))}
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">{item.title}</h3>
              {creatorName && <p className="text-sm text-muted">by {creatorName}</p>}
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.description}</p>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="label">Tools used</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tools.map((t) => (
                    <Badge key={t} tone="cyan">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 text-muted">
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> {formatNumber(item.views)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4" /> {formatNumber(item.likes)}
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-muted">
                <Calendar className="h-4 w-4" /> {formatDate(item.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
