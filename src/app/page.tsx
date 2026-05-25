import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  Car,
  FileX,
  Repeat,
  Bike,
  ShieldCheck,
  Clock,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

import { homepageContent } from '@/lib/content';
import { siteConfig } from '@/lib/config';
import { getProductBySlug } from '@/lib/db';

const Steps = dynamic(() => import('@/components/Steps'));
const Requirements = dynamic(() => import('@/components/Requirements'));
const TrustBadges = dynamic(() => import('@/components/TrustBadges'));
const Support = dynamic(() => import('@/components/Support'));
const FAQ = dynamic(() => import('@/components/FAQ'));
const VehicleTypes = dynamic(() => import('@/components/VehicleTypes'));

export const revalidate = 60;

function formatPrice(price: number) {
  return price.toFixed(2).replace('.', ',');
}

async function getHomepagePrices() {
  const fallback = {
    anmeldungMinPrice: 124.70,
    ummeldungPrice: 119.70,
    abmeldungPrice: 19.70,
  };

  try {
    const [anmeldenProduct, abmeldungProduct] = await Promise.all([
      getProductBySlug('auto-online-anmelden'),
      getProductBySlug('fahrzeugabmeldung'),
    ]);

    const anmeldenOpts = anmeldenProduct?.options
      ? JSON.parse(anmeldenProduct.options)
      : {};

    const anmeldenServices: Array<{ key?: string; label?: string; price: number }> =
      anmeldenOpts.services ?? [];

    const anmeldungMinPrice = anmeldenServices.length
      ? Math.min(...anmeldenServices.map((s) => s.price))
      : anmeldenProduct?.price ?? fallback.anmeldungMinPrice;

    const ummeldungService = anmeldenServices.find((s) =>
      String(s.key || s.label || '').toLowerCase().includes('ummeld')
    );

    const ummeldungPrice = ummeldungService?.price ?? fallback.ummeldungPrice;
    const abmeldungPrice = abmeldungProduct?.price ?? fallback.abmeldungPrice;

    return {
      anmeldungMinPrice,
      ummeldungPrice,
      abmeldungPrice,
    };
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const { anmeldungMinPrice, ummeldungPrice, abmeldungPrice } =
    await getHomepagePrices();

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.company.name,
    },
  };

  const services = [
    {
      icon: FileX,
      title: 'KFZ online abmelden',
      desc: 'Fahrzeug bequem online außer Betrieb setzen – ohne Termin bei der Zulassungsstelle.',
      price: `${formatPrice(abmeldungPrice)} €`,
      badge: 'Beliebt',
      href: '/product/fahrzeugabmeldung/',
      cta: 'Jetzt Fahrzeug abmelden',
      points: ['Ohne Behördengang', 'Bestätigung per E-Mail', 'Schnell online erledigt'],
    },
    {
      icon: Car,
      title: 'Auto online anmelden',
      desc: 'Neuzulassung oder Wiederzulassung digital starten – mit persönlicher Unterstützung.',
      price: `ab ${formatPrice(anmeldungMinPrice)} €`,
      badge: 'Online starten',
      href: '/product/auto-online-anmelden/',
      cta: 'Jetzt Auto anmelden',
      points: ['Mit eVB möglich', 'Dokumente online hochladen', 'Persönlicher Support'],
    },
    {
      icon: Repeat,
      title: 'KFZ online ummelden',
      desc: 'Ummeldung bei Umzug, Halterwechsel oder Kennzeichenwechsel einfach online starten.',
      price: `ab ${formatPrice(ummeldungPrice)} €`,
      badge: 'Digitaler Antrag',
      href: '/product/auto-online-anmelden/',
      cta: 'Jetzt ummelden',
      points: ['Für Halterwechsel', 'Für Adressänderung', 'Schritt-für-Schritt Formular'],
    },
    {
      icon: Bike,
      title: 'Motorrad online anmelden',
      desc: 'Motorrad-Zulassung online vorbereiten und bequem digital beauftragen.',
      price: `ab ${formatPrice(anmeldungMinPrice)} €`,
      badge: 'Auch Motorrad',
      href: '/product/auto-online-anmelden/',
      cta: 'Motorrad anmelden',
      points: ['Für Motorrad & Roller', 'Online Dokumente einreichen', 'Deutschlandweit nutzbar'],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <section className="relative overflow-hidden bg-dark-950">
        <div className="absolute top-0 left-1/4 w-[520px] h-[520px] bg-primary/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[420px] h-[420px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="container-main relative z-10 pt-32 pb-16 md:pt-40 md:pb-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/70 text-sm mb-6">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Digitaler KFZ-Service für Deutschland
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
              KFZ-Zulassung online erledigen –
              <span className="text-primary block">ohne Behördengang</span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mb-8">
              Fahrzeug anmelden, abmelden oder ummelden. Starten Sie Ihren Antrag online
              und erhalten Sie persönliche Unterstützung bei jedem Schritt.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="#services" className="btn-primary text-lg">
                Service auswählen <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/kfz-online-abmelden/" className="btn-outline-white">
                Mehr zur Online-Abmeldung
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
              {[
                { icon: ShieldCheck, label: 'Sicher & offiziell', desc: 'Digitale Bearbeitung' },
                { icon: Clock, label: '24/7 starten', desc: 'Ohne Öffnungszeiten' },
                { icon: Headphones, label: 'Persönlicher Support', desc: 'Hilfe bei Fragen' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white/[0.06] border border-white/[0.08] p-4 backdrop-blur-sm"
                  >
                    <Icon className="w-5 h-5 text-primary mb-3" />
                    <div className="text-white font-bold text-sm">{item.label}</div>
                    <div className="text-white/45 text-xs mt-1">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              Direkt online starten
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-dark-900 mb-4">
              Was möchten Sie erledigen?
            </h2>
            <p className="text-dark-500 text-lg">
              Wählen Sie den passenden Service. Danach führen wir Sie Schritt für Schritt
              durch den Antrag.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="group rounded-3xl bg-white border border-dark-100 p-6 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-13 h-13 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-dark-900 mb-3">
                    {service.title}
                  </h3>

                  <p className="text-dark-500 text-sm leading-relaxed min-h-[72px] mb-5">
                    {service.desc}
                  </p>

                  <div className="text-2xl font-extrabold text-primary mb-5">
                    {service.price}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-dark-600">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={service.href}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-dark-900 text-white px-4 py-3 font-bold text-sm group-hover:bg-primary transition-colors"
                  >
                    {service.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <TrustBadges />
      <Steps />
      <Requirements />
      <Support />

      <FAQ
        title={homepageContent.faq.title}
        items={homepageContent.faq.items}
        singleSection
      />

      <VehicleTypes />
    </>
  );
}