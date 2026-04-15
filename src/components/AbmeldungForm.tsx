'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Car,
  FileText,
  Shield,
  Tag,
  HelpCircle,
  Upload,
  CheckCircle2,
  Truck,
  Bike,
  CircleHelp,
  PlayCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePriceFeed } from '@/hooks/usePriceFeed';
import KennzeichenInput from '@/components/KennzeichenInput';

// ── Externe Medien ──
const SCHEIN_VIDEO_URL = 'https://www.youtube.com/watch?v=u38keaF1QKU';
const KENNZEICHEN_VIDEO_URL = 'https://www.youtube.com/watch?v=3nsdJSvKAtE';

const TEIL1_VORDERSEITE_IMAGE =
  'https://ikfzdigitalzulassung.de/uploads/Zulassungsbescheinigung-I-1-685d2fef.jpg';

const TEIL1_RUECKSEITE_IMAGE =
  'https://ikfzdigitalzulassung.de/uploads/2024/11/WhatsApp-Image-2024-01-06-at-3.21.48-PM-2.jpeg';

const KENNZEICHEN_CODE_IMAGE =
  'https://ikfzdigitalzulassung.de/uploads/2024/10/j-1536x863.png';

// ── Schema ──
const abmeldungSchema = z
  .object({
    vehicleType: z.enum(
      ['auto', 'motorrad', 'anhaenger', 'leichtkraftrad', 'lkw', 'andere'],
      {
        required_error: 'Bitte wählen Sie eine Fahrzeugart',
      }
    ),
    inputMode: z.enum(['manuell', 'bilder'], {
      required_error: 'Bitte wählen Sie eine Eingabeart',
    }),
    kennzeichen: z.string().min(1, 'Kennzeichen ist erforderlich'),
    fin: z.string().optional(),
    sicherheitscode: z.string().optional(),
    stadtKreis: z.string().min(1, 'Stadt/Kreis ist erforderlich'),
    codeVorne: z.string().optional(),
    codeHinten: z.string().optional(),
    reservierung: z.enum(['keine', 'einJahr']),
  })
  .superRefine((data, ctx) => {
    const onePlate =
      data.vehicleType === 'motorrad' ||
      data.vehicleType === 'anhaenger' ||
      data.vehicleType === 'leichtkraftrad';

    if (data.inputMode === 'manuell') {
      if (!data.fin || data.fin.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fin'],
          message: 'Fahrgestellnummer ist erforderlich',
        });
      }

      if (!data.sicherheitscode || data.sicherheitscode.trim().length !== 7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sicherheitscode'],
          message: 'Der Sicherheitscode muss genau 7 Zeichen haben',
        });
      }
    }

    if (onePlate) {
      if (!data.codeHinten || data.codeHinten.trim().length !== 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['codeHinten'],
          message: 'Der Code muss genau 3 Zeichen haben',
        });
      }
    } else {
      if (!data.codeVorne || data.codeVorne.trim().length !== 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['codeVorne'],
          message: 'Der Code muss genau 3 Zeichen haben',
        });
      }
      if (!data.codeHinten || data.codeHinten.trim().length !== 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['codeHinten'],
          message: 'Der Code muss genau 3 Zeichen haben',
        });
      }
    }
  });

type AbmeldungFormData = z.infer<typeof abmeldungSchema>;

const STEPS = [
  { id: 1, label: 'Fahrzeugdaten', icon: Car },
  { id: 2, label: 'Fahrzeugschein-Code', icon: FileText },
  { id: 3, label: 'Kennzeichen-Code(s)', icon: Shield },
  { id: 4, label: 'Reservierung', icon: Tag },
];

interface ServiceFormProps {
  basePrice: number;
  reservierungPrice: number;
  productName: string;
}

type UploadFiles = {
  teil1Vorne: File | null;
  teil1Hinten: File | null;
  kennzeichenVorne: File | null;
  kennzeichenHinten: File | null;
};

const INITIAL_UPLOADS: UploadFiles = {
  teil1Vorne: null,
  teil1Hinten: null,
  kennzeichenVorne: null,
  kennzeichenHinten: null,
};

const formatPrice = (value: number) => `${value.toFixed(2).replace('.', ',')} €`;

