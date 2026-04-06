'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import {
  Check,
  CheckCircle,
  Shield,
  Lock,
  AlertCircle,
  Phone,
  MessageCircle,
  Play,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Car,
  FileText,
  Tag,
} from 'lucide-react';
import { FormErrorBanner } from './ui/FormErrorBanner';
import { LicensePlateInput } from './ui/LicensePlateInput';
import {
  VehicleTypeSelector,
  PLATE_PLACEHOLDERS,
  type VehicleType,
} from './ui/VehicleTypeSelector';

/* ------------------------------------------------------------------ */
/*  Zod Schema                                                        */
/* ------------------------------------------------------------------ */
const formSchema = z.object({
  fahrzeugTyp: z
    .enum(['auto', 'motorrad', 'anhaenger', 'leichtkraftrad', 'lkw', 'andere'])
    .default('auto'),
  kennzeichen: z.string().min(3, 'Bitte geben Sie ein gültiges Kennzeichen ein'),
  fin: z.string().min(6, 'Bitte geben Sie die FIN (Feld E) ein'),
  sicherheitscode: z
    .string()
    .min(7, 'Bitte geben Sie den 7-stelligen Sicherheitscode ein')
    .max(7, 'Der Sicherheitscode muss genau 7 Zeichen haben'),
  stadtKreis: z.string().min(2, 'Bitte geben Sie Ihre Stadt / Ihren Kreis ein'),
  codeVorne: z
    .string()
    .min(3, 'Bitte geben Sie den 3-stelligen Code ein')
    .max(3, 'Der Code muss genau 3 Zeichen haben'),
  codeHinten: z
    .string()
    .min(3, 'Bitte geben Sie den 3-stelligen Code ein')
    .max(3, 'Der Code muss genau 3 Zeichen haben'),
  reservierung: z
    .enum(['keine', 'einJahr'], {
      required_error: 'Bitte wählen Sie eine Option',
    })
    .default('keine'),
});

type FormData = z.infer<typeof formSchema>;

/* ------------------------------------------------------------------ */
/*  Assets                                                            */
/* ------------------------------------------------------------------ */
const FAHRZEUGSCHEIN_IMAGE =
  '/uploads/wp/2024/01/WhatsApp-Image-2024-01-06-at-3.21.48-PM.jpeg';
const PLAKETTE_IMAGE =
  '/uploads/wp/2024/10/WhatsApp-Image-2024-10-28-at-23.51.02.jpeg';
const CODE_HINT_IMAGE =
  '/uploads/wp/2024/01/WhatsApp-Image-2024-01-06-at-3.21.48-PM-1.jpeg';

const VIDEO_FAHRZEUGSCHEIN = 'https://www.youtube.com/watch?v=u38keaF1QKU';
const VIDEO_PLAKETTE = 'https://www.youtube.com/watch?v=3nsdJSvKAtE';

const INPUT_CLASS =
  'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 text-base';

const STEPS = [
  { id: 1, label: 'Fahrzeugdaten', icon: Car },
  { id: 2, label: 'Fahrzeugschein', icon: FileText },
  { id: 3, label: 'Kennzeichen', icon: Shield },
  { id: 4, label: 'Reservierung', icon: Tag },
] as const;

const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ['fahrzeugTyp', 'kennzeichen', 'fin'],
  2: ['sicherheitscode'],
  3: ['stadtKreis', 'codeVorne', 'codeHinten'],
  4: ['reservierung'],
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
interface ServiceFormProps {
  basePrice?: number;
  reservierungPrice?: number;
  contactPhone?: string;
  contactPhoneLink?: string;
  contactWhatsapp?: string;
}

