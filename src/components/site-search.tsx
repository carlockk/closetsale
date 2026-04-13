"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

type SearchResults = {
  products: Array<{
    id: string;
    title: string;
    slug: string;
    category: { name: string };
  }>;
  pages: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  sellers: Array<{
    id: string;
    storeName: string;
    slug: string;
    _count: {
      products: number;
    };
  }>;
};

const EMPTY_RESULTS: SearchResults = {
  products: [],
  pages: [],
  categories: [],
  sellers: [],
};

export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    inputRef.current?.focus();

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error("No se pudo buscar.");
        }

        setResults({
          products: Array.isArray(data.products) ? data.products : [],
          pages: Array.isArray(data.pages) ? data.pages : [],
          categories: Array.isArray(data.categories) ? data.categories : [],
          sellers: Array.isArray(data.sellers) ? data.sellers : [],
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults(EMPTY_RESULTS);
        }
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [open, query]);

  const hasResults =
    results.products.length > 0 ||
    results.pages.length > 0 ||
    results.categories.length > 0 ||
    results.sellers.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center text-stone-700"
        aria-label="Buscar en la web"
      >
        <Search className="h-5 w-5" />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-[90] mt-4 w-[min(92vw,30rem)] overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-stone-200 px-4 py-3">
            <Search className="h-4 w-4 text-stone-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Busca productos, tiendas, paginas o categorias..."
              className="flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
            />
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-stone-500" />
            ) : query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults(EMPTY_RESULTS);
                  inputRef.current?.focus();
                }}
                className="text-stone-500"
                aria-label="Limpiar busqueda"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="max-h-[65vh] overflow-y-auto px-4 py-4">
            {query.trim().length < 2 ? (
              <p className="text-sm text-stone-500">Escribe al menos 2 letras para buscar.</p>
            ) : null}

            {query.trim().length >= 2 && !loading && !hasResults ? (
              <p className="text-sm text-stone-500">No encontre resultados para tu busqueda.</p>
            ) : null}

            {results.products.length > 0 ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">Productos</p>
                <div className="mt-3 space-y-2">
                  {results.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200 transition hover:bg-stone-50"
                    >
                      <p className="text-sm font-medium text-stone-900">{product.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-400">
                        {product.category.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {results.sellers.length > 0 ? (
              <div className={results.products.length > 0 ? "mt-5" : ""}>
                <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">Sellers</p>
                <div className="mt-3 space-y-2">
                  {results.sellers.map((seller) => (
                    <Link
                      key={seller.id}
                      href={`/tienda/${seller.slug}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200 transition hover:bg-stone-50"
                    >
                      <p className="text-sm font-medium text-stone-900">{seller.storeName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-400">
                        {seller._count.products} productos
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {results.pages.length > 0 ? (
              <div className={results.products.length > 0 || results.sellers.length > 0 ? "mt-5" : ""}>
                <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">Paginas</p>
                <div className="mt-3 space-y-2">
                  {results.pages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/pages/${page.slug}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200 transition hover:bg-stone-50"
                    >
                      <p className="text-sm font-medium text-stone-900">{page.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-400">
                        Pagina
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {results.categories.length > 0 ? (
              <div className={results.products.length > 0 || results.sellers.length > 0 || results.pages.length > 0 ? "mt-5" : ""}>
                <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">Categorias</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {results.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-full bg-white px-4 py-2 text-sm text-stone-700 ring-1 ring-stone-200 transition hover:bg-stone-50"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
