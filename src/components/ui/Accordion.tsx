"use client";

type AccordionProps = {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
};

export default function Accordion({
  question,
  answer,
  open,
  onToggle,
}: AccordionProps) {
  return (
    <div className="border-b border-warm-gray">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        aria-expanded={open}
      >
        <span className="pr-4 text-lg font-medium text-espresso">
          {question}
        </span>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center text-xl text-stone transition-transform duration-200"
          aria-hidden="true"
        >
          {open ? "−" : "+"}
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-6 text-earth leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}