export default function ServiceForm({
  basePrice: propBasePrice,
  reservierungPrice: propReservierungPrice,
  contactPhone = '01522 4999190',
  contactPhoneLink = 'tel:015224999190',
  contactWhatsapp = 'https://wa.me/4915224999190',
}: ServiceFormProps = {}) {
  const router = useRouter();
  const formTopRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step4Visited, setStep4Visited] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showCodeHelp, setShowCodeHelp] = useState(false);
  const [showKennzeichenHelp, setShowKennzeichenHelp] = useState(false);

  const basePrice = propBasePrice ?? 19.7;
  const reservierungUnitPrice = propReservierungPrice ?? 4.7;

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fahrzeugTyp: 'auto',
      kennzeichen: '',
      fin: '',
      sicherheitscode: '',
      stadtKreis: '',
      codeVorne: '',
      codeHinten: '',
      reservierung: 'keine',
    },
  });

  const fahrzeugTyp = watch('fahrzeugTyp') as VehicleType;
  const reservierung = watch('reservierung');

  const { reservierungPrice, totalPrice } = useMemo(() => {
    const rp = reservierung === 'einJahr' ? reservierungUnitPrice : 0;
    return {
      reservierungPrice: rp,
      totalPrice: basePrice + rp,
    };
  }, [reservierung, reservierungUnitPrice, basePrice]);

  const scrollToTop = () => {
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const nextStep = useCallback(async () => {
    const fields = STEP_FIELDS[currentStep];
    const valid = await trigger(fields);

    if (!valid) return;

    if (currentStep < 4) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next === 4) setStep4Visited(true);
      scrollToTop();
    }
  }, [currentStep, trigger]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      scrollToTop();
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    if (currentStep !== 4 || !step4Visited) return;
    if (submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setFormError(null);

    try {
      sessionStorage.setItem(
        'serviceData',
        JSON.stringify({
          formType: 'fahrzeugabmeldung',
          productId: 'abmeldung',
          productPrice: totalPrice.toFixed(2),
          fahrzeugTyp: data.fahrzeugTyp,
          kennzeichen: data.kennzeichen.toUpperCase(),
          fin: data.fin.toUpperCase(),
          sicherheitscode: data.sicherheitscode,
          stadtKreis: data.stadtKreis,
          codeVorne: data.codeVorne,
          codeHinten: data.codeHinten,
          reservierung: data.reservierung,
        })
      );

      router.push('/rechnung');
    } catch {
      setFormError('Daten konnten nicht gespeichert werden. Bitte versuchen Sie es erneut.');
      setIsSubmitting(false);
      submittingRef.current = false;
      return;
    }

    setIsSubmitting(false);
    submittingRef.current = false;
  };

  return (
    <div ref={formTopRef} className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-4 md:p-8">
        {/* Help Banner */}
        <div className="flex items-center gap-3 rounded-2xl p-4 mb-8 bg-primary/[0.04] border border-primary/10">
          <Phone className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-sm text-gray-700">
            Benötigen Sie Hilfe? Rufen Sie uns an:{' '}
            <a href={contactPhoneLink} className="font-bold text-primary hover:underline">
              ℡ {contactPhone}
            </a>
          </span>
        </div>

        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-initial min-w-0">
                  <div className="flex flex-col items-center min-w-0">
                    <div
                      className={[
                        'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 text-sm font-bold',
                        isCompleted
                          ? 'bg-primary text-white shadow-[0_4px_12px_rgba(0,168,90,0.25)]'
                          : isActive
                          ? 'bg-primary text-white ring-4 ring-primary/15 shadow-[0_4px_16px_rgba(0,168,90,0.25)]'
                          : 'bg-gray-50 text-gray-400 border border-gray-200',
                      ].join(' ')}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>

                    <span
                      className={[
                        'text-[10px] md:text-xs font-medium mt-2 text-center',
                        isActive
                          ? 'text-primary'
                          : isCompleted
                          ? 'text-gray-700'
                          : 'text-gray-400',
                      ].join(' ')}
                    >
                      {step.label}
                    </span>
                  </div>

                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-2 md:mx-3 h-0.5 rounded-full mt-[-18px] md:mt-[-20px]">
                      <div
                        className={[
                          'h-full rounded-full transition-all duration-500',
                          isCompleted ? 'bg-primary' : 'bg-gray-200',
                        ].join(' ')}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">Fahrzeugdaten</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Geben Sie Kennzeichen und Fahrzeug-Identnummer ein.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-5">
                    <FieldGroup
                      label="Fahrzeugtyp wählen"
                      description="Wählen Sie den Typ Ihres Fahrzeugs"
                    >
                      <VehicleTypeSelector
                        value={fahrzeugTyp}
                        onChange={(t) => setValue('fahrzeugTyp', t, { shouldValidate: true })}
                      />
                    </FieldGroup>

                    <FieldGroup
                      label="Kennzeichen eintragen"
                      required
                      description="Bei E-, H- oder Saisonkennzeichen bitte nur das normale Kennzeichen eingeben."
                      error={errors.kennzeichen?.message}
                    >
                      <LicensePlateInput
                        value={watch('kennzeichen') || ''}
                        onChange={(v) =>
                          setValue('kennzeichen', v, { shouldValidate: true })
                        }
                        error={errors.kennzeichen?.message}
                        vehicleType={fahrzeugTyp}
                        placeholder={PLATE_PLACEHOLDERS[fahrzeugTyp]}
                      />
                    </FieldGroup>

                    <FieldGroup
                      label="Fahrzeug-Identnummer (FIN)"
                      required
                      description="Die FIN steht im Fahrzeugschein in Feld E."
                      error={errors.fin?.message}
                    >
                      <input
                        {...register('fin')}
                        placeholder="z. B. WBA71AUU805U1111"
                        maxLength={17}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value.toUpperCase();
                        }}
                        className={`${INPUT_CLASS} font-mono uppercase`}
                      />
                    </FieldGroup>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-primary" />
                      Wo finde ich die FIN?
                    </p>
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-white">
                      <Image
                        src={FAHRZEUGSCHEIN_IMAGE}
                        alt="Fahrzeugschein mit markierter FIN"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Sicherheitscode Fahrzeugschein
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Den 7-stelligen Sicherheitscode finden Sie auf der Rückseite Ihres
                      Fahrzeugscheins.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                    <FieldGroup
                      label="Sicherheitscode (7 Zeichen)"
                      required
                      description="Achten Sie auf Groß- und Kleinschreibung."
                      error={errors.sicherheitscode?.message}
                    >
                      <input
                        {...register('sicherheitscode')}
                        placeholder="z. B. YKeqT2v"
                        maxLength={7}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        className={`${INPUT_CLASS} font-mono tracking-[0.25em] text-center text-lg`}
                      />
                    </FieldGroup>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCodeHelp((s) => !s)}
                    className="w-full text-left"
                  >
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        Wo finde ich den Sicherheitscode?
                        <span className="text-xs text-primary">
                          {showCodeHelp ? 'Ausblenden' : 'Anzeigen'}
                        </span>
                      </p>

                      {showCodeHelp && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3"
                        >
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-white">
                            <Image
                              src={PLAKETTE_IMAGE}
                              alt="Fahrzeugschein Rückseite mit markiertem Sicherheitscode"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Kratzen Sie den verdeckten Bereich auf der Rückseite frei, um
                            den 7-stelligen Code zu sehen.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </button>

                  <div className="rounded-2xl bg-primary/[0.04] border border-primary/10 p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Video-Anleitung</p>
                    <p className="text-xs text-gray-500">
                      So finden Sie den Code auf dem Fahrzeugschein.
                    </p>
                    <a
                      href={VIDEO_FAHRZEUGSCHEIN}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-sm text-primary font-semibold hover:underline"
                    >
                      <Play className="w-4 h-4" />
                      Video ansehen
                    </a>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Sicherheitscodes Kennzeichen
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Geben Sie Stadt/Kreis und die Codes von Ihren Kennzeichen ein.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-5">
                    <FieldGroup
                      label="Stadt / Kreis"
                      required
                      description="Steht direkt unter dem Sicherheitscode auf dem Fahrzeugschein."
                      error={errors.stadtKreis?.message}
                    >
                      <input
                        {...register('stadtKreis')}
                        placeholder="z. B. Neckar-Odenwald-Kreis"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        className={INPUT_CLASS}
                      />
                    </FieldGroup>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldGroup
                        label="Code vorne (3 Zeichen)"
                        required
                        error={errors.codeVorne?.message}
                      >
                        <input
                          {...register('codeVorne')}
                          placeholder="z. B. jA4"
                          maxLength={3}
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          className={`${INPUT_CLASS} font-mono text-center tracking-[0.25em]`}
                        />
                      </FieldGroup>

                      <FieldGroup
                        label="Code hinten (3 Zeichen)"
                        required
                        error={errors.codeHinten?.message}
                      >
                        <input
                          {...register('codeHinten')}
                          placeholder="z. B. a1B"
                          maxLength={3}
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          className={`${INPUT_CLASS} font-mono text-center tracking-[0.25em]`}
                        />
                      </FieldGroup>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowKennzeichenHelp((s) => !s)}
                    className="w-full text-left"
                  >
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        Wo finde ich die Kennzeichen-Codes?
                        <span className="text-xs text-primary">
                          {showKennzeichenHelp ? 'Ausblenden' : 'Anzeigen'}
                        </span>
                      </p>

                      {showKennzeichenHelp && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3"
                        >
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-white">
                            <Image
                              src={CODE_HINT_IMAGE}
                              alt="Kennzeichen mit markierten Sicherheitscodes"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Entfernen Sie die Plakette vorsichtig, um den 3-stelligen Code
                            freizulegen.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </button>

                  <div className="rounded-2xl bg-primary/[0.04] border border-primary/10 p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Video-Anleitung</p>
                    <p className="text-xs text-gray-500">
                      In diesem Video sehen Sie, wie die Kennzeichen-Codes freigelegt werden.
                    </p>
                    <a
                      href={VIDEO_PLAKETTE}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-sm text-primary font-semibold hover:underline"
                    >
                      <Play className="w-4 h-4" />
                      Video ansehen
                    </a>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <p className="text-xs text-amber-800">
                      <strong>Hinweis:</strong>{' '}
                      {fahrzeugTyp === 'motorrad' ||
                      fahrzeugTyp === 'leichtkraftrad' ||
                      fahrzeugTyp === 'anhaenger'
                        ? 'Ihr Fahrzeugtyp hat in der Regel nur ein Kennzeichen. Bitte denselben Code vorne und hinten eintragen.'
                        : 'Bei Fahrzeugen mit nur einem Kennzeichen (z. B. Motorrad oder Anhänger) bitte denselben Code vorne und hinten eintragen.'}
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Kennzeichenreservierung
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Optional: Möchten Sie Ihr Kennzeichen für ein Jahr reservieren?
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Kennzeichen reservieren?
                    </label>

                    <div className="space-y-3">
                      <label
                        className={[
                          'flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                          reservierung === 'keine'
                            ? 'border-primary bg-primary/[0.04] shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/60',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            {...register('reservierung')}
                            type="radio"
                            value="keine"
                            className="accent-primary w-4 h-4"
                          />
                          <div>
                            <span className="font-semibold text-gray-800 text-sm">
                              Keine Reservierung
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Das Kennzeichen wird freigegeben
                            </p>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm">Inklusive</span>
                      </label>

                      <label
                        className={[
                          'flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                          reservierung === 'einJahr'
                            ? 'border-primary bg-primary/[0.04] shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/60',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            {...register('reservierung')}
                            type="radio"
                            value="einJahr"
                            className="accent-primary w-4 h-4"
                          />
                          <div>
                            <span className="font-semibold text-gray-800 text-sm">
                              Kennzeichen für 1 Jahr reservieren
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Ihr Kennzeichen wird für 12 Monate reserviert
                            </p>
                          </div>
                        </div>
                        <span className="text-primary font-bold text-sm">
                          + {reservierungUnitPrice.toFixed(2).replace('.', ',')} €
                        </span>
                      </label>
                    </div>

                    {errors.reservierung && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.reservierung.message}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm divide-y divide-gray-100">
                    <div className="p-5">
                      <h3 className="font-bold text-gray-800 mb-3">Ihre Angaben</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">Fahrzeugtyp</span>
                          <span className="text-gray-800 font-medium capitalize text-right">
                            {getValues('fahrzeugTyp') || '–'}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">Kennzeichen</span>
                          <span className="text-gray-800 font-medium uppercase text-right">
                            {getValues('kennzeichen') || '–'}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">FIN</span>
                          <span className="text-gray-800 font-medium uppercase text-right">
                            {getValues('fin') || '–'}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">Sicherheitscode ZB I</span>
                          <span className="text-gray-800 font-medium text-right">
                            {getValues('sicherheitscode') || '–'}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">Stadt / Kreis</span>
                          <span className="text-gray-800 font-medium text-right">
                            {getValues('stadtKreis') || '–'}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">Codes (vorne / hinten)</span>
                          <span className="text-gray-800 font-medium text-right">
                            {getValues('codeVorne') || '–'} / {getValues('codeHinten') || '–'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-primary/[0.04] border-2 border-primary/20 p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Kostenübersicht</h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dienstleistung</span>
                        <span className="text-gray-800 font-medium">
                          {basePrice.toFixed(2).replace('.', ',')} €
                        </span>
                      </div>

                      {reservierungPrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Kennzeichenreservierung (1 Jahr)
                          </span>
                          <span className="text-gray-800 font-medium">
                            {reservierungPrice.toFixed(2).replace('.', ',')} €
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/20">
                      <span className="text-lg font-bold text-gray-900">Gesamtpreis</span>
                      <span className="text-2xl font-black text-primary">
                        {totalPrice.toFixed(2).replace('.', ',')} €
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                    <p className="font-bold text-primary mb-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Fragen? Sofort-Hilfe:
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={contactPhoneLink}
                        className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors font-medium text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        {contactPhone}
                      </a>

                      <a
                        href={`${contactWhatsapp}${
                          contactWhatsapp.includes('?') ? '&' : '?'
                        }text=Hallo,+ich+brauche+Hilfe+bei+der+KFZ-Abmeldung`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-lg hover:bg-[#20BD5A] transition-colors font-medium text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Live-Chat über WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            {formError && (
              <div className="mb-4">
                <FormErrorBanner message={formError} onDismiss={() => setFormError(null)} />
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 && (
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Aktueller Preis:</span>
                  <span className="font-bold text-primary text-lg">
                    {totalPrice.toFixed(2).replace('.', ',')} €
                  </span>
                </div>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                  Weiter
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !step4Visited}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Wird bearbeitet…
                    </>
                  ) : (
                    <>
                      Weiter zur Kasse
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-gray-400 mt-6 pt-6 border-t border-gray-100">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" /> SSL verschlüsselt
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-4 h-4" /> Sichere Zahlung
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Sichere Abwicklung
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable Field Group                                              */
/* ------------------------------------------------------------------ */
function FieldGroup({
  label,
  required,
  description,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-2">
        {label}{' '}
        {required && (
          <abbr className="text-red-500 no-underline" title="Pflichtfeld">
            *
          </abbr>
        )}
      </label>

      {children}

      {description && <p className="mt-1.5 text-xs text-gray-500">{description}</p>}

      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
