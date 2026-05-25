import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Car, ShieldCheck, Banknote, Clock, CheckCircle2, Phone, MessageCircle, TrendingUp, FileText, Truck, CreditCard, ChevronDown, Home, Headphones, BadgeCheck, RefreshCw, FileX, Repeat, Download, Globe, Laptop, Building2 } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { siteConfig } from '@/lib/config';
import AutoVerkaufenForm from '@/components/AutoVerkaufenForm';
import prisma from '@/lib/db';

export const metadata: Metadata = {
  title: 'Auto verkaufen – Kostenloses Angebot vom Händler',
  description:
    'Auto verkaufen leicht gemacht. Kostenloses und unverbindliches Angebot von geprüften Händlern. Top-Preis sichern – stressfrei und sicher.',
  alternates: {
    canonical: 'https://ikfzdigitalzulassung.de/auto-verkaufen/',
  },
};

const features = [
  { icon: Home, title: 'Bequem von überall', desc: 'Erledigen Sie Ihre Anliegen zu jeder Zeit – ganz ohne Öffnungszeiten.' },
  { icon: Clock, title: '24/7 verfügbar', desc: 'Auch am Wochenende und an Feiertagen für Sie da.' },
  { icon: Headphones, title: 'Live-Support', desc: 'Persönliche Beratung per WhatsApp, Telefon oder Chat.' },
  { icon: BadgeCheck, title: 'Geld-zurück-Garantie', desc: 'Sollte etwas nicht klappen, erhalten Sie Ihr Geld zurück.' },
];

const services = [
  { icon: FileX, title: 'KFZ online abmelden', desc: 'Schnell und ohne Behördengänge', href: '/product/fahrzeugabmeldung/', cta: 'Jetzt KFZ online abmelden' },
  { icon: Car, title: 'KFZ online anmelden', desc: 'Einfach und sicher online erledigen', href: '/product/auto-online-anmelden/', cta: 'Jetzt KFZ Online Anmelden' },
  { icon: Repeat, title: 'KFZ online ummelden', desc: 'Ohne Stress in wenigen Minuten.', href: '/product/auto-online-anmelden/', cta: 'Jetzt Online KFZ ummelden' },
  { icon: ShieldCheck, title: 'eVB-Nummer', desc: 'Sofort online für Ihre Zulassung!', href: '/evb/', cta: 'Jetzt eVB-Nummer erhalten' },
  { icon: Banknote, title: 'Auto Verkaufen', desc: 'Kostenlose Bewertung Anfordern', href: '#formular', cta: 'Jetzt Auto Verkaufen' },
];

const processSteps = [
  { num: 1, title: 'Dienstleistung auswählen', desc: 'Wählen Sie den gewünschten Service aus.' },
  { num: 2, title: 'Daten der Dokumente Eintragen', desc: 'Geben Sie die erforderlichen Daten ein oder senden Sie uns die Dokumente.' },
  { num: 3, title: 'Auf Bestätigung warten und fertig!', desc: 'Wir bearbeiten Ihren Antrag und Sie erhalten die Bestätigung.' },
];

