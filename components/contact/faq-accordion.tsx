"use client";

import { FaqAnswer } from "components/contact/faq-answer";
import type { FaqSection } from "lib/contact/faq-content";
import { useState } from "react";

type FaqAccordionProps = {
  sections: FaqSection[];
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 512"
      className={`mt-0.5 h-3.5 w-3.5 shrink-0 fill-current transition-transform duration-200 ${
        open ? "rotate-90" : ""
      }`}
    >
      <path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
    </svg>
  );
}

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#d7d7d7] [overflow-anchor:none]">
      <button
        type="button"
        aria-expanded={open}
        onMouseDown={(event) => {
          // Avoid focus scroll jump when toggling with the mouse
          event.preventDefault();
        }}
        onClick={onToggle}
        className="type-text flex w-full items-start gap-3 py-3.5 text-left text-[13px] uppercase leading-[18px] outline-none transition duration-150 ease-in-out active:text-active"
      >
        <ChevronIcon open={open} />
        <span>{question}</span>
      </button>
      {open ? (
        <div className="pb-4 pl-7 pr-1">
          <FaqAnswer answer={answer} />
        </div>
      ) : null}
    </div>
  );
}

export function FaqAccordion({ sections }: FaqAccordionProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {sections.map((section, sectionIndex) => {
        const headingId = `faq-section-${sectionIndex}`;
        return (
          <section key={section.title} aria-labelledby={headingId}>
            <h2
              id={headingId}
              className={`type-h2 text-sm uppercase ${
                section.description ? "mb-1" : "mb-3"
              }`}
            >
              {section.title}
            </h2>
            {section.description ? (
              <p className="type-text mb-3 text-[13px] leading-[18px]">
                {section.description}
              </p>
            ) : null}
            <div>
              {section.items.map((item) => {
                const key = `${section.title}::${item.question}`;
                return (
                  <FaqItem
                    key={key}
                    question={item.question}
                    answer={item.answer}
                    open={openKey === key}
                    onToggle={() =>
                      setOpenKey((current) => (current === key ? null : key))
                    }
                  />
                );
              })}
            </div>
            {section.note ? (
              <p className="type-text mt-5 text-[13px] leading-[18px] italic [font-synthesis:style]">
                {section.note}
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
