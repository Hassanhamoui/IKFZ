'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle,
  Shield,
  Lock,
  AlertCircle,
  Phone,
  MessageCircle,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Car,
  FileText,
  CreditCard,
  Landmark,
  Package,
  Upload,
  X,
  Info,
  Camera,
  ChevronDown,
} from 'lucide-react';
import { FormErrorBanner } from './ui/FormErrorBanner';
import { LicensePlateInput } from './ui/LicensePlateInput';

/* ------------------------------------------------------------------ */
/*  Zod Schema                                                        */
/* ------------------------------------------------------------------ */
const formSchema = z.object({
  service: z.string().min(1, 'Bitte wählen Sie eine Leistung'),
  ausweis: z.string().min(1, 'Bitte wählen Sie Ihren Ausweistyp'),
  evbNummer: z
    .string()
    .min(6, 'Bitte geben Sie Ihre eVB-Nummer ein (mind. 6 Zeichen)')
    .max(12, 'eVB-Nummer darf max. 12 Zeichen haben'),

  kennzeichenWahl: z.string().min(1, 'Bitte wählen Sie eine Kennzeichen-Option'),
  wunschkennzeichen: z.string().optional().default(''),
  kennzeichenPin: z.string().optional().default(''),
  kennzeichenBestellen: z.enum(['ja', 'nein'], {
    required_error: 'Bitte wählen Sie eine Option',
  }),

  kontoinhaber: z.string().min(2, 'Bitte geben Sie den Kontoinhaber ein'),
  iban: z
    .string()
    .min(15, 'Bitte geben Sie eine gültige IBAN ein')
    .max(34, 'IBAN darf maximal 34 Zeichen haben'),
});

type FormData = z.infer<typeof formSchema>;

/* ------------------------------------------------------------------ */
/*  Styling                                                           */
/* ------------------------------------------------------------------ */
const INPUT_CLASS =
  'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base bg-white';

const SELECT_CLASS =
  'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base bg-white appearance-none cursor-pointer';

/* ------------------------------------------------------------------ */
/*  Service prices                                                    */
/* ------------------------------------------------------------------ */
const DEFAULT_SERVICE_OPTIONS: { value: string; label: string; price: number }[] = [
  { value: 'neuzulassung', label: 'Anmelden', price: 124.7 },
  { value: 'ummeldung', label: 'Ummelden', price: 119.7 },
  { value: 'wiederzulassung', label: 'Wiederzulassung', price: 99.7 },
  { value: 'neuwagen', label: 'Neuwagen Zulassung', price: 99.7 },
];

