'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false, loading: () => null });

const supportsWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

/** CSS glow + grid always render; the Three.js orb loads lazily after idle when WebGL is available. */
export function HeroBackground() {
  const [show3d, setShow3d] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !supportsWebGL()) return;
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (ric) ric(() => setShow3d(true));
    else setTimeout(() => setShow3d(true), 300);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute top-[-10%] left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-violet/25 blur-[140px]" />
      <div className="absolute top-[30%] right-[-10%] h-[400px] w-[500px] rounded-full bg-cyan/10 blur-[120px]" />
      <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${show3d ? 'opacity-100' : 'opacity-0'}`}>
        {show3d && <HeroScene />}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink-950 to-transparent" />
    </div>
  );
}
