"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type SellerSideDrawerProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  closeHref?: string;
  onClose?: () => void;
};

export function SellerSideDrawer({
  open,
  title,
  children,
  closeHref,
  onClose,
}: SellerSideDrawerProps) {
  const [shouldRender, setShouldRender] = useState(open);
  const [visible, setVisible] = useState(false);

  function closeDrawer() {
    setVisible(false);

    window.setTimeout(() => {
      if (onClose) {
        onClose();
        return;
      }

      if (closeHref) {
        window.location.href = closeHref;
      }
    }, 220);
  }

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      return;
    }

    setVisible(false);
    const timeout = window.setTimeout(() => {
      setShouldRender(false);
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [shouldRender]);

  if (!shouldRender || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[130] bg-stone-950/45 backdrop-blur-[2px] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button type="button" className="absolute inset-0 h-full w-full" aria-label="Cerrar panel" onClick={closeDrawer} />
      <aside
        className={`absolute right-0 top-0 h-screen w-[96vw] max-w-3xl overflow-hidden border-l border-stone-200 bg-[#f8f5ef] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          visible ? "translate-x-0" : "translate-x-[104%]"
        }`}
      >
        <div className="flex h-full min-w-0 flex-col">
          <div className="flex min-w-0 items-center justify-between gap-4 border-b border-stone-200 px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">Seller</p>
              <h2 className="mt-1 truncate font-serif text-2xl text-stone-950 sm:text-3xl">{title}</h2>
            </div>
            {closeHref ? (
              <Link
                href={closeHref}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-stone-300 text-stone-700 transition hover:bg-stone-900 hover:text-white"
                aria-label="Cerrar panel"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18" />
                </svg>
              </Link>
            ) : (
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-stone-300 text-stone-700 transition hover:bg-stone-900 hover:text-white"
                aria-label="Cerrar panel"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-5">{children}</div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