function FileUploadBox({
  title,
  subtitle,
  file,
  onChange,
  required = false,
}: {
  title: string;
  subtitle?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
}) {
  return (
    <label className="block cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-emerald-400/30 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">
            {title} {required && <span className="text-red-400">*</span>}
          </div>
          {subtitle && <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>}
          {file && (
            <p className="mt-3 break-all text-xs font-medium text-emerald-400">
              Ausgewählt: {file.name}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-emerald-500/10 p-3">
          <Upload className="h-4 w-4 text-emerald-400" />
        </div>
      </div>
      <input
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function MediaHelpCard({
  title,
  videoUrl,
  imageUrl,
  imageAlt,
}: {
  title: string;
  videoUrl: string;
  imageUrl: string;
  imageAlt: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <HelpCircle className="h-4 w-4 text-emerald-400" />
          {title}
        </p>
      </div>
      <div className="p-5">
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-400 hover:bg-emerald-500/15"
        >
          <PlayCircle className="h-4 w-4" />
          Video-Anleitung ansehen
        </a>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-white">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default function ServiceForm({
  basePrice = 19.7,
  reservierungPrice = 4.7,
  productName = 'Fahrzeug Online Abmelden',
}: ServiceFormProps) {
  const router = useRouter();
  const stepTopRef = useRef<HTMLDivElement | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [showCodeHelp, setShowCodeHelp] = useState(true);
  const [showKennzeichenHelp, setShowKennzeichenHelp] = useState(true);
  const [uploads, setUploads] = useState<UploadFiles>(INITIAL_UPLOADS);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const feed = usePriceFeed({
    fahrzeugabmeldung: { price: basePrice, options: null },
  });
  const liveBasePrice = feed['fahrzeugabmeldung']?.price ?? basePrice;

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<AbmeldungFormData>({
    resolver: zodResolver(abmeldungSchema),
    defaultValues: {
      vehicleType: 'auto',
      inputMode: 'manuell',
      reservierung: 'keine',
      kennzeichen: '',
      fin: '',
      sicherheitscode: '',
      stadtKreis: '',
      codeVorne: '',
      codeHinten: '',
    },
  });

  const watchReservierung = watch('reservierung');
  const watchVehicleType = watch('vehicleType');
  const watchInputMode = watch('inputMode');

  const onePlateVehicle =
    watchVehicleType === 'motorrad' ||
    watchVehicleType === 'anhaenger' ||
    watchVehicleType === 'leichtkraftrad';

  const totalPrice = useMemo(() => {
    let price = liveBasePrice;
    if (watchReservierung === 'einJahr') {
      price += reservierungPrice;
    }
    return price;
  }, [liveBasePrice, reservierungPrice, watchReservierung]);

  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        stepTopRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
    });
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [currentStep, scrollToTop]);

  const setUpload = useCallback((key: keyof UploadFiles, file: File | null) => {
    setUploads((prev) => ({ ...prev, [key]: file }));
    setUploadErrors((prev) => ({ ...prev, [key]: '' }));
  }, []);

  const validateCurrentStep = useCallback(async () => {
    setUploadErrors({});
    let valid = true;

    if (currentStep === 1) {
      const stepValid = await trigger(['vehicleType', 'inputMode', 'kennzeichen', 'fin']);
      if (watchInputMode === 'bilder') {
        const partialValid = await trigger(['vehicleType', 'inputMode', 'kennzeichen']);
        if (!partialValid) valid = false;
      } else if (!stepValid) {
        valid = false;
      }
    }

    if (currentStep === 2) {
      const baseValid = await trigger(['stadtKreis']);
      if (!baseValid) valid = false;

      if (watchInputMode === 'manuell') {
        const manualValid = await trigger(['sicherheitscode']);
        if (!manualValid) valid = false;
      }

      if (watchInputMode === 'bilder') {
        const nextUploadErrors: Record<string, string> = {};

        if (!uploads.teil1Vorne) {
          nextUploadErrors.teil1Vorne = 'Bitte Vorderseite hochladen';
          valid = false;
        }
        if (!uploads.teil1Hinten) {
          nextUploadErrors.teil1Hinten =
            'Bitte Rückseite oder den Bereich mit dem Sicherheitscode hochladen';
          valid = false;
        }

        setUploadErrors(nextUploadErrors);
      }
    }

    if (currentStep === 3) {
      if (watchInputMode === 'manuell') {
        if (onePlateVehicle) {
          const codeValid = await trigger(['codeHinten']);
          if (!codeValid) valid = false;
        } else {
          const codeValid = await trigger(['codeVorne', 'codeHinten']);
          if (!codeValid) valid = false;
        }
      }

      if (watchInputMode === 'bilder') {
        const nextUploadErrors: Record<string, string> = {};

        if (onePlateVehicle) {
          if (!uploads.kennzeichenHinten) {
            nextUploadErrors.kennzeichenHinten =
              'Bitte Bild vom Kennzeichen mit Sicherheitscode hochladen';
            valid = false;
          }
        } else {
          if (!uploads.kennzeichenVorne) {
            nextUploadErrors.kennzeichenVorne =
              'Bitte Bild vom vorderen Kennzeichen hochladen';
            valid = false;
          }
          if (!uploads.kennzeichenHinten) {
            nextUploadErrors.kennzeichenHinten =
              'Bitte Bild vom hinteren Kennzeichen hochladen';
            valid = false;
          }
        }

        setUploadErrors(nextUploadErrors);
      }
    }

    if (currentStep === 4) {
      const stepValid = await trigger(['reservierung']);
      if (!stepValid) valid = false;
    }

    if (!valid) scrollToTop();

    return valid;
  }, [
    currentStep,
    onePlateVehicle,
    scrollToTop,
    trigger,
    uploads.kennzeichenHinten,
    uploads.kennzeichenVorne,
    uploads.teil1Hinten,
    uploads.teil1Vorne,
    watchInputMode,
  ]);

  const nextStep = useCallback(async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;
    setCurrentStep((s) => Math.min(s + 1, 4));
  }, [validateCurrentStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  const onSubmit = useCallback(
    async (data: AbmeldungFormData) => {
      if (currentStep !== 4) return;

      const valid = await validateCurrentStep();
      if (!valid) return;

      const finalData = {
        ...data,
        kennzeichen: data.kennzeichen.toUpperCase(),
        fin: (data.fin || '').toUpperCase(),
        codeVorne: onePlateVehicle ? '' : (data.codeVorne || '').trim(),
        codeHinten: (data.codeHinten || '').trim(),
      };

      const orderData = {
        productName,
        productSlug: 'fahrzeugabmeldung',
        serviceType: 'abmeldung',
        formData: finalData,
        uploadMode: watchInputMode,
        uploads: {
          teil1Vorne: uploads.teil1Vorne?.name || null,
          teil1Hinten: uploads.teil1Hinten?.name || null,
          kennzeichenVorne: uploads.kennzeichenVorne?.name || null,
          kennzeichenHinten: uploads.kennzeichenHinten?.name || null,
        },
        basePrice: liveBasePrice,
        addons:
          data.reservierung === 'einJahr'
            ? [
                {
                  key: 'reservierung',
                  label: 'Kennzeichenreservierung (1 Jahr)',
                  price: reservierungPrice,
                },
              ]
            : [],
        total: totalPrice,
      };

      sessionStorage.setItem('checkout_order', JSON.stringify(orderData));
      router.push('/rechnung/');
    },
    [
      currentStep,
      liveBasePrice,
      onePlateVehicle,
      productName,
      reservierungPrice,
      router,
      totalPrice,
      uploads.kennzeichenHinten,
      uploads.kennzeichenVorne,
      uploads.teil1Hinten,
      uploads.teil1Vorne,
      validateCurrentStep,
      watchInputMode,
    ]
  );

  return (
    <div className="min-h-screen bg-[#050816] px-3 py-4 md:px-6 md:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_26%),linear-gradient(180deg,#0A1020_0%,#060B16_100%)] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="p-4 md:p-8 lg:p-10">
            <div ref={stepTopRef} />

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Shield className="h-4 w-4" />
                Digitaler Abmeldeservice
              </div>
              <h1 className="mt-4 text-2xl font-black text-white md:text-4xl">
                Fahrzeug online abmelden
              </h1>
              <p className="mt-2 text-sm text-zinc-400 md:text-base">
                Einfach, sicher und Schritt für Schritt.
              </p>
            </div>

            <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
              <div className="flex items-center justify-between gap-2 overflow-x-auto">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const isCompleted = currentStep > step.id;
                  const isActive = currentStep === step.id;

                  return (
                    <div
                      key={step.id}
                      className="flex min-w-max flex-1 items-center last:flex-initial"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition-all md:h-12 md:w-12',
                            isCompleted
                              ? 'border-emerald-400 bg-emerald-500 text-white'
                              : isActive
                              ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]'
                              : 'border-white/10 bg-white/[0.04] text-zinc-500'
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <span
                          className={cn(
                            'mt-2 text-[10px] font-medium md:text-xs',
                            isActive
                              ? 'text-emerald-400'
                              : isCompleted
                              ? 'text-zinc-200'
                              : 'text-zinc-500'
                          )}
                        >
                          {step.label}
                        </span>
                      </div>

                      {i < STEPS.length - 1 && (
                        <div className="mx-2 h-px flex-1 bg-white/10 md:mx-3">
                          <div
                            className={cn(
                              'h-px transition-all duration-300',
                              isCompleted ? 'w-full bg-emerald-400' : 'w-0 bg-transparent'
                            )}
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
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.22 }}
                >
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <div className="text-sm font-semibold text-emerald-400">
                          Schritt 1 von 4
                        </div>
                        <h2 className="mt-1 text-2xl font-black text-white">
                          Kennzeichen und FIN
                        </h2>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                        <h3 className="mb-4 text-base font-bold text-white">
                          Fahrzeugtyp wählen
                        </h3>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {[
                            { value: 'auto', label: 'Auto', icon: Car },
                            { value: 'motorrad', label: 'Motorrad', icon: Bike },
                            { value: 'anhaenger', label: 'Anhänger', icon: Truck },
                            { value: 'leichtkraftrad', label: 'Leichtkraftrad', icon: Bike },
                            { value: 'lkw', label: 'LKW', icon: Truck },
                            { value: 'andere', label: 'Andere', icon: CircleHelp },
                          ].map((item) => {
                            const Icon = item.icon;
                            const active = watchVehicleType === item.value;

                            return (
                              <label
                                key={item.value}
                                className={cn(
                                  'cursor-pointer rounded-2xl border p-4 transition-all',
                                  active
                                    ? 'border-emerald-400 bg-emerald-500/10'
                                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                                )}
                              >
                                <input
                                  type="radio"
                                  className="hidden"
                                  value={item.value}
                                  {...register('vehicleType')}
                                />
                                <div className="flex flex-col items-center justify-center gap-3 text-center">
                                  <div
                                    className={cn(
                                      'rounded-2xl p-3',
                                      active ? 'bg-emerald-500/15' : 'bg-white/[0.04]'
                                    )}
                                  >
                                    <Icon
                                      className={cn(
                                        'h-7 w-7',
                                        active ? 'text-emerald-400' : 'text-zinc-400'
                                      )}
                                    />
                                  </div>
                                  <span
                                    className={cn(
                                      'text-sm font-bold',
                                      active ? 'text-white' : 'text-zinc-300'
                                    )}
                                  >
                                    {item.label}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                        <h3 className="mb-4 text-base font-bold text-white">
                          Wie möchten Sie die Daten eingeben?
                        </h3>

                        <div className="grid gap-3 md:grid-cols-2">
                          {[
                            ['manuell', 'Daten manuell eingeben'],
                            ['bilder', 'Bilder hochladen'],
                          ].map(([value, label]) => (
                            <label
                              key={value}
                              className={cn(
                                'cursor-pointer rounded-2xl border p-4 text-sm font-semibold transition-all',
                                watchInputMode === value
                                  ? 'border-emerald-400 bg-emerald-500/10 text-white'
                                  : 'border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20'
                              )}
                            >
                              <input
                                type="radio"
                                className="hidden"
                                value={value}
                                {...register('inputMode')}
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="space-y-5">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-white">
                              Kennzeichen eintragen <span className="text-red-400">*</span>
                            </label>

                            <KennzeichenInput
                              value={watch('kennzeichen') || ''}
                              onChange={(v) =>
                                setValue('kennzeichen', (v || '').toUpperCase(), {
                                  shouldValidate: !!errors.kennzeichen,
                                })
                              }
                              error={errors.kennzeichen?.message}
                            />

                            <p className="mt-2 text-xs text-zinc-400">
                              Bei E-, H- oder Saisonkennzeichen bitte nur das normale
                              Kennzeichen eintragen.
                            </p>
                          </div>

                          {watchInputMode === 'manuell' ? (
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-white">
                                Fahrzeug-Identnummer (FIN){' '}
                                <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                {...register('fin', {
                                  onChange: (e) => {
                                    e.target.value = e.target.value.toUpperCase();
                                  },
                                })}
                                placeholder="WBA71AUU805U1111"
                                maxLength={17}
                                className={cn(
                                  'w-full rounded-2xl border bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500',
                                  errors.fin
                                    ? 'border-red-400 focus:border-red-400'
                                    : 'border-white/10 focus:border-emerald-400'
                                )}
                              />
                              {errors.fin && (
                                <p className="mt-1 text-sm text-red-400">
                                  {errors.fin.message}
                                </p>
                              )}
                              <p className="mt-2 text-xs text-zinc-400">
                                Die FIN steht im Fahrzeugschein in Feld E. Siehe Bild.
                              </p>
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                              Bitte senden Sie uns ein Foto vom Fahrzeugschein Vorderseite.
                            </div>
                          )}
                        </div>
                      </div>

                      {watchInputMode === 'bilder' ? (
                        <MediaHelpCard
                          title="Beispiel Fahrzeugschein Vorderseite"
                          videoUrl={SCHEIN_VIDEO_URL}
                          imageUrl={TEIL1_VORDERSEITE_IMAGE}
                          imageAlt="Beispiel Fahrzeugschein Vorderseite"
                        />
                      ) : (
                        <MediaHelpCard
                          title="Wo finde ich die FIN?"
                          videoUrl={SCHEIN_VIDEO_URL}
                          imageUrl={TEIL1_VORDERSEITE_IMAGE}
                          imageAlt="Fahrzeugschein Vorderseite mit FIN"
                        />
                      )}
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <div className="text-sm font-semibold text-emerald-400">
                          Schritt 2 von 4
                        </div>
                        <h2 className="mt-1 text-2xl font-black text-white">
                          Code vom Fahrzeugschein
                        </h2>
                      </div>

                      <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-5">
                        <div className="text-sm font-semibold text-amber-100">
                          Code vom Fahrzeugschein
                        </div>
                        <p className="mt-2 text-sm leading-6 text-amber-50">
                          Bitte achten Sie auf die genaue Schreibweise. Der Code befindet
                          sich auf der Rückseite des Fahrzeugscheins unter dem
                          freizulegenden Bereich.
                        </p>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-5">
                        {watchInputMode === 'manuell' ? (
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-white">
                              Code vom Fahrzeugschein <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              {...register('sicherheitscode')}
                              placeholder="z. B. aB12cd3"
                              maxLength={7}
                              className={cn(
                                'w-full rounded-2xl border bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500',
                                errors.sicherheitscode
                                  ? 'border-red-400 focus:border-red-400'
                                  : 'border-white/10 focus:border-emerald-400'
                              )}
                            />
                            {errors.sicherheitscode && (
                              <p className="mt-1 text-sm text-red-400">
                                {errors.sicherheitscode.message}
                              </p>
                            )}
                            <p className="mt-2 text-xs text-zinc-400">
                              Bitte Groß- und Kleinschreibung genau übernehmen.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                              Bitte senden Sie uns ein Foto von der Rückseite vom
                              Fahrzeugschein. Den Sicherheitscode bitte vorher freilegen.
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <FileUploadBox
                                  title="Fahrzeugschein Vorderseite"
                                  subtitle="Bitte Vorderseite hochladen"
                                  required
                                  file={uploads.teil1Vorne}
                                  onChange={(file) => setUpload('teil1Vorne', file)}
                                />
                                {uploadErrors.teil1Vorne && (
                                  <p className="mt-2 text-sm text-red-400">
                                    {uploadErrors.teil1Vorne}
                                  </p>
                                )}
                              </div>

                              <div>
                                <FileUploadBox
                                  title="Fahrzeugschein Rückseite / Sicherheitscode"
                                  subtitle="Bitte den Bereich mit dem Sicherheitscode hochladen"
                                  required
                                  file={uploads.teil1Hinten}
                                  onChange={(file) => setUpload('teil1Hinten', file)}
                                />
                                {uploadErrors.teil1Hinten && (
                                  <p className="mt-2 text-sm text-red-400">
                                    {uploadErrors.teil1Hinten}
                                  </p>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white">
                            Stadt / Kreis <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            {...register('stadtKreis')}
                            placeholder="z. B. Essen"
                            className={cn(
                              'w-full rounded-2xl border bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500',
                              errors.stadtKreis
                                ? 'border-red-400 focus:border-red-400'
                                : 'border-white/10 focus:border-emerald-400'
                            )}
                          />
                          {errors.stadtKreis && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors.stadtKreis.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                        <button
                          type="button"
                          onClick={() => setShowCodeHelp((v) => !v)}
                          className="flex w-full items-center justify-between border-b border-white/10 px-5 py-4 text-left"
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold text-white">
                            <HelpCircle className="h-4 w-4 text-emerald-400" />
                            Anleitung zum Freilegen des Codes
                          </span>
                          <span className="text-xs font-semibold text-emerald-400">
                            {showCodeHelp ? 'Ausblenden' : 'Anzeigen'}
                          </span>
                        </button>

                        {showCodeHelp && (
                          <div className="p-5">
                            <a
                              href={SCHEIN_VIDEO_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-400 hover:bg-emerald-500/15"
                            >
                              <PlayCircle className="h-4 w-4" />
                              Video-Anleitung ansehen
                            </a>

                            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-white">
                              <Image
                                src={TEIL1_RUECKSEITE_IMAGE}
                                alt="Sicherheitscode auf der Rückseite vom Fahrzeugschein"
                                fill
                                sizes="(max-width: 768px) 100vw, 900px"
                                className="object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <div className="text-sm font-semibold text-emerald-400">
                          Schritt 3 von 4
                        </div>
                        <h2 className="mt-1 text-2xl font-black text-white">
                          Codes vom Kennzeichen
                        </h2>
                      </div>

                      <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-5">
                        <div className="text-sm font-semibold text-amber-100">
                          3-stelliger Code vom Kennzeichen
                        </div>
                        <p className="mt-2 text-sm leading-6 text-amber-50">
                          Entfernen Sie die Plakette vorsichtig, um den 3-stelligen Code
                          freizulegen. Achten Sie auf die genaue Schreibweise.
                        </p>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                        {watchInputMode === 'manuell' ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            {!onePlateVehicle && (
                              <div>
                                <label className="mb-2 block text-sm font-semibold text-white">
                                  Code vom vorderen Kennzeichen{' '}
                                  <span className="text-red-400">*</span>
                                </label>
                                <input
                                  type="text"
                                  {...register('codeVorne')}
                                  placeholder="z. B. ja4"
                                  maxLength={3}
                                  className={cn(
                                    'w-full rounded-2xl border bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500',
                                    errors.codeVorne
                                      ? 'border-red-400 focus:border-red-400'
                                      : 'border-white/10 focus:border-emerald-400'
                                  )}
                                />
                                {errors.codeVorne && (
                                  <p className="mt-1 text-sm text-red-400">
                                    {errors.codeVorne.message}
                                  </p>
                                )}
                              </div>
                            )}

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-white">
                                {onePlateVehicle
                                  ? 'Code vom Kennzeichen'
                                  : 'Code vom hinteren Kennzeichen'}{' '}
                                <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                {...register('codeHinten')}
                                placeholder="z. B. a1B"
                                maxLength={3}
                                className={cn(
                                  'w-full rounded-2xl border bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500',
                                  errors.codeHinten
                                    ? 'border-red-400 focus:border-red-400'
                                    : 'border-white/10 focus:border-emerald-400'
                                )}
                              />
                              {errors.codeHinten && (
                                <p className="mt-1 text-sm text-red-400">
                                  {errors.codeHinten.message}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                              {onePlateVehicle
                                ? 'Bitte laden Sie das Bild vom Kennzeichen mit freigelegtem Code hoch.'
                                : 'Bitte laden Sie die Bilder von den Kennzeichen mit freigelegtem Code hoch.'}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              {!onePlateVehicle && (
                                <div>
                                  <FileUploadBox
                                    title="Bild vom vorderen Kennzeichen"
                                    subtitle="Bitte den Bereich mit der Plakette hochladen"
                                    required
                                    file={uploads.kennzeichenVorne}
                                    onChange={(file) => setUpload('kennzeichenVorne', file)}
                                  />
                                  {uploadErrors.kennzeichenVorne && (
                                    <p className="mt-2 text-sm text-red-400">
                                      {uploadErrors.kennzeichenVorne}
                                    </p>
                                  )}
                                </div>
                              )}

                              <div>
                                <FileUploadBox
                                  title={
                                    onePlateVehicle
                                      ? 'Bild vom Kennzeichen'
                                      : 'Bild vom hinteren Kennzeichen'
                                  }
                                  subtitle="Bitte den Bereich mit der Plakette hochladen"
                                  required
                                  file={uploads.kennzeichenHinten}
                                  onChange={(file) => setUpload('kennzeichenHinten', file)}
                                />
                                {uploadErrors.kennzeichenHinten && (
                                  <p className="mt-2 text-sm text-red-400">
                                    {uploadErrors.kennzeichenHinten}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                        <button
                          type="button"
                          onClick={() => setShowKennzeichenHelp((v) => !v)}
                          className="flex w-full items-center justify-between border-b border-white/10 px-5 py-4 text-left"
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold text-white">
                            <HelpCircle className="h-4 w-4 text-emerald-400" />
                            Anleitung zum Entfernen der Plakette
                          </span>
                          <span className="text-xs font-semibold text-emerald-400">
                            {showKennzeichenHelp ? 'Ausblenden' : 'Anzeigen'}
                          </span>
                        </button>

                        {showKennzeichenHelp && (
                          <div className="p-5">
                            <a
                              href={KENNZEICHEN_VIDEO_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-400 hover:bg-emerald-500/15"
                            >
                              <PlayCircle className="h-4 w-4" />
                              Video-Anleitung ansehen
                            </a>

                            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-white">
                              <Image
                                src={KENNZEICHEN_CODE_IMAGE}
                                alt="Kennzeichen Sicherheitscode freilegen"
                                fill
                                sizes="(max-width: 768px) 100vw, 900px"
                                className="object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <div className="text-sm font-semibold text-emerald-400">
                          Schritt 4 von 4
                        </div>
                        <h2 className="mt-1 text-2xl font-black text-white">
                          Reservierung wählen
                        </h2>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                        <label className="mb-4 block text-sm font-semibold text-white">
                          Kennzeichen reservieren?
                        </label>

                        <div className="space-y-3">
                          <label
                            className={cn(
                              'flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all',
                              watchReservierung === 'keine'
                                ? 'border-emerald-400 bg-emerald-500/10'
                                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                value="keine"
                                {...register('reservierung')}
                                className="accent-emerald-500"
                              />
                              <div>
                                <span className="text-sm font-semibold text-white">
                                  Keine Kennzeichenreservierung
                                </span>
                              </div>
                            </div>
                          </label>

                          <label
                            className={cn(
                              'flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all',
                              watchReservierung === 'einJahr'
                                ? 'border-emerald-400 bg-emerald-500/10'
                                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                value="einJahr"
                                {...register('reservierung')}
                                className="accent-emerald-500"
                              />
                              <div>
                                <span className="text-sm font-semibold text-white">
                                  1 Jahr reservieren
                                </span>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-emerald-400">
                              + {formatPrice(reservierungPrice)}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-lg font-bold text-white">Endbetrag</span>
                          <span className="text-3xl font-black text-emerald-400">
                            {formatPrice(totalPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-100">
                          <CheckCircle2 className="h-4 w-4" />
                          Wenn Sie Fragen haben
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <a
                            href="tel:015224999190"
                            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-bold text-[#0b1120] hover:opacity-90"
                          >
                            01522 4999190
                          </a>
                          <a
                            href="https://wa.me/4915224999190"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-400"
                          >
                            Live-Chat über WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="mb-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    SSL verschlüsselt
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Sichere Zahlung
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Sichere Abwicklung
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Zurück
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-400"
                    >
                      Weiter
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-400"
                    >
                      Zur Kasse
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
