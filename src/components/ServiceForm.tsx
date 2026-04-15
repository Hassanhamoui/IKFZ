'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Car,
  Check,
  CheckCircle,
  ClipboardCheck,
  CreditCard,
  FileText,
  HelpCircle,
  Info,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShoppingCart,
  Truck,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ServiceType =
  | 'neuwagen'
  | 'gebraucht_anmelden'
  | 'ummeldung'
  | 'wiederzulassung';

type IdentityType = 'personalausweis' | 'aufenthaltstitel' | 'reisepass';

type VehicleKind = 'pkw' | 'motorrad' | 'anhaenger' | 'quad' | 'lkw' | 'sonstiges';

type KennzeichenMode = 'frei' | 'reserviert';

type FormValues = {
  serviceType: ServiceType;
  vehicleKind: VehicleKind;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  holderStreet: string;
  holderHouseNumber: string;
  holderPostalCode: string;
  holderCity: string;

  identityType: IdentityType;

  keepExistingPlate: 'ja' | 'nein';
  kennzeichenMode: KennzeichenMode;
  reservedPlate: string;
  reservedPin: string;
  plateOrder: 'ja' | 'nein';

  evbNumber: string;
  fin: string;
  teil1Code: string;
  zb2Code: string;

  accountHolder: string;
  iban: string;

  useHolderAddressForZb1: 'ja' | 'nein';
  zb1Recipient: string;
  zb1Street: string;
  zb1HouseNumber: string;
  zb1PostalCode: string;
  zb1City: string;

  useHolderAddressForZb2: 'ja' | 'nein';
  zb2Recipient: string;
  zb2Street: string;
  zb2HouseNumber: string;
  zb2PostalCode: string;
  zb2City: string;
};

type FileState = {
  idFront: File | null;
  idBack: File | null;
  passport: File | null;
  addressProof: File | null;
  teil1Front: File | null;
  teil1Back: File | null;
  zb2Image: File | null;
};

const PRICES = {
  neuwagen: 124.7,
  gebraucht_anmelden: 124.7,
  ummeldung: 119.7,
  wiederzulassung: 99.7,
  reservedPlate: 24.7,
  plateOrder: 29.7,
};

const EVB_LINK =
  'https://www.tarifcheck.de/kfz-versicherung/?partner_id=184294&ad_id=15&model=1';
const SECURITY_VIDEO = 'https://www.youtube.com/watch?v=u38keaF1QKU';
const ZB2_IMAGE =
  'https://ikfzdigitalzulassung.de/uploads/2024/11/SicherheitscodeZB2-e1736860037665.jpg';
const TEIL1_IMAGE =
  'https://ikfzdigitalzulassung.de/uploads/2024/10/WhatsApp-Image-2024-01-06-at-3.21.48-PM-2-768x432.jpeg';

const STEPS = [
  { id: 1, label: 'Vorgang', icon: Car },
  { id: 2, label: 'Halter', icon: User },
  { id: 3, label: 'Kennzeichen', icon: FileText },
  { id: 4, label: 'Unterlagen', icon: CreditCard },
  { id: 5, label: 'Bank', icon: Banknote },
  { id: 6, label: 'Versand', icon: Truck },
  { id: 7, label: 'Übersicht', icon: ClipboardCheck },
];

const SERVICE_LABELS: Record<ServiceType, string> = {
  neuwagen: 'Neuwagenzulassung',
  gebraucht_anmelden: 'Gebrauchtfahrzeug anmelden',
  ummeldung: 'Ummeldung',
  wiederzulassung: 'Wiederzulassung',
};

const VEHICLE_LABELS: Record<VehicleKind, string> = {
  pkw: 'PKW',
  motorrad: 'Motorrad',
  anhaenger: 'Anhänger',
  quad: 'Quad',
  lkw: 'LKW',
  sonstiges: 'Sonstiges',
};

const IDENTITY_LABELS: Record<IdentityType, string> = {
  personalausweis: 'Deutscher Ausweis',
  aufenthaltstitel: 'Aufenthaltstitel',
  reisepass: 'Reisepass',
};

const formatPrice = (value: number) => `${value.toFixed(2).replace('.', ',')} €`;

