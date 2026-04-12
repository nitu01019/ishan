"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FAQ, SectionBackground, AnimationConfig } from "@/types";
import { getSectionStyle } from "@/lib/section-style";
import { getCardVariants } from "@/lib/animation-config";
import SectionTitle from "@/components/ui/SectionTitle";
import Button from "@/components/ui/Button";

interface FAQProps {
  readonly faqs: readonly FAQ[];
  readonly background?: SectionBackground;
  readonly animations?: AnimationConfig;
}

interface AccordionItemProps {
  readonly faq: FAQ;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

function AccordionItem({ faq, isOpen, onToggle }: AccordionItemProps) {
  const questionId = `faq-question-${faq.id}`;
  const answerId = `faq-answer-${faq.id}`;

  return (
    <div className="border border-gray-700 rounded-xl p-3 md:p-4">
      <button
        type="button"
        id={questionId}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={answerId}
        className="w-full flex items-center justify-between gap-3 md:gap-4 text-left min-h-[44px]"
      >
        <span className="text-white font-medium text-sm md:text-base break-words">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-shrink-0 text-accent-green text-xl font-light leading-none w-6 h-6 flex items-center justify-center"
          aria-hidden="true"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={answerId}
            role="region"
            aria-labelledby={questionId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="pt-3 text-text-secondary text-sm leading-relaxed break-words overflow-wrap-anywhere">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ({ faqs, background, animations: _animations }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-12 md:py-16 lg:py-20 px-4 md:px-8 lg:px-16" style={getSectionStyle(background)}>
      <SectionTitle text="Frequently Asked Questions" highlight="Asked Questions" />

      <div className="mt-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Left side - Accordion */}
        <div className="w-full lg:w-[60%] flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.id}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Right side - CTA Card */}
        <div className="w-full lg:w-[40%]">
          <div className="lg:sticky lg:top-32 gradient-green rounded-2xl p-8 flex flex-col gap-6">
            <p className="font-bold text-2xl text-black">
              Get started with a free Discovery call.
            </p>
            <Button variant="dark" href="#contact">
              Book a Call
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
