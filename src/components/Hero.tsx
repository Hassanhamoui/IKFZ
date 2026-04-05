import Link from 'next/link';
import Image from 'next/image';
import { FileText, Zap, Clock, Euro, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { homepageContent } from '@/lib/content';

const iconMap: Record<string, React.ElementType> = {
  FileText,
  Zap,
  Clock,
  Euro,
  Shield,
};

export default function Hero() {
  const { hero } = homepageContent;

  return (
    <section className="relative flex items-center overflow-hidden py-16 md:py-20 lg:py-24" style={{ contain: 'layout style paint' }}>
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />

      {/* Gradient accent orbs — reduced blur radius for better paint performance */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/15 blur-[40px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[30px]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] hero-grid-pattern" />

      <div className="relative container-main w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 py-24 md:py-28">
          {/* Text Content — rendered server-side, immediately visible for LCP */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full text-sm font-medium text-primary border border-primary/20 mb-8">
              <Shield className="w-4 h-4" />
              <span>{hero.kbaText}</span>
            </div>

            <h1 className="text-hero-mobile md:text-hero text-white mb-5 text-balance">
              {hero.title.split(' ').map((word, i) => (
                <span key={i}>
                  {word === 'online' ? (
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">{word}</span>
                  ) : (
                    word
                  )}{' '}
                </span>
              ))}
            </h1>

            <p className="text-xl md:text-2xl text-white/70 font-medium mb-3 tracking-[-0.01em]">
              {hero.subtitle}
            </p>

            <p className="text-base text-white/40 font-medium mb-8">
              {hero.badge}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href={hero.cta.href}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 text-[1.05rem] cta-glow"
              >
                {hero.cta.text}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/product/fahrzeugabmeldung/"
                className="btn-outline-white"
              >
                Auto online abmelden
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 justify-center lg:justify-start">
              {['Persönlicher-Support', 'PDF-Bestätigung', '24/7 Support'].map((text) => (
                <span key={text} className="flex items-center gap-2 text-sm text-white/50">
                  <CheckCircle2 className="w-4 h-4 text-primary-400" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Right side - KBA badge image (desktop only) */}
          <div className="flex-shrink-0 hidden lg:block">
            <div className="relative w-[400px] h-[400px]">
              <div className="absolute inset-0 bg-primary/8 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-[120px] scale-125 pointer-events-none" />
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative w-[340px] h-[340px] bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-sm rounded-[2rem] border border-white/[0.12] p-6 flex items-center justify-center shadow-[0_8px_60px_rgba(0,168,90,0.12)]">
                  <Image
                    src="/uploads/2025/02/KBA-NEU-e1739626430147.png"
                    alt="KBA – Registriert gemäß §34 FZV beim Kraftfahrt-Bundesamt"
                    width={241}
                    height={300}
                    className="w-auto h-[280px] object-contain drop-shadow-[0_4px_40px_rgba(0,168,90,0.12)]"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12 relative z-10">
          {hero.features.map((feature) => {
            const Icon = iconMap[feature.icon] || FileText;
            return (
              <div
                key={feature.label}
                className="group bg-white/[0.05] backdrop-blur-sm rounded-2xl p-5 text-center border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.15] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary-400" />
                </div>
                <div className="text-lg font-bold text-white">{feature.label}</div>
                <div className="text-sm text-white/40 mt-1">{feature.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
