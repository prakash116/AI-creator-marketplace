'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

/** Remote image with a graceful gradient fallback (Cloudinary/Unsplash URLs). */
export function SmartImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (failed || !src) {
    return <div aria-label={alt} className={cn('bg-gradient-to-br from-violet/40 via-ink-850 to-cyan/30', className)} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={cn('bg-card-2 object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', className)}
    />
  );
}
