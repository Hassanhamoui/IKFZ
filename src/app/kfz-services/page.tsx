import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Car, FileX, Repeat, CreditCard, Sparkles, ShieldCheck, Banknote } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { getProductBySlug } from '@/lib/db';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'KFZ Dienstleistungen – Online Zulassungsservice',
  description:
    'Alle KFZ-Dienstleistungen online: Fahrzeuganmeldung, Abmeldung, Ummeldung, eVB-Nummer, Versicherung berechnen, Auto verkaufen und mehr.',
  alternates: {
    canonical: 'https://ikfzdigitalzulassung.de/kfz-services/',
  },
};

const servicesMeta = [
  {
    icon: Car,
    key: 'anmelden',
    title: 'Fahrzeug Anmelden',
    description: 'Ihr Fahrzeug schnell und unkompliziert online anmelden – ohne Wartezeiten bei der Zulassungsstelle.',
    href: '/product/auto-online-anmelden/',
    featured: true,
  },
  {
    icon: FileX,
    key: 'abmelden',
    title: 'Fahrzeug Abmelden',
    description: 'Die Abmeldung eines Fahrzeugs erfolgt komplett digital. Innerhalb weniger Minuten.',
    href: '/product/fahrzeugabmeldung/',
    featured: false,
  },
  {
    icon: Repeat,
    key: 'ummelden',
    title: 'Fahrzeug Ummelden',
    description: 'Reibungslose Halterwechsel oder Adressänderungen – schnell und bequem online.',
    href: '/product/auto-online-anmelden/',
    featured: false,
  },
  {
    icon: CreditCard,
    key: 'evb',
    title: 'eVB-Nummer anfordern',
    description: 'Die elektronische Versicherungsbestätigung erhalten Sie direkt über unsere Plattform – kostenlos.',
    href: '/evb/',
    featured: false,
  },
  {
    icon: ShieldCheck,
    key: 'versicherung',
    title: 'KFZ-Versicherung berechnen',
    description: 'Vergleichen Sie hunderte Tarife in 2 Minuten und sparen Sie bis zu 850 € pro Jahr.',
    href: '/kfz-versicherung-berechnen/',
    featured: false,
  },
  {
    icon: Banknote,
    key: 'verkaufen',
    title: 'Auto verkaufen',
    description: 'Kostenloses und unverbindliches Angebot von geprüften Händlern. Top-Preis sichern.',
    href: '/auto-verkaufen/',
    featured: false,
  },
];

export default async function KfzServicesPage() {
  // Fetch live prices from DB
  const [anmeldenProduct, abmeldungProduct] = await Promise.all([
    getProductBySlug('auto-online-anmelden'),
    getProductBySlug('fahrzeugabmeldung'),
  ]);

  const anmeldenOpts = anmeldenProduct?.options ? JSON.parse(anmeldenProduct.options) : {};
  const anmeldenServices: Array<{ key: string; label: string; price: number }> = anmeldenOpts.services ?? [];

  const anmeldenMinPrice = anmeldenServices.length
    ? Math.min(...anmeldenServices.map((s) => s.price))
    : (anmeldenProduct?.price ?? 99.70);
  const ummeldungService = anmeldenServices.find((s) => s.key === 'ummeldung');
  const ummeldungPrice = ummeldungService?.price ?? anmeldenProduct?.price ?? 119.70;
  const abmeldungPrice = abmeldungProduct?.price ?? 19.70;

  const fmt = (n: number) => n.toFixed(2).replace('.', ',');

  const services = servicesMeta.map((s) => ({
    ...s,
    price:
      s.key === 'anmelden'   ? `ab ${fmt(anmeldenMinPrice)} €` :
      s.key === 'abmelden'   ? `${fmt(abmeldungPrice)} €` :
      s.key === 'ummelden'   ? `ab ${fmt(ummeldungPrice)} €` :
      s.key === 'evb'        ? 'Kostenlos' :
      '',
  }));

  return (
    <>
      {/* ── Dark Hero ── */}
      <section className="relative overflow-hidden bg-dark-950">
        <div className="pt-32 pb-16 md:pt-40 md:pb-20 relative">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="container-main relative z-10">
            <ScrollReveal>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                Unsere<br />
                <span className="text-primary">Dienstleistungen</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 max-w-2xl">
                Alle KFZ-Services auf einen Blick – von der Zulassung bis zur Versicherung.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Service Cards (Light Mode) ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <ScrollReveal key={service.title} delay={i * 0.08}>
                  <div className={`group relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 ${
                    service.featured
                      ? 'bg-white border-primary/30 shadow-[0_4px_24px_rgba(0,168,90,0.08)] hover:shadow-[0_8px_32px_rgba(0,168,90,0.15)]'
                      : 'bg-white border-dark-100 shadow-sm hover:shadow-card hover:border-dark-200'
                  }`}>
                    {service.featured && (
                      <div className="absolute -top-3 right-6 inline-flex items-center gap-1.5 px-3 py-1 bg-primary rounded-full text-xs font-bold text-white">
                        <Sparkles className="w-3 h-3" /> Beliebt
                      </div>
                    )}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${
                      service.featured ? 'bg-primary/10' : 'bg-dark-50 group-hover:bg-primary/10'
                    }`}>
                      <Icon className={`w-7 h-7 ${service.featured ? 'text-primary' : 'text-dark-400 group-hover:text-primary'} transition-colors`} />
                    </div>
                    <h3 className="text-xl font-bold text-dark-900 mb-2">{service.title}</h3>
                    <p className="text-dark-500 mb-5 leading-relaxed text-sm">{service.description}</p>
                    {service.price && (
                      <p className="text-2xl font-black text-primary mb-5">{service.price}</p>
                    )}
                    <Link
                      href={service.href}
                      className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
                    >
                      Jetzt starten <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA (Dark) ── */}
      <section className="relative bg-dark-950 py-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="container-main relative z-10 text-center">
          <ScrollReveal>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Bereit für Ihren <span className="text-primary">Online-Service</span>?
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Starten Sie jetzt und sparen Sie sich den Weg zur Zulassungsstelle.
            </p>
            <Link
              href="/kfz-service/kfz-online-service/"
              className="btn-primary text-lg"
            >
              Jetzt Fahrzeug anmelden
              <ArrowRight className="w-5 h-5" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
