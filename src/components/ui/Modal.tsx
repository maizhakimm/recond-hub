"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "./Icons";

/**
 * Accessible modal built on <dialog>: focus is trapped by the browser, Esc closes,
 * focus returns to the trigger on close. Full-height sheet on phones, centred card on desktop.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  dark = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-lg p-0 sm:m-auto sm:max-w-lg sm:rounded-lg ${
        dark ? "bg-night-2 text-[#f1ead9]" : "bg-paper text-ink"
      }`}
    >
      {open && (
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id="modal-title" className="text-2xl">
              {title}
            </h2>
            <button type="button" onClick={onClose} className="-m-2 grid h-11 w-11 place-items-center rounded-full hover:bg-black/5" aria-label="Close">
              <CloseIcon />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
