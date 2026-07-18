"use client";

import { useEffect, useRef } from "react";

/** Client component only because <video> has no HTML attribute for playback rate — needs a ref. */
export function HeroBackgroundVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (v) v.playbackRate = 0.5;
  }, []);

  return (
    <video
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
      src="/hero-bg.mp4"
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
    />
  );
}
