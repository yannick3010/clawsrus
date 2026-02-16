"use client";

import { useState } from "react";
import { FAQ_DATA } from "@/lib/constants";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import Accordion from "@/components/ui/Accordion";
import FadeIn from "@/components/ui/FadeIn";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SectionWrapper id="faq" alt>
      <SectionHeading>Questions? We&rsquo;ve got answers.</SectionHeading>
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <div className="border-t border-warm-gray">
            {FAQ_DATA.map((item, i) => (
              <Accordion
                key={i}
                question={item.question}
                answer={item.answer}
                open={openIndex === i}
                onToggle={() =>
                  setOpenIndex(openIndex === i ? null : i)
                }
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </SectionWrapper>
  );
}
