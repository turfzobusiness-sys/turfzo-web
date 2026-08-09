"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4 w-full">
      {items.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            className="bg-surface/50 border border-border-default hover:border-border-strong rounded-lg overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full text-left font-sans font-semibold text-sm text-text-main px-6 py-4.5 flex items-center justify-between gap-4 focus:outline-none"
            >
              <span className={isOpen ? "text-brand-lime transition-colors" : "text-text-main transition-colors"}>
                {item.question}
              </span>
              <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-brand-lime" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-4 pt-2 text-xs text-text-muted font-sans leading-relaxed border-t border-border-subtle/50">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
