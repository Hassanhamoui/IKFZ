import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import SiteShell from '@/components/SiteShell';
import PromoBanner from '@/components/PromoBanner';
import { siteConfig } from '@/lib/config';
import { CustomerAuthProvider } from '@/components/CustomerAuthProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'KFZ Zulassung online – Auto online anmelden | IKFZ Digital Zulassung',
    template: '%s | IKFZ Digital Zulassung',
  },
  description: siteConfig.description,
  keywords: [
    'KFZ Zulassung online',
    'Auto online anmelden',
    'Fahrzeug anmelden online',
    'KFZ Abmeldung online',
    'eVB Nummer',
    'Wunschkennzeichen',
    'digitale Zulassung',
    'iKfz',
    'KBA registriert',
    'Fahrzeugzulassung',
  ],
  authors: [{ name: 'IKFZ Digital Zulassung' }],
  creator: 'IKFZ Digital Zulassung',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: siteConfig.url,
    title: 'KFZ Zulassung online – Auto online anmelden | IKFZ Digital Zulassung',
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'IKFZ Digital Zulassung',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KFZ Zulassung online – Auto online anmelden',
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* JSON-LD Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: siteConfig.company.name,
              url: siteConfig.url,
              logo: `${siteConfig.url}/logo-ikfz.svg`,
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: siteConfig.company.phone,
                contactType: 'customer service',
                availableLanguage: ['German', 'English'],
              },
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Gerhard-Küchen-Straße 14',
                addressLocality: 'Essen',
                postalCode: '45141',
                addressCountry: 'DE',
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <CustomerAuthProvider>
          <SiteShell><PromoBanner /><Navbar /></SiteShell>
          <main className="min-h-screen">{children}</main>
          <SiteShell>
            <Footer />
            <WhatsAppFloat />
          </SiteShell>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
