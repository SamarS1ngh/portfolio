"use client";

import { useState } from "react";

export function Decrypt({ id, text }: { id: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/55 transition-colors hover:text-amber-300"
      >
        {open ? "▾ collapse" : "▸ decrypt full log"}
      </button>
      <div
        id={id}
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pt-3 font-sans text-[15px] leading-relaxed text-bone/80">{text}</p>
        </div>
      </div>
    </div>
  );
}
