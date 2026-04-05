import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Phone, ShieldCheck, Clock, Zap, CreditCard, ExternalLink, AlertTriangle } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'KFZ Online Abmelden – Schnell & ohne Behördengang',
  description:
    'KFZ online abmelden – in wenigen Minuten erledigt. Ohne Termin, ohne Wartezeit. Für nur 19,75 € Kennzeichenreservierung. Jetzt digital abmelden!',
  alternates: {
    canonical: 'https://ikfzdigitalzulassung.de/kfz-online-abmelden/',
  },
};

export default function KfzAbmeldenPage() {
  return (
    <>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-dark-950">
        <div className="pt-32 pb-16 md:pt-40 md:pb-20 relative">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="container-main relative z-10">
            <ScrollReveal>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
                KFZ Online abmelden
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-4">
                Erledigen Sie die Fahrzeugabmeldung schnell und bequem von zu Hause – ohne Behördentermin.
              </p>
              <p className="text-white/50 max-w-2xl mb-6">
                Senden Sie uns einfach Fotos der Vorder- und Rückseite Ihres Fahrzeugscheins (mit sichtbarem Code) sowie beider Kennzeichen. Bei Motorrädern oder Anhängern genügt das vordere Kennzeichen.
              </p>
              <div className="mb-8">
                <Image
                  src="/uploads/2025/02/KBA-NEU-e1739626430147.png"
                  alt="KBA NEU"
                  width={200}
                  height={80}
                  className="opacity-80"
                  unoptimized
                />
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <Link href="/kfz-service/kfz-online-service/" className="btn-primary text-lg">
                  JETZT KFZ ONLINE ABMELDEN FÜR NUR 19,70 € INKL. AMTLICHER BESTÄTIGUNG! <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Die unschlagbaren Vorteile ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <p className="text-primary font-semibold mb-2">Die unschlagbaren Vorteile</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-dark-900 mb-8">
                Online abmelden, ohne Personalausweis!
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: ShieldCheck, title: 'Unkompliziert und sicher', desc: 'Kein mühsames Ausfüllen von Formularen oder Behördengänge.' },
                { icon: Clock, title: 'Zeit effizient nutzen', desc: 'Erledigen Sie die Abmeldung schnell und stressfrei.' },
                { icon: Zap, title: 'Kein Warten / Papierkram', desc: 'Sparen Sie sich den Weg zur Zulassungsstelle.' },
                { icon: CreditCard, title: '19,70 € Fest Preis', desc: 'Transparenter Festpreis ohne versteckte Kosten.' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={i} delay={i * 0.08}>
                    <div className="group rounded-2xl bg-gray-50 border border-dark-100 p-8 hover:shadow-card hover:border-primary/20 transition-all duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-dark-900 mb-2">{item.title}</h3>
                      <p className="text-dark-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Abmeldung für alle Regionen ── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-extrabold text-dark-900 mb-6">
                Abmeldung und Zulassung für alle Regionen – auch ohne Digitalisierung
              </h2>
              <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                <p>
                  Dank unserer Zusammenarbeit mit dem Kraftfahrt-Bundesamt (KBA) können wir Fahrzeuge in ganz Deutschland online abmelden oder zulassen – unabhängig davon, ob die zuständige Zulassungsstelle vollständig digitalisiert ist.
                </p>
                <p className="font-semibold mt-6">Für nicht-digitalisierte Zulassungsstellen:</p>
                <ul className="space-y-3 mt-4 list-none pl-0">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Informieren wir Sie sofort, dass Ihre Abmeldung oder Zulassung erfolgreich bei der Zulassungsbehörde eingereicht wurde.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Die zuständige Behörde sendet Ihnen die endgültige Bestätigung direkt per Post.</span>
                  </li>
                </ul>
                <p className="mt-6">
                  Für volldigitalisierte Zulassungsstellen erfolgt die Bestätigung direkt über unser System – schnell und unkompliziert. Dieser Service wird deutschlandweit nur von wenigen Anbietern, wie uns, angeboten.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mt-10 text-center">
                <Link href="/kfz-service/kfz-online-service/" className="btn-primary text-lg">
                  JETZT KFZ ONLINE ABMELDEN FÜR NUR 24,95 € <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Wichtig Hinweis ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-8 flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-dark-900">
                    Wichtig : Abmeldung online für zugelassene Fahrzeuge vor 2015 ist leider nicht möglich.
                  </h2>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 5 Steps: Simpel und für jeden machbar ── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h3 className="text-2xl md:text-3xl font-extrabold text-dark-900 mb-8 text-center">
                Simpel und für jeden machbar
              </h3>
            </ScrollReveal>
            <div className="space-y-6">
              {[
                {
                  num: 1,
                  title: 'Fahrgestellnummer (FIN)',
                  desc: 'Die Fahrzeug-Identifizierungsnummer (FIN) finden Sie unter Buchstabe E im Fahrzeugschein oder Fahrzeugbrief.',
                },
                {
                  num: 2,
                  title: 'Sicherheitscode aus dem Fahrzeugschein',
                  desc: 'Geben Sie den 7-stelligen Sicherheitscode ein, den Sie im Fahrzeugschein (Zulassungsbescheinigung Teil I) finden.',
                },
                {
                  num: 3,
                  title: 'Sicherheitscode der Schilder',
                  desc: 'Zeichnen Sie mit einem Messer vorsichtig eine U-Form um das Siegel in die Folie ein. Klappen Sie dann die Folie hoch, um den 3-stelligen Code sichtbar zu machen.',
                },
                {
                  num: 4,
                  title: 'Daten eingegeben?',
                  desc: 'Lehnen Sie sich zurück – wir kümmern uns um die sichere und reibungslose Abmeldung Ihres Fahrzeugs.',
                },
                {
                  num: 5,
                  title: 'Bestätigung per E-Mail erhalten',
                  desc: 'Sie erhalten eine Bestätigung per E-Mail, sobald Ihr Fahrzeug erfolgreich abgemeldet ist. Unser Service macht es für Sie einfach und unkompliziert.',
                },
              ].map((step, i) => (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <div className="rounded-2xl bg-white border border-dark-100 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-extrabold text-lg">{step.num}</span>
                      </div>
                      <div>
                        <p className="text-xs text-dark-400 font-medium mb-1">Schritt {step.num}</p>
                        <h4 className="text-lg font-bold text-dark-900 mb-2">{step.title}</h4>
                        <p className="text-dark-700 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.3}>
              <div className="mt-10 text-center">
                <p className="text-2xl font-extrabold text-primary mb-4">Für Nur 24,95€</p>
                <Link href="/kfz-service/kfz-online-service/" className="btn-primary text-lg">
                  KFZ ONLINE ABMELDEN <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Erklärvideo Section ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <p className="text-primary font-semibold mb-2">ERKLÄRVIDEO: SO FUNKTIONIERT&apos;S</p>
              <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-6">
                Schauen Sie sich unser kurzes Video an und erfahren Sie den Ablauf auf einen Blick. Bei Schwierigkeiten steht Ihnen unser Live-Support jederzeit zur Verfügung.
              </h3>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Service CTAs ── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ScrollReveal delay={0}>
                <Link href="/kfz-service/kfz-online-service/" className="block rounded-2xl bg-white border border-dark-100 p-6 text-center hover:shadow-card hover:border-primary/20 transition-all duration-300">
                  <span className="text-primary font-bold">JETZT KFZ ANMELDEN!</span>
                </Link>
              </ScrollReveal>
              <ScrollReveal delay={0.05}>
                <Link href="/kfz-service/kfz-online-service/" className="block rounded-2xl bg-white border border-dark-100 p-6 text-center hover:shadow-card hover:border-primary/20 transition-all duration-300">
                  <span className="text-primary font-bold">JETZT KFZ ABMELDEN</span>
                </Link>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <Link href="/kfz-service/kfz-online-service/" className="block rounded-2xl bg-white border border-dark-100 p-6 text-center hover:shadow-card hover:border-primary/20 transition-all duration-300">
                  <span className="text-primary font-bold">JETZT KFZ UMMELDEN</span>
                </Link>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <Link href="/evb/" className="block rounded-2xl bg-white border border-dark-100 p-6 text-center hover:shadow-card hover:border-primary/20 transition-all duration-300">
                  <span className="text-primary font-bold text-sm">IHRE EVB-NUMMER IN WENIGEN MINUTEN</span>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Detailed Content: KFZ Online Abmelden – Schnell, Sicher und Komfortabel ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                KFZ Online Abmelden – Schnell, Sicher und Komfortabel
              </h3>
              <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                <p>
                  Die Abmeldung Ihres Fahrzeugs war noch nie so einfach! Mit unserem Service können Sie Ihr KFZ bequem von zu Hause aus abmelden, ohne einen Termin bei der Zulassungsstelle vereinbaren zu müssen. Keine langen Wartezeiten, kein Papierkram – einfach online abmelden und Zeit sparen.
                </p>
              </div>
            </ScrollReveal>

            {/* Vorteile */}
            <ScrollReveal delay={0.05}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Die Vorteile der KFZ-Online-Abmeldung
                </h3>
                <h4 className="text-lg font-bold text-dark-900 mb-4">
                  Warum die digitale Abmeldung sinnvoll ist
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-dark-700"><strong>Unkompliziert und sicher:</strong> Kein mühsames Ausfüllen von Formularen oder Behördengänge.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-dark-700"><strong>Zeit effizient nutzen:</strong> Erledigen Sie die Abmeldung schnell und stressfrei.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-dark-700"><strong>Keine Wartezeiten:</strong> Sparen Sie sich den Weg zur Zulassungsstelle.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-dark-700"><strong>Inklusive Kennzeichenreservierung:</strong> Für nur 24,95 € können Sie Ihr Fahrzeug abmelden und gleichzeitig Ihr Kennzeichen für zukünftige Fahrzeuge sichern.</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            {/* Einschränkungen */}
            <ScrollReveal delay={0.1}>
              <div className="mt-12">
                <h4 className="text-lg font-bold text-dark-900 mb-4">
                  Einschränkungen und Hinweise
                </h4>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    <strong>Wichtig:</strong> Die Online-Abmeldung ist nur für Fahrzeuge möglich, die nach 2015 zugelassen wurden.
                  </p>
                  <p>
                    <strong>ACHTUNG:</strong> Nicht jede Stadt in Deutschland bietet die Möglichkeit der Online-Abmeldung. Überprüfen Sie, ob Ihre Region betroffen ist. Eine Übersicht zu den Städten und Regionen finden Sie auf der offiziellen Webseite der{' '}
                    <a
                      href="https://bmdv.bund.de/SharedDocs/DE/Artikel/StV/Strassenverkehr/internetbasierte-fahrzeugzulassung.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Kraftfahrzeug-Zulassungsbehörde
                      <ExternalLink className="w-4 h-4" />
                    </a>.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Schritt-für-Schritt-Anleitung */}
            <ScrollReveal delay={0.15}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Schritt-für-Schritt-Anleitung zur KFZ Online Abmelden
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed mb-6">
                  <p>
                    Unsere Online-Abmeldung ist simpel und für jeden machbar. Folgen Sie einfach diesen Schritten:
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">Schritt 1 – Fahrzeug-Identifizierungsnummer (FIN)</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Die FIN finden Sie im Fahrzeugschein oder Fahrzeugbrief unter Buchstabe E. Geben Sie diese Nummer ein, um den Abmeldeprozess zu starten.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">Schritt 2 – Sicherheitscode aus dem Fahrzeugschein</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Der 7-stellige Sicherheitscode befindet sich in der Zulassungsbescheinigung Teil I (Fahrzeugschein). Tragen Sie diesen Code ein, um Ihr Fahrzeug eindeutig zu identifizieren.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">Schritt 3 – Sicherheitscode der Kennzeichen</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Um den Sicherheitscode der Kennzeichen zu ermitteln, zeichnen Sie vorsichtig eine U-Form um das Siegel auf der Plakette. Klappen Sie die Folie hoch, um den 3-stelligen Code sichtbar zu machen. Dies ist ein wichtiger Schritt, um die Abmeldung zu verifizieren. Weitere Informationen zur Kennzeichenverarbeitung finden Sie auf der offiziellen Seite des{' '}
                      <a
                        href="https://www.meldino.de/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Bundesverkehrsministeriums
                        <ExternalLink className="w-4 h-4" />
                      </a>.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">Schritt 4 – Daten eingegeben?</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Nach Eingabe aller erforderlichen Daten können Sie sich zurücklehnen. Unser System übernimmt die Abwicklung der Abmeldung. Sicher und schnell!
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">Schritt 5 – Bestätigung per E-Mail erhalten</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Sobald die Abmeldung erfolgreich abgeschlossen ist, erhalten Sie eine Bestätigung per E-Mail. Dieses Dokument ist Ihre offizielle Bestätigung, dass Ihr Fahrzeug abgemeldet wurde.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Kennzeichenreservierung */}
            <ScrollReveal delay={0.2}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Kennzeichenreservierung inklusive
                </h3>
                <h4 className="text-lg font-bold text-dark-900 mb-4">
                  Warum die Kennzeichenreservierung wichtig ist
                </h4>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Ein besonderer Vorteil unseres Services: Ihr Kennzeichen bleibt reserviert – ohne zusätzliche Kosten! Wenn Sie Ihr Fahrzeug später erneut anmelden oder ein neues Fahrzeug registrieren möchten, können Sie Ihr persönliches Kennzeichen ganz einfach wiederverwenden. Das spart Zeit und bietet Komfort.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Kostenübersicht */}
            <ScrollReveal delay={0.25}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Kostenübersicht – Nur 24,95 € für die KFZ-Abmeldung
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Unser Service ist nicht nur schnell und einfach, sondern auch erschwinglich. Für nur 24,95 €, inklusive der Reservierung Ihres Kennzeichens, erledigen wir den gesamten Prozess für Sie.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Unterstützung und Erklärvideo */}
            <ScrollReveal delay={0.3}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Unterstützung und Erklärvideo für KFZ Online Abmelden
                </h3>
                <h4 className="text-lg font-bold text-dark-900 mb-4">
                  Erklärvideo – So funktioniert&apos;s
                </h4>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed mb-6">
                  <p>
                    Für eine schnelle Orientierung können Sie sich unser kurzes Erklärvideo ansehen. In wenigen Minuten erfahren Sie alles, was Sie wissen müssen, um den Abmeldeprozess erfolgreich durchzuführen.
                  </p>
                </div>
                <h4 className="text-lg font-bold text-dark-900 mb-4">
                  Live-Support bei Fragen
                </h4>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Falls Sie während der Abmeldung auf Schwierigkeiten stoßen, steht Ihnen unser Live-Support jederzeit zur Verfügung. Unser Team hilft Ihnen bei jedem Schritt weiter und beantwortet Ihre Fragen.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Rechtliche Hinweise */}
            <ScrollReveal delay={0.35}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Rechtliche Hinweise und Einschränkungen
                </h3>
                <h4 className="text-lg font-bold text-dark-900 mb-4">
                  Einschränkungen der Online-Abmeldung
                </h4>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed mb-6">
                  <p>
                    Bitte beachten Sie, dass die Online-Abmeldung nur für Fahrzeuge mit einer Zulassung nach 2015 möglich ist. Ältere Fahrzeuge können derzeit nicht über dieses System abgemeldet werden.
                  </p>
                </div>
                <h4 className="text-lg font-bold text-dark-900 mb-4">
                  Abhängig von Ihrer Region
                </h4>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Nicht alle Städte in Deutschland bieten die Möglichkeit der Online-Abmeldung. Überprüfen Sie, ob Ihre Region den Service unterstützt.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Fazit */}
            <ScrollReveal delay={0.4}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Fazit: KFZ Online Abmelden leicht gemacht
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Die digitale Abmeldung Ihres Fahrzeugs ist der einfachste Weg, Zeit und Nerven zu sparen. Mit einem transparenten und sicheren Prozess, einer unschlagbaren Preisstruktur von 24,95 € inkl. Kennzeichenreservierung und einer einfachen Schritt-für-Schritt-Anleitung ist unser Service die perfekte Lösung für Fahrzeughalter in Deutschland. Probieren Sie es aus und erleben Sie, wie unkompliziert die KFZ-Abmeldung sein kann.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Weitere Dienstleistungen */}
            <ScrollReveal delay={0.45}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Nutzen Sie auch unsere weiteren Dienstleistungen
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Neben der KFZ-Abmeldung bieten wir Ihnen auch zahlreiche weitere Dienstleistungen, um Ihre Fahrzeugverwaltung so einfach wie möglich zu gestalten. Profitieren Sie von unserem umfangreichen Angebot:
                  </p>
                </div>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-dark-700"><strong>KFZ-Anmeldung:</strong> Melden Sie Ihr Fahrzeug bequem online an, ohne einen Termin bei der Zulassungsstelle.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-dark-700"><strong>KFZ-Ummeldung:</strong> Ändern Sie Fahrzeug- oder Halterdaten unkompliziert über unsere Plattform.</span>
                  </li>
                </ul>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/kfz-service/kfz-online-service/" className="btn-primary">
                    Jetzt direkt zur Abmeldung <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/evb/" className="btn-secondary">
                    Hier eVB Beantragen
                  </Link>
                  <Link href="/auto-online-anmelden/" className="btn-secondary">
                    Hier Fahrzeug anmelden
                  </Link>
                </div>
                <div className="mt-8">
                  <p className="text-dark-700 leading-relaxed">
                    Erleben Sie, wie einfach die Verwaltung Ihrer Fahrzeugdaten sein kann – alles digital, sicher und bequem.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── CTA (Dark) ── */}
      <section className="relative bg-dark-950 py-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="container-main relative z-10 text-center">
          <ScrollReveal>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Bereit, Ihr <span className="text-primary">Fahrzeug abzumelden</span>?
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Starten Sie jetzt – für nur 24,95 € inkl. Kennzeichenreservierung.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/kfz-service/kfz-online-service/" className="btn-primary text-lg">
                KFZ ONLINE ABMELDEN <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auto-online-anmelden/" className="btn-outline-white">
                Auto anmelden
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
