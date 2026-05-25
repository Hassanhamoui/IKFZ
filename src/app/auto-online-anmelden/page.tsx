import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Phone, ExternalLink } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Kfz Zulassung online – Ihr offizieller i-Kfz Service',
  description:
    'Auto online anmelden, ummelden oder wiederzulassen – einfach, schnell und bequem. Ihr offizieller i-Kfz Service mit persönlicher Hilfe bei der Verifizierung.',
  alternates: {
    canonical: 'https://ikfzdigitalzulassung.de/auto-online-anmelden/',
  },
};

const formSteps = [
  {
    num: 1,
    title: 'HU/TÜV-Bericht',
    desc: 'Geben Sie an, ob die HU/TÜV noch gültig ist. Falls nicht, müssen Sie die geforderten Daten, die dann erscheinen, ausfüllen.',
  },
  {
    num: 2,
    title: 'eVB Nummer eintragen',
    desc: 'Tragen Sie die 7-stellige eVB-Nummer Ihrer Versicherung ein. Falls Sie keine haben, können Sie diese schnell und unkompliziert über uns anfordern.',
  },
  {
    num: 3,
    title: 'Kennzeichen auswählen',
    desc: 'Entscheiden Sie sich, ob Sie ein Wunschkennzeichen, ein reserviertes Kennzeichen oder ein nächstfreies Kennzeichen möchten. Wir bieten Kennzeichen für nur 29,95 € inklusive Versand an.',
  },
  {
    num: 4,
    title: 'Fahrzeugschein',
    desc: 'Die Fahrzeug-Identifizierungsnummer (FIN) finden Sie unter Buchstabe E im Fahrzeugschein oder Fahrzeugbrief.',
  },
  {
    num: 5,
    title: 'Sicherheitscode freilegen',
    desc: 'Der Sicherheitscode auf der Zulassungsbescheinigung Teil I oder Teil II kann auf zwei Arten freigelegt werden:\n\n• Variante 1: Den Code vorsichtig mit einer Münze freirubbeln.\n• Variante 2: Die Schutzfolie vorsichtig abziehen.\n\nAchten Sie darauf, den Code nicht zu beschädigen und machen Sie anschließend ein gut lesbares Foto.',
  },
  {
    num: 6,
    title: 'Sicherheitscode aus dem Fahrzeugschein',
    desc: 'Sicherheitscode eintragen: Geben Sie den 7-stelligen Sicherheitscode ein, den Sie im Fahrzeugschein (Zulassungsbescheinigung Teil I) finden. Bitte vorsichtig freirubbeln oder die Schutzfolie abziehen, je nach Darstellung.',
  },
  {
    num: 7,
    title: 'Sicherheitscode aus dem Fahrzeugbrief',
    desc: 'Sicherheitscode eintragen: Geben Sie den 12-stelligen Sicherheitscode ein, den Sie im Fahrzeugschein (Zulassungsbescheinigung Teil II) finden. Bitte vorsichtig freirubbeln oder die Schutzfolie abziehen, je nach Darstellung.',
  },
  {
    num: 8,
    title: 'Bankverbindung eintragen',
    desc: 'Für die Kfz-Steuer benötigen wir die IBAN und den Namen des Kontoinhabers. Ihre Daten werden sicher und nur für die Steuerlastschrift verwendet.',
  },
  {
    num: 9,
    title: 'Verifizierung durchführen',
    desc: 'Nach Eingabe aller Daten erhalten Sie von uns einen Link zur Verifizierung. Der Prozess läuft sicher über unseren Partner Verimi und ist in wenigen Minuten abgeschlossen.',
  },
];

