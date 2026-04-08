"use client";

import { Heart } from "lucide-react";

import { useFavoriteStore } from "@/components/store/store";
import { cn } from "@/lib/utils";

export function FavoriteToggle({ productId }: { productId: string }) {
  const favorites = useFavoriteStore((state) => state.items);
  const toggle = useFavoriteStore((state) => state.toggle);
  const active = favorites.includes(productId);

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      className={cn(
        "border p-2 backdrop-blur transition",
        active
          ? "border-stone-950 bg-stone-950 text-white"
          : "border-white/70 bg-white/80 text-stone-800",
      )}
      aria-label="Favorito"
    >
      <Heart className="h-4 w-4" fill={active ? "currentColor" : "none"} />
    </button>
  );
}
