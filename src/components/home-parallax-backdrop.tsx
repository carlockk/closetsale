"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HomeParallaxBackdropProps = {
  imageUrl: string;
};

export function HomeParallaxBackdrop({ imageUrl }: HomeParallaxBackdropProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame = 0;

    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setOffset(window.scrollY * 0.18);
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-[-8%] scale-110"
        style={{ transform: `translate3d(0, ${offset}px, 0) scale(1.12)` }}
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover blur-2xl saturate-[0.8]"
        />
      </div>
      <div className="absolute inset-0 bg-[rgba(248,244,237,0.72)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.18),rgba(248,244,237,0.82))]" />
    </div>
  );
}
