import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Phone, ExternalLink } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Motorrad Online Anmelden – ab 119,75 €',
  description:
    'Motorrad online anmelden – einfach, digital und ohne Stress. Schnell, sicher und offiziell beim KBA registriert. Jetzt in wenigen Minuten erledigen!',
  alternates: {
    canonical: 'https://ikfzdigitalzulassung.de/motorrad-online-anmelden/',
  },
};

export default function MotorradAnmeldenPage() {
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
              <p className="text-white/60 text-lg mb-4">
                Erledigen Sie die Anmeldung Ihres Motorrads in 5 Minuten
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
                Motorrad Online Anmelden<br />
                <span className="text-primary">für ab 89,95 €</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-4">
                einfach, digital und ohne Stress
              </p>
              <div className="flex flex-wrap gap-4 items-center mb-8">
                <Link href="/kfz-service/kfz-online-service/" className="btn-primary text-lg">
                  JETZT MOTORRAD ONLINE ANMELDEN <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="mt-6">
                <Image
                  src="/uploads/2025/02/KBA-NEU-e1739626430147.png"
                  alt="KBA NEU"
                  width={200}
                  height={80}
                  className="opacity-80"
                  unoptimized
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Motorrad online anmelden – schnell, einfach und für jeden machbar ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-dark-900">
                  Motorrad online anmelden<br />
                  <span className="text-primary">schnell, einfach und für jeden machbar</span>
                </h2>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Motorrad online anmelden in ganz Deutschland ── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-extrabold text-dark-900 mb-6">
                Motorrad online anmelden in ganz Deutschland – Egal ob digitalisiert oder nicht
              </h2>
              <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                <p>
                  Mit unserem Service können Sie Ihr Fahrzeug in jeder Region Deutschlands online anmelden – unabhängig davon, ob die Zulassungsstelle vollständig digitalisiert ist.
                </p>
                <p className="font-semibold mt-6">Für Zulassungsstellen, die nicht volldigitalisiert sind:</p>
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Reichen wir Ihre Anmeldung manuell bei der zuständigen Behörde ein.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Sie erhalten von uns eine Bestätigung, dass Ihre Anmeldung erfolgreich eingereicht wurde.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Die Zulassungsstelle informiert Sie direkt per Post über den Abschluss der Anmeldung.</span>
                  </li>
                </ul>
                <p className="mt-6">
                  Bei volldigitalisierten Zulassungsstellen erfolgt die Bestätigung direkt und schnell über unser System. Dank unserer Zusammenarbeit mit dem Kraftfahrt-Bundesamt (KBA) sind wir einer der wenigen Anbieter, die diesen umfassenden Service deutschlandweit ermöglichen.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="mt-10 rounded-2xl bg-white border border-dark-100 p-8">
                <p className="text-dark-600 text-sm leading-relaxed">
                  * Bei einer Umschreibung oder einer Wiederzulassung mit Halter- oder Kennzeichenwechsel, muss die Zulassungsbescheinigung Teil II nach dem 01.01.2018 ausgestellt sein.
                </p>
                <p className="text-dark-600 text-sm leading-relaxed mt-3">
                  ** Bei Außerbetriebsetzung des Fahrzeuges ist zu beachten, dass die Zulassung des Fahrzeuges nach dem 01.01.2015 erfolgt ist.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="mt-10 text-center">
                <Link href="/kfz-service/kfz-online-service/" className="btn-primary text-lg">
                  JETZT MOTORRAD ONLINE ANMELDEN <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Main Content: Motorrad online anmelden – Einfach, schnell und bequem ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-extrabold text-dark-900 mb-6">
                Motorrad online anmelden – Einfach, schnell und bequem
              </h2>
              <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                <p>
                  Die Zulassung oder Abmeldung eines Fahrzeugs kann oft mit viel Aufwand und Zeit verbunden sein. Mit unserem Online-Zulassungsservice möchten wir Ihnen diesen Prozess erleichtern. Ob Sie Ihr Fahrzeug neu anmelden, ummelden oder abmelden möchten – bei uns können Sie das alles bequem von zu Hause aus erledigen. Kein Stress mit langen Wartezeiten oder Terminvereinbarungen bei der Zulassungsstelle!
                </p>
              </div>
            </ScrollReveal>

            {/* Ihre Vorteile */}
            <ScrollReveal delay={0.05}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Ihre Vorteile mit unserem Online-Zulassungsservice- Motorrad online anmelden
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Unser Service bietet Ihnen nicht nur eine schnelle und einfache Möglichkeit, Ihr Fahrzeug online zuzulassen oder abzumelden, sondern auch die Flexibilität, Ihre Daten auf verschiedene Arten einzureichen. Sie haben die Wahl: Entweder tragen Sie die erforderlichen Daten manuell ein oder, wenn es schneller gehen soll, schicken Sie uns einfach Fotos der benötigten Dokumente.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Dokumente per Foto */}
            <ScrollReveal delay={0.1}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Einfach und schnell: Dokumente per Foto einreichen- Motorrad online anmelden
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Für eine zügige Bearbeitung können Sie die erforderlichen Dokumente einfach per Foto an uns übermitteln. Damit entfällt für Sie das mühsame Eintippen von Daten, und wir können Ihren Antrag umgehend bearbeiten. Hier ist eine Übersicht, welche Dokumente wir benötigen und wie Sie diese am besten bereitstellen:
                  </p>
                </div>
                <div className="mt-6 space-y-6">
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">1. Fahrzeugschein (Zulassungsbescheinigung Teil I):</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Der Fahrzeugschein enthält wichtige Informationen zum Fahrzeug und zur Zulassung. Wir benötigen ein gut lesbares Foto der Vorder- und Rückseite.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">2. Fahrzeugbrief (Zulassungsbescheinigung Teil II):</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Der Fahrzeugbrief ist ein essenzielles Dokument, das den Fahrzeughalter ausweist. Auch hier brauchen wir ein Foto von Vorder- und Rückseite.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">3. eVB-Nummer:</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Für die Anmeldung benötigen Sie eine gültige elektronische Versicherungsbestätigungsnummer (eVB). Falls Sie noch keine haben, können Sie diese über unseren Service anfordern. Sobald Sie die eVB-Nummer haben, schicken Sie sie uns einfach mit den Dokumenten.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Ablauf der Onlinezulassung */}
            <ScrollReveal delay={0.15}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  So funktioniert der Ablauf der Onlinezulassung - Motorrad online anmelden
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed mb-6">
                  <p>
                    Mit unserem Service ist die Fahrzeugzulassung ein schneller und einfacher Prozess. Hier ein Überblick über die einzelnen Schritte:
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">1. Fahrzeugdaten übermitteln</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Entscheiden Sie sich, ob Sie die Fahrzeugdaten manuell eingeben oder uns die Dokumente per Foto zukommen lassen möchten. Bei der Fotomethode können Sie einfach Fotos von Fahrzeugschein, Fahrzeugbrief und Ihrer eVB-Nummer hochladen – und das war&apos;s schon! Unsere Experten kümmern sich um den Rest.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">2. Wahl des Kennzeichens</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Im nächsten Schritt wählen Sie, ob Sie ein beliebiges Kennzeichen, ein reserviertes Kennzeichen oder ein Wunschkennzeichen möchten. Für Wunschkennzeichen können Sie uns Ihre Präferenz mitteilen, und wir prüfen die Verfügbarkeit.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">3. HU/TÜV-Status angeben</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Geben Sie an, ob die HU/TÜV noch gültig ist. Falls nicht, tragen Sie das Datum der letzten Prüfung ein oder schicken Sie uns ein Foto der entsprechenden Bescheinigung.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">4. Verifizierung über Verimi</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Zum Abschluss der Online-Zulassung erhalten Sie einen Link zur Verifizierung. Diese Verifizierung läuft über unseren Partner Verimi und ist notwendig, um den Prozess sicher und zuverlässig abzuschließen. Folgen Sie einfach dem Link, und schon sind Sie fertig.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Warum Fotomethode */}
            <ScrollReveal delay={0.2}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Warum Sie unsere Fotomethode nutzen sollten- Motorrad online anmelden
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Das manuelle Eintragen von Daten kann zeitaufwändig sein, besonders wenn viele Informationen erforderlich sind. Mit der Fotomethode sparen Sie nicht nur Zeit, sondern sorgen auch dafür, dass alle Informationen korrekt übermittelt werden. Unsere Mitarbeiter entnehmen die relevanten Daten direkt den eingesandten Fotos und stellen so sicher, dass alles vollständig und korrekt ist.
                  </p>
                  <p>
                    Falls Sie also wenig Zeit haben oder es sich einfach machen möchten, nutzen Sie die Möglichkeit, die Dokumente per Foto zu übermitteln. So wird der Prozess der Fahrzeugzulassung noch komfortabler.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Sichere und schnelle Bearbeitung */}
            <ScrollReveal delay={0.25}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Sichere und schnelle Bearbeitung-Motorrad online anmelden
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Wir legen höchsten Wert auf die Sicherheit Ihrer Daten. Alle Fotos und Informationen, die Sie uns übermitteln, werden streng vertraulich behandelt und nur für den Zulassungsprozess verwendet. So können Sie sicher sein, dass Ihre Daten bei uns in guten Händen sind.
                  </p>
                  <h4 className="text-lg font-bold text-dark-900 mt-6 mb-3">Fazit</h4>
                  <p>
                    Unser Online-Zulassungsservice ist die einfachste und schnellste Möglichkeit, Ihr Fahrzeug anzumelden, umzumelden oder abzumelden. Ob Sie die Daten manuell eingeben oder per Foto übermitteln möchten – wir bieten Ihnen die Flexibilität, die zu Ihren Bedürfnissen passt. Testen Sie unseren Service und erleben Sie, wie unkompliziert die Zulassung Ihres Fahrzeugs sein kann!
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Versicherung */}
            <ScrollReveal delay={0.3}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Versicherung- Motorrad online anmelden
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Vergleichen Sie schnell und einfach Kfz-Versicherungen online, um die beste Lösung für Ihr Fahrzeug zu finden. Nutzen Sie Plattformen wie{' '}
                    <a
                      href="https://a.partner-versicherung.de/click.php?partner_id=184294&ad_id=15&deep=kfz-versicherung"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      CHECK24 Kfz-Versicherungsvergleich oder Tarifcheck Kfz-Versicherung
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    , um Tarife und Leistungen zu vergleichen und direkt online abzuschließen.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* KBA */}
            <ScrollReveal delay={0.35}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Kraftfahrt-Bundesamt (KBA)- Motorrad online anmelden
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Das KBA ist die zentrale Behörde für alle Fragen rund um die Fahrzeugzulassung in Deutschland. Weitere Informationen zu Fahrzeugabmeldungen, Zulassungsstellen und Digitalisierung finden Sie auf der offiziellen Website des{' '}
                    <a
                      href="https://www.kba.de/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Kraftfahrt-Bundesamts (KBA)
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    .
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
              Bereit, Ihr <span className="text-primary">Motorrad online anzumelden</span>?
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Starten Sie jetzt und sparen Sie sich den Weg zur Zulassungsstelle.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/kfz-service/kfz-online-service/" className="btn-primary text-lg">
                JETZT MOTORRAD ONLINE ANMELDEN <ArrowRight className="w-5 h-5" />
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
