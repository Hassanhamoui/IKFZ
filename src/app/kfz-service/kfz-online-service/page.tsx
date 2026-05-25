import type { Metadata } from 'next';
import ServiceForm from '@/components/ServiceForm';

export const metadata: Metadata = {
  title: 'Jetzt Fahrzeug Online an- oder abmelden – KFZ Online Service',
  description:
    'KFZ-Service in Minuten – 100% Online & Ohne Wartezeit! Fahrzeug anmelden, abmelden oder ummelden. Offiziell beim KBA registriert.',
  alternates: {
    canonical: 'https://ikfzdigitalzulassung.de/kfz-service/kfz-online-service/',
  },
  openGraph: {
    title: 'Jetzt Fahrzeug Online an- oder abmelden',
    description: 'KFZ-Service in Minuten – 100% Online & Ohne Wartezeit!',
    url: 'https://ikfzdigitalzulassung.de/kfz-service/kfz-online-service/',
  },
};

export default function KfzOnlineServicePage() {
  return (
    <>
      {/* JSON-LD Service Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'KFZ Online Zulassung',
            provider: {
              '@type': 'Organization',
              name: 'iKFZ Digital Zulassung UG',
            },
            description:
              'Digitale Fahrzeugzulassung, Abmeldung und Ummeldung. Offiziell beim KBA registriert.',
            areaServed: 'DE',
            offers: {
              '@type': 'Offer',
              price: '119.70',
              priceCurrency: 'EUR',
            },
          }),
        }}
      />
      <ServiceForm />
    </>
  );
}