export default function AutoAnmeldenPage() {
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
                Kfz Zulassung online
              </h1>
              <h2 className="text-xl md:text-2xl font-bold text-white/80 mb-2">
                Ihr offizieller i-Kfz Service<br />
                <span className="text-primary">mit persönlicher Hilfe bei der Verifizierung</span>
              </h2>
              <div className="mt-6 mb-8">
                <Image
                  src="/uploads/2025/05/KBA-LOGO-Weiss-Und-schwarze-Beschriftung-e1747611306758.png"
                  alt="Offiziell registrierter i-Kfz Dienstleister beim Kraftfahrt-Bundesamt (KBA)"
                  width={250}
                  height={100}
                  className="opacity-90"
                  unoptimized
                />
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <Link href="/product/auto-online-anmelden/" className="btn-primary text-lg">
                  Jetzt online starten <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 9 Steps Process ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {formSteps.map((step, i) => (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-extrabold text-lg">
                          {step.num}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-dark-400 font-medium mb-1">Schritt {step.num}</p>
                        <h3 className="text-lg font-bold text-dark-900 mb-2">{step.title}</h3>
                        <div className="text-dark-700 leading-relaxed whitespace-pre-line">
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Auto online anmelden in ganz Deutschland ── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-extrabold text-dark-900 mb-6">
                Auto online anmelden, Ummelden oder Wiederzulassen in ganz Deutschland
              </h2>
              <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                <p>
                  Mit unserem Service können Sie Ihr Fahrzeug in jeder Region Deutschlands online anmelden – unabhängig davon, ob die Zulassungsstelle vollständig digitalisiert ist.
                </p>
                <p className="font-semibold mt-6">Für Zulassungsstellen, die nicht volldigitalisiert sind:</p>
                <ul className="space-y-3 mt-4 list-none pl-0">
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
                <Link href="/product/auto-online-anmelden/" className="btn-primary text-lg">
                  JETZT AUTO ONLINE ANMELDEN <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Main Content: Auto online anmelden – Einfach, schnell und bequem ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="text-2xl md:text-3xl font-extrabold text-dark-900 mb-6">
                Auto online anmelden – Einfach, schnell und bequem
              </h2>
              <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                <h3 className="text-xl font-bold text-dark-900 mt-0 mb-4">
                  Die Zulassung eines Fahrzeugs war noch nie so einfach!
                </h3>
                <p>
                  Mit unserem Online-Service für Fahrzeugzulassung, Ummeldung und Wiederzulassung machen wir es Ihnen so bequem wie möglich. Kein Stress mit Behördengängen oder Terminvereinbarungen – alles kann online erledigt werden, von überall und zu jeder Zeit.
                </p>
              </div>
            </ScrollReveal>

            {/* Ihre Vorteile */}
            <ScrollReveal delay={0.05}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Ihre Vorteile mit unserem Online-Zulassungsservice Auto Online Anmelden
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Unser Service bietet Ihnen eine schnelle und einfache Möglichkeit, Ihr Fahrzeug online anzumelden, umzumelden oder wieder zuzulassen. Sie haben die Wahl, die erforderlichen Daten manuell einzugeben oder einfach Fotos der benötigten Dokumente über unseren Live-Support hochzuladen.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Dokumente per Foto */}
            <ScrollReveal delay={0.1}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Einfach und schnell: Dokumente per Foto einreichen
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Für eine reibungslose Bearbeitung können Sie die erforderlichen Unterlagen einfach als Foto übermitteln. Das spart Zeit und sorgt dafür, dass alle Daten korrekt erfasst werden. Folgende Dokumente benötigen wir:
                  </p>
                </div>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-dark-700"><strong>Fahrzeugschein (Zulassungsbescheinigung Teil I):</strong> Foto der Vorder- und Rückseite.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-dark-700"><strong>Fahrzeugbrief (Zulassungsbescheinigung Teil II):</strong> Foto der Vorder- und Rückseite.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-dark-700"><strong>eVB-Nummer:</strong> Die elektronische Versicherungsnummer. Falls Sie keine haben, bieten wir Ihnen eine kostengünstige Möglichkeit, diese direkt bei uns zu erhalten.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-dark-700"><strong>HU/TÜV-Bericht:</strong> Falls der TÜV abgelaufen ist, einfach ein Foto vom neuen TÜV-Bericht schicken.</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            {/* Ablauf */}
            <ScrollReveal delay={0.15}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  So funktioniert der Ablauf – Egal ob Anmeldung, Ummeldung oder Wiederzulassung - Auto Online Anmelden
                </h3>
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">1. Fahrzeugdaten übermitteln</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Entscheiden Sie, ob Sie die Daten manuell eingeben oder Fotos der Dokumente hochladen möchten. Bei der Fotomethode kümmern wir uns um alles Weitere.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">2. Kennzeichen auswählen</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Wählen Sie zwischen einem beliebigen Kennzeichen, einem Wunschkennzeichen oder einem reservierten Kennzeichen. Bei Bedarf können Sie die Kennzeichen direkt über uns bestellen (29,95 € inkl. Versand in 2 Werktagen).
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">3. HU/TÜV-Status prüfen</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Ist Ihr TÜV abgelaufen? Laden Sie einfach ein Foto des TÜV-Berichts hoch, und wir übernehmen den Rest.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">4. Bankverbindung für KFZ-Steuer angeben</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Tragen Sie Ihre IBAN und den Namen des Kontoinhabers ein, damit die KFZ-Steuer korrekt abgebucht werden kann.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">5. Sicherheitscode freilegen</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Auf der Zulassungsbescheinigung Teil I und Teil II finden Sie Sicherheitscodes, die Sie entweder freirubbeln (mit einer Münze) oder die Folie abziehen müssen. Laden Sie dann gut lesbare Fotos der Codes hoch.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-dark-100 p-6">
                    <h4 className="font-bold text-dark-900 mb-2">6. Verifizierung abschließen</h4>
                    <p className="text-dark-700 leading-relaxed">
                      Nach dem Einreichen aller Daten erhalten Sie einen Link von unserem Partner Verimi, über den Sie Ihre Identität sicher verifizieren können. Dieser Schritt ist notwendig, um den Zulassungsprozess abzuschließen.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Warum unsere Methode */}
            <ScrollReveal delay={0.2}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Warum unsere Methode nutzen - Auto Online Anmelden?
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Unsere Fotomethode spart nicht nur Zeit, sondern garantiert auch, dass alle Daten korrekt übermittelt werden. Unsere Experten entnehmen die relevanten Informationen direkt aus den eingereichten Fotos, damit keine Fehler entstehen.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Sichere Bearbeitung */}
            <ScrollReveal delay={0.25}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">
                  Sichere und schnelle Bearbeitung - Auto Online Anmelden
                </h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Ihre Daten sind bei uns in sicheren Händen. Alle Fotos und Informationen werden streng vertraulich behandelt und nur für den Zulassungsprozess verwendet.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Fazit */}
            <ScrollReveal delay={0.3}>
              <div className="mt-12">
                <h3 className="text-xl md:text-2xl font-bold text-dark-900 mb-4">Fazit</h3>
                <div className="prose prose-lg max-w-none text-dark-700 leading-relaxed">
                  <p>
                    Unser Online-Service bietet Ihnen die einfachste Möglichkeit, Ihr Fahrzeug anzumelden, umzumelden oder wiederzuzulassen. Nutzen Sie die Möglichkeit, Ihre Daten per Foto einzureichen, oder wählen Sie die manuelle Eingabe – flexibel und ganz nach Ihren Bedürfnissen. Testen Sie unseren Service und erleben Sie, wie unkompliziert die Fahrzeugzulassung sein kann!
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
              Bereit, Ihr <span className="text-primary">Auto online anzumelden</span>?
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Starten Sie jetzt und sparen Sie sich den Weg zur Zulassungsstelle.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/product/auto-online-anmelden/" className="btn-primary text-lg">
                JETZT AUTO ONLINE ANMELDEN <ArrowRight className="w-5 h-5" />
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