const faqCategories = [
  {
    title: 'FAQ Elektronische Versicherungsbestätigung (eVB)',
    items: [
      { q: 'Was ist eine elektronische Versicherungsbestätigung (eVB)?', a: 'Eine eVB ist ein digitaler Nachweis Ihrer Kfz-Haftpflichtversicherung, der für die Zulassung Ihres Fahrzeugs benötigt wird.' },
      { q: 'Wie beantrage ich eine eVB?', a: 'Sie können die eVB bei uns online beantragen. Füllen Sie das Formular aus, und wir stellen die Bestätigung innerhalb weniger Minuten aus.' },
      { q: 'Ist die eVB kostenlos?', a: 'Ja, bei uns können Sie die eVB kostenlos beantragen.' },
      { q: 'Für welche Fahrzeuge benötige ich eine eVB?', a: 'Eine eVB ist erforderlich für Autos, Motorräder, Anhänger und andere Kraftfahrzeuge.' },
      { q: 'Wie lange ist eine eVB gültig?', a: 'Je nach Versicherung, sie ist in der Regel 14 Tage bis zu 6 Monate gültig.' },
      { q: 'Kann ich eine eVB für ein Fahrzeug beantragen, das nicht auf meinen Namen läuft?', a: 'Ja, das ist möglich, wenn Sie die Zustimmung des Fahrzeughalters haben.' },
      { q: 'Was passiert, wenn meine eVB abläuft?', a: 'Sie müssen eine neue eVB beantragen, da eine Verlängerung nicht möglich ist.' },
      { q: 'Kann ich die eVB mehrfach nutzen?', a: 'Nein, jede eVB ist fahrzeugspezifisch und nur einmal gültig.' },
    ],
  },
  {
    title: 'FAQ Fahrzeuganmeldung',
    items: [
      { q: 'Welche Unterlagen benötige ich für die Fahrzeuganmeldung?', a: 'Sie benötigen: eVB, Zulassungsbescheinigung Teil I und II, Personalausweis oder Reisepass, HU/TÜV-Nachweis.' },
      { q: 'Wie funktioniert die Online-Fahrzeuganmeldung?', a: 'Unsere Online-Fahrzeuganmeldung ist einfach und benutzerfreundlich. Sie können die Daten manuell im Formular eingeben oder uns Ihre Dokumente per Live-Support als Fotos senden. Unser System führt Sie Schritt für Schritt durch den Prozess: Zulassungsbezirk auswählen, Fahrgestellnummer (FIN) eintragen, HU/TÜV-Daten und eVB eingeben, Kennzeichen wählen und Sicherheitscodes eingeben. Nach Abschluss dauert die Bearbeitung in der Regel 10-15 Minuten.' },
      { q: 'Muss ich mich bei der Anmeldung legitimieren?', a: 'Ja, die Legitimation erfolgt über unseren Partner „Verimi".' },
      { q: 'Wie lange dauert die Anmeldung?', a: 'Nach Abschluss des Antrags dauert die Bearbeitung in der Regel 10-15 Minuten.' },
      { q: 'Kann ich die Anmeldung für ein Fahrzeug durchführen, das jemand anderem gehört?', a: 'Ja, solange Sie eine Vollmacht, Personalausweis, Reisepass oder Ausweis-Dokument und die Zustimmung des Eigentümers haben.' },
      { q: 'Kann ich ein Wunschkennzeichen reservieren?', a: 'Ja, teilen Sie uns Ihr Wunschkennzeichen mit, und wir prüfen die Verfügbarkeit.' },
    ],
  },
  {
    title: 'FAQ Fahrzeugabmeldung',
    items: [
      { q: 'Welche Unterlagen brauche ich für die Abmeldung?', a: 'Sie benötigen: Zulassungsbescheinigung Teil I, Sicherheitscode aus der Zulassungsbescheinigung, Codes der Vorderen und Hinteren Kennzeichen.' },
      { q: 'Ist bei der Abmeldung eine Legitimation erforderlich?', a: 'Nein, bei uns ist eine Legitimation der Fahrzeugabmeldung nicht notwendig.' },
      { q: 'Wie funktioniert die Online-Abmeldung?', a: 'Sie können die Daten selbstständig über unser Formular eingeben (Kennzeichen, Zulassungsbezirk, Fahrzeugtyp, FIN und Sicherheitscodes) oder uns die Dokumente als Fotos über den Live-Support senden. Wir übernehmen die Datenübertragung. Die Abmeldung dauert in der Regel 10 Minuten.' },
      { q: 'Wie lange dauert die Abmeldung?', a: 'Nach Abschluss des Antrags dauert die Bearbeitung in der Regel 10-15 Minuten.' },
      { q: 'Kann ich die Abmeldung für ein Fahrzeug durchführen, das jemand anderem gehört?', a: 'Ja, Sie müssen keine persönlichen Angaben machen.' },
      { q: 'Kann ich mein Kennzeichen reservieren?', a: 'Ja, wir bieten das kostenlos an.' },
      { q: 'Kann ich mein Fahrzeug abmelden, wenn es vor 2015 zugelassen wurde?', a: 'Nein, die Online-Abmeldung ist nur für Fahrzeuge möglich, die ab 2015 zugelassen wurden.' },
    ],
  },
  {
    title: 'FAQ Fahrzeug Ummeldung',
    items: [
      { q: 'Welche Unterlagen brauche ich für die Ummeldung?', a: 'Sie benötigen: eVB, Zulassungsbescheinigung Teil I und II, HU/TÜV-Nachweis, Personalausweis.' },
      { q: 'Was ist der Unterschied zwischen Ummeldung und Halterwechsel?', a: 'Ummeldung: Adresse des Fahrzeughalters ändert sich. Halterwechsel: Eigentümer des Fahrzeugs ändert sich.' },
      { q: 'Wie lange dauert die Ummeldung?', a: 'Nach Abschluss des Antrags dauert die Bearbeitung in der Regel 10-15 Minuten.' },
      { q: 'Kann ich eine Ummeldung ohne eVB durchführen?', a: 'Nein, die eVB ist auch für die Ummeldung erforderlich.' },
    ],
  },
  {
    title: 'FAQ Kennzeichen und Wunschkennzeichen',
    items: [
      { q: 'Kann ich ein Wunschkennzeichen reservieren?', a: 'Ja, wir prüfen die Verfügbarkeit und reservieren Ihr Wunschkennzeichen.' },
      { q: 'Sind Kennzeichen bei euch kostenlos?', a: 'Ja, wir bieten kostenlose Standardkennzeichen an. Wunschkennzeichen kosten extra.' },
      { q: 'Wie lange dauert es, bis ich mein Kennzeichen erhalte?', a: 'Kennzeichen werden in der Regel innerhalb von 2-3 Werktagen geliefert.' },
      { q: 'Kann ich mein aktuelles Kennzeichen behalten?', a: 'Ja, bei der Ummeldung können Sie Ihr Kennzeichen behalten.' },
    ],
  },
  {
    title: 'FAQ Preise und Zahlungsarten',
    items: [
      { q: 'Wie viel kostet die Fahrzeuganmeldung?', a: 'Die Fahrzeuganmeldung kostet bei uns 124,95 € inkl. Kennzeichen und Versand.' },
      { q: 'Wie viel kostet die Fahrzeugabmeldung?', a: 'Die Fahrzeugabmeldung kostet bei uns 24,95 € inkl. Kostenlose Kennzeichenreservierung.' },
      { q: 'Wie viel kostet die Fahrzeugummeldung?', a: 'Die Fahrzeugummeldung kostet bei uns 94,95 €.' },
      { q: 'Gibt es versteckte Kosten?', a: 'Nein, alle Preise sind transparent und werden vorab angezeigt.' },
      { q: 'Kann ich eine Rückerstattung beantragen, wenn ich den Service nicht nutze?', a: 'Ja, unter bestimmten Bedingungen ist eine Rückerstattung möglich, z.B. wegen Wartungsarbeiten.' },
      { q: 'Welche Zahlungsmethoden bietet ihr an?', a: 'Wir akzeptieren: PayPal, Kreditkarten (Visa, Mastercard), Sofortüberweisung, Klarna, Standardüberweisung.' },
    ],
  },
  {
    title: 'FAQ Technische Fragen',
    items: [
      { q: 'Welche Browser werden für die Online-Dienste unterstützt?', a: 'Unsere Plattform funktioniert mit den gängigen Browsern (Chrome, Firefox, Edge, Safari).' },
      { q: 'Was mache ich, wenn der Upload der Dokumente nicht funktioniert?', a: 'Kontaktieren Sie unseren Support, und wir helfen Ihnen bei der Lösung des Problems.' },
    ],
  },
  {
    title: 'FAQ Allgemeine Fragen zum Service',
    items: [
      { q: 'Was unterscheidet euren Service von anderen Anbietern?', a: 'Wir bieten einen Rundum-Service mit schneller Bearbeitung, kostenloser eVB und Kennzeichen.' },
      { q: 'Gibt es eine Hotline für weitere Fragen?', a: 'Ja, Sie können uns unter 015224999190 erreichen.' },
    ],
  },
];

