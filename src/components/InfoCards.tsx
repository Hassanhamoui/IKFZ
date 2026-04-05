'use client';

import { motion } from 'framer-motion';
import { FileSignature, Hash, Check } from 'lucide-react';
import { homepageContent } from '@/lib/content';

export default function InfoCards() {
  return (
    <section className="py-10 md:py-16 bg-warm relative overflow-hidden">
      {/* Separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-dark-200/30 to-transparent" />
      {/* Design layer */}
      <div className="absolute inset-0 lines-pattern pointer-events-none" />
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Vollmacht Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl p-8 border border-dark-100/60 shadow-card hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-5">
              <FileSignature className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-3">
              {homepageContent.vollmacht.title}
            </h3>
            <p className="text-dark-400 leading-relaxed text-[0.95rem]">
              {homepageContent.vollmacht.description}
            </p>
          </motion.div>

          {/* Wunschkennzeichen Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl p-8 border border-dark-100/60 shadow-card hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-5">
              <Hash className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-dark-900 mb-3">
              {homepageContent.wunschkennzeichen.title}
            </h2>
            <p className="text-dark-400 leading-relaxed mb-4 text-[0.95rem]">
              {homepageContent.wunschkennzeichen.description}
            </p>
            <ul className="space-y-2.5">
              {homepageContent.wunschkennzeichen.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-dark-500 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