function FileUploadCard({
  title,
  subtitle,
  required,
  file,
  onChange,
}: {
  title: string;
  subtitle?: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-emerald-400/40 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">
            {title} {required && <span className="text-red-400">*</span>}
          </div>
          {subtitle && <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>}
          {file && (
            <p className="mt-3 text-xs font-medium text-emerald-400 break-all">
              Ausgewählt: {file.name}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400">
          Datei wählen
        </div>
      </div>
      <input
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function InfoModal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b1120] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-zinc-300 hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5 text-sm leading-6 text-zinc-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ServiceForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [modal, setModal] = useState<
    | null
    | 'service'
    | 'vehicle'
    | 'evb'
    | 'teil1'
    | 'zb2'
    | 'identity'
    | 'shipping'
  >(null);

  const [files, setFiles] = useState<FileState>({
    idFront: null,
    idBack: null,
    passport: null,
    addressProof: null,
    teil1Front: null,
    teil1Back: null,
    zb2Image: null,
  });

  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  const stepTopRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      serviceType: 'gebraucht_anmelden',
      vehicleKind: 'pkw',

      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      holderStreet: '',
      holderHouseNumber: '',
      holderPostalCode: '',
      holderCity: '',

      identityType: 'personalausweis',

      keepExistingPlate: 'nein',
      kennzeichenMode: 'frei',
      reservedPlate: '',
      reservedPin: '',
      plateOrder: 'nein',

      evbNumber: '',
      fin: '',
      teil1Code: '',
      zb2Code: '',

      accountHolder: '',
      iban: '',

      useHolderAddressForZb1: 'ja',
      zb1Recipient: '',
      zb1Street: '',
      zb1HouseNumber: '',
      zb1PostalCode: '',
      zb1City: '',

      useHolderAddressForZb2: 'ja',
      zb2Recipient: '',
      zb2Street: '',
      zb2HouseNumber: '',
      zb2PostalCode: '',
      zb2City: '',
    },
  });

  const serviceType = watch('serviceType');
  const vehicleKind = watch('vehicleKind');
  const identityType = watch('identityType');
  const keepExistingPlate = watch('keepExistingPlate');
  const kennzeichenMode = watch('kennzeichenMode');
  const plateOrder = watch('plateOrder');
  const useHolderAddressForZb1 = watch('useHolderAddressForZb1');
  const useHolderAddressForZb2 = watch('useHolderAddressForZb2');

  const totalPrice = useMemo(() => {
    let total = PRICES[serviceType];
    if (kennzeichenMode === 'reserviert') total += PRICES.reservedPlate;
    if (plateOrder === 'ja') total += PRICES.plateOrder;
    return total;
  }, [serviceType, kennzeichenMode, plateOrder]);

  const setFile = (key: keyof FileState, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
    setFileErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const scrollToStepTop = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        stepTopRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
    });
  };

  useEffect(() => {
    scrollToStepTop();
  }, [currentStep]);

  const validateStep = () => {
    const values = getValues();
    const nextFileErrors: Record<string, string> = {};
    let valid = true;

    const requireField = (condition: boolean, name: keyof FormValues, message: string) => {
      if (!condition) {
        setError(name, { type: 'manual', message });
        valid = false;
      } else {
        clearErrors(name);
      }
    };

    const requireFile = (condition: boolean, key: keyof FileState, message: string) => {
      if (!condition) {
        nextFileErrors[key] = message;
        valid = false;
      }
    };

    if (currentStep === 1) {
      requireField(!!values.serviceType, 'serviceType', 'Bitte wählen Sie einen Vorgang');
      requireField(!!values.vehicleKind, 'vehicleKind', 'Bitte wählen Sie eine Fahrzeugart');
    }

    if (currentStep === 2) {
      requireField(!!values.firstName.trim(), 'firstName', 'Vorname ist erforderlich');
      requireField(!!values.lastName.trim(), 'lastName', 'Nachname ist erforderlich');
      requireField(!!values.email.trim(), 'email', 'E-Mail ist erforderlich');
      requireField(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email),
        'email',
        'Bitte geben Sie eine gültige E-Mail ein'
      );
      requireField(!!values.phone.trim(), 'phone', 'Telefonnummer ist erforderlich');
      requireField(!!values.holderStreet.trim(), 'holderStreet', 'Straße ist erforderlich');
      requireField(
        !!values.holderHouseNumber.trim(),
        'holderHouseNumber',
        'Hausnummer ist erforderlich'
      );
      requireField(
        !!values.holderPostalCode.trim(),
        'holderPostalCode',
        'PLZ ist erforderlich'
      );
      requireField(!!values.holderCity.trim(), 'holderCity', 'Ort ist erforderlich');

      if (identityType === 'personalausweis' || identityType === 'aufenthaltstitel') {
        requireFile(!!files.idFront, 'idFront', 'Vorderseite hochladen');
        requireFile(!!files.idBack, 'idBack', 'Rückseite hochladen');
      }

      if (identityType === 'reisepass') {
        requireFile(!!files.passport, 'passport', 'Reisepass hochladen');
        requireFile(
          !!files.addressProof,
          'addressProof',
          'Meldebescheinigung oder aktuelles Schreiben hochladen'
        );
      }
    }

    if (currentStep === 3) {
      const needsPlateChoice =
        serviceType === 'neuwagen' ||
        serviceType === 'gebraucht_anmelden' ||
        (serviceType === 'ummeldung' && keepExistingPlate === 'nein') ||
        (serviceType === 'wiederzulassung' && keepExistingPlate === 'nein');

      if (serviceType === 'ummeldung' || serviceType === 'wiederzulassung') {
        requireField(
          values.keepExistingPlate === 'ja' || values.keepExistingPlate === 'nein',
          'keepExistingPlate',
          'Bitte wählen Sie eine Option'
        );
      }

      if (needsPlateChoice) {
        requireField(
          values.kennzeichenMode === 'frei' || values.kennzeichenMode === 'reserviert',
          'kennzeichenMode',
          'Bitte wählen Sie eine Kennzeichenart'
        );

        if (values.kennzeichenMode === 'reserviert') {
          requireField(
            !!values.reservedPlate.trim(),
            'reservedPlate',
            'Kennzeichen ist erforderlich'
          );
          requireField(!!values.reservedPin.trim(), 'reservedPin', 'PIN ist erforderlich');
        }

        requireField(
          values.plateOrder === 'ja' || values.plateOrder === 'nein',
          'plateOrder',
          'Bitte wählen Sie eine Option'
        );
      }
    }

    if (currentStep === 4) {
      requireField(!!values.evbNumber.trim(), 'evbNumber', 'eVB-Nummer ist erforderlich');

      if (serviceType === 'neuwagen') {
        const hasZb2 = !!values.zb2Code.trim() || !!files.zb2Image;
        if (!hasZb2) {
          setError('zb2Code', {
            type: 'manual',
            message: 'Bitte Sicherheitscode eingeben oder Foto von Teil 2 hochladen',
          });
          nextFileErrors.zb2Image = 'Bitte Sicherheitscode eingeben oder Foto hochladen';
          valid = false;
        } else {
          clearErrors('zb2Code');
        }
      }

      if (serviceType === 'gebraucht_anmelden' || serviceType === 'ummeldung') {
        const hasTeil1Front = !!files.teil1Front || !!values.fin.trim();
        const hasTeil1Back = !!files.teil1Back || !!values.teil1Code.trim();
        const hasZb2 = !!files.zb2Image || !!values.zb2Code.trim();

        if (!hasTeil1Front) {
          setError('fin', {
            type: 'manual',
            message: 'Bitte FIN eingeben oder Vorderseite von Teil 1 hochladen',
          });
          nextFileErrors.teil1Front = 'Bitte Vorderseite hochladen oder FIN eingeben';
          valid = false;
        } else {
          clearErrors('fin');
        }

        if (!hasTeil1Back) {
          setError('teil1Code', {
            type: 'manual',
            message: 'Bitte Sicherheitscode eingeben oder Rückseite von Teil 1 hochladen',
          });
          nextFileErrors.teil1Back = 'Bitte Rückseite hochladen oder Code eingeben';
          valid = false;
        } else {
          clearErrors('teil1Code');
        }

        if (!hasZb2) {
          setError('zb2Code', {
            type: 'manual',
            message: 'Bitte Sicherheitscode eingeben oder Foto von Teil 2 hochladen',
          });
          nextFileErrors.zb2Image = 'Bitte Foto von Teil 2 hochladen oder Code eingeben';
          valid = false;
        } else {
          clearErrors('zb2Code');
        }
      }

      if (serviceType === 'wiederzulassung') {
        const hasTeil1Front = !!files.teil1Front || !!values.fin.trim();
        const hasTeil1Back = !!files.teil1Back || !!values.teil1Code.trim();

        if (!hasTeil1Front) {
          setError('fin', {
            type: 'manual',
            message: 'Bitte FIN eingeben oder Vorderseite von Teil 1 hochladen',
          });
          nextFileErrors.teil1Front = 'Bitte Vorderseite hochladen oder FIN eingeben';
          valid = false;
        } else {
          clearErrors('fin');
        }

        if (!hasTeil1Back) {
          setError('teil1Code', {
            type: 'manual',
            message: 'Bitte Sicherheitscode eingeben oder Rückseite von Teil 1 hochladen',
          });
          nextFileErrors.teil1Back = 'Bitte Rückseite hochladen oder Code eingeben';
          valid = false;
        } else {
          clearErrors('teil1Code');
        }
      }
    }

    if (currentStep === 5) {
      requireField(
        !!values.accountHolder.trim(),
        'accountHolder',
        'Kontoinhaber ist erforderlich'
      );
      requireField(!!values.iban.trim(), 'iban', 'IBAN ist erforderlich');
      requireField(
        values.iban.replace(/\s+/g, '').length >= 15,
        'iban',
        'Bitte geben Sie eine gültige IBAN ein'
      );
    }

    if (currentStep === 6) {
      if (useHolderAddressForZb1 === 'nein') {
        requireField(!!values.zb1Recipient.trim(), 'zb1Recipient', 'Empfänger ist erforderlich');
        requireField(!!values.zb1Street.trim(), 'zb1Street', 'Straße ist erforderlich');
        requireField(
          !!values.zb1HouseNumber.trim(),
          'zb1HouseNumber',
          'Hausnummer ist erforderlich'
        );
        requireField(!!values.zb1PostalCode.trim(), 'zb1PostalCode', 'PLZ ist erforderlich');
        requireField(!!values.zb1City.trim(), 'zb1City', 'Ort ist erforderlich');
      }

      if (useHolderAddressForZb2 === 'nein') {
        requireField(!!values.zb2Recipient.trim(), 'zb2Recipient', 'Empfänger ist erforderlich');
        requireField(!!values.zb2Street.trim(), 'zb2Street', 'Straße ist erforderlich');
        requireField(
          !!values.zb2HouseNumber.trim(),
          'zb2HouseNumber',
          'Hausnummer ist erforderlich'
        );
        requireField(!!values.zb2PostalCode.trim(), 'zb2PostalCode', 'PLZ ist erforderlich');
        requireField(!!values.zb2City.trim(), 'zb2City', 'Ort ist erforderlich');
      }
    }

    setFileErrors(nextFileErrors);
    return valid;
  };

  const nextStep = () => {
    const valid = validateStep();
    if (!valid) {
      scrollToStepTop();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      price: totalPrice,
      uploadedFiles: {
        idFront: files.idFront?.name || null,
        idBack: files.idBack?.name || null,
        passport: files.passport?.name || null,
        addressProof: files.addressProof?.name || null,
        teil1Front: files.teil1Front?.name || null,
        teil1Back: files.teil1Back?.name || null,
        zb2Image: files.zb2Image?.name || null,
      },
    };

    console.log('Service form payload:', payload);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('serviceFormData', JSON.stringify(payload));
    }

    setSubmitted(true);
  };

  const showPlateChoice =
    serviceType === 'neuwagen' ||
    serviceType === 'gebraucht_anmelden' ||
    (serviceType === 'ummeldung' && keepExistingPlate === 'nein') ||
    (serviceType === 'wiederzulassung' && keepExistingPlate === 'nein');

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050816] px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white">Antrag erfolgreich gespeichert</h2>
          <p className="mt-3 text-zinc-300">
            Die Daten wurden übernommen. Jetzt kannst du unten deine Checkout- oder
            Rechnungslogik anschließen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#050816] px-3 py-4 md:px-6 md:py-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#0A1020_0%,#060B16_100%)] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_420px]">
              <div className="p-4 md:p-8 lg:p-10">
                <div ref={stepTopRef} />

                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <Shield className="h-4 w-4" />
                      Digitaler Zulassungsservice
                    </div>
                    <h1 className="mt-4 text-2xl font-black text-white md:text-4xl">
                      KFZ Zulassung online
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400 md:text-base">
                      Einfach, klar und Schritt für Schritt.
                    </p>
                  </div>

                  <div className="hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-right md:block">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Aktueller Gesamtpreis
                    </div>
                    <div className="mt-1 text-2xl font-black text-emerald-400">
                      {formatPrice(totalPrice)}
                    </div>
                  </div>
                </div>

                <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
                  <div className="flex items-center justify-between gap-2 overflow-x-auto">
                    {STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;

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

                          {index < STEPS.length - 1 && (
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
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black text-white">Vorgang auswählen</h2>
                            <button
                              type="button"
                              onClick={() => setModal('service')}
                              className="rounded-full p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            {(
                              [
                                ['neuwagen', 'Neuwagenzulassung', formatPrice(PRICES.neuwagen)],
                                [
                                  'gebraucht_anmelden',
                                  'Gebrauchtfahrzeug anmelden',
                                  formatPrice(PRICES.gebraucht_anmelden),
                                ],
                                ['ummeldung', 'Ummeldung', formatPrice(PRICES.ummeldung)],
                                [
                                  'wiederzulassung',
                                  'Wiederzulassung',
                                  formatPrice(PRICES.wiederzulassung),
                                ],
                              ] as const
                            ).map(([value, label, price]) => (
                              <label
                                key={value}
                                className={cn(
                                  'cursor-pointer rounded-3xl border p-5 transition-all',
                                  serviceType === value
                                    ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]'
                                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                                )}
                              >
                                <input
                                  type="radio"
                                  className="hidden"
                                  value={value}
                                  {...register('serviceType')}
                                />
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="text-base font-bold text-white">{label}</div>
                                    <p className="mt-1 text-sm text-zinc-400">
                                      Einfach online starten
                                    </p>
                                  </div>
                                  <div className="rounded-xl bg-black/20 px-3 py-2 text-sm font-bold text-emerald-400">
                                    {price}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                          {errors.serviceType && (
                            <p className="text-sm text-red-400">{errors.serviceType.message}</p>
                          )}

                          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                            <div className="mb-3 flex items-center gap-2">
                              <h3 className="text-base font-bold text-white">Fahrzeugart</h3>
                              <button
                                type="button"
                                onClick={() => setModal('vehicle')}
                                className="rounded-full p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
                              >
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {(
                                [
                                  ['pkw', 'PKW'],
                                  ['motorrad', 'Motorrad'],
                                  ['anhaenger', 'Anhänger'],
                                  ['quad', 'Quad'],
                                  ['lkw', 'LKW'],
                                  ['sonstiges', 'Sonstiges'],
                                ] as const
                              ).map(([value, label]) => (
                                <label
                                  key={value}
                                  className={cn(
                                    'cursor-pointer rounded-2xl border p-4 text-sm font-semibold transition-all',
                                    vehicleKind === value
                                      ? 'border-emerald-400 bg-emerald-500/10 text-white'
                                      : 'border-white/10 bg-black/10 text-zinc-300 hover:border-white/20'
                                  )}
                                >
                                  <input
                                    type="radio"
                                    className="hidden"
                                    value={value}
                                    {...register('vehicleKind')}
                                  />
                                  {label}
                                </label>
                              ))}
                            </div>

                            {serviceType === 'neuwagen' && vehicleKind !== 'pkw' && (
                              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                                Bitte kontaktieren Sie uns bei Neuwagen für Motorrad, Anhänger,
                                Quad, LKW oder Sonderfahrzeuge vorab kurz.
                              </div>
                            )}

                            {errors.vehicleKind && (
                              <p className="mt-3 text-sm text-red-400">
                                {errors.vehicleKind.message}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black text-white">
                              Halter & Identität
                            </h2>
                            <button
                              type="button"
                              onClick={() => setModal('identity')}
                              className="rounded-full p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                Vorname *
                              </label>
                              <input
                                {...register('firstName')}
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                placeholder="Vorname"
                              />
                              {errors.firstName && (
                                <p className="mt-1 text-sm text-red-400">
                                  {errors.firstName.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                Nachname *
                              </label>
                              <input
                                {...register('lastName')}
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                placeholder="Nachname"
                              />
                              {errors.lastName && (
                                <p className="mt-1 text-sm text-red-400">
                                  {errors.lastName.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                E-Mail *
                              </label>
                              <div className="relative">
                                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input
                                  {...register('email')}
                                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-white outline-none transition focus:border-emerald-400"
                                  placeholder="name@beispiel.de"
                                />
                              </div>
                              {errors.email && (
                                <p className="mt-1 text-sm text-red-400">
                                  {errors.email.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                Telefonnummer *
                              </label>
                              <div className="relative">
                                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                <input
                                  {...register('phone')}
                                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-white outline-none transition focus:border-emerald-400"
                                  placeholder="01522 49991900"
                                />
                              </div>
                              {errors.phone && (
                                <p className="mt-1 text-sm text-red-400">
                                  {errors.phone.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                            <h3 className="mb-4 text-base font-bold text-white">Halteradresse</h3>

                            <div className="grid gap-4 md:grid-cols-[1fr_150px]">
                              <div>
                                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                  Straße *
                                </label>
                                <input
                                  {...register('holderStreet')}
                                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  placeholder="Straße"
                                />
                                {errors.holderStreet && (
                                  <p className="mt-1 text-sm text-red-400">
                                    {errors.holderStreet.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                  Nr. *
                                </label>
                                <input
                                  {...register('holderHouseNumber')}
                                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  placeholder="12A"
                                />
                                {errors.holderHouseNumber && (
                                  <p className="mt-1 text-sm text-red-400">
                                    {errors.holderHouseNumber.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr]">
                              <div>
                                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                  PLZ *
                                </label>
                                <input
                                  {...register('holderPostalCode')}
                                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  placeholder="45127"
                                />
                                {errors.holderPostalCode && (
                                  <p className="mt-1 text-sm text-red-400">
                                    {errors.holderPostalCode.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                  Ort *
                                </label>
                                <input
                                  {...register('holderCity')}
                                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  placeholder="Essen"
                                />
                                {errors.holderCity && (
                                  <p className="mt-1 text-sm text-red-400">
                                    {errors.holderCity.message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                            <div className="mb-4 flex items-center gap-2">
                              <h3 className="text-base font-bold text-white">Ausweisart</h3>
                              <button
                                type="button"
                                onClick={() => setModal('identity')}
                                className="rounded-full p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
                              >
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                              {(
                                [
                                  ['personalausweis', 'Deutscher Ausweis'],
                                  ['aufenthaltstitel', 'Aufenthaltstitel'],
                                  ['reisepass', 'Reisepass'],
                                ] as const
                              ).map(([value, label]) => (
                                <label
                                  key={value}
                                  className={cn(
                                    'cursor-pointer rounded-2xl border p-4 text-sm font-semibold transition-all',
                                    identityType === value
                                      ? 'border-emerald-400 bg-emerald-500/10 text-white'
                                      : 'border-white/10 bg-black/10 text-zinc-300 hover:border-white/20'
                                  )}
                                >
                                  <input
                                    type="radio"
                                    className="hidden"
                                    value={value}
                                    {...register('identityType')}
                                  />
                                  {label}
                                </label>
                              ))}
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                              {(identityType === 'personalausweis' ||
                                identityType === 'aufenthaltstitel') && (
                                <>
                                  <div>
                                    <FileUploadCard
                                      title={`${IDENTITY_LABELS[identityType]} Vorderseite`}
                                      subtitle="Foto oder Scan"
                                      required
                                      file={files.idFront}
                                      onChange={(file) => setFile('idFront', file)}
                                    />
                                    {fileErrors.idFront && (
                                      <p className="mt-2 text-sm text-red-400">
                                        {fileErrors.idFront}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <FileUploadCard
                                      title={`${IDENTITY_LABELS[identityType]} Rückseite`}
                                      subtitle="Foto oder Scan"
                                      required
                                      file={files.idBack}
                                      onChange={(file) => setFile('idBack', file)}
                                    />
                                    {fileErrors.idBack && (
                                      <p className="mt-2 text-sm text-red-400">
                                        {fileErrors.idBack}
                                      </p>
                                    )}
                                  </div>
                                </>
                              )}

                              {identityType === 'reisepass' && (
                                <>
                                  <div>
                                    <FileUploadCard
                                      title="Reisepass"
                                      subtitle="Bitte die Seite mit Bild hochladen"
                                      required
                                      file={files.passport}
                                      onChange={(file) => setFile('passport', file)}
                                    />
                                    {fileErrors.passport && (
                                      <p className="mt-2 text-sm text-red-400">
                                        {fileErrors.passport}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <FileUploadCard
                                      title="Meldebescheinigung oder aktuelles Schreiben"
                                      subtitle="Zum Beispiel Meldebescheinigung, Jobcenter, Amt oder andere aktuelle Post"
                                      required
                                      file={files.addressProof}
                                      onChange={(file) => setFile('addressProof', file)}
                                    />
                                    {fileErrors.addressProof && (
                                      <p className="mt-2 text-sm text-red-400">
                                        {fileErrors.addressProof}
                                      </p>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <h2 className="text-2xl font-black text-white">Kennzeichen</h2>

                          {(serviceType === 'ummeldung' || serviceType === 'wiederzulassung') && (
                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                              <h3 className="mb-4 text-base font-bold text-white">
                                Altes Kennzeichen behalten?
                              </h3>
                              <div className="grid gap-3 md:grid-cols-2">
                                {(
                                  [
                                    ['ja', 'Ja, Kennzeichen behalten'],
                                    ['nein', 'Nein, neues Kennzeichen'],
                                  ] as const
                                ).map(([value, label]) => (
                                  <label
                                    key={value}
                                    className={cn(
                                      'cursor-pointer rounded-2xl border p-4 text-sm font-semibold transition-all',
                                      keepExistingPlate === value
                                        ? 'border-emerald-400 bg-emerald-500/10 text-white'
                                        : 'border-white/10 bg-black/10 text-zinc-300 hover:border-white/20'
                                    )}
                                  >
                                    <input
                                      type="radio"
                                      className="hidden"
                                      value={value}
                                      {...register('keepExistingPlate')}
                                    />
                                    {label}
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {showPlateChoice ? (
                            <>
                              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                <h3 className="mb-4 text-base font-bold text-white">
                                  Kennzeichenart
                                </h3>
                                <div className="grid gap-3 md:grid-cols-2">
                                  {(
                                    [
                                      ['frei', 'Nächstfreies Kennzeichen'],
                                      ['reserviert', 'Reserviertes Kennzeichen'],
                                    ] as const
                                  ).map(([value, label]) => (
                                    <label
                                      key={value}
                                      className={cn(
                                        'cursor-pointer rounded-2xl border p-4 text-sm font-semibold transition-all',
                                        kennzeichenMode === value
                                          ? 'border-emerald-400 bg-emerald-500/10 text-white'
                                          : 'border-white/10 bg-black/10 text-zinc-300 hover:border-white/20'
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        className="hidden"
                                        value={value}
                                        {...register('kennzeichenMode')}
                                      />
                                      <div className="flex items-center justify-between gap-3">
                                        <span>{label}</span>
                                        {value === 'reserviert' && (
                                          <span className="text-emerald-400">
                                            + {formatPrice(PRICES.reservedPlate)}
                                          </span>
                                        )}
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              {kennzeichenMode === 'reserviert' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                      Reserviertes Kennzeichen *
                                    </label>
                                    <input
                                      {...register('reservedPlate', {
                                        onChange: (e) => {
                                          e.target.value = e.target.value.toUpperCase();
                                        },
                                      })}
                                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                      placeholder="z. B. E-AB 1234"
                                    />
                                    {errors.reservedPlate && (
                                      <p className="mt-1 text-sm text-red-400">
                                        {errors.reservedPlate.message}
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                      PIN *
                                    </label>
                                    <input
                                      {...register('reservedPin')}
                                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                      placeholder="PIN"
                                    />
                                    {errors.reservedPin && (
                                      <p className="mt-1 text-sm text-red-400">
                                        {errors.reservedPin.message}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                                <h3 className="mb-4 text-base font-bold text-white">
                                  Kennzeichen bestellen?
                                </h3>
                                <div className="grid gap-3 md:grid-cols-2">
                                  {(
                                    [
                                      ['ja', `Ja, von euch bestellen (+ ${formatPrice(PRICES.plateOrder)})`],
                                      ['nein', 'Nein, ich besorge sie selbst'],
                                    ] as const
                                  ).map(([value, label]) => (
                                    <label
                                      key={value}
                                      className={cn(
                                        'cursor-pointer rounded-2xl border p-4 text-sm font-semibold transition-all',
                                        plateOrder === value
                                          ? 'border-emerald-400 bg-emerald-500/10 text-white'
                                          : 'border-white/10 bg-black/10 text-zinc-300 hover:border-white/20'
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        className="hidden"
                                        value={value}
                                        {...register('plateOrder')}
                                      />
                                      {label}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5 text-sm text-emerald-200">
                              Das bisherige Kennzeichen bleibt erhalten. In diesem Schritt sind
                              keine weiteren Angaben nötig.
                            </div>
                          )}
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black text-white">Unterlagen</h2>
                            <button
                              type="button"
                              onClick={() => setModal('evb')}
                              className="rounded-full p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-base font-bold text-white">
                                  eVB-Nummer eingeben
                                </h3>
                                <p className="mt-1 text-sm text-emerald-100">
                                  Falls du noch keine eVB-Nummer hast, kannst du sie hier
                                  beantragen.
                                </p>
                              </div>
                              <a
                                href={EVB_LINK}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#0b1120] transition hover:opacity-90"
                              >
                                eVB beantragen
                              </a>
                            </div>

                            <div className="mt-4">
                              <label className="mb-2 block text-sm font-semibold text-white">
                                eVB-Nummer *
                              </label>
                              <input
                                {...register('evbNumber', {
                                  onChange: (e) => {
                                    e.target.value = e.target.value.toUpperCase();
                                  },
                                })}
                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-white"
                                placeholder="z. B. ABC123456"
                              />
                              {errors.evbNumber && (
                                <p className="mt-1 text-sm text-red-300">
                                  {errors.evbNumber.message}
                                </p>
                              )}
                            </div>
                          </div>

                          {(serviceType === 'gebraucht_anmelden' ||
                            serviceType === 'ummeldung' ||
                            serviceType === 'wiederzulassung') && (
                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                              <div className="mb-4 flex items-center gap-2">
                                <h3 className="text-base font-bold text-white">
                                  Teil 1 / Fahrzeugschein
                                </h3>
                                <button
                                  type="button"
                                  onClick={() => setModal('teil1')}
                                  className="rounded-full p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
                                >
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="grid gap-4 lg:grid-cols-2">
                                <div className="space-y-4">
                                  <FileUploadCard
                                    title="Teil 1 Vorderseite"
                                    subtitle="Oder alternativ die FIN unten eintragen"
                                    file={files.teil1Front}
                                    onChange={(file) => setFile('teil1Front', file)}
                                  />
                                  {fileErrors.teil1Front && (
                                    <p className="text-sm text-red-400">
                                      {fileErrors.teil1Front}
                                    </p>
                                  )}

                                  <div>
                                    <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                      FIN / Fahrzeug-ID-Nummer
                                    </label>
                                    <input
                                      {...register('fin', {
                                        onChange: (e) => {
                                          e.target.value = e.target.value.toUpperCase();
                                        },
                                      })}
                                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                      placeholder="17-stellige FIN"
                                    />
                                    {errors.fin && (
                                      <p className="mt-1 text-sm text-red-400">
                                        {errors.fin.message}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <FileUploadCard
                                    title="Teil 1 Rückseite"
                                    subtitle="Oder unten Sicherheitscode selbst eingeben"
                                    file={files.teil1Back}
                                    onChange={(file) => setFile('teil1Back', file)}
                                  />
                                  {fileErrors.teil1Back && (
                                    <p className="text-sm text-red-400">
                                      {fileErrors.teil1Back}
                                    </p>
                                  )}

                                  <div>
                                    <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                      Sicherheitscode Teil 1
                                    </label>
                                    <input
                                      {...register('teil1Code', {
                                        onChange: (e) => {
                                          e.target.value = e.target.value.toUpperCase();
                                        },
                                      })}
                                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                      placeholder="Code eingeben"
                                    />
                                    {errors.teil1Code && (
                                      <p className="mt-1 text-sm text-red-400">
                                        {errors.teil1Code.message}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <a
                                  href={SECURITY_VIDEO}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                                >
                                  <img
                                    src={TEIL1_IMAGE}
                                    alt="Sicherheitscode Teil 1"
                                    className="h-44 w-full object-cover"
                                  />
                                  <div className="p-4">
                                    <p className="text-sm font-bold text-white">
                                      Videoanleitung Teil 1
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-400">
                                      Sicherheitscode freilegen oder freirubbeln
                                    </p>
                                  </div>
                                </a>

                                {(serviceType === 'gebraucht_anmelden' ||
                                  serviceType === 'ummeldung') && (
                                  <a
                                    href={SECURITY_VIDEO}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                                  >
                                    <img
                                      src={ZB2_IMAGE}
                                      alt="Sicherheitscode Teil 2"
                                      className="h-44 w-full object-cover"
                                    />
                                    <div className="p-4">
                                      <p className="text-sm font-bold text-white">
                                        Videoanleitung Teil 2
                                      </p>
                                      <p className="mt-1 text-xs text-zinc-400">
                                        Sicherheitscode vom Fahrzeugbrief freilegen
                                      </p>
                                    </div>
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {(serviceType === 'neuwagen' ||
                            serviceType === 'gebraucht_anmelden' ||
                            serviceType === 'ummeldung') && (
                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                              <div className="mb-4 flex items-center gap-2">
                                <h3 className="text-base font-bold text-white">
                                  Teil 2 / Fahrzeugbrief
                                </h3>
                                <button
                                  type="button"
                                  onClick={() => setModal('zb2')}
                                  className="rounded-full p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
                                >
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="grid gap-4 lg:grid-cols-2">
                                <div>
                                  <FileUploadCard
                                    title="Foto von Teil 2"
                                    subtitle="Alternativ kannst du den Sicherheitscode unten selbst eingeben"
                                    file={files.zb2Image}
                                    onChange={(file) => setFile('zb2Image', file)}
                                  />
                                  {fileErrors.zb2Image && (
                                    <p className="mt-2 text-sm text-red-400">
                                      {fileErrors.zb2Image}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    Sicherheitscode Teil 2
                                  </label>
                                  <input
                                    {...register('zb2Code', {
                                      onChange: (e) => {
                                        e.target.value = e.target.value.toUpperCase();
                                      },
                                    })}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                    placeholder="Code eingeben"
                                  />
                                  {errors.zb2Code && (
                                    <p className="mt-1 text-sm text-red-400">
                                      {errors.zb2Code.message}
                                    </p>
                                  )}

                                  <a
                                    href={SECURITY_VIDEO}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-4 block overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                                  >
                                    <img
                                      src={ZB2_IMAGE}
                                      alt="Sicherheitscode Teil 2"
                                      className="h-44 w-full object-cover"
                                    />
                                    <div className="p-4">
                                      <p className="text-sm font-bold text-white">
                                        Videoanleitung Teil 2
                                      </p>
                                      <p className="mt-1 text-xs text-zinc-400">
                                        Sicherheitscode freilegen
                                      </p>
                                    </div>
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {currentStep === 5 && (
                        <div className="space-y-6">
                          <h2 className="text-2xl font-black text-white">Bankdaten</h2>

                          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                  Kontoinhaber *
                                </label>
                                <input
                                  {...register('accountHolder')}
                                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  placeholder="Vor- und Nachname"
                                />
                                {errors.accountHolder && (
                                  <p className="mt-1 text-sm text-red-400">
                                    {errors.accountHolder.message}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                  IBAN *
                                </label>
                                <input
                                  {...register('iban', {
                                    onChange: (e) => {
                                      e.target.value = e.target.value
                                        .toUpperCase()
                                        .replace(/\s+/g, '')
                                        .replace(/(.{4})/g, '$1 ')
                                        .trim();
                                    },
                                  })}
                                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  placeholder="DE00 0000 0000 0000 0000 00"
                                />
                                {errors.iban && (
                                  <p className="mt-1 text-sm text-red-400">
                                    {errors.iban.message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStep === 6 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black text-white">Versand</h2>
                            <button
                              type="button"
                              onClick={() => setModal('shipping')}
                              className="rounded-full p-1 text-zinc-400 hover:bg-white/5 hover:text-white"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                            <h3 className="mb-4 text-base font-bold text-white">
                              Versandadresse ZB1 / Fahrzeugschein
                            </h3>

                            <div className="grid gap-3 md:grid-cols-2">
                              {(
                                [
                                  ['ja', 'An Halteradresse senden'],
                                  ['nein', 'Andere Adresse eingeben'],
                                ] as const
                              ).map(([value, label]) => (
                                <label
                                  key={value}
                                  className={cn(
                                    'cursor-pointer rounded-2xl border p-4 text-sm font-semibold transition-all',
                                    useHolderAddressForZb1 === value
                                      ? 'border-emerald-400 bg-emerald-500/10 text-white'
                                      : 'border-white/10 bg-black/10 text-zinc-300 hover:border-white/20'
                                  )}
                                >
                                  <input
                                    type="radio"
                                    className="hidden"
                                    value={value}
                                    {...register('useHolderAddressForZb1')}
                                  />
                                  {label}
                                </label>
                              ))}
                            </div>

                            {useHolderAddressForZb1 === 'nein' && (
                              <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    Empfänger *
                                  </label>
                                  <input
                                    {...register('zb1Recipient')}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  />
                                  {errors.zb1Recipient && (
                                    <p className="mt-1 text-sm text-red-400">
                                      {errors.zb1Recipient.message}
                                    </p>
                                  )}
                                </div>
                                <div />
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    Straße *
                                  </label>
                                  <input
                                    {...register('zb1Street')}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  />
                                  {errors.zb1Street && (
                                    <p className="mt-1 text-sm text-red-400">
                                      {errors.zb1Street.message}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    Hausnummer *
                                  </label>
                                  <input
                                    {...register('zb1HouseNumber')}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  />
                                  {errors.zb1HouseNumber && (
                                    <p className="mt-1 text-sm text-red-400">
                                      {errors.zb1HouseNumber.message}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    PLZ *
                                  </label>
                                  <input
                                    {...register('zb1PostalCode')}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  />
                                  {errors.zb1PostalCode && (
                                    <p className="mt-1 text-sm text-red-400">
                                      {errors.zb1PostalCode.message}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    Ort *
                                  </label>
                                  <input
                                    {...register('zb1City')}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  />
                                  {errors.zb1City && (
                                    <p className="mt-1 text-sm text-red-400">
                                      {errors.zb1City.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                            <h3 className="mb-4 text-base font-bold text-white">
                              Versandadresse ZB2 / Fahrzeugbrief
                            </h3>

                            <div className="grid gap-3 md:grid-cols-2">
                              {(
                                [
                                  ['ja', 'An Halteradresse senden'],
                                  ['nein', 'Andere Adresse eingeben'],
                                ] as const
                              ).map(([value, label]) => (
                                <label
                                  key={value}
                                  className={cn(
                                    'cursor-pointer rounded-2xl border p-4 text-sm font-semibold transition-all',
                                    useHolderAddressForZb2 === value
                                      ? 'border-emerald-400 bg-emerald-500/10 text-white'
                                      : 'border-white/10 bg-black/10 text-zinc-300 hover:border-white/20'
                                  )}
                                >
                                  <input
                                    type="radio"
                                    className="hidden"
                                    value={value}
                                    {...register('useHolderAddressForZb2')}
                                  />
                                  {label}
                                </label>
                              ))}
                            </div>

                            {useHolderAddressForZb2 === 'nein' && (
                              <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    Empfänger *
                                  </label>
                                  <input
                                    {...register('zb2Recipient')}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  />
                                  {errors.zb2Recipient && (
                                    <p className="mt-1 text-sm text-red-400">
                                      {errors.zb2Recipient.message}
                                    </p>
                                  )}
                                </div>
                                <div />
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    Straße *
                                  </label>
                                  <input
                                    {...register('zb2Street')}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  />
                                  {errors.zb2Street && (
                                    <p className="mt-1 text-sm text-red-400">
                                      {errors.zb2Street.message}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    Hausnummer *
                                  </label>
                                  <input
                                    {...register('zb2HouseNumber')}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  />
                                  {errors.zb2HouseNumber && (
                                    <p className="mt-1 text-sm text-red-400">
                                      {errors.zb2HouseNumber.message}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    PLZ *
                                  </label>
                                  <input
                                    {...register('zb2PostalCode')}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  />
                                  {errors.zb2PostalCode && (
                                    <p className="mt-1 text-sm text-red-400">
                                      {errors.zb2PostalCode.message}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-zinc-200">
                                    Ort *
                                  </label>
                                  <input
                                    {...register('zb2City')}
                                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400"
                                  />
                                  {errors.zb2City && (
                                    <p className="mt-1 text-sm text-red-400">
                                      {errors.zb2City.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {currentStep === 7 && (
                        <div className="space-y-6">
                          <h2 className="text-2xl font-black text-white">Übersicht</h2>

                          <div className="rounded-3xl border border-white/10 bg-white/[0.03]">
                            <div className="divide-y divide-white/10">
                              <div className="p-5">
                                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                  Vorgang
                                </div>
                                <div className="mt-1 text-white">
                                  {SERVICE_LABELS[getValues('serviceType')]}
                                </div>
                                <div className="mt-1 text-sm text-zinc-400">
                                  Fahrzeugart: {VEHICLE_LABELS[getValues('vehicleKind')]}
                                </div>
                              </div>

                              <div className="p-5">
                                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                  Halter
                                </div>
                                <div className="mt-1 text-white">
                                  {getValues('firstName')} {getValues('lastName')}
                                </div>
                                <div className="mt-1 text-sm text-zinc-400">
                                  {getValues('email')} · {getValues('phone')}
                                </div>
                                <div className="mt-1 text-sm text-zinc-400">
                                  {getValues('holderStreet')} {getValues('holderHouseNumber')},{' '}
                                  {getValues('holderPostalCode')} {getValues('holderCity')}
                                </div>
                                <div className="mt-1 text-sm text-zinc-400">
                                  Dokument: {IDENTITY_LABELS[getValues('identityType')]}
                                </div>
                              </div>

                              <div className="p-5">
                                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                  Kennzeichen
                                </div>
                                {(serviceType === 'ummeldung' ||
                                  serviceType === 'wiederzulassung') && (
                                  <div className="mt-1 text-sm text-zinc-400">
                                    Kennzeichen behalten:{' '}
                                    {getValues('keepExistingPlate') === 'ja' ? 'Ja' : 'Nein'}
                                  </div>
                                )}

                                {showPlateChoice ? (
                                  <>
                                    <div className="mt-1 text-white">
                                      {getValues('kennzeichenMode') === 'frei'
                                        ? 'Nächstfreies Kennzeichen'
                                        : 'Reserviertes Kennzeichen'}
                                    </div>
                                    {getValues('kennzeichenMode') === 'reserviert' && (
                                      <div className="mt-1 text-sm text-zinc-400">
                                        {getValues('reservedPlate')} · PIN: {getValues('reservedPin')}
                                      </div>
                                    )}
                                    <div className="mt-1 text-sm text-zinc-400">
                                      Kennzeichen bestellen:{' '}
                                      {getValues('plateOrder') === 'ja' ? 'Ja' : 'Nein'}
                                    </div>
                                  </>
                                ) : (
                                  <div className="mt-1 text-sm text-zinc-400">
                                    Bestehendes Kennzeichen bleibt erhalten
                                  </div>
                                )}
                              </div>

                              <div className="p-5">
                                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                  Unterlagen
                                </div>
                                <div className="mt-1 text-white">eVB: {getValues('evbNumber')}</div>
                                {!!getValues('fin') && (
                                  <div className="mt-1 text-sm text-zinc-400">
                                    FIN: {getValues('fin')}
                                  </div>
                                )}
                                {!!getValues('teil1Code') && (
                                  <div className="mt-1 text-sm text-zinc-400">
                                    Teil 1 Code: {getValues('teil1Code')}
                                  </div>
                                )}
                                {!!getValues('zb2Code') && (
                                  <div className="mt-1 text-sm text-zinc-400">
                                    Teil 2 Code: {getValues('zb2Code')}
                                  </div>
                                )}
                              </div>

                              <div className="p-5">
                                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                  Bankdaten
                                </div>
                                <div className="mt-1 text-white">
                                  {getValues('accountHolder')}
                                </div>
                                <div className="mt-1 text-sm text-zinc-400">
                                  {getValues('iban')}
                                </div>
                              </div>

                              <div className="p-5">
                                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                  Versand
                                </div>
                                <div className="mt-2 text-sm text-zinc-400">
                                  ZB1:{' '}
                                  {getValues('useHolderAddressForZb1') === 'ja'
                                    ? 'Halteradresse'
                                    : `${getValues('zb1Recipient')}, ${getValues('zb1Street')} ${getValues(
                                        'zb1HouseNumber'
                                      )}, ${getValues('zb1PostalCode')} ${getValues('zb1City')}`}
                                </div>
                                <div className="mt-2 text-sm text-zinc-400">
                                  ZB2:{' '}
                                  {getValues('useHolderAddressForZb2') === 'ja'
                                    ? 'Halteradresse'
                                    : `${getValues('zb2Recipient')}, ${getValues('zb2Street')} ${getValues(
                                        'zb2HouseNumber'
                                      )}, ${getValues('zb2PostalCode')} ${getValues('zb2City')}`}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="text-sm font-semibold text-emerald-100">
                                  Gesamtpreis
                                </div>
                                <div className="mt-1 text-3xl font-black text-white">
                                  {formatPrice(totalPrice)}
                                </div>
                              </div>
                              <div className="text-right text-sm text-emerald-100">
                                Livechat / WhatsApp
                                <div className="mt-1 font-bold text-white">01522 49991900</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
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

                    {currentStep < STEPS.length ? (
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
                        <ShoppingCart className="h-4 w-4" />
                        Jetzt zur Kasse
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="border-l border-white/10 bg-black/20 p-4 md:p-6 lg:p-8">
                <div className="sticky top-6 space-y-5">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Preis live
                    </div>
                    <div className="mt-2 text-4xl font-black text-emerald-400">
                      {formatPrice(totalPrice)}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <h3 className="text-base font-bold text-white">Kostenübersicht</h3>

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-3 text-zinc-300">
                        <span>{SERVICE_LABELS[serviceType]}</span>
                        <span className="font-semibold text-white">
                          {formatPrice(PRICES[serviceType])}
                        </span>
                      </div>

                      {kennzeichenMode === 'reserviert' && showPlateChoice && (
                        <div className="flex items-center justify-between gap-3 text-zinc-300">
                          <span>Reserviertes Kennzeichen</span>
                          <span className="font-semibold text-white">
                            {formatPrice(PRICES.reservedPlate)}
                          </span>
                        </div>
                      )}

                      {plateOrder === 'ja' && showPlateChoice && (
                        <div className="flex items-center justify-between gap-3 text-zinc-300">
                          <span>Kennzeichenbestellung</span>
                          <span className="font-semibold text-white">
                            {formatPrice(PRICES.plateOrder)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-zinc-300">Gesamt</span>
                        <span className="text-2xl font-black text-emerald-400">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <h3 className="text-base font-bold text-white">Schnelle Hilfe</h3>
                    <div className="mt-4 space-y-3">
                      <a
                        href="tel:0152249991900"
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white hover:bg-black/30"
                      >
                        <Phone className="h-4 w-4 text-emerald-400" />
                        01522 49991900
                      </a>

                      <a
                        href="https://wa.me/49152249991900"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white hover:bg-black/30"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        WhatsApp öffnen
                      </a>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <h3 className="text-base font-bold text-white">Aktuell ausgewählt</h3>
                    <div className="mt-3 text-sm text-zinc-300">
                      {SERVICE_LABELS[serviceType]}
                    </div>
                    <div className="mt-2 text-sm text-zinc-500">
                      Fahrzeugart: {VEHICLE_LABELS[vehicleKind]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <InfoModal
          open={modal === 'service'}
          title="Welcher Vorgang ist richtig?"
          onClose={() => setModal(null)}
        >
          <p>
            <strong>Neuwagenzulassung:</strong> Fahrzeug war noch nie zugelassen.
          </p>
          <p>
            <strong>Gebrauchtfahrzeug anmelden:</strong> Fahrzeug soll neu auf Sie
            angemeldet werden.
          </p>
          <p>
            <strong>Ummeldung:</strong> Fahrzeug ist aktuell noch zugelassen und es ändert
            sich etwas.
          </p>
          <p>
            <strong>Wiederzulassung:</strong> Fahrzeug war bereits zugelassen und wurde
            vorher abgemeldet.
          </p>
        </InfoModal>

        <InfoModal
          open={modal === 'vehicle'}
          title="Hinweis zur Fahrzeugart"
          onClose={() => setModal(null)}
        >
          <p>
            Bei Neuwagen für Motorrad, Anhänger, Quad, LKW oder Sonderfahrzeuge bitte
            vorher kurz kontaktieren.
          </p>
        </InfoModal>

        <InfoModal
          open={modal === 'identity'}
          title="Hinweis zu Ausweis und Reisepass"
          onClose={() => setModal(null)}
        >
          <p>Bei allen Vorgängen wird ein Ausweisdokument benötigt.</p>
          <p>
            Bei Reisepass zusätzlich bitte eine Meldebescheinigung oder ein aktuelles
            Schreiben hochladen.
          </p>
        </InfoModal>

        <InfoModal
          open={modal === 'evb'}
          title="Hinweis zur eVB"
          onClose={() => setModal(null)}
        >
          <p>Für die Anmeldung wird eine gültige eVB-Nummer benötigt.</p>
          <p>
            Falls noch keine eVB-Nummer vorhanden ist, kann sie direkt über den Button
            beantragt werden.
          </p>
        </InfoModal>

        <InfoModal
          open={modal === 'teil1'}
          title="Teil 1 / Fahrzeugschein"
          onClose={() => setModal(null)}
        >
          <p>
            Sie können die Vorder- und Rückseite hochladen oder die wichtigsten Daten
            selbst eingeben.
          </p>
          <p>
            Beim Sicherheitscode hilft das Bild oder die Videoanleitung direkt im Formular.
          </p>
        </InfoModal>

        <InfoModal
          open={modal === 'zb2'}
          title="Teil 2 / Fahrzeugbrief"
          onClose={() => setModal(null)}
        >
          <p>
            Hier wird der Sicherheitscode aus Teil 2 benötigt. Sie können den Code selbst
            eingeben oder ein Bild hochladen.
          </p>
        </InfoModal>

        <InfoModal
          open={modal === 'shipping'}
          title="Versandadresse"
          onClose={() => setModal(null)}
        >
          <p>
            Für ZB1 und ZB2 können getrennte Versandadressen verwendet werden. Wenn keine
            andere Adresse gewählt wird, wird die Halteradresse verwendet.
          </p>
        </InfoModal>
      </div>
    </>
  );
}
