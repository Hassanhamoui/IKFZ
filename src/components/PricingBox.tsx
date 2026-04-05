'use client';

import { motion } from 'framer-motion';
import { Euro, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { homepageContent } from '@/lib/content';
import { usePriceFeed } from '@/hooks/usePriceFeed';

interface PricingBoxProps {
  anmeldungMinPrice?: number;
  abmeldungPrice?: number;
}

export default function PricingBox({
  anmeldungMinPrice = 119.70,
  abmeldungPrice = 19.70,
}: PricingBoxProps) {
  const { pricing, deregistration } = homepageContent;

  // Subscribe to live price feed; initial values come from server-rendered props
  const feed = usePriceFeed({
    'auto-online-anmelden': { price: anmeldungMinPrice, options: null },
    'fahrzeugabmeldung': { price: abmeldungPrice, options: null },
  });
  const liveAnmeldungMinPrice = feed['auto-online-anmelden']?.price ?? anmeldungMinPrice;
  const liveAbmeldungPrice = feed['fahrzeugabmeldung']?.price ?? abmeldungPrice;

  return (
    <section className="py-10 md:py-16 relative overflow-hidden" id="kosten" style={{ background: 'linear-gradient(180deg, #f0f4f2 0%, #e8eeeb 50%, #f0f4f2 100%)' }}>
      {/* Decorative */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gold/[0.03] rounded-full blur-[80px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />

      <div className="container-main relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="section-label mb-5 inline-flex">
            <Euro className="w-3.5 h-3.5" />
            Transparente Preise
          </span>
          <h2 className="text-section-mobile md:text-section text-dark-900 mb-4 text-balance">
            {pricing.title}
          </h2>
          <p className="text-lg text-dark-400 max-w-3xl mx-auto">
            {pricing.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Registration Card - Featured */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-px bg-gradient-to-b from-primary/40 via-primary/20 to-primary/5 rounded-[1.6rem]" />
            <div className="relative bg-white rounded-3xl p-8 h-full border border-primary/10">
              <div className="badge-gold mb-6">
                Beliebt
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/8 rounded-2xl flex items-center justify-center">
                  <Euro className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark-900">KFZ Anmeldung</h3>
                  <p className="text-sm text-dark-400">Online Zulassung</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-dark-400 font-medium">ab</span>
                  <span className="text-5xl font-black text-dark-900 tracking-tight">{liveAnmeldungMinPrice.toFixed(2).replace('.', ',')}</span>
                  <span className="text-xl font-bold text-dark-400">€</span>
                </div>
                <p className="text-sm text-dark-400 mt-1">Servicegebühr inkl. Behördengebühren</p>
              </div>

              <Link
                href="/kfz-service/kfz-online-service/"
                className="btn-primary w-full mb-6 cta-glow"
              >
                Jetzt Zulassung starten
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>

              <div className="space-y-3 pt-6 border-t border-dark-100/60">
                {pricing.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm text-dark-500">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Deregistration Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white rounded-3xl p-8 h-full border border-dark-100/60 shadow-card">
              <div className="flex items-center gap-4 mb-6 mt-8">
                <div className="w-14 h-14 bg-dark-50 rounded-2xl flex items-center justify-center">
                  <Euro className="w-7 h-7 text-dark-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark-900">{deregistration.title}</h3>
                  <p className="text-sm text-dark-400">Online Abmeldung</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-dark-900 tracking-tight">{liveAbmeldungPrice.toFixed(2).replace('.', ',')}</span>
                  <span className="text-xl font-bold text-dark-400">€</span>
                </div>
                <p className="text-sm text-dark-400 mt-1">Einmalige Servicegebühr</p>
              </div>

              <a
                href={deregistration.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full mb-6"
              >
                Zum Abmeldeportal
                <ArrowRight className="w-4.5 h-4.5" />
              </a>

              <div className="pt-6 border-t border-dark-100/60">
                <p className="text-dark-400 leading-relaxed text-sm">
                  {deregistration.description}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-dark-400 mt-8 max-w-3xl mx-auto text-sm leading-relaxed"
        >
          {pricing.note}
        </motion.p>
      </div>
    </section>
  );
}
