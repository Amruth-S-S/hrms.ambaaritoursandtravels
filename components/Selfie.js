"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { fileUrl } from "@/lib/api";
import { Modal } from "./ui";

/** Selfie thumbnail; click to view full size. */
export default function Selfie({ id, label = "Selfie", size = 44 }) {
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);

  if (!id || broken) {
    return (
      <div className="rounded-md bg-mist border border-line flex items-center justify-center text-ink-muted" style={{ width: size, height: size }}>
        <UserRound className="h-4 w-4" aria-label="No selfie" />
      </div>
    );
  }
  const src = fileUrl(id);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-md overflow-hidden border border-line shrink-0" style={{ width: size, height: size }} aria-label={`View ${label}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="h-full w-full object-cover" onError={() => setBroken(true)} loading="lazy" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={label}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="w-full rounded-md" />
      </Modal>
    </>
  );
}
