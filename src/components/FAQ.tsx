'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

interface FAQProps {
  title?: string;
  sections?: FAQSection[];
  items?: FAQItem[];
  singleSection?: boolean;
}

export default function FAQ({ title, sections, items, singleSection = false }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  const renderItem = (item: FAQItem, sectionIndex: number, itemIndex: number) => {
    const id = `${sectionIndex}-${itemIndex}`;
    const isOpen = openIndex === id;

    return (
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: itemIndex * 0.04, duration: 0.3 }}
        className="group"
      >
        <button
  id={`faq-button-${id}`}
  onClick={() => toggle(id)}
  aria-expanded={isOpen}
  aria-controls={`faq-content-${id}`}
  className={cn(
    'w-full flex items-center justify-between gap-4 py-5 px-5 text-left rounded-2xl transition-all duration-200',
    isOpen ? 'bg-primary/[0.04]' : 'hover:bg-dark-50/70'
  )}
>
          <span className={cn(
            'text-[0.95rem] font-semibold transition-colors leading-snug',
            isOpen ? 'text-primary' : 'text-dark-800'
          )}>
            {item.question}
          </span>
          <div className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
            isOpen ? 'bg-primary/10 rotate-180' : 'bg-dark-50'
          )}>
            <ChevronDown className={cn(
              'w-4 h-4 transition-colors',
              isOpen ? 'text-primary' : 'text-dark-400'
            )} />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
  id={`faq-content-${id}`}
  role="region"
  aria-labelledby={`faq-button-${id}`}
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  className="overflow-hidden"
>
              <div className="px-5 pb-5 text-dark-400 leading-relaxed text-[0.95rem]">
                {item.answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <section className="py-10 md:py-16 bg-cool relative overflow-hidden section-divider-top" id="faq">
      {/* Design layer */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-primary/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="container-main">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <span className="section-label mb-5 inline-flex">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </span>
            <h2 className="text-section-mobile md:text-section text-dark-900 text-balance">
              {title}
            </h2>
          </motion.div>
        )}

        {/* Single items list */}
        {singleSection && items && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-dark-100/60 shadow-card p-2 md:p-3">
            {items.map((item, index) => renderItem(item, 0, index))}
          </div>
        )}

        {/* Multiple sections */}
        {sections && sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-12 last:mb-0">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl font-bold text-dark-900 mb-4 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-sm font-black">{sectionIndex + 1}</span>
              </div>
              {section.title}
            </motion.h3>
            <div className="bg-white rounded-3xl border border-dark-100/60 shadow-card p-2 md:p-3">
              {section.items.map((item, itemIndex) =>
                renderItem(item, sectionIndex, itemIndex)
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
