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
  // Fetch live prices from DB
  const [anmeldenProduct, abmeldungProduct] = await Promise.all([
    getProductBySlug('auto-online-anmelden'),
    getProductBySlug('fahrzeugabmeldung'),
  ]);

  const anmeldenOpts = anmeldenProduct?.options ? JSON.parse(anmeldenProduct.options) : {};
  const anmeldenServices: Array<{ price: number }> = anmeldenOpts.services ?? [];
  const anmeldungMinPrice = anmeldenServices.length
    ? Math.min(...anmeldenServices.map((s) => s.price))
    : (anmeldenProduct?.price ?? 119.70);
  const abmeldungPrice = abmeldungProduct?.price ?? 19.70;
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
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
