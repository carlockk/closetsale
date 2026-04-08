"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type Slide = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  href: string | null;
};

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrent((value) => (value + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative z-0 overflow-hidden bg-stone-900">
      <div className="relative min-h-[560px] md:min-h-[720px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              index === current
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-[1.035] opacity-0"
            }`}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/30 to-transparent" />
            <div className="relative z-10 flex min-h-[560px] items-end md:min-h-[720px]">
              <div className="max-w-2xl px-6 py-12 text-white md:px-16 md:py-20">
                <p className="text-xs uppercase tracking-[0.4em] text-stone-300">
                  Seleccion curada
                </p>
                <h1 className="mt-4 font-serif text-4xl md:text-6xl">{slide.title}</h1>
                {slide.subtitle ? (
                  <p className="mt-4 max-w-xl text-base text-stone-200 md:text-lg">
                    {slide.subtitle}
                  </p>
                ) : null}
                <div className="mt-8">
                  <Link
                    href={slide.href || "/products"}
                    className="inline-flex rounded-full bg-[#d5b26f] px-6 py-3 text-sm font-medium uppercase tracking-[0.25em] text-stone-950 transition hover:bg-[#e3c78f]"
                  >
                    Ver coleccion
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => setCurrent((value) => (value - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-3 text-stone-900 backdrop-blur hover:bg-white md:left-6"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrent((value) => (value + 1) % slides.length)}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-3 text-stone-900 backdrop-blur hover:bg-white md:right-6"
            aria-label="Siguiente slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <div className="absolute bottom-6 right-6 z-20 flex gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrent(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === current ? "w-10 bg-white" : "w-2.5 bg-white/50"
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
