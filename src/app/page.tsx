import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';
import PricingBox from '@/components/PricingBox';
import IntroSection from '@/components/IntroSection';

// Below-fold components: code-split to keep initial JS bundle small
const Steps = dynamic(() => import('@/components/Steps'));
const Requirements = dynamic(() => import('@/components/Requirements'));
const TrustBadges = dynamic(() => import('@/components/TrustBadges'));
const Support = dynamic(() => import('@/components/Support'));
const FAQ = dynamic(() => import('@/components/FAQ'));
const VehicleTypes = dynamic(() => import('@/components/VehicleTypes'));
const InfoCards = dynamic(() => import('@/components/InfoCards'));

import { homepageContent } from '@/lib/content';
import { siteConfig } from '@/lib/config';
import { getProductBySlug } from '@/lib/db';

export const revalidate = 60;

export default async function HomePage() {
  const [anmeldenProduct, abmeldungProduct] = await Promise.all([
    getProductBySlug('auto-online-anmelden'),
    getProductBySlug('fahrzeugabmeldung'),
  ]);

  const anmeldenOpts = (() => {
    try {
      return anmeldenProduct?.options ? JSON.parse(anmeldenProduct.options) : {};
    } catch {
      return {};
    }
  })();

  const anmeldenServices: Array<{ price: number }> = anmeldenOpts.services ?? [];
  const anmeldungMinPrice = anmeldenServices.length
    ? Math.min(...anmeldenServices.map((s) => s.price))
    : (anmeldenProduct?.price ?? 119.70);

  const abmeldungPrice = abmeldungProduct?.price ?? 19.70;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: siteConfig.name,
        url: siteConfig.url,
        publisher: {
          '@type': 'Organization',
          name: siteConfig.company.name,
        },
      },
      {
        '@type': 'Organization',
        name: siteConfig.company.name,
        url: siteConfig.url,
        // logo nur eintragen, wenn die EXAKTE Live-Logo-URL existiert
        // logo: 'HIER_EXAKTE_LOGO_URL_EINTRAGEN',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+49 1522 4999190',
            contactType: 'customer service',
            areaServed: 'DE',
            availableLanguage: ['de'],
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Hero />
      <IntroSection />
      <Steps />
      <Requirements />
      <PricingBox anmeldungMinPrice={anmeldungMinPrice} abmeldungPrice={abmeldungPrice} />
      <TrustBadges />
      <InfoCards />
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