/* ------------------------------------------------------------------ */
/*  Step definitions                                                  */
/* ------------------------------------------------------------------ */
const FORM_STEPS = [
  {
    title: 'Service & Ausweis',
    description: 'Leistung wählen, eVB eingeben',
    icon: Car,
  },
  {
    title: 'Kennzeichen',
    description: 'Wunschkennzeichen & Bestellung',
    icon: Package,
  },
  {
    title: 'Bankdaten & Kasse',
    description: 'IBAN für KFZ-Steuer & bezahlen',
    icon: CreditCard,
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Upload field definitions                                          */
/* ------------------------------------------------------------------ */
const UPLOAD_FIELDS = [
  {
    id: 'fahrzeugscheinVorne',
    label: 'Fahrzeugschein (Teil I) – Vorderseite',
    hint: 'Bitte laden Sie die Vorderseite vom Fahrzeugschein vollständig hoch.',
    exampleImage: '/uploads/2025/02/fahrzeugschein-800x800.webp',
  },
  {
    id: 'fahrzeugscheinHinten',
    label: 'Fahrzeugschein (Teil I) – Rückseite mit Sicherheitscode',
    hint: 'Bitte laden Sie die Rückseite vom Fahrzeugschein hoch. Der Sicherheitscode muss gut sichtbar sein.',
  },
  {
    id: 'fahrzeugbriefVorne',
    label: 'Fahrzeugbrief (Teil II) – Vorderseite',
    hint: 'Bitte laden Sie die Vorderseite vom Fahrzeugbrief vollständig hoch.',
    exampleImage: '/uploads/2025/02/Fahrzeugbrief-800x800.webp',
  },
  {
    id: 'personalausweisVorne',
    label: 'Personalausweis – Vorderseite',
    hint: 'Bitte laden Sie die Vorderseite Ihres Personalausweises gut leserlich hoch.',
  },
  {
    id: 'personalausweisHinten',
    label: 'Personalausweis – Rückseite',
    hint: 'Bitte laden Sie die Rückseite Ihres Personalausweises gut leserlich hoch.',
  },
  {
    id: 'aufenthaltstitelVorne',
    label: 'Aufenthaltstitel – Vorderseite',
    hint: 'Bitte laden Sie die Vorderseite Ihres Aufenthaltstitels gut leserlich hoch.',
  },
  {
    id: 'aufenthaltstitelHinten',
    label: 'Aufenthaltstitel – Rückseite',
    hint: 'Bitte laden Sie die Rückseite Ihres Aufenthaltstitels gut leserlich hoch.',
  },
  {
    id: 'reisepassVorne',
    label: 'Reisepass – Seite mit Foto',
    hint: 'Bitte laden Sie die Seite mit Foto und persönlichen Daten gut leserlich hoch.',
  },
  {
    id: 'meldebescheinigung',
    label: 'Meldebescheinigung',
    hint: 'Bitte laden Sie eine aktuelle Meldebescheinigung oder ein behördliches Dokument mit Ihrer Adresse hoch.',
  },
] as const;

type UploadField = (typeof UPLOAD_FIELDS)[number];
type UploadFieldId = UploadField['id'];

const ACCEPTED_FILE_TYPES = 'image/jpeg,image/png,image/webp,application/pdf';

/* ------------------------------------------------------------------ */
/*  Upload rules                                                      */
/* ------------------------------------------------------------------ */
function getVehicleUploadIds(service?: string): UploadFieldId[] {
  switch (service) {
    case 'wiederzulassung':
      return ['fahrzeugscheinVorne', 'fahrzeugscheinHinten'];
    case 'neuwagen':
      return ['fahrzeugbriefVorne'];
    case 'neuzulassung':
    case 'ummeldung':
    default:
      return ['fahrzeugscheinVorne', 'fahrzeugscheinHinten', 'fahrzeugbriefVorne'];
  }
}

function getVerificationUploadIds(ausweis?: string): UploadFieldId[] {
  switch (ausweis) {
    case 'personalausweis':
      return ['personalausweisVorne', 'personalausweisHinten'];
    case 'aufenthaltstitel':
      return ['aufenthaltstitelVorne', 'aufenthaltstitelHinten'];
    case 'reisepass':
      return ['reisepassVorne', 'meldebescheinigung'];
    default:
      return [];
  }
}

function getUploadFieldById(id: UploadFieldId): UploadField {
  return UPLOAD_FIELDS.find((field) => field.id === id)!;
}

/* ------------------------------------------------------------------ */
/*  Single file upload card component                                 */
/* ------------------------------------------------------------------ */
function FileUploadCard({
  field,
  file,
  onFileChange,
  onRemove,
  error,
}: {
  field: UploadField;
  file: File | null;
  onFileChange: (file: File) => void;
  onRemove: () => void;
  error?: string;
}) {
  const [showExample, setShowExample] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (f: File) => {
    onFileChange(f);
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  return (
    <>
      <div
        className={`relative rounded-xl border-2 border-dashed transition-all ${
          error
            ? 'border-red-300 bg-red-50/50'
            : file
            ? 'border-green-300 bg-green-50/50'
            : 'border-gray-200 bg-gray-50/50 hover:border-primary/40 hover:bg-primary/5'
        }`}
      >
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
          <label className="block text-sm font-bold text-gray-700 leading-snug pr-2">
            {field.label} <span className="text-red-500">*</span>
          </label>

          {field.exampleImage ? (
            <button
              type="button"
              onClick={() => setShowExample(true)}
              className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
              title="Beispielbild anzeigen"
            >
              <Info className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        <p className="px-4 text-xs text-gray-400 mb-3 leading-relaxed">{field.hint}</p>

        {!file ? (
          <label className="flex flex-col items-center gap-2 px-4 pb-5 cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary">
              Foto aufnehmen oder Datei wählen
            </span>
            <span className="text-xs text-gray-400">JPG, PNG, WebP oder PDF · max. 10 MB</span>
            <input
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        ) : (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
              {preview ? (
                <img
                  src={preview}
                  alt="Vorschau"
                  className="w-16 h-16 object-cover rounded-lg shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={onRemove}
                className="shrink-0 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Datei hochgeladen
            </div>
          </div>
        )}

        {error && (
          <p className="px-4 pb-3 text-red-500 text-xs flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}
      </div>

      {showExample && field.exampleImage && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowExample(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold text-gray-900 text-sm">{field.label}</h3>
              <button
                type="button"
                onClick={() => setShowExample(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <img
                src={field.exampleImage}
                alt={`Beispiel: ${field.label}`}
                className="w-full rounded-xl"
              />
              <p className="text-xs text-gray-500 mt-3 text-center">{field.hint}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Client-side image compression                                     */
/* ------------------------------------------------------------------ */
const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;

function compressImageOnce(
  img: HTMLImageElement,
  maxDim: number,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let { width, height } = img;

    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas not supported'));

    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Komprimierung fehlgeschlagen'))),
      'image/jpeg',
      quality,
    );
  });
}

async function compressImage(file: File): Promise<Blob> {
  if (file.size <= MAX_UPLOAD_BYTES || !file.type.startsWith('image/')) {
    return file;
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new window.Image();
    const url = URL.createObjectURL(file);

    i.onload = () => {
      URL.revokeObjectURL(url);
      resolve(i);
    };

    i.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Bild konnte nicht geladen werden'));
    };

    i.src = url;
  });

  const attempts: [number, number][] = [
    [1600, 0.7],
    [1200, 0.6],
    [1000, 0.5],
    [800, 0.4],
    [600, 0.3],
  ];

  for (const [maxDim, quality] of attempts) {
    const blob = await compressImageOnce(img, maxDim, quality);
    if (blob.size <= MAX_UPLOAD_BYTES) {
      return blob;
    }
  }

  return compressImageOnce(img, 400, 0.2);
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
interface RegistrationFormProps {
  productName?: string;
  options?: {
    services?: { key: string; label: string; price: number }[];
    kennzeichen_reserviert?: { label: string; price: number };
    kennzeichen_bestellen?: { label: string; price: number };
  };
  contactPhone?: string;
  contactPhoneLink?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function RegistrationForm({
  productName = 'Auto Online Anmelden / Ummelden',
  options,
  contactPhone = '01522 4999190',
  contactPhoneLink = 'tel:015224999190',
  contactWhatsapp = 'https://wa.me/4915224999190',
  contactEmail = 'info@ikfzdigitalzulassung.de',
}: RegistrationFormProps = {}) {
  const SERVICE_OPTIONS =
    options?.services?.map((item) => ({
      value: item.key,
      label: item.label,
      price: item.price,
    })) ?? DEFAULT_SERVICE_OPTIONS;

  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const formTopRef = useRef<HTMLDivElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<Record<UploadFieldId, File | null>>({
    fahrzeugscheinVorne: null,
    fahrzeugscheinHinten: null,
    fahrzeugbriefVorne: null,
    personalausweisVorne: null,
    personalausweisHinten: null,
    aufenthaltstitelVorne: null,
    aufenthaltstitelHinten: null,
    reisepassVorne: null,
    meldebescheinigung: null,
  });

  const [uploadErrors, setUploadErrors] = useState<Partial<Record<UploadFieldId, string>>>({});

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service: '',
      ausweis: '',
      evbNummer: '',
      kennzeichenWahl: '',
      wunschkennzeichen: '',
      kennzeichenPin: '',
      kennzeichenBestellen: 'nein',
      kontoinhaber: '',
      iban: '',
    },
  });

  const kennzeichenWahl = watch('kennzeichenWahl');
  const kennzeichenBestellen = watch('kennzeichenBestellen');
  const selectedService = watch('service');
  const selectedAusweis = watch('ausweis');

  const serviceOption = SERVICE_OPTIONS.find((o) => o.value === selectedService);
  const basePrice = serviceOption?.price ?? 0;
  const kReserviertUnit = options?.kennzeichen_reserviert?.price ?? 24.7;
  const kBestellenUnit = options?.kennzeichen_bestellen?.price ?? 29.7;
  const kennzeichenReservierung = kennzeichenWahl === 'reserviert' ? kReserviertUnit : 0;
  const kennzeichenBestellung = kennzeichenBestellen === 'ja' ? kBestellenUnit : 0;
  const totalPrice = basePrice + kennzeichenReservierung + kennzeichenBestellung;
  const fmtPrice = (n: number) => n.toFixed(2).replace('.', ',');

  const vehicleUploadIds = getVehicleUploadIds(selectedService);
  const verificationUploadIds = getVerificationUploadIds(selectedAusweis);

  const stepFields: (keyof FormData)[][] = [
    ['service', 'ausweis', 'evbNummer'],
    ['kennzeichenWahl', 'kennzeichenBestellen'],
    ['kontoinhaber', 'iban'],
  ];

  const nextStep = async () => {
    const valid = await trigger(stepFields[currentStep]);
    if (!valid) return;

    if (currentStep === 1 && kennzeichenWahl === 'reserviert') {
      const wk = watch('wunschkennzeichen') || '';
      const pin = watch('kennzeichenPin') || '';
      let hasError = false;

      clearErrors('wunschkennzeichen');
      clearErrors('kennzeichenPin');

      if (wk.length < 3) {
        setError('wunschkennzeichen', {
          type: 'manual',
          message: 'Bitte Ihr Wunschkennzeichen eingeben (mind. 3 Zeichen)',
        });
        hasError = true;
      }

      if (pin.length < 4) {
        setError('kennzeichenPin', {
          type: 'manual',
          message: 'Bitte die PIN der Reservierung eingeben (mind. 4 Zeichen)',
        });
        hasError = true;
      }

      if (hasError) return;
    }

    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      setTimeout(() => {
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const onSubmit = async (data: FormData) => {
    const newUploadErrors: Partial<Record<UploadFieldId, string>> = {};
    const requiredUploadIds = [
      ...getVehicleUploadIds(data.service),
      ...getVerificationUploadIds(data.ausweis),
    ];

    for (const id of requiredUploadIds) {
      if (!uploadedFiles[id]) {
        const field = getUploadFieldById(id);
        newUploadErrors[id] = `Bitte ${field.label} hochladen`;
      }
    }

    if (Object.keys(newUploadErrors).length > 0) {
      setUploadErrors(newUploadErrors);
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setFormError(null);

    try {
      const fileInfo: Record<string, { name: string; size: number; type: string; url: string }> =
        {};

      for (const id of requiredUploadIds) {
        const file = uploadedFiles[id];
        if (!file) continue;

        try {
          let fileToUpload: File | Blob = file;
          let fileName = file.name;

          if (file.type.startsWith('image/')) {
            fileToUpload = await compressImage(file);
            fileName = fileName.replace(/\.(png|bmp|webp|tiff?)$/i, '.jpg');
            if (!fileName.match(/\.jpe?g$/i)) fileName += '.jpg';
          }

          const uploadFormData = new FormData();
          uploadFormData.append('file', fileToUpload, fileName);
          uploadFormData.append('fieldName', id);

          const res = await fetch('/api/upload/documents', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!res.ok) {
            const errBody = await res.json().catch(() => ({ error: 'Upload fehlgeschlagen' }));
            throw new Error(errBody.error || `Upload fehlgeschlagen (${res.status})`);
          }

          const result = await res.json();
          const uploaded = result.files?.[0];

          if (!uploaded?.url) {
            throw new Error('Keine URL vom Upload erhalten');
          }

          fileInfo[id] = {
            name: file.name,
            size: file.size,
            type: file.type,
            url: uploaded.url,
          };
        } catch (uploadErr) {
          const errMsg = uploadErr instanceof Error ? uploadErr.message : 'Upload fehlgeschlagen';
          setUploadErrors((prev) => ({ ...prev, [id]: errMsg }));
          setFormError(`Upload fehlgeschlagen: ${errMsg}`);
          setIsSubmitting(false);
          submittingRef.current = false;
          return;
        }
      }

      const selectedOption = SERVICE_OPTIONS.find((o) => o.value === data.service);
      const kReservierung = data.kennzeichenWahl === 'reserviert' ? kReserviertUnit : 0;
      const kBestellung = data.kennzeichenBestellen === 'ja' ? kBestellenUnit : 0;
      const computedPrice = (selectedOption?.price ?? 0) + kReservierung + kBestellung;

      const addons: { key: string; label: string; price: number }[] = [];

      if (data.kennzeichenWahl === 'reserviert') {
        addons.push({
          key: 'kennzeichen_reserviert',
          label:
            options?.kennzeichen_reserviert?.label ?? 'Reserviertes Wunschkennzeichen',
          price: kReserviertUnit,
        });
      }

      if (data.kennzeichenBestellen === 'ja') {
        addons.push({
          key: 'kennzeichen_bestellen',
          label:
            options?.kennzeichen_bestellen?.label ?? 'Kennzeichen bestellen & liefern',
          price: kBestellenUnit,
        });
      }

      const checkoutOrder = {
        productName,
        productSlug: 'auto-online-anmelden',
        serviceType: 'anmeldung',
        formData: {
          ...data,
          uploadedFiles: fileInfo,
        },
        selectedService: selectedOption?.label || data.service,
        basePrice: selectedOption?.price ?? 0,
        addons,
        total: computedPrice,
      };

      const legacyServiceData = {
        formType: 'autoanmeldung',
        productId: 'anmeldung',
        productPrice: computedPrice.toFixed(2),
        service: data.service,
        serviceLabel: selectedOption?.label || data.service,
        ausweis: data.ausweis,
        evbNummer: data.evbNummer,
        kennzeichenWahl: data.kennzeichenWahl,
        wunschkennzeichen: data.wunschkennzeichen || '',
        kennzeichenPin: data.kennzeichenPin || '',
        kennzeichenBestellen: data.kennzeichenBestellen,
        kontoinhaber: data.kontoinhaber,
        iban: data.iban,
        uploadedFiles: fileInfo,
      };

      sessionStorage.setItem('checkout_order', JSON.stringify(checkoutOrder));
      sessionStorage.setItem('serviceData', JSON.stringify(legacyServiceData));

      router.push('/rechnung/');
    } catch (err) {
      console.error('Submit error:', err);
      setFormError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div
      ref={formTopRef}
      className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary to-primary-700 px-6 md:px-10 py-6 text-white">
          <h2 className="text-xl md:text-2xl font-extrabold">
            Jetzt Formular ausfüllen – wir schalten Ihr Fahrzeug gleich frei
          </h2>
          <p className="text-white/80 text-sm mt-1">
            Live-Support: Persönliche Hilfe per Chat während des Ausfüllens
          </p>
        </div>

        <div className="px-4 md:px-10 pt-8 pb-2">
          <div className="flex items-center justify-between">
            {FORM_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isDone = index < currentStep;

              return (
                <div key={step.title} className="flex items-center flex-1 last:flex-initial">
                  <button
                    type="button"
                    onClick={() => {
                      if (isDone) setCurrentStep(index);
                    }}
                    className={`flex items-center gap-2 md:gap-3 transition-all ${
                      isDone ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <span
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                          : isDone
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </span>

                    <span className="hidden md:block text-left">
                      <span
                        className={`block text-sm font-bold ${
                          isActive ? 'text-primary' : isDone ? 'text-accent' : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="block text-xs text-gray-400">{step.description}</span>
                    </span>
                  </button>

                  {index < FORM_STEPS.length - 1 && (
                    <div className="flex-1 mx-2 md:mx-4">
                      <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDone ? 'bg-accent w-full' : 'bg-gray-200 w-0'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 md:px-10 py-8 min-h-[400px]">
          {currentStep === 0 && (
            <div
              key="step-1"
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Service & Ausweis</h3>
                  <p className="text-sm text-gray-500">
                    Wählen Sie Ihre gewünschte Leistung und Ihren Ausweistyp
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Was möchten Sie tun? <span className="text-red-500">*</span>
                </label>
                <select {...register('service')} className={SELECT_CLASS}>
                  <option value="">— Bitte wählen —</option>
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ( + {opt.price.toFixed(2).replace('.', ',')} € )
                    </option>
                  ))}
                </select>
                {errors.service && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.service.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Welchen Ausweis besitzen Sie? <span className="text-red-500">*</span>
                </label>
                <select {...register('ausweis')} className={SELECT_CLASS}>
                  <option value="">— Bitte wählen —</option>
                  <option value="personalausweis">Deutscher Personalausweis</option>
                  <option value="aufenthaltstitel">Aufenthaltstitel</option>
                  <option value="reisepass">Reisepass</option>
                </select>
                {errors.ausweis && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.ausweis.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  eVB Nummer eintragen (Versicherungsbestätigung){' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('evbNummer')}
                  placeholder="z. B. A1B2C3D"
                  className={INPUT_CLASS}
                />
                {errors.evbNummer && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.evbNummer.message}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Die eVB-Nummer erhalten Sie von Ihrer KFZ-Versicherung
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div
              key="step-2"
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Kennzeichen</h3>
                  <p className="text-sm text-gray-500">Wunschkennzeichen & Bestelloptionen</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Welches Kennzeichen möchten Sie? <span className="text-red-500">*</span>
                </label>
                <select {...register('kennzeichenWahl')} className={SELECT_CLASS}>
                  <option value="">— Bitte wählen —</option>
                  <option value="automatisch">Automatische Zuteilung</option>
                  <option value="reserviert">
                    Reserviertes Kennzeichen ( + {fmtPrice(kReserviertUnit)} € )
                  </option>
                </select>
                {errors.kennzeichenWahl && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.kennzeichenWahl.message}
                  </p>
                )}
              </div>

              {kennzeichenWahl === 'reserviert' && (
                <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-sm text-gray-700 font-medium">
                    Bitte Ihr Wunschkennzeichen und die PIN aus der Reservierung eintragen. Kein
                    reserviertes Kennzeichen vorhanden?{' '}
                    <a
                      href={contactWhatsapp}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="text-primary underline font-bold"
                    >
                      Kontaktieren Sie uns.
                    </a>
                  </p>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Wunschkennzeichen <span className="text-red-500">*</span>
                    </label>
                    <LicensePlateInput
                      value={watch('wunschkennzeichen') || ''}
                      onChange={(v) =>
                        setValue('wunschkennzeichen', v, { shouldValidate: true })
                      }
                      error={errors.wunschkennzeichen?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      PIN für reserviertes Kennzeichen <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('kennzeichenPin')}
                      placeholder="z. B. 123456"
                      className={INPUT_CLASS}
                    />
                    {errors.kennzeichenPin && (
                      <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.kennzeichenPin.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Möchten Sie Ihre Kennzeichen mitbestellen?{' '}
                  <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      kennzeichenBestellen === 'ja'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value="ja"
                      {...register('kennzeichenBestellen')}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-bold text-sm text-gray-800">
                        Ja <span className="text-accent">(+ {fmtPrice(kBestellenUnit)} €)</span>
                      </p>
                      <p className="text-xs text-gray-400">Lieferung in 2–3 Werktagen</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      kennzeichenBestellen === 'nein'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value="nein"
                      {...register('kennzeichenBestellen')}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-bold text-sm text-gray-800">Nein</p>
                      <p className="text-xs text-gray-400">
                        Selbst beim Schildermacher prägen
                      </p>
                    </div>
                  </label>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Hinweis: Kennzeichen von uns werden in 2–3 Werktagen geliefert.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div
              key="step-3"
              className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Bankverbindung für die Kfz-Steuerlastschrift
                  </h3>
                  <p className="text-sm text-gray-500">
                    IBAN wird für die automatische KFZ-Steuer benötigt
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Kontoinhaber (Vor- und Nachname) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('kontoinhaber')}
                  placeholder="Max Mustermann"
                  className={INPUT_CLASS}
                />
                {errors.kontoinhaber && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.kontoinhaber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  IBAN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('iban')}
                  placeholder="DE89 3704 0044 0532 0130 00"
                  className={INPUT_CLASS}
                />
                {errors.iban && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.iban.message}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Wird nur für das Lastschriftmandat der KFZ-Steuer verwendet
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Fahrzeugdokumente hochladen</h4>
                    <p className="text-xs text-gray-500">
                      Bitte laden Sie die für Ihren Service benötigten Fahrzeugdokumente hoch
                    </p>
                  </div>
                </div>

                {vehicleUploadIds.map((id) => {
                  const field = getUploadFieldById(id);
                  return (
                    <FileUploadCard
                      key={field.id}
                      field={field}
                      file={uploadedFiles[field.id]}
                      error={uploadErrors[field.id]}
                      onFileChange={(file) => {
                        setUploadedFiles((prev) => ({ ...prev, [field.id]: file }));
                        setUploadErrors((prev) => {
                          const next = { ...prev };
                          delete next[field.id];
                          return next;
                        });
                      }}
                      onRemove={() => {
                        setUploadedFiles((prev) => ({ ...prev, [field.id]: null }));
                      }}
                    />
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Verifizierung</h4>
                    <p className="text-xs text-gray-500">
                      Bitte laden Sie die passenden Dokumente gut leserlich hoch
                    </p>
                  </div>
                </div>

                {verificationUploadIds.map((id) => {
                  const field = getUploadFieldById(id);
                  return (
                    <FileUploadCard
                      key={field.id}
                      field={field}
                      file={uploadedFiles[field.id]}
                      error={uploadErrors[field.id]}
                      onFileChange={(file) => {
                        setUploadedFiles((prev) => ({ ...prev, [field.id]: file }));
                        setUploadErrors((prev) => {
                          const next = { ...prev };
                          delete next[field.id];
                          return next;
                        });
                      }}
                      onRemove={() => {
                        setUploadedFiles((prev) => ({ ...prev, [field.id]: null }));
                      }}
                    />
                  );
                })}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Probleme beim Hochladen?</strong> Senden Sie uns die Fotos alternativ per
                  WhatsApp oder E-Mail.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={contactWhatsapp}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#128C7E] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp {contactPhone}
                  </a>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-2 bg-primary text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {contactEmail}
                  </a>
                </div>
              </div>

              <details className="group bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
                <summary className="list-none cursor-pointer px-4 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-amber-900">Wichtige Informationen</p>
                    <p className="text-xs text-amber-800 mt-1">
                      Bitte prüfen Sie Ihre Angaben vor dem Absenden genau
                    </p>
                  </div>
                  <ChevronDown className="w-5 h-5 text-amber-900 transition-transform group-open:rotate-180" />
                </summary>

                <div className="px-4 pb-4 text-sm text-amber-900 space-y-2 leading-relaxed">
                  <p>
                    Bitte achten Sie darauf, dass alle Angaben exakt mit Ihren Dokumenten
                    übereinstimmen.
                  </p>
                  <p>
                    Besonders wichtig sind die eVB-Nummer, der vollständige Name laut Ausweis,
                    bereits reservierte Kennzeichen, die PIN der Reservierung und Ihre Bankdaten.
                  </p>
                  <p>
                    Wenn Daten bei Versicherung, Kennzeichen-Reservierung oder Lastschrift nicht
                    korrekt hinterlegt sind, kann der Antrag abgelehnt werden.
                  </p>
                  <p>
                    Eine Ablehnung kann kostenpflichtig sein. Wenn Sie unsicher sind, kontaktieren
                    Sie uns bitte vor dem Absenden kurz per WhatsApp oder Telefon.
                  </p>
                  <p>
                    Wichtig ist außerdem, dass bei Ihrer zuständigen Zulassungsstelle keine
                    offenen Steuerrückstände bestehen.
                  </p>
                </div>
              </details>

              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-5 border border-primary/10">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{serviceOption?.label ?? 'Zulassung'}</span>
                    <span className="font-bold text-gray-800">
                      {basePrice.toFixed(2).replace('.', ',')} €
                    </span>
                  </div>

                  {kennzeichenReservierung > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reserviertes Kennzeichen</span>
                      <span className="font-bold text-gray-800">
                        + {fmtPrice(kennzeichenReservierung)} €
                      </span>
                    </div>
                  )}

                  {kennzeichenBestellung > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kennzeichen-Bestellung</span>
                      <span className="font-bold text-gray-800">
                        + {fmtPrice(kennzeichenBestellung)} €
                      </span>
                    </div>
                  )}

                  <div className="border-t border-primary/10 pt-2 flex justify-between">
                    <span className="font-bold text-primary text-lg">Gesamt</span>
                    <span className="font-extrabold text-primary text-lg">
                      {totalPrice.toFixed(2).replace('.', ',')} €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 md:px-10 pb-8">
          {formError && (
            <div className="mb-4">
              <FormErrorBanner message={formError} onDismiss={() => setFormError(null)} />
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors px-4 py-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </button>
            ) : (
              <div />
            )}

            {currentStep < FORM_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                Weiter
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/25 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Wird gesendet …
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Zur Kasse – {totalPrice.toFixed(2).replace('.', ',')} €
                  </>
                )}
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> SSL-verschlüsselt
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> KBA-registriert
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> Live-Support: {contactPhone}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