export default async function AutoVerkaufenPage() {
  // Fetch 3 recent blog posts
  const recentPosts = await prisma.blogPost.findMany({
    where: { status: 'publish', publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { slug: true, title: true, excerpt: true, featuredImage: true, publishedAt: true },
  });

  return (
    <>
      {/* ── Dark Hero ── */}
      <section className="relative overflow-hidden bg-dark-950">
        <div className="pt-32 pb-16 md:pt-40 md:pb-20 relative">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="container-main relative z-10">
            <ScrollReveal>
              <div className="flex items-center gap-2 text-white/50 text-sm font-medium mb-4">
                <Link href="/kfz-services/" className="hover:text-primary transition-colors">Dienstleistungen</Link>
                <span>/</span>
                <span className="text-white/70">Auto verkaufen</span>
              </div>
              <p className="text-sm text-white/40 font-medium mb-3">Auto verkaufen in nur 5 Minuten</p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                Kostenloses und unverbindliches<br />
                <span className="text-primary">Angebot von Händlern</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-8">
                Top-Preis sichern – stressfrei, sicher und unkompliziert. Wir kaufen alle Marken und Modelle.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/product/auto-online-anmelden/" className="btn-primary text-lg">
                  KFZ anmelden <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/product/fahrzeugabmeldung/" className="btn-outline-white">
                  KFZ abmelden
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Vehicle Selling Form ── */}
      <section id="formular" className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-10">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Kostenlose Bewertung</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900">Kostenlose Fahrzeugbewertung</h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <AutoVerkaufenForm />
              {/* Contract download */}
              <div className="mt-6 text-center">
                <a
                  href="/uploads/2024/12/iKfz-Digital-Zulassung-Vertrag-fuer-den-privaten-Verkauf-eines-Fahrzeugs-zugeschnitten.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-600 font-medium text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Hier können Sie den iKfz Digital Zulassung Vertrag für den privaten Verkauf eines Fahrzeugs herunterladen.
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-primary py-12">
        <div className="container-main text-center">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
              Jetzt starten und Top-Preis sichern – stressfrei, sicher und unkompliziert!
            </h2>
            <p className="text-white/80 text-lg mb-6 max-w-3xl mx-auto">
              Verkaufen Sie Ihr Auto schnell und sicher, melden Sie Ihr Fahrzeug an, um oder ab, schließen Sie die passende Kfz-Versicherung ab und beantragen Sie Ihre eVB-Nummer – alles digital und einfach!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/evb/" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-gray-50 transition-colors">
                Ihre eVB-Nummer in wenigen Minuten <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-white/60 text-sm mt-3">Sparen Sie Zeit und erledigen Sie alles bequem von Zuhause</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Was macht iKFZ besonders? ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900">Was macht iKFZ Digital Zulassung besonders?</h2>
              </div>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((item, i) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={i} delay={i * 0.08}>
                    <div className="text-center group">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-bold text-dark-900 mb-1">{item.title}</h3>
                      <p className="text-dark-500 text-sm">{item.desc}</p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── KBA Cooperation ── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="rounded-2xl bg-white border border-dark-100 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-xs text-dark-500 font-medium mt-2 text-center">Registriert gemäß<br/>§34 FZV beim KBA</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark-900 mb-3">In Zusammenarbeit mit dem Kraftfahrt-Bundesamt (KBA)</h3>
                  <p className="text-dark-600 leading-relaxed">
                    Als unabhängiger Dienstleister arbeiten wir in enger Kooperation mit dem Kraftfahrt-Bundesamt (KBA) und dem fachaufsichtsführenden Bundesministerium für Digitales und Verkehr (BMDV). Wir unterstützen die Behörden dabei, die digitalen Zulassungsprozesse in Deutschland effizient und nutzerfreundlich zu gestalten.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Unsere Services ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900">Unsere Services – Einfach, digital, schnell</h2>
                <p className="text-dark-500 mt-3">Wählen Sie Ihren Service und erledigen Sie alles bequem online – ohne Stress und Behördengänge!</p>
              </div>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s, i) => {
                const Icon = s.icon;
                return (
                  <ScrollReveal key={i} delay={i * 0.08}>
                    <div className="group rounded-2xl bg-white border border-dark-100 p-8 hover:shadow-card hover:border-primary/20 transition-all duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-dark-900 mb-1">{s.title}</h3>
                      <p className="text-dark-500 text-sm mb-5">{s.desc}</p>
                      <Link href={s.href} className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
                        {s.cta} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── So funktioniert's – 3 Schritte ── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900">So funktioniert&apos;s – Ihr KFZ-Service in 3 einfachen Schritten</h2>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-8">
              {processSteps.map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.15}>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-5">
                      <span className="text-white font-extrabold text-xl">{item.num}</span>
                    </div>
                    <h3 className="text-lg font-bold text-dark-900 mb-2">{item.title}</h3>
                    <p className="text-dark-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog / Tipps und News ── */}
      {recentPosts.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <div className="container-main">
            <div className="max-w-5xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900">Wissen, das zählt – Tipps und News rund um KFZ-Zulassung</h2>
                </div>
              </ScrollReveal>
              <div className="grid md:grid-cols-3 gap-8">
                {recentPosts.map((post, i) => (
                  <ScrollReveal key={post.slug} delay={i * 0.1}>
                    <Link href={`/insiderwissen/${post.slug}/`} className="group block rounded-2xl bg-white border border-dark-100 overflow-hidden hover:shadow-card transition-all duration-300">
                      {post.featuredImage && (
                        <div className="aspect-[16/10] overflow-hidden">
                          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        </div>
                      )}
                      <div className="p-6">
                        {post.publishedAt && (
                          <p className="text-xs text-dark-400 font-medium mb-2">
                            {new Date(post.publishedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                          </p>
                        )}
                        <h3 className="font-bold text-dark-900 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Full FAQ ── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">FAQ</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900">Häufige Fragen zu eVB, Fahrzeuganmeldung, Ab- und Ummeldung und Kennzeichen</h2>
              </div>
            </ScrollReveal>
            <div className="space-y-10">
              {faqCategories.map((cat, ci) => (
                <ScrollReveal key={ci} delay={ci * 0.05}>
                  <div>
                    <h3 className="text-xl font-bold text-dark-900 mb-4">{cat.title}</h3>
                    <div className="space-y-3">
                      {cat.items.map((item, i) => (
                        <details key={i} className="group rounded-2xl bg-white border border-dark-100 overflow-hidden">
                          <summary className="flex items-center justify-between cursor-pointer p-5 hover:bg-gray-50 transition-colors">
                            <span className="font-medium text-dark-800 pr-4 text-sm">{item.q}</span>
                            <ChevronDown className="w-5 h-5 text-dark-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="px-5 pb-5 text-dark-600 leading-relaxed text-sm">
                            {item.a}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Online vs Offline Comparison ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">Unterschied Online vs. Offline</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900">Erledigen Sie Ihre Fahrzeugangelegenheiten einfach und digital</h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="space-y-6 mb-10">
                <p className="text-dark-600 leading-relaxed">
                  Das klassische Verfahren, einen Termin bei der Zulassungsstelle zu vereinbaren, lange Wartezeiten in Kauf zu nehmen und den gesamten Prozess persönlich durchzuführen, gehört der Vergangenheit an. Mit unserem digitalen Service erledigen Sie die Anmeldung, Ummeldung oder Abmeldung Ihres Fahrzeugs bequem von Zuhause aus – ohne Behördengänge und ohne Stress.
                </p>
                <p className="text-dark-600 leading-relaxed">
                  <strong className="text-dark-800">Warum digital?</strong> Unser Online-Service spart Ihnen wertvolle Zeit, da Sie keine Termine mehr benötigen und keine langen Wartezeiten entstehen. Stattdessen erhalten Sie alle Bestätigungen digital als PDF, sofort gültig und anerkannt bei Behörden und Versicherungen.
                </p>
                <div>
                  <h4 className="font-bold text-dark-900 mb-3">Ihre Vorteile auf einen Blick:</h4>
                  <ul className="space-y-2">
                    {[
                      'Bequem von überall: Erledigen Sie Ihre Anliegen zu jeder Zeit – ganz ohne Öffnungszeiten.',
                      'Zeitersparnis: Keine Wartezeiten, keine Termine – alles in wenigen Minuten erledigt.',
                      'Offiziell und sicher: Ihre digitalen Dokumente werden von allen Behörden und Versicherungen anerkannt.',
                      'Kompletter Service: Wir übernehmen die gesamte Abwicklung für Sie.',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-dark-600 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Comparison table */}
              <div className="rounded-2xl border border-dark-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-dark-50">
                      <th className="text-left p-4 font-bold text-dark-900"></th>
                      <th className="text-center p-4 font-bold text-dark-900">
                        <div className="flex items-center justify-center gap-2"><Building2 className="w-4 h-4" /> Zulassungsstelle</div>
                      </th>
                      <th className="text-center p-4 font-bold text-primary">
                        <div className="flex items-center justify-center gap-2"><Laptop className="w-4 h-4" /> Online-Service</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-dark-100">
                      <td className="p-4 font-medium text-dark-800">Bescheinigung &amp; Zeitaufwand</td>
                      <td className="p-4 text-center text-dark-600">in Papierform, ca. 90 Minuten</td>
                      <td className="p-4 text-center text-primary font-medium">✅ als PDF, in wenigen Minuten</td>
                    </tr>
                    <tr className="border-t border-dark-100 bg-dark-50/50">
                      <td className="p-4 font-medium text-dark-800">Wartezeiten &amp; Termin</td>
                      <td className="p-4 text-center text-dark-600">30 - 120 Minuten, Termin notwendig</td>
                      <td className="p-4 text-center text-primary font-medium">✅ keine Wartezeiten, kein Termin</td>
                    </tr>
                    <tr className="border-t border-dark-100">
                      <td className="p-4 font-medium text-dark-800">Flexibilität</td>
                      <td className="p-4 text-center text-dark-600">Öffnungszeiten der Behörde</td>
                      <td className="p-4 text-center text-primary font-medium">✅ immer geöffnet</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Auto verkaufen leicht gemacht – Detailed Content ── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900">Auto verkaufen leicht gemacht – So einfach geht&apos;s!</h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="rounded-2xl bg-white border border-dark-100 p-8 md:p-10 space-y-8">
                <p className="text-dark-600 leading-relaxed">
                  Der Autoankauf war noch nie so unkompliziert und stressfrei wie mit unserem Service. Bei uns haben Sie die Möglichkeit, Ihr Fahrzeug schnell, sicher und bequem online zu verkaufen. Mit nur wenigen Klicks können Sie ein kostenloses Angebot erhalten und von unseren zahlreichen Vorteilen profitieren.
                </p>

                {/* Warum unser Autoankauf-Service */}
                <div>
                  <h3 className="text-xl font-bold text-dark-900 mb-3">Warum unser Autoankauf-Service die beste Wahl ist</h3>
                  <p className="text-dark-600 leading-relaxed mb-4">
                    Wir kaufen Ihr Auto – ganz gleich, ob es sich um einen Gebrauchtwagen, Unfallwagen oder ein Fahrzeug ohne TÜV handelt. Unsere Plattform bietet Ihnen nicht nur faire Preise, sondern auch einen Rundum-Service, der keine Wünsche offenlässt.
                  </p>
                  <ul className="space-y-3">
                    {[
                      { icon: Truck, text: 'Kostenlose Abholung: Wir holen Ihr Fahrzeug direkt bei Ihnen zu Hause oder an einem beliebigen Standort ab – völlig kostenlos.' },
                      { icon: FileText, text: 'Kostenlose Abmeldung: Wir kümmern uns um die Abmeldung Ihres Autos bei der Zulassungsstelle. Sie erhalten von uns eine offizielle Bestätigung der Abmeldung.' },
                      { icon: ShieldCheck, text: 'Sicher und unkompliziert: Dank unserer Zusammenarbeit mit zertifizierten Händlern garantieren wir Ihnen einen transparenten und sicheren Verkaufsprozess.' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-dark-600 text-sm leading-relaxed">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* So funktioniert unser Autoankauf */}
                <div>
                  <h3 className="text-xl font-bold text-dark-900 mb-4">So funktioniert unser Autoankauf</h3>
                  <div className="space-y-4">
                    {[
                      { num: '1', title: 'Fahrzeugdaten eingeben', text: 'Geben Sie einfach die wichtigsten Daten Ihres Autos ein, wie Marke, Modell, Baujahr und Kilometerstand. Zusätzlich können Sie Bilder hochladen, um den Wert Ihres Fahrzeugs noch präziser einschätzen zu lassen.' },
                      { num: '2', title: 'Kostenloses Angebot erhalten', text: 'Nach der Eingabe Ihrer Daten überprüfen wir diese und erstellen ein faires Angebot. Dieses basiert auf dem aktuellen Marktwert und wird Ihnen schnellstmöglich mitgeteilt.' },
                      { num: '3', title: 'Abholung und Abmeldung', text: 'Wenn Sie das Angebot annehmen, holen wir Ihr Auto kostenlos bei Ihnen ab. Gleichzeitig übernehmen wir die komplette Abmeldung Ihres Fahrzeugs bei der Zulassungsbehörde und senden Ihnen die Abmeldebestätigung zu.' },
                      { num: '4', title: 'Sichere Bezahlung', text: 'Nach der Übergabe erhalten Sie Ihr Geld direkt und sicher – entweder per Überweisung oder Barzahlung, je nach Wunsch.' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-bold text-sm">{item.num}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-dark-900 mb-1">{item.title}</h4>
                          <p className="text-dark-600 text-sm leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vorteile auf einen Blick */}
                <div>
                  <h3 className="text-xl font-bold text-dark-900 mb-3">Ihre Vorteile auf einen Blick</h3>
                  <ul className="space-y-2">
                    {[
                      'Schnelligkeit: Verkaufen Sie Ihr Auto in wenigen Schritten online.',
                      'Flexibilität: Wir kaufen Autos aller Marken und Zustände an.',
                      'Rundum-Service: Abholung und Abmeldung sind bei uns kostenlos.',
                      'Zuverlässigkeit: Sie erhalten eine Bestätigung der Abmeldung direkt von der Zulassungsbehörde.',
                      'Faire Preise: Unsere Angebote basieren auf dem aktuellen Marktwert und sind unverbindlich.',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-dark-600 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Auto-Verkauf FAQ */}
                <div>
                  <h3 className="text-xl font-bold text-dark-900 mb-4">Häufig gestellte Fragen (FAQ)</h3>
                  <div className="space-y-3">
                    {[
                      { q: 'Welche Fahrzeugtypen kann ich verkaufen?', a: 'Wir kaufen alle Arten von Fahrzeugen, darunter Gebrauchtwagen, Unfallwagen, Fahrzeuge ohne TÜV und sogar Autos mit hoher Kilometerleistung.' },
                      { q: 'Wie lange dauert der Verkaufsprozess?', a: 'Der gesamte Prozess, von der Angebotserstellung bis zur Bezahlung, kann innerhalb weniger Tage abgeschlossen sein.' },
                      { q: 'Ist der Service wirklich kostenlos?', a: 'Ja, sowohl die Abholung als auch die Abmeldung Ihres Fahrzeugs sind vollkommen kostenlos.' },
                      { q: 'Was passiert, wenn ich das Angebot ablehne?', a: 'Kein Problem – unser Service ist unverbindlich. Wenn Ihnen das Angebot nicht zusagt, entstehen keine Kosten.' },
                    ].map((item, i) => (
                      <details key={i} className="group rounded-xl bg-gray-50 border border-dark-100 overflow-hidden">
                        <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-100 transition-colors">
                          <span className="font-medium text-dark-800 pr-4 text-sm">{item.q}</span>
                          <ChevronDown className="w-4 h-4 text-dark-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="px-4 pb-4 text-dark-600 leading-relaxed text-sm">{item.a}</div>
                      </details>
                    ))}
                  </div>
                </div>

                {/* Warum iKFZ */}
                <div>
                  <h3 className="text-xl font-bold text-dark-900 mb-3">Warum iKFZ Digitalzulassung?</h3>
                  <p className="text-dark-600 leading-relaxed mb-3">
                    Unser Ziel ist es, den Autoankauf für unsere Kunden so einfach wie möglich zu gestalten. Neben dem Ankauf bieten wir auch Dienstleistungen wie die Anmeldung, Ummeldung und Abmeldung von Fahrzeugen sowie die Beantragung von eVB-Nummern und den Abschluss von Kfz-Versicherungen an. Alles digital, alles aus einer Hand.
                  </p>
                  <p className="text-dark-600 leading-relaxed">
                    Vertrauen Sie auf unsere Erfahrung und unser Netzwerk aus professionellen Händlern, um den besten Preis für Ihr Fahrzeug zu erzielen.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Final CTA (Dark) ── */}
      <section className="relative bg-dark-950 py-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="container-main relative z-10 text-center">
          <ScrollReveal>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Jetzt Ihr <span className="text-primary">Auto verkaufen</span>
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Starten Sie noch heute und profitieren Sie von unserem erstklassigen Service. Geben Sie einfach Ihre Fahrzeugdaten ein und lassen Sie uns den Rest erledigen. Sicher, schnell und kostenlos!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/product/auto-online-anmelden/" className="btn-primary text-lg">
                KFZ online anmelden <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/product/fahrzeugabmeldung/" className="btn-outline-white">
                Online KFZ abmelden
              </Link>
              <Link href="/evb/" className="btn-outline-white">
                eVB-Nummer anfordern
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
