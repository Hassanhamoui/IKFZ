'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, RefreshCcw } from 'lucide-react';
import { homepageContent } from '@/lib/content';

interface BadgeContent {
  title: string;
  description: string;
  methods?: readonly string[];
}

const badges: { icon: typeof RefreshCcw; getContent: (content: typeof homepageContent) => BadgeContent }[] = [
  {
    icon: RefreshCcw,
    getContent: (content) => ({
      title: content.guarantee.title,
      description: content.guarantee.description,
    }),
  },
  {
    icon: CreditCard,
    getContent: (content) => ({
      title: content.payment.title,
      description: content.payment.note,
      methods: content.payment.methods,
    }),
  },
  {
    icon: ShieldCheck,
    getContent: () => ({
      title: 'Offiziell beim KBA registriert',
      description: 'Als registrierter Großkunde gemäß §34 FZV arbeiten wir direkt mit dem Kraftfahrt-Bundesamt zusammen.',
    }),
  },
];

export default function TrustBadges() {
  return (
    <section className="py-10 md:py-16 bg-dark-950 relative overflow-hidden">
      {/* Design layers */}
      <div className="absolute inset-0 dot-pattern-dark pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/[0.05] rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />
      <div className="container-main relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-section-mobile md:text-section text-white mb-4">
            Vertrauen & Sicherheit
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Ihre Zufriedenheit und Sicherheit stehen bei uns an erster Stelle
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {badges.map((badge, index) => {
            const content = badge.getContent(homepageContent);
            const Icon = badge.icon;
            return (
              <motion.div
                key={content.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white/[0.04] rounded-3xl p-8 text-center border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-300 h-full">
                  <div className="w-16 h-16 mx-auto mb-5 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{content.title}</h3>
                  
                  {'methods' in content && content.methods && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {content.methods.map((method: string) => (
                        <span
                          key={method}
                          className="px-3 py-1 bg-white/[0.06] rounded-lg text-xs font-medium text-white/60 border border-white/[0.05]"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-white/40 leading-relaxed text-[0.95rem]">{content.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
