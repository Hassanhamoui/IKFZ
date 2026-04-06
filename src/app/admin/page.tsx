"use client"; 

import "./admin.css";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import dynamic from "next/dynamic";
import {
  FileText, BookOpen, Search, LogOut, LayoutDashboard,
  Plus, Pencil, Trash2, Save, X, Eye, EyeOff, Settings, Globe,
  ShoppingCart, Users, CreditCard, Receipt, Package,
  TrendingUp, DollarSign, ChevronLeft, ChevronRight,
  Download, Filter, RefreshCw, Zap, Shield, Wallet, Clock,
  ExternalLink, Image as ImageIcon, AlertCircle, FileQuestion,
  Tag, Calendar, Mail, Lock, Copy, Send, Percent, ToggleLeft, ToggleRight,
  Upload, Menu,
  Landmark, Apple, Car, type LucideIcon,
} from "lucide-react";
import { MediaLibraryTab, ImageField, MediaPicker } from "@/components/admin/MediaLibrary";
import { ToastProvider, useToast } from "@/components/admin/Toast";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });
const ProductsManager = dynamic(() => import("@/components/admin/ProductsManager"), { ssr: false });

const API = "/api/admin";

// ─── Types ──────────────────────────────────────────────────
interface SEOData { id?: string; metaTitle?: string; metaDescription?: string; canonicalUrl?: string; ogTitle?: string; ogDescription?: string; ogImage?: string; robots?: string; schemaJson?: string; }
interface PageData { id: string; title: string; slug: string; content: string; excerpt: string; status: string; pageType: string; featuredImage: string | null; seo: SEOData | null; }
interface PostData { id: string; title: string; slug: string; content: string; excerpt: string; status: string; author: string | null; featuredImage: string | null; readingTime: number | null; publishedAt: string | null; scheduledAt: string | null; seo: SEOData | null; categories?: { category: { id: string; name: string; slug: string } }[]; }
interface PaginationInfo { page: number; totalPages: number; total: number; limit: number; }

type Tab = "dashboard" | "pages" | "posts" | "seo" | "products" | "orders" | "customers" | "payments" | "invoices" | "gateways" | "coupons" | "campaigns" | "settings" | "media";

// ─── Helpers ────────────────────────────────────────────────
function formatEuro(n: number) { return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n); }
function formatDate(d: string | null) { if (!d) return "-"; return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }); }

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700 border-green-300",
  processing: "bg-blue-100 text-blue-700 border-blue-300",
  "on-hold": "bg-amber-100 text-amber-700 border-amber-300",
  pending: "bg-amber-100 text-amber-700 border-amber-300",
  cancelled: "bg-red-100 text-red-700 border-red-300",
  refunded: "bg-orange-100 text-orange-700 border-orange-300",
  failed: "bg-red-100 text-red-700 border-red-300",
  paid: "bg-green-100 text-green-700 border-green-300",
  issued: "bg-sky-100 text-sky-700 border-sky-300",
  publish: "bg-green-100 text-green-700 border-green-300",
  draft: "bg-gray-100 text-gray-600 border-gray-300",
  published: "bg-green-100 text-green-700 border-green-300",
  scheduled: "bg-purple-100 text-purple-700 border-purple-300",
  instock: "bg-green-100 text-green-700 border-green-300",
  outofstock: "bg-red-100 text-red-700 border-red-300",
};

const statusLabels: Record<string, string> = {
  completed: "Abgeschlossen",
  processing: "In Bearbeitung",
  "on-hold": "Wartend",
  pending: "Ausstehend",
  cancelled: "Storniert",
  refunded: "Erstattet",
  failed: "Fehlgeschlagen",
  paid: "Bezahlt",
  issued: "Erstellt",
  publish: "Veröffentlicht",
  draft: "Entwurf",
  published: "Veröffentlicht",
  scheduled: "Geplant",
  instock: "Auf Lager",
  outofstock: "Ausverkauft",
};

function Badge({ status }: { status: string }) {
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${statusColors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>{statusLabels[status] || status}</span>;
}

// ─── Debounce Hook ──────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── SWR Fetcher ────────────────────────────────────────────
function fetcher(url: string) {
  const normalizedUrl = url.endsWith('/') ? url : `${url}/`;
  return fetch(normalizedUrl, { credentials: "include", cache: "no-store" }).then(r => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  });
}

// ═══════════════════════════════════════════════════════════
// SKELETON LOADER
// ═══════════════════════════════════════════════════════════
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 animate-pulse">
      <div className="w-12 h-12 rounded-lg bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/5" />
      </div>
      <div className="h-6 w-16 bg-gray-200 rounded" />
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return <div className="space-y-2">{Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}</div>;
}

// ═══════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════
function EmptyState({ icon: Icon = FileQuestion, title = "Keine Einträge gefunden", description }: { icon?: any; title?: string; description?: string }) {
  return (
    <div className="text-center py-16">
      <Icon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-400 text-sm">{title}</p>
      {description && <p className="text-gray-300 text-xs mt-1">{description}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ERROR STATE
// ═══════════════════════════════════════════════════════════
function ErrorState({ message = "Fehler beim Laden", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-16">
      <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3 opacity-50" />
      <p className="text-red-600 text-sm">{message}</p>
      {onRetry && <button onClick={onRetry} className="mt-3 px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm hover:bg-red-100 transition-colors">Erneut versuchen</button>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGINATION COMPONENT
// ═══════════════════════════════════════════════════════════
function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationInfo & { onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Generate page numbers with ellipsis
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
      <span className="text-gray-400 text-sm">{start}–{end} von {total}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-2 text-gray-300 text-sm">...</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)} className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}>{p}</button>
          )
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SEARCH BAR
// ═══════════════════════════════════════════════════════════
function SearchBar({ value, onChange, placeholder = "Suchen...", count, suffix }: { value: string; onChange: (v: string) => void; placeholder?: string; count?: number; suffix?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex-1 relative min-w-[200px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:border-primary focus:outline-none" />
      </div>
      {count !== undefined && <span className="text-gray-400 text-sm whitespace-nowrap">{count} Einträge</span>}
      {suffix}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LOGIN SCREEN — Premium Dark Mode
// ═══════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler");
      onLogin(data.token);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex bg-dark-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Left Panel — Branding (hidden on mobile) */}
      <div className={`hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12 transition-all duration-700 ${
        mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
      }`}>
        <div className="max-w-md text-center space-y-8">
          {/* Logo area */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse-slow" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary-700 rounded-2xl flex items-center justify-center">
              <Car className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              iKFZ Digital
              <span className="block text-primary">Zulassung</span>
            </h1>
            <p className="text-dark-400 text-lg leading-relaxed">
              Verwaltungspanel für die digitale Fahrzeugzulassung — sicher, schnell und effizient.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-3 text-left">
            {[
              { icon: Shield, text: 'Sichere Authentifizierung' },
              { icon: Zap, text: 'Echtzeit-Verwaltung' },
              { icon: LayoutDashboard, text: 'Übersichtliches Dashboard' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-dark-400">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative border line */}
        <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      </div>

      {/* Right Panel — Login Form */}
      <div className={`w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6 sm:p-8 transition-all duration-700 delay-150 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-primary-700 rounded-xl">
              <Car className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">iKFZ Digital Zulassung</h1>
              <p className="text-dark-500 text-sm mt-1">Admin Panel</p>
            </div>
          </div>

          {/* Header */}
          <div className="hidden lg:block">
            <h2 className="text-2xl font-bold text-white">Willkommen zurück</h2>
            <p className="text-dark-500 mt-2">Melden Sie sich in Ihrem Admin-Konto an</p>
          </div>

          {/* Login Card */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-8 rounded-2xl bg-dark-900/50 border border-dark-700/50 backdrop-blur-sm space-y-5"
                 style={{ boxShadow: '0 0 40px rgba(0, 168, 90, 0.04), 0 8px 32px rgba(0,0,0,0.3)' }}>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-dark-300">E-Mail Adresse</label>
                <div className="relative">
                  <Mail className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@ikfz.de"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-dark-800/50 border border-dark-600/50 text-white placeholder:text-dark-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-dark-300">Passwort</label>
                <div className="relative">
                  <Lock className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-dark-800/50 border border-dark-600/50 text-white placeholder:text-dark-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-dark-500 hover:text-dark-300 hover:bg-dark-700/50 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative group mt-1"
                style={{ boxShadow: '0 4px 14px rgba(0, 168, 90, 0.3), 0 2px 6px rgba(0,168,90,0.15)' }}
              >
                <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Wird angemeldet...
                    </>
                  ) : 'Anmelden'}
                </span>
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-dark-600 text-xs">
            © {new Date().getFullYear()} iKFZ Digital Zulassung — Admin
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CONTENT EDITOR (Pages/Posts)
// ═══════════════════════════════════════════════════════════
function ContentEditor({ item, type, token, onSave, onCancel }: { item: PageData | PostData | null; type: "pages" | "posts"; token: string; onSave: () => void; onCancel: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState(item?.title || "");
  const [slug, setSlug] = useState(item?.slug || "");
  const [content, setContent] = useState(item?.content || "");
  const [status, setStatus] = useState(item?.status || "published");
  const [seoTab, setSeoTab] = useState(false);
  const [metaTitle, setMetaTitle] = useState(item?.seo?.metaTitle || "");
  const [metaDesc, setMetaDesc] = useState(item?.seo?.metaDescription || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const body: any = { title, slug, content, status };
      if (item?.id) body.id = item.id;
      if (metaTitle || metaDesc) { body.seo = { metaTitle, metaDescription: metaDesc }; }
      const res = await fetch(`${API}/${type}`, { method: item?.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Save failed");
      toast("Erfolgreich gespeichert");
      onSave();
    } catch { toast("Fehler beim Speichern", "error"); } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{item?.id ? "Bearbeiten" : "Neu erstellen"}</h2>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><X className="w-4 h-4" /></button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"><Save className="w-4 h-4" />{saving ? "..." : "Speichern"}</button>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setSeoTab(false)} className={`px-4 py-2 rounded-lg text-sm ${!seoTab ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Inhalt</button>
        <button onClick={() => setSeoTab(true)} className={`px-4 py-2 rounded-lg text-sm ${seoTab ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>SEO</button>
      </div>
      {!seoTab ? (
        <div className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titel" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" />
          <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="Slug" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-500 text-sm focus:border-primary focus:outline-none" />
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none">
            <option value="published">Published</option><option value="draft">Draft</option>
          </select>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={20} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-white text-sm font-mono focus:border-primary focus:outline-none" />
        </div>
      ) : (
        <div className="space-y-4">
          <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Meta Title" className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" />
          <div className="text-xs text-gray-400">{metaTitle.length}/60 Zeichen</div>
          <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} placeholder="Meta Description" rows={3} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" />
          <div className="text-xs text-gray-400">{metaDesc.length}/160 Zeichen</div>
          <div className="p-4 rounded-xl bg-white border border-gray-200">
            <p className="text-xs text-gray-400 mb-2">Google-Vorschau</p>
            <p className="text-blue-400 text-base">{metaTitle || title || "Titel"}</p>
            <p className="text-green-400 text-xs">ikfzdigitalzulassung.de/{slug}</p>
            <p className="text-gray-500 text-sm mt-1">{metaDesc || "Beschreibung..."}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════
function DashboardTab({ token }: { token: string }) {
  const { data, error, mutate } = useSWR(`${API}/dashboard`, fetcher, { revalidateOnFocus: false, dedupingInterval: 60000 });

  if (error) return <ErrorState onRetry={() => mutate()} />;
  if (!data) return <SkeletonTable rows={4} />;

  const { stats, recentOrders, paymentMethods, monthlyRevenue, statusBreakdown } = data;
  const maxRevenue = Math.max(...monthlyRevenue.map((m: any) => m.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Umsatz", value: formatEuro(stats.totalRevenue), icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
          { label: "Bestellungen", value: stats.totalOrders, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Kunden", value: stats.totalCustomers, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Produkte", value: stats.totalProducts, icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((s, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <span className="text-gray-500 text-sm">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-white border border-gray-200">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Monatlicher Umsatz</h3>
        <div className="flex items-end gap-2 h-48">
          {monthlyRevenue.map((m: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-400">{m.revenue > 0 ? formatEuro(m.revenue) : ""}</span>
              <div className="w-full bg-primary/20 rounded-t" style={{ height: `${Math.max((m.revenue / maxRevenue) * 140, 2)}px` }}>
                <div className="w-full h-full bg-primary/60 rounded-t" />
              </div>
              <span className="text-[10px] text-gray-400">{m.month.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-gray-200">
          <h3 className="text-lg font-semibold text-white mb-4">Bestellstatus</h3>
          <div className="space-y-3">
            {statusBreakdown.map((s: any) => (
              <div key={s.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-600 text-sm capitalize">{s.status}</span>
                </div>
                <span className="text-white font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200">
          <h3 className="text-lg font-semibold text-white mb-4">Zahlungsmethoden</h3>
          <div className="space-y-3">
            {paymentMethods.map((pm: any) => (
              <div key={pm.method} className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">{pm.method || "Sonstige"}</span>
                <div className="text-right">
                  <span className="text-white font-medium">{pm.count}x</span>
                  <span className="text-gray-400 text-xs ml-2">{formatEuro(pm.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-gray-200">
        <h3 className="text-lg font-semibold text-white mb-4">Letzte Bestellungen</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-gray-400 text-xs uppercase">
              <th className="text-left py-2 px-3">#</th><th className="text-left py-2 px-3">Kunde</th>
              <th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Zahlung</th>
              <th className="text-right py-2 px-3">Betrag</th><th className="text-left py-2 px-3">Datum</th>
            </tr></thead>
            <tbody>{recentOrders.map((o: any) => (
              <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-3 text-gray-600">{o.orderNumber}</td>
                <td className="py-3 px-3"><span className="text-white">{o.billingFirstName} {o.billingLastName}</span><br /><span className="text-gray-400 text-xs">{o.billingEmail}</span></td>
                <td className="py-3 px-3"><Badge status={o.status} /></td>
                <td className="py-3 px-3 text-gray-500">{o.paymentMethodTitle || "-"}</td>
                <td className="py-3 px-3 text-right text-white font-medium">{formatEuro(o.total)}</td>
                <td className="py-3 px-3 text-gray-400">{formatDate(o.createdAt)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CMS LIST TAB (Pages) — with SWR + Pagination
// ═══════════════════════════════════════════════════════════
function CMSListTab({ type, token }: { type: "pages" | "posts"; token: string }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any | null>(undefined);
  const debouncedSearch = useDebounce(search, 300);

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (debouncedSearch) params.set("search", debouncedSearch);
  const swrKey = `${API}/${type}?${params}`;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, { revalidateOnFocus: false, keepPreviousData: true });

  const items = data?.[type] || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  async function handleDelete(id: string) {
    if (!confirm("Wirklich löschen?")) return;
    try {
      await fetch(`${API}/${type}?id=${id}`, { method: "DELETE", credentials: "include" });
      toast("Erfolgreich gelöscht");
      mutate();
    } catch { toast("Fehler beim Löschen", "error"); }
  }

  if (editing !== undefined) {
    return <ContentEditor item={editing} type={type} token={token} onSave={() => { setEditing(undefined); mutate(); }} onCancel={() => setEditing(undefined)} />;
  }

  return (
    <div className="space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        count={total}
        suffix={<button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Neu</button>}
      />

      {error ? <ErrorState onRetry={() => mutate()} /> : isLoading ? <SkeletonTable /> : items.length === 0 ? (
        <EmptyState icon={FileText} title={debouncedSearch ? "Keine Ergebnisse" : "Keine Einträge"} description={debouncedSearch ? `Keine Ergebnisse für "${debouncedSearch}"` : undefined} />
      ) : (
        <>
          <div className="space-y-2">
            {items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-300 transition-colors">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{item.title}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">/{item.slug}/</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge status={item.status} />
                  <button onClick={() => setEditing(item)} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} limit={20} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SEO TAB — with SWR + Pagination
// ═══════════════════════════════════════════════════════════
function SEOTab({ token }: { token: string }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (debouncedSearch) params.set("search", debouncedSearch);
  const swrKey = `${API}/seo?${params}`;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, { revalidateOnFocus: false, keepPreviousData: true });

  const records = data?.seo || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [canonical, setCanonical] = useState("");
  const [robots, setRobots] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDesc, setOgDesc] = useState("");
  const [ogImage, setOgImage] = useState("");

  function startEdit(r: any) {
    setEditing(r);
    setMetaTitle(r.metaTitle || "");
    setMetaDesc(r.metaDescription || "");
    setCanonical(r.canonicalUrl || "");
    setRobots(r.robots || "");
    setOgTitle(r.ogTitle || "");
    setOgDesc(r.ogDescription || "");
    setOgImage(r.ogImage || "");
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await fetch(`${API}/seo`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id: editing.id, metaTitle, metaDescription: metaDesc, canonicalUrl: canonical, robots, ogTitle, ogDescription: ogDesc, ogImage }) });
      toast("SEO erfolgreich aktualisiert");
      setEditing(null); mutate();
    } catch { toast("Fehler beim Speichern", "error"); } finally { setSaving(false); }
  }

  if (editing) {
    const pageTitle = editing.page?.title || editing.post?.title || "Unbekannt";
    const pageSlug = editing.page?.slug || editing.post?.slug || "";
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">SEO bearbeiten</h2>
            <p className="text-gray-400 text-sm">{pageTitle} — /{pageSlug}/</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><X className="w-4 h-4" /></button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-lg bg-primary text-white font-medium flex items-center gap-2"><Save className="w-4 h-4" />{saving ? "..." : "Speichern"}</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div><label className="block text-xs text-gray-400 mb-1">Meta Title <span className="text-gray-300">({metaTitle.length}/60)</span></label><input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Meta Description <span className="text-gray-300">({metaDesc.length}/160)</span></label><textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Canonical URL</label><input value={canonical} onChange={e => setCanonical(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-500 text-sm focus:border-primary focus:outline-none" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Robots</label><input value={robots} onChange={e => setRobots(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-500 text-sm focus:border-primary focus:outline-none" /></div>
          </div>
          <div className="space-y-4">
            <div><label className="block text-xs text-gray-400 mb-1">OG Title</label><input value={ogTitle} onChange={e => setOgTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">OG Description</label><textarea value={ogDesc} onChange={e => setOgDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" /></div>
            <ImageField label="OG Image" value={ogImage} onChange={setOgImage} token={token} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Google-Vorschau</p>
          <p className="text-blue-400 text-lg hover:underline cursor-pointer">{metaTitle || pageTitle}</p>
          <p className="text-green-500 text-sm">https://ikfzdigitalzulassung.de/{pageSlug}/</p>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{metaDesc || "Keine Beschreibung vorhanden..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} placeholder="Seiten oder Beiträge suchen..." count={total} />

      {error ? <ErrorState onRetry={() => mutate()} /> : isLoading ? <SkeletonTable /> : records.length === 0 ? (
        <EmptyState icon={Globe} title={debouncedSearch ? "Keine Ergebnisse" : "Keine SEO-Einträge"} />
      ) : (
        <>
          <div className="space-y-2">
            {records.map((r: any) => {
              const pageTitle = r.page?.title || r.post?.title || "—";
              const pageSlug = r.page?.slug || r.post?.slug || "";
              const type = r.page ? "Seite" : "Beitrag";
              const hasIssues = !r.metaTitle || !r.metaDescription || (r.metaTitle && r.metaTitle.length > 60) || (r.metaDescription && r.metaDescription.length > 160);
              return (
                <div key={r.id} onClick={() => startEdit(r)} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium truncate">{pageTitle}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">{type}</span>
                      {hasIssues && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">⚠ Issues</span>}
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">/{pageSlug}/ — {r.metaTitle ? `"${r.metaTitle.slice(0, 50)}..."` : "Kein Title"}</p>
                  </div>
                  <Pencil className="w-4 h-4 text-gray-300 ml-4" />
                </div>
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} limit={20} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ORDERS TAB — with SWR + Pagination (detail → /admin/orders/[id])
// ═══════════════════════════════════════════════════════════
function OrdersTab({ token }: { token: string }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (debouncedSearch) params.set("search", debouncedSearch);
  if (statusFilter) params.set("status", statusFilter);
  const swrKey = `${API}/orders?${params}`;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, { revalidateOnFocus: false, keepPreviousData: true });

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  async function deleteOrder(id: string, orderNumber: string) {
    if (!confirm(`Bestellung #${orderNumber} wirklich löschen?`)) return;
    try {
      const res = await fetch(`${API}/orders/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        toast("Bestellung gelöscht", "success");
        mutate();
      } else {
        const d = await res.json().catch(() => ({}));
        toast(d.error || "Fehler beim Löschen", "error");
      }
    } catch {
      toast("Fehler beim Löschen", "error");
    }
  }

  return (
    <div className="space-y-4">
      <SearchBar
        value={search}
        onChange={v => { setSearch(v); }}
        placeholder="Suche nach Name, Email, Nummer..."
        count={data?.total}
        suffix={
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); }} className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none">
            <option value="">Alle Status</option>
            {["completed", "processing", "on-hold", "pending", "cancelled", "refunded", "failed"].map(s => <option key={s} value={s}>{statusLabels[s] || s}</option>)}
          </select>
        }
      />

      {error ? <ErrorState onRetry={() => mutate()} /> : isLoading ? <SkeletonTable /> : (data?.orders || []).length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Keine Bestellungen" />
      ) : (
        <>
          <div className="space-y-2">
            {(data.orders || []).map((o: any) => (
              <a key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer block">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3"><span className="text-white font-medium">#{o.orderNumber}</span><Badge status={o.status} /></div>
                  <p className="text-gray-400 text-xs mt-1">{o.billingFirstName} {o.billingLastName} — {o.billingEmail}</p>
                </div>
                <div className="text-right ml-4 flex items-center gap-3">
                  <div>
                    <p className="text-white font-semibold">{formatEuro(o.total)}</p>
                    <p className="text-gray-400 text-xs">{o.paymentMethodTitle || "-"} | {formatDate(o.createdAt)}</p>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteOrder(o.id, o.orderNumber); }} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors" title="Löschen"><Trash2 className="w-4 h-4" /></button>
                </div>
              </a>
            ))}
          </div>
          <Pagination page={page} totalPages={data.totalPages || 1} total={data.total || 0} limit={20} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CUSTOMERS TAB — with SWR + Pagination
// ═══════════════════════════════════════════════════════════
function CustomersTab({ token }: { token: string }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const params = new URLSearchParams({ page: String(page), limit: "30" });
  if (debouncedSearch) params.set("search", debouncedSearch);
  const swrKey = `${API}/customers?${params}`;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, { revalidateOnFocus: false, keepPreviousData: true });

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} placeholder="Suche nach Name, Email, Firma..." count={data?.total} />

      {error ? <ErrorState onRetry={() => mutate()} /> : isLoading ? <SkeletonTable /> : (data?.customers || []).length === 0 ? (
        <EmptyState icon={Users} title="Keine Kunden" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 text-xs uppercase"><th className="text-left py-2 px-3">Kunde</th><th className="text-left py-2 px-3">E-Mail</th><th className="text-left py-2 px-3">Ort</th><th className="text-center py-2 px-3">Bestellungen</th><th className="text-right py-2 px-3">Umsatz</th></tr></thead>
              <tbody>
                {(data.customers || []).map((c: any) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3"><span className="text-white">{c.firstName} {c.lastName}</span>{c.company && <span className="text-gray-400 text-xs block">{c.company}</span>}</td>
                    <td className="py-3 px-3 text-gray-500">{c.email}</td>
                    <td className="py-3 px-3 text-gray-500">{[c.billingPostcode, c.billingCity].filter(Boolean).join(" ")}</td>
                    <td className="py-3 px-3 text-center text-gray-600">{c.orderCount}</td>
                    <td className="py-3 px-3 text-right text-white font-medium">{formatEuro(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={data.totalPages || 1} total={data.total || 0} limit={30} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAYMENTS TAB — with SWR + Pagination
// ═══════════════════════════════════════════════════════════
function PaymentsTab({ token }: { token: string }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ page: String(page), limit: "30" });
  if (statusFilter) params.set("status", statusFilter);
  const swrKey = `${API}/payments?${params}`;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, { revalidateOnFocus: false, keepPreviousData: true });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm"><option value="">Alle Status</option><option value="completed">Bezahlt</option><option value="pending">Ausstehend</option><option value="failed">Fehlgeschlagen</option><option value="refunded">Erstattet</option></select>
        <span className="text-gray-400 text-sm">{data?.total || 0} Zahlungen</span>
      </div>

      {error ? <ErrorState onRetry={() => mutate()} /> : isLoading ? <SkeletonTable /> : (data?.payments || []).length === 0 ? (
        <EmptyState icon={CreditCard} title="Keine Zahlungen" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 text-xs uppercase"><th className="text-left py-2 px-3">Bestellung</th><th className="text-left py-2 px-3">Kunde</th><th className="text-left py-2 px-3">Methode</th><th className="text-left py-2 px-3">Status</th><th className="text-right py-2 px-3">Betrag</th><th className="text-left py-2 px-3">Datum</th></tr></thead>
              <tbody>
                {(data.payments || []).map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-600">#{p.order?.orderNumber}</td>
                    <td className="py-3 px-3"><span className="text-white">{p.order?.billingFirstName} {p.order?.billingLastName}</span></td>
                    <td className="py-3 px-3 text-gray-500">{p.methodTitle || p.method}</td>
                    <td className="py-3 px-3"><Badge status={p.status} /></td>
                    <td className="py-3 px-3 text-right text-white font-medium">{formatEuro(p.amount)}</td>
                    <td className="py-3 px-3 text-gray-400">{formatDate(p.paidAt || p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={data.totalPages || 1} total={data.total || 0} limit={30} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INVOICES TAB — with SWR + Pagination + Search + Status Tabs + PDF Download + Detail View
// ═══════════════════════════════════════════════════════════
function InvoicesTab({ token }: { token: string }) {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
  if (search) params.set("search", search);
  const swrKey = `${API}/invoices?${params}`;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    dedupingInterval: 10000,
    errorRetryCount: 2,
  });

  // Detail fetch
  const { data: detailData, isLoading: detailLoading } = useSWR(
    selectedInvoice ? `${API}/invoices/${selectedInvoice.id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  const detail = detailData?.invoice;

  const statusTabs = [
    { key: "all", label: "Alle", count: data?.total },
    { key: "paid", label: "Bezahlt" },
    { key: "issued", label: "Ausstehend" },
    { key: "refunded", label: "Erstattet" },
    { key: "cancelled", label: "Storniert" },
  ];

  async function generateAll() {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/invoices/generate-all`, {
        method: "POST",
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok) {
        toast(result.message || `${result.created} Rechnungen erstellt`, "success");
        mutate();
      } else {
        toast(result.error || "Fehler", "error");
      }
    } catch {
      toast("Fehler beim Generieren", "error");
    } finally {
      setGenerating(false);
    }
  }

  function downloadPdf(inv: any) {
    window.open(`${API}/invoices/${inv.id}/pdf/`, "_blank");
  }

  function handleStatusChange(status: string) {
    setStatusFilter(status);
    setPage(1);
  }

  // ── Invoice Detail View ──
  if (selectedInvoice) {
    const inv = detail || selectedInvoice;
    const items: any[] = (() => { try { return JSON.parse(inv.items || "[]"); } catch { return []; } })();
    const total = inv.amount || 0;
    const taxAmount = parseFloat((total - total / 1.19).toFixed(2));
    const netAmount = parseFloat((total / 1.19).toFixed(2));

    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedInvoice(null)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Zurück zur Liste
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Rechnung {inv.invoiceNumber}</h2>
            <Badge status={inv.status} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => downloadPdf(inv)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary/80 transition-colors">
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        {detailLoading ? <SkeletonTable rows={4} /> : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Invoice Preview */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Header bar */}
              <div className="invoice-preview-header bg-dark-900 px-6 py-5" style={{ color: '#fff' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-70">RECHNUNG</p>
                    <p className="text-lg font-bold">{inv.invoiceNumber}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">iKFZ Digital Zulassung</p>
                    <p className="opacity-70">ikfzdigitalzulassung.de</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Info grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs uppercase text-gray-400 mb-2">Rechnungsadresse</p>
                    <p className="text-gray-900 font-medium">{inv.billingName || "-"}</p>
                    {inv.billingAddress && <p className="text-gray-600 text-sm">{inv.billingAddress}</p>}
                    <p className="text-gray-600 text-sm">{inv.billingEmail || inv.order?.billingEmail || "-"}</p>
                    {(detail?.order?.billingPhone) && <p className="text-gray-500 text-sm">Tel: {detail.order.billingPhone}</p>}
                  </div>
                  <div className="text-right">
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400">Rechnungsdatum</p>
                      <p className="text-gray-900 font-medium">{formatDate(inv.issuedAt)}</p>
                      <p className="text-gray-400 mt-2">Bestellnr.</p>
                      <p className="text-gray-900 font-medium">#{inv.order?.orderNumber || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Items table */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-xs uppercase">
                      <th className="text-left py-2 w-12">Pos.</th>
                      <th className="text-left py-2">Beschreibung</th>
                      <th className="text-center py-2 w-16">Menge</th>
                      <th className="text-right py-2 w-24">Preis</th>
                      <th className="text-right py-2 w-24">Gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 text-gray-500">{i + 1}</td>
                        <td className="py-3 text-gray-900">{item.name}</td>
                        <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                        <td className="py-3 text-right text-gray-600">{formatEuro(item.price)}</td>
                        <td className="py-3 text-right text-gray-900 font-medium">{formatEuro(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Nettobetrag</span>
                      <span>{formatEuro(netAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>USt. 19%</span>
                      <span>{formatEuro(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-900 font-bold text-base pt-2 border-t border-gray-200">
                      <span>Gesamtbetrag</span>
                      <span className="text-primary font-bold">{formatEuro(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment status banner */}
                {inv.status === "paid" && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold text-sm" style={{ color: '#fff' }}>✓</div>
                    <div className="text-sm">
                      <p className="text-green-800 font-medium">Bezahlt{detail?.order?.paymentMethodTitle ? ` via ${detail.order.paymentMethodTitle}` : ""}</p>
                      {(detail?.order?.transactionId) && <p className="text-green-600 text-xs">Transaktions-ID: {detail.order.transactionId}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar actions */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Aktionen</h3>
                <button onClick={() => downloadPdf(inv)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-colors">
                  <Download className="w-4 h-4" /> PDF herunterladen
                </button>
                {inv.orderId && (
                  <button onClick={async () => {
                    try {
                      const res = await fetch(`${API}/orders/${inv.orderId}/resend-invoice`, { method: "POST", credentials: "include" });
                      const r = await res.json();
                      if (res.ok) toast("Rechnung per E-Mail gesendet", "success");
                      else toast(r.error || "Fehler", "error");
                    } catch { toast("Fehler beim Senden", "error"); }
                  }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-colors">
                    <Mail className="w-4 h-4" /> Rechnung senden
                  </button>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Status</span><Badge status={inv.status} /></div>
                  <div className="flex justify-between"><span className="text-gray-400">Betrag</span><span className="text-gray-900 font-medium">{formatEuro(total)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Erstellt</span><span className="text-gray-600">{formatDate(inv.createdAt)}</span></div>
                  {inv.paidAt && <div className="flex justify-between"><span className="text-gray-400">Bezahlt am</span><span className="text-gray-600">{formatDate(inv.paidAt)}</span></div>}
                  {detail?.order?.productName && <div className="flex justify-between"><span className="text-gray-400">Produkt</span><span className="text-gray-600">{detail.order.productName}</span></div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── List View ──
  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {statusTabs.map(tab => (
          <button key={tab.key} onClick={() => handleStatusChange(tab.key)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === tab.key ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Actions bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input value={searchInput} onChange={e => { setSearchInput(e.target.value); setPage(1); }} placeholder="Rechnungsnr., Kunde oder E-Mail..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm">
          <option value={20}>20 pro Seite</option>
          <option value={50}>50 pro Seite</option>
          <option value={100}>100 pro Seite</option>
          <option value={200}>200 pro Seite</option>
        </select>
        <button onClick={generateAll} disabled={generating} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50">
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Alle generieren
        </button>
        <span className="text-gray-400 text-sm">{data?.total || 0} Rechnungen</span>
      </div>

      {error ? <ErrorState onRetry={() => mutate()} /> : isLoading ? <SkeletonTable /> : (data?.invoices || []).length === 0 ? (
        <EmptyState icon={Receipt} title="Keine Rechnungen" description={search ? "Keine Ergebnisse für diese Suche" : undefined} />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase">
                  <th className="text-left py-2 px-3" style={{ width: "14%" }}>Rechnungsnr.</th>
                  <th className="text-left py-2 px-3" style={{ width: "12%" }}>Bestellung</th>
                  <th className="text-left py-2 px-3" style={{ width: "22%" }}>Kunde</th>
                  <th className="text-left py-2 px-3" style={{ width: "14%" }}>Datum</th>
                  <th className="text-right py-2 px-3" style={{ width: "12%" }}>Betrag</th>
                  <th className="text-left py-2 px-3" style={{ width: "14%" }}>Status</th>
                  <th className="text-center py-2 px-3" style={{ width: "12%" }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {(data.invoices || []).map((inv: any) => (
                  <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3">
                      <button onClick={() => setSelectedInvoice(inv)} className="text-primary font-medium hover:underline text-left">{inv.invoiceNumber}</button>
                    </td>
                    <td className="py-3 px-3 text-gray-500">#{inv.order?.orderNumber || "-"}</td>
                    <td className="py-3 px-3">
                      <div className="text-gray-900">{inv.billingName || "-"}</div>
                      <div className="text-gray-400 text-xs">{inv.billingEmail || "-"}</div>
                    </td>
                    <td className="py-3 px-3 text-gray-500">{formatDate(inv.issuedAt)}</td>
                    <td className="py-3 px-3 text-right text-gray-900 font-medium">{formatEuro(inv.amount)}</td>
                    <td className="py-3 px-3"><Badge status={inv.status} /></td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedInvoice(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors" title="Ansehen"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => downloadPdf(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors" title="PDF"><Download className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {(data.invoices || []).map((inv: any) => (
              <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <button onClick={() => setSelectedInvoice(inv)} className="text-primary font-medium text-sm hover:underline">{inv.invoiceNumber}</button>
                  <Badge status={inv.status} />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-900">{inv.billingName || "-"}</p>
                  <p className="text-gray-400 text-xs">{inv.billingEmail || "-"}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-gray-400">{formatDate(inv.issuedAt)}</span>
                    <span className="text-gray-900 font-bold">{formatEuro(inv.amount)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <button onClick={() => setSelectedInvoice(inv)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-gray-700 text-sm hover:bg-gray-100 transition-colors">
                    <Eye className="w-3.5 h-3.5" /> Ansehen
                  </button>
                  <button onClick={() => downloadPdf(inv)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={data.totalPages || 1} total={data.total || 0} limit={limit} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAYMENT GATEWAYS TAB (DB-backed via PaymentGateway table)
// ═══════════════════════════════════════════════════════════
function GatewaysTab({ token }: { token: string }) {
  const { toast } = useToast();
  const { data, isLoading, mutate } = useSWR(`${API}/gateways`, fetcher, { revalidateOnFocus: false });
  const [saving, setSaving] = useState<string | null>(null);

  const GATEWAY_ICONS: Record<string, LucideIcon> = {
    paypal: Wallet,
    mollie_creditcard: CreditCard,
    mollie_applepay: Apple,
    sepa: Landmark,
    mollie_klarna: ShoppingCart,
  };

  const gateways: any[] = data?.gateways || [];
  const paymentStats: any[] = data?.paymentStats || [];
  const summary = data?.summary || {};

  async function toggleGateway(gw: any) {
    setSaving(gw.id);
    try {
      const res = await fetch(`${API}/gateways`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: gw.id, isEnabled: !gw.isEnabled }),
      });
      if (res.ok) {
        mutate();
        toast(`${gw.name} ${!gw.isEnabled ? "aktiviert" : "deaktiviert"}`);
      }
    } catch {
      toast("Fehler beim Aktualisieren");
    } finally {
      setSaving(null);
    }
  }

  async function updateFee(gw: any, fee: number) {
    setSaving(gw.id);
    try {
      const res = await fetch(`${API}/gateways`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: gw.id, fee }),
      });
      if (res.ok) {
        mutate();
        toast("Gebühr aktualisiert");
      }
    } catch {
      toast("Fehler beim Speichern");
    } finally {
      setSaving(null);
    }
  }

  async function updateMode(gw: any, mode: string) {
    setSaving(gw.id);
    try {
      const res = await fetch(`${API}/gateways`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: gw.id, mode }),
      });
      if (res.ok) {
        mutate();
        toast(`${gw.name}: ${mode === "live" ? "Live" : "Test"}-Modus`);
      }
    } catch {
      toast("Fehler beim Speichern");
    } finally {
      setSaving(null);
    }
  }

  if (isLoading) return <SkeletonTable rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Zahlungs-Gateways</h2>
        <p className="text-gray-400 text-sm">Benutzerdefinierte Zahlungskonfiguration — Änderungen werden sofort auf der Checkout-Seite angezeigt</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200">
          <p className="text-gray-400 text-xs mb-1">Gesamtumsatz</p>
          <p className="text-white font-semibold text-lg">{formatEuro(summary.totalRevenue || 0)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-200">
          <p className="text-gray-400 text-xs mb-1">Transaktionen</p>
          <p className="text-white font-semibold text-lg">{summary.totalTransactions || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-200">
          <p className="text-gray-400 text-xs mb-1">Aktive Gateways</p>
          <p className="text-green-400 font-semibold text-lg">{summary.activeGateways || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-200">
          <p className="text-gray-400 text-xs mb-1">Inaktive Gateways</p>
          <p className="text-gray-500 font-semibold text-lg">{summary.inactiveGateways || 0}</p>
        </div>
      </div>

      {/* Revenue per gateway */}
      {paymentStats.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-gray-200">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Umsatz je Gateway</h3>
          <div className="space-y-3">
            {paymentStats.map((ps: any) => {
              const maxCount = Math.max(...paymentStats.map((p: any) => p._count));
              return (
                <div key={ps.gateway || "unknown"}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600 text-sm">{ps.gateway || "Sonstige"}</span>
                    <span className="text-white text-sm font-medium">{ps._count}x — {formatEuro(ps._sum?.amount || 0)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-primary/60" style={{ width: `${(ps._count / (maxCount || 1)) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gateway cards */}
      <div className="space-y-3">
        {gateways.map((gw: any) => (
          <div key={gw.id} className={`p-5 rounded-2xl border transition-colors ${gw.isEnabled ? "bg-white border-gray-200" : "bg-gray-100 border-gray-100 opacity-60"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {(() => { const Icon = GATEWAY_ICONS[gw.gatewayId] || CreditCard; return <Icon className="w-6 h-6 text-gray-500" />; })()}
                <div>
                  <h3 className="text-white font-medium">{gw.name}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{gw.description}</p>
                  <p className="text-gray-300 text-[10px] font-mono mt-1">{gw.gatewayId}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Fee input */}
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 text-xs">Gebühr:</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={gw.fee}
                    className="w-20 px-2 py-1 text-sm rounded-lg bg-gray-100 border border-gray-200 text-white focus:border-primary/50 focus:outline-none"
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val !== gw.fee) updateFee(gw, val);
                    }}
                    disabled={saving === gw.id}
                  />
                  <span className="text-gray-400 text-xs">€</span>
                </div>

                {/* Mode toggle */}
                <button
                  onClick={() => updateMode(gw, gw.mode === "live" ? "test" : "live")}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                    gw.mode === "live"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                  disabled={saving === gw.id}
                >
                  {gw.mode === "live" ? "Live" : "Test"}
                </button>

                {/* Enable/disable toggle */}
                <button
                  onClick={() => toggleGateway(gw)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${gw.isEnabled ? "bg-green-500" : "bg-gray-200"}`}
                  disabled={saving === gw.id}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${gw.isEnabled ? "left-6" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
        <p className="text-blue-400 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Änderungen hier beeinflussen sofort die aktive Checkout-Seite. Deaktivierte Gateways werden den Besuchern nicht angezeigt.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COUPONS TAB
// ═══════════════════════════════════════════════════════════
function CouponsTab({ token }: { token: string }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<any>(undefined);
  const [creating, setCreating] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (debouncedSearch) params.set("search", debouncedSearch);
  if (filter !== "all") params.set("status", filter);
  const { data, error, isLoading, mutate } = useSWR(`${API}/coupons?${params}`, fetcher, { revalidateOnFocus: false, keepPreviousData: true });

  useEffect(() => { setPage(1); }, [debouncedSearch, filter]);

  if (creating || editing !== undefined) {
    return <CouponEditor item={editing || null} onSave={() => { setEditing(undefined); setCreating(false); mutate(); }} onCancel={() => { setEditing(undefined); setCreating(false); }} toast={toast} />;
  }

  function couponStatus(c: any): { label: string; color: string } {
    if (!c.isActive) return { label: "Inaktiv", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" };
    if (c.endDate && new Date(c.endDate) < new Date()) return { label: "Abgelaufen", color: "bg-red-500/10 text-red-400 border-red-500/20" };
    if (c.startDate && new Date(c.startDate) > new Date()) return { label: "Geplant", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
    return { label: "Aktiv", color: "bg-green-500/10 text-green-400 border-green-500/20" };
  }

  async function handleDelete(id: string) {
    if (!confirm("Diesen Gutschein wirklich löschen?")) return;
    const res = await fetch(`${API}/coupons/${id}/`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast("Gutschein gelöscht"); mutate(); } else { toast("Fehler beim Löschen", "error"); }
  }

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} placeholder="Suche nach Code oder Beschreibung..." count={data?.pagination?.total}
        suffix={<button onClick={() => setCreating(true)} className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />Neu</button>}
      />
      <div className="flex gap-2">
        {[["all","Alle"],["active","Aktiv"],["inactive","Inaktiv"],["expired","Abgelaufen"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===v?"bg-primary text-white":"bg-gray-100 text-gray-400 hover:text-gray-600"}`}>{l}</button>
        ))}
      </div>

      {error ? <ErrorState onRetry={() => mutate()} /> : isLoading ? <SkeletonTable /> : (data?.coupons || []).length === 0 ? (
        <EmptyState icon={Tag} title="Keine Gutscheine" description="Erstellen Sie Ihren ersten Gutscheincode" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 text-xs uppercase"><th className="text-left py-2 px-3">Code</th><th className="text-left py-2 px-3">Rabatt</th><th className="text-center py-2 px-3">Nutzung</th><th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Gültig</th><th className="text-right py-2 px-3">Aktionen</th></tr></thead>
              <tbody>
                {(data.coupons || []).map((c: any) => {
                  const st = couponStatus(c);
                  return (
                    <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3"><span className="text-white font-mono font-bold">{c.code}</span>{c.description && <span className="text-gray-400 text-xs block mt-0.5">{c.description}</span>}</td>
                      <td className="py-3 px-3 text-gray-600">{c.discountType === "percentage" ? `${c.discountValue}%` : formatEuro(c.discountValue)}</td>
                      <td className="py-3 px-3 text-center text-gray-500">{c._count?.usages ?? c.usageCount ?? 0}{c.maxUsageTotal > 0 ? `/${c.maxUsageTotal}` : ""}</td>
                      <td className="py-3 px-3"><span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${st.color}`}>{st.label}</span></td>
                      <td className="py-3 px-3 text-gray-500 text-xs">{c.startDate ? formatDate(c.startDate) : "–"} – {c.endDate ? formatDate(c.endDate) : "∞"}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditing(c)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={data.pagination?.pages || 1} total={data.pagination?.total || 0} limit={20} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function CouponEditor({ item, onSave, onCancel, toast }: { item: any; onSave: () => void; onCancel: () => void; toast: (m: string, t?: "success" | "error" | "info") => void }) {
  const [code, setCode] = useState(item?.code || "");
  const [description, setDescription] = useState(item?.description || "");
  const [discountType, setDiscountType] = useState(item?.discountType || "fixed");
  const [discountValue, setDiscountValue] = useState(String(item?.discountValue || ""));
  const [minOrderValue, setMinOrderValue] = useState(String(item?.minOrderValue || "0"));
  const [maxUsageTotal, setMaxUsageTotal] = useState(String(item?.maxUsageTotal || "0"));
  const [maxUsagePerUser, setMaxUsagePerUser] = useState(String(item?.maxUsagePerUser || "1"));
  const [isActive, setIsActive] = useState(item?.isActive !== false);
  const [showBanner, setShowBanner] = useState(item?.showBanner === true);
  const [bannerText, setBannerText] = useState(item?.bannerText || "");
  const [startDate, setStartDate] = useState(item?.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : "");
  const [endDate, setEndDate] = useState(item?.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const body: any = { code, description, discountType, discountValue: parseFloat(discountValue), minOrderValue: parseFloat(minOrderValue), maxUsageTotal: parseInt(maxUsageTotal), maxUsagePerUser: parseInt(maxUsagePerUser), isActive, showBanner, bannerText, startDate: startDate || null, endDate: endDate || null };
    try {
      const url = item?.id ? `${API}/coupons/${item.id}/` : `${API}/coupons/`;
      const res = await fetch(url, { method: item?.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Fehler"); }
      toast(item?.id ? "Gutschein aktualisiert" : "Gutschein erstellt");
      onSave();
    } catch (err: any) { toast(err.message, "error"); } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{item?.id ? "Gutschein bearbeiten" : "Neuer Gutschein"}</h2>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><X className="w-4 h-4" /></button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"><Save className="w-4 h-4" />{saving ? "..." : "Speichern"}</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-2xl bg-white border border-gray-200">
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Code</label><input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="z.B. SOMMER20 (leer = auto)" className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 font-mono focus:border-primary focus:outline-none" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Beschreibung</label><input value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary focus:outline-none" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Rabatt-Typ</label><select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary focus:outline-none"><option value="fixed">Fester Betrag (€)</option><option value="percentage">Prozentsatz (%)</option></select></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Rabattwert</label><input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} min="0" step="0.01" className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary focus:outline-none" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Mindestbestellwert (€)</label><input type="number" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} min="0" step="0.01" className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary focus:outline-none" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Max. Nutzung gesamt (0 = unbegrenzt)</label><input type="number" value={maxUsageTotal} onChange={e => setMaxUsageTotal(e.target.value)} min="0" className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary focus:outline-none" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Max. pro Nutzer</label><input type="number" value={maxUsagePerUser} onChange={e => setMaxUsagePerUser(e.target.value)} min="1" className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary focus:outline-none" /></div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-primary" /><span className="text-sm text-gray-600">Aktiv</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={showBanner} onChange={e => setShowBanner(e.target.checked)} className="accent-primary" /><span className="text-sm text-gray-600">Banner anzeigen</span></label>
        </div>
        {showBanner && <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Banner-Text</label><input value={bannerText} onChange={e => setBannerText(e.target.value)} placeholder="z.B. 20% Rabatt mit Code SOMMER20!" className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary focus:outline-none" /></div>}
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Startdatum</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary focus:outline-none" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Enddatum</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-primary focus:outline-none" /></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EMAIL CAMPAIGNS TAB
// ═══════════════════════════════════════════════════════════
function EmailCampaignsTab({ token }: { token: string }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<any>(undefined);
  const [creating, setCreating] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (debouncedSearch) params.set("search", debouncedSearch);
  if (filter !== "all") params.set("status", filter);
  const { data, error, isLoading, mutate } = useSWR(`${API}/email-campaigns?${params}`, fetcher, { revalidateOnFocus: false, keepPreviousData: true });

  useEffect(() => { setPage(1); }, [debouncedSearch, filter]);

  if (creating || editing !== undefined) {
    return <CampaignEditor item={editing || null} onSave={() => { setEditing(undefined); setCreating(false); mutate(); }} onCancel={() => { setEditing(undefined); setCreating(false); }} toast={toast} />;
  }

  const campaignStatusColors: Record<string, string> = {
    draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    scheduled: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    sending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    sent: "bg-green-500/10 text-green-400 border-green-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const campaignStatusLabels: Record<string, string> = {
    draft: "Entwurf", scheduled: "Geplant", sending: "Wird gesendet", sent: "Gesendet", failed: "Fehlgeschlagen",
  };

  async function handleDelete(id: string) {
    if (!confirm("Diese Kampagne wirklich löschen?")) return;
    const res = await fetch(`${API}/email-campaigns/${id}/`, { method: "DELETE", credentials: "include" });
    if (res.ok) { toast("Kampagne gelöscht"); mutate(); } else { const d = await res.json().catch(() => ({})); toast(d.error || "Fehler beim Löschen", "error"); }
  }

  async function handleDuplicate(id: string) {
    const res = await fetch(`${API}/email-campaigns/${id}/duplicate/`, { method: "POST", credentials: "include" });
    if (res.ok) { toast("Kampagne dupliziert"); mutate(); } else { toast("Fehler beim Duplizieren", "error"); }
  }

  async function handleSend(id: string) {
    if (!confirm("Kampagne jetzt an alle Empfänger senden?")) return;
    const res = await fetch(`${API}/email-campaigns/${id}/send/`, { method: "POST", credentials: "include" });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { toast(d.message || "Kampagne wird gesendet"); mutate(); } else { toast(d.error || "Fehler beim Senden", "error"); }
  }

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} placeholder="Suche nach Name oder Betreff..." count={data?.pagination?.total}
        suffix={<button onClick={() => setCreating(true)} className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />Neue Kampagne</button>}
      />
      <div className="flex gap-2">
        {[["all","Alle"],["draft","Entwurf"],["scheduled","Geplant"],["sent","Gesendet"],["failed","Fehlgeschlagen"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===v?"bg-primary text-white":"bg-gray-100 text-gray-400 hover:text-gray-600"}`}>{l}</button>
        ))}
      </div>

      {error ? <ErrorState onRetry={() => mutate()} /> : isLoading ? <SkeletonTable /> : (data?.campaigns || []).length === 0 ? (
        <EmptyState icon={Mail} title="Keine Kampagnen" description="Erstellen Sie Ihre erste E-Mail-Kampagne" />
      ) : (
        <>
          <div className="space-y-2">
            {(data.campaigns || []).map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Mail className="w-5 h-5 text-primary/60" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-medium truncate">{c.name}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${campaignStatusColors[c.status] || campaignStatusColors.draft}`}>{campaignStatusLabels[c.status] || c.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs truncate">{c.subject || "Kein Betreff"}</p>
                  {c.status === "sent" && <p className="text-gray-400 text-xs mt-0.5">✉ {c.sentCount}/{c.totalRecipients} gesendet{c.failedCount > 0 ? ` · ${c.failedCount} fehlgeschlagen` : ""}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {(c.status === "draft" || c.status === "scheduled") && (
                    <>
                      <button onClick={() => setEditing(c)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-white transition-colors" title="Bearbeiten"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleSend(c.id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors" title="Senden"><Send className="w-3.5 h-3.5" /></button>
                    </>
                  )}
                  <button onClick={() => handleDuplicate(c.id)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-white transition-colors" title="Duplizieren"><Copy className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors" title="Löschen"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={data.pagination?.pages || 1} total={data.pagination?.total || 0} limit={20} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function CampaignEditor({ item, onSave, onCancel, toast }: { item: any; onSave: () => void; onCancel: () => void; toast: (m: string, t?: "success" | "error" | "info") => void }) {
  const [name, setName] = useState(item?.name || "");
  const [subject, setSubject] = useState(item?.subject || "");
  const [heading, setHeading] = useState(item?.heading || "");
  const [content, setContent] = useState(item?.content || "");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || "");
  const [ctaText, setCtaText] = useState(item?.ctaText || "");
  const [ctaUrl, setCtaUrl] = useState(item?.ctaUrl || "");
  const [targetMode, setTargetMode] = useState(item?.targetMode || "all");
  const [targetEmails, setTargetEmails] = useState(item?.targetEmails || "");
  const [testEmail, setTestEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);

  useEffect(() => {
    const body = { targetMode, targetEmails, targetSegment: "" };
    fetch(`${API}/email-campaigns/count-recipients/`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) })
      .then(r => r.json()).then(d => setRecipientCount(d.count ?? null)).catch(() => {});
  }, [targetMode, targetEmails]);

  async function handleSave() {
    setSaving(true);
    const body: any = { name, subject, heading, content, imageUrl, ctaText, ctaUrl, targetMode, targetEmails };
    try {
      const url = item?.id ? `${API}/email-campaigns/${item.id}/` : `${API}/email-campaigns/`;
      const res = await fetch(url, { method: item?.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Fehler"); }
      toast(item?.id ? "Kampagne aktualisiert" : "Kampagne erstellt");
      onSave();
    } catch (err: any) { toast(err.message, "error"); } finally { setSaving(false); }
  }

  async function handleTest() {
    if (!testEmail) return;
    setTesting(true);
    try {
      const id = item?.id;
      if (!id) { toast("Speichern Sie zuerst die Kampagne", "error"); return; }
      const res = await fetch(`${API}/email-campaigns/${id}/test/`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email: testEmail }) });
      const d = await res.json();
      if (res.ok) { toast(d.message || "Test-E-Mail gesendet"); } else { toast(d.error || "Fehler", "error"); }
    } catch { toast("Fehler beim Senden", "error"); } finally { setTesting(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{item?.id ? "Kampagne bearbeiten" : "Neue Kampagne"}</h2>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><X className="w-4 h-4" /></button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"><Save className="w-4 h-4" />{saving ? "..." : "Speichern"}</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-2xl bg-white border border-gray-200">
        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Kampagnen-Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="z.B. Frühlings-Newsletter" className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" /></div>
        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Betreff *</label><input value={subject} onChange={e => setSubject(e.target.value)} placeholder="E-Mail Betreffzeile" className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" /></div>
        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Überschrift</label><input value={heading} onChange={e => setHeading(e.target.value)} placeholder="Überschrift im E-Mail-Body" className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" /></div>
        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Inhalt *</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={8} placeholder="<p>Ihr E-Mail-Inhalt...</p>" className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm font-mono focus:border-primary focus:outline-none" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Bild-URL</label><input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">CTA Text</label><input value={ctaText} onChange={e => setCtaText(e.target.value)} placeholder="Jetzt bestellen" className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">CTA URL</label><input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" /></div>
        <div><label className="block text-xs font-medium text-gray-500 mb-1">Empfänger</label><select value={targetMode} onChange={e => setTargetMode(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none"><option value="all">Alle Abonnenten</option><option value="specific">Bestimmte E-Mails</option></select>{recipientCount !== null && <p className="text-xs text-gray-400 mt-1">{recipientCount} Empfänger</p>}</div>
        {targetMode === "specific" && <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">E-Mail-Adressen (kommagetrennt)</label><textarea value={targetEmails} onChange={e => setTargetEmails(e.target.value)} rows={3} placeholder="email1@test.de, email2@test.de" className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none" /></div>}
      </div>
      {item?.id && (
        <div className="p-4 rounded-2xl bg-white border border-gray-200">
          <label className="block text-xs font-medium text-gray-500 mb-2">Test-E-Mail senden</label>
          <div className="flex gap-2">
            <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@email.de" className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white focus:border-primary focus:outline-none" />
            <button onClick={handleTest} disabled={testing || !testEmail} className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 disabled:opacity-50 transition-colors flex items-center gap-2"><Send className="w-4 h-4" />{testing ? "..." : "Test senden"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SETTINGS TAB
// ═══════════════════════════════════════════════════════════
function SettingsTab({ token }: { token: string }) {
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const { data, error, isLoading, mutate } = useSWR(`${API}/settings`, fetcher, { revalidateOnFocus: false });

  const settings = data?.settings || [];

  const grouped: Record<string, any[]> = settings.reduce((acc: Record<string, any[]>, s: any) => {
    const prefix = s.key.includes("_") ? s.key.split("_")[0] : "general";
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(s);
    return acc;
  }, {} as Record<string, any[]>);

  const groupLabels: Record<string, string> = {
    site: "🌐 Website",
    payment: "💳 Zahlung",
    gateway: "🔌 Gateways",
    seo: "🔍 SEO",
    email: "📧 E-Mail",
    general: "⚙️ Allgemein",
    wp: "📦 WordPress",
  };

  async function updateSetting(key: string, value: string) {
    await fetch(`${API}/settings`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ key, value }) });
  }

  async function addSetting() {
    if (!newKey.trim()) return;
    setSaving(true);
    await fetch(`${API}/settings`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ key: newKey.trim(), value: newValue }) });
    setNewKey(""); setNewValue("");
    mutate();
    setSaving(false);
  }

  async function deleteSetting(key: string) {
    if (!confirm(`"${key}" löschen?`)) return;
    await fetch(`${API}/settings?key=${encodeURIComponent(key)}`, { method: "DELETE", credentials: "include" });
    mutate();
  }

  if (error) return <ErrorState onRetry={() => mutate()} />;
  if (isLoading) return <SkeletonTable rows={6} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Einstellungen</h2>
        <p className="text-gray-400 text-sm">{settings.length} Einstellungen gespeichert</p>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-gray-200">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Neue Einstellung</h3>
        <div className="flex gap-3">
          <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Schlüssel (z.B. site_name)" className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none" />
          <input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Wert" className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none" />
          <button onClick={addSetting} disabled={saving || !newKey.trim()} className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm disabled:opacity-40 flex items-center gap-2"><Plus className="w-4 h-4" /> Hinzufügen</button>
        </div>
      </div>

      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([group, items]) => (
        <div key={group} className="p-5 rounded-2xl bg-white border border-gray-200">
          <h3 className="text-white font-semibold mb-4">{groupLabels[group] || `📁 ${group}`}</h3>
          <div className="space-y-3">
            {items.sort((a: any, b: any) => a.key.localeCompare(b.key)).map((s: any) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-gray-500 text-xs font-mono min-w-[200px] shrink-0">{s.key}</span>
                <input
                  defaultValue={s.value}
                  onBlur={e => { if (e.target.value !== s.value) updateSetting(s.key, e.target.value); }}
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none"
                />
                <button onClick={() => deleteSetting(s.key)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BLOG — Types
// ═══════════════════════════════════════════════════════════
interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: string;
  author: string | null;
  featuredImage: string | null;
  featuredImageId: string | null;
  category: string | null;
  tags: string | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
}

// ═══════════════════════════════════════════════════════════
// BLOG TAB — Full Blog Management with SWR + Pagination
// ═══════════════════════════════════════════════════════════
function BlogTab({ token }: { token: string }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<BlogPostData | null | undefined>(undefined);
  const debouncedSearch = useDebounce(search, 300);

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (debouncedSearch) params.set("search", debouncedSearch);
  const swrKey = `${API}/blog?${params}`;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher, { revalidateOnFocus: false, keepPreviousData: true });

  const posts: BlogPostData[] = data?.posts || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.pages || 1;

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: total, publish: 0, draft: 0, scheduled: 0 };
    if (statusFilter === "all") {
      posts.forEach(p => {
        if (p.status === "publish") counts.publish++;
        else if (p.status === "draft") counts.draft++;
        else if (p.status === "scheduled") counts.scheduled++;
      });
    }
    return counts;
  }, [posts, total, statusFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Diesen Beitrag wirklich löschen?")) return;
    try {
      await fetch(`${API}/blog/${id}`, { method: "DELETE", credentials: "include" });
      toast("Beitrag gelöscht");
      mutate();
    } catch { toast("Fehler beim Löschen", "error"); }
  }

  if (editing !== undefined) {
    return <BlogEditor post={editing} token={token} onSave={() => { setEditing(undefined); mutate(); }} onCancel={() => setEditing(undefined)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Blog-Beiträge</h2>
          <p className="text-gray-400 text-sm mt-1">{total} Beiträge insgesamt</p>
        </div>
        <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Neuer Beitrag
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Beiträge suchen..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="flex gap-1.5">
          {(["all", "publish", "draft", "scheduled"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary/10 text-primary border border-primary/20" : "bg-white text-gray-400 border border-gray-200 hover:text-white"}`}>
              {s === "all" ? "Alle" : s === "publish" ? "Veröffentlicht" : s === "draft" ? "Entwurf" : "Geplant"}
            </button>
          ))}
        </div>
      </div>

      {error ? <ErrorState onRetry={() => mutate()} /> : isLoading ? <SkeletonTable /> : posts.length === 0 ? (
        <EmptyState icon={BookOpen} title={debouncedSearch ? "Keine Ergebnisse" : "Keine Beiträge"} description={debouncedSearch ? `Keine Ergebnisse für "${debouncedSearch}"` : undefined} />
      ) : (
        <>
          <div className="space-y-2">
            {posts.map(post => (
              <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-300 transition-colors group">
                {post.featuredImage ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{post.title}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-gray-400 text-xs">/{post.slug}/</span>
                    {post.publishedAt && <span className="text-gray-400 text-xs">{formatDate(post.publishedAt)}</span>}
                    {post.status === "scheduled" && post.scheduledAt && (
                      <span className="text-yellow-400/70 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Geplant: {new Date(post.scheduledAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })} {new Date(post.scheduledAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                    {post.category && <span className="text-primary/70 text-xs">{post.category}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={post.status} />
                  <a href={`/insiderwissen/${post.slug}/`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-white transition-colors"><Eye className="w-4 h-4" /></a>
                  <button onClick={async () => {
                    try {
                      const res = await fetch(`${API}/blog/${post.id}`, { credentials: 'include' });
                      if (res.ok) { const full = await res.json(); setEditing(full); }
                      else { setEditing(post); }
                    } catch { setEditing(post); }
                  }} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} limit={20} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BLOG EDITOR — Create/Edit with Tiptap, Scheduling & SEO
// ═══════════════════════════════════════════════════════════
function BlogEditor({
  post,
  token,
  onSave,
  onCancel,
}: {
  post: BlogPostData | null;
  token: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isNew = !post?.id;
  const { toast } = useToast();

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [category, setCategory] = useState(post?.category || "");
  const [tags, setTags] = useState(post?.tags || "");
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "");
  const [useRichEditor, setUseRichEditor] = useState(true);

  const [publishMode, setPublishMode] = useState<"draft" | "publish" | "schedule">(
    post?.status === "scheduled" ? "schedule" : post?.status === "publish" ? "publish" : "draft"
  );
  const [scheduleDate, setScheduleDate] = useState(
    post?.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ""
  );

  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "");
  const [metaDesc, setMetaDesc] = useState(post?.metaDescription || "");
  const [focusKeyword, setFocusKeyword] = useState(post?.focusKeyword || "");
  const [canonical, setCanonical] = useState(post?.canonical || "");
  const [ogTitle, setOgTitle] = useState(post?.ogTitle || "");
  const [ogDesc, setOgDesc] = useState(post?.ogDescription || "");

  const [slugManual, setSlugManual] = useState(!!post?.slug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(t: string) {
    return t
      .toLowerCase()
      .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(t: string) {
    setTitle(t);
    if (!slugManual) setSlug(generateSlug(t));
  }

  function handleSlugChange(s: string) {
    setSlugManual(true);
    setSlug(s.replace(/[^a-z0-9-]/g, ""));
  }

  async function handleSave() {
    if (!title.trim()) { setError("Titel ist erforderlich"); return; }
    const finalSlug = slug.trim() || generateSlug(title);
    if (!finalSlug) { setError("Slug ist erforderlich"); return; }
    if (!slug) setSlug(finalSlug);
    if (publishMode === "schedule" && !scheduleDate) { setError("Bitte Datum und Uhrzeit für die geplante Veröffentlichung angeben"); return; }

    setSaving(true); setError("");

    const status = publishMode === "publish" ? "publish" : publishMode === "schedule" ? "scheduled" : "draft";
    const body: Record<string, unknown> = {
      title, slug: finalSlug, content, excerpt, status,
      category: category || '',
      tags: tags || '',
      featuredImage: featuredImage || '',
      metaTitle: metaTitle || '',
      metaDescription: metaDesc || '',
      focusKeyword: focusKeyword || '',
      canonical: canonical || '',
      ogTitle: ogTitle || '',
      ogDescription: ogDesc || '',
    };

    if (status === "scheduled") body.scheduledAt = scheduleDate;
    if (post?.id) body.id = post.id;

    try {
      const url = post?.id ? `${API}/blog/${post.id}` : `${API}/blog`;
      const res = await fetch(url, {
        method: post?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Fehler beim Speichern");
      toast("Beitrag erfolgreich gespeichert");
      setTimeout(() => onSave(), 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{isNew ? "Neuer Beitrag" : "Beitrag bearbeiten"}</h2>
          {!isNew && <p className="text-gray-400 text-sm mt-0.5">/{post?.slug}/</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"><X className="w-4 h-4" /> Abbrechen</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? "Speichern..." : "Speichern"}
          </button>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Content + SEO ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Titel *</label>
            <input value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Beitragstitel..." className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-white text-lg font-semibold focus:border-primary focus:outline-none" />
          </div>
          {/* Slug */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Slug (URL)</label>
            <div className="flex items-center">
              <span className="px-3 py-2.5 rounded-l-xl bg-gray-100 border border-r-0 border-gray-200 text-gray-400 text-xs select-none whitespace-nowrap">ikfzdigitalzulassung.de/</span>
              <input value={slug} onChange={e => handleSlugChange(e.target.value)} placeholder="beitrag-slug" className="flex-1 px-4 py-2.5 rounded-r-xl bg-white border border-gray-200 text-gray-600 text-sm focus:border-primary focus:outline-none" />
            </div>
          </div>
          {/* Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-400">Inhalt</label>
              <button type="button" onClick={() => setUseRichEditor(v => !v)} className="text-xs text-primary/70 hover:text-primary transition-colors">
                {useRichEditor ? "HTML-Ansicht" : "Editor-Ansicht"}
              </button>
            </div>
            {useRichEditor ? (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <TiptapEditor content={content} onChange={setContent} placeholder="Schreibe deinen Beitrag..." />
              </div>
            ) : (
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={20} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-white text-sm font-mono leading-relaxed focus:border-primary focus:outline-none resize-y" />
            )}
          </div>
          {/* Excerpt */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Auszug / Zusammenfassung</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} placeholder="Kurze Zusammenfassung für SEO und Karten..." className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none resize-y" />
          </div>
          {/* SEO Section */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> SEO</h3>
            <div className="p-4 rounded-xl bg-white border border-gray-200">
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Google-Vorschau</p>
              <p className="text-blue-400 text-base hover:underline cursor-default truncate">{metaTitle || title || "Titel"}</p>
              <p className="text-green-400 text-xs mt-0.5">ikfzdigitalzulassung.de/{slug || "slug"}/</p>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{metaDesc || excerpt || "Beschreibung..."}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Meta Title <span className="text-gray-300">({metaTitle.length}/60)</span></label>
                <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} maxLength={70} placeholder={title || "Meta Title"} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Focus-Keyword</label>
                <input value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)} placeholder="Haupt-Keyword..." className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Meta Description <span className="text-gray-300">({metaDesc.length}/160)</span></label>
              <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={2} maxLength={170} placeholder="Beschreibung für Suchmaschinen..." className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Canonical URL</label>
              <input value={canonical} onChange={e => setCanonical(e.target.value)} placeholder={`https://ikfzdigitalzulassung.de/${slug || "beitrag-slug"}/`} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">OG Title</label>
                <input value={ogTitle} onChange={e => setOgTitle(e.target.value)} placeholder={metaTitle || title || "OG Title"} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">OG Description</label>
                <input value={ogDesc} onChange={e => setOgDesc(e.target.value)} placeholder={metaDesc || "OG Description"} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="space-y-4">
          {/* Publish Mode */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Veröffentlichung</h3>
            <div className="space-y-2">
              {(["draft", "publish", "schedule"] as const).map(mode => (
                <label key={mode} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${publishMode === mode ? "border-primary/30 bg-primary/[0.05]" : "border-gray-200"}`}>
                  <input type="radio" name="publishMode" checked={publishMode === mode} onChange={() => setPublishMode(mode)} className="accent-primary" />
                  <div>
                    <span className="text-white text-sm font-medium">{mode === "draft" ? "Entwurf" : mode === "publish" ? "Sofort veröffentlichen" : "Zeitgesteuert"}</span>
                    <p className="text-gray-400 text-xs">{mode === "draft" ? "Nicht veröffentlicht" : mode === "publish" ? "Wird sofort live" : "Automatisch veröffentlichen"}</p>
                  </div>
                </label>
              ))}
            </div>
            {publishMode === "schedule" && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Datum & Uhrzeit</label>
                <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} min={new Date().toISOString().slice(0, 16)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none [color-scheme:dark]" />
                {scheduleDate && (
                  <p className="text-xs text-yellow-400/70 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(scheduleDate).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} · {new Date(scheduleDate).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                  </p>
                )}
              </div>
            )}
            <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {saving ? "Speichern..." : "Speichern"}
            </button>
          </div>
          {/* Category & Tags */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Kategorie & Tags</h3>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Kategorie</label>
              <input value={category} onChange={e => setCategory(e.target.value)} placeholder="z. B. Fahrzeugzulassung" className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Tags <span className="text-gray-300">(kommagetrennt)</span></label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="kfz, zulassung, ummeldung" className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-white text-sm focus:border-primary focus:outline-none" />
            </div>
          </div>
          {/* Featured Image */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary" /> Beitragsbild</h3>
            <ImageField label="" value={featuredImage} onChange={setFeaturedImage} token={token} />
          </div>
          {/* Post Info */}
          {!isNew && post && (
            <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-2">
              <h3 className="text-white font-semibold text-sm mb-3">Info</h3>
              {post.publishedAt && <div className="flex justify-between text-xs"><span className="text-gray-400">Veröffentlicht</span><span className="text-gray-500">{formatDate(post.publishedAt)}</span></div>}
              <div className="flex justify-between text-xs"><span className="text-gray-400">Status</span><Badge status={post.status} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ═══════════════════════════════════════════════════════════
export default function AdminPage() {
  return (
    <ToastProvider>
      <AdminPageInner />
    </ToastProvider>
  );
}

function AdminPageInner() {
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`${API}/auth/`, { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { if (d.authenticated) setToken(d.user?.email || "session"); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!token) return;
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      if (res.status === 401) {
        const url = typeof args[0] === "string" ? args[0] : "";
        // Only logout if a real admin API call failed (not the auth endpoint itself)
        if (url.startsWith("/api/admin/") && !url.includes("/auth")) {
          // Confirm session is truly invalid before logging out
          try {
            const check = await originalFetch(`${API}/auth/`, { credentials: "include" });
            if (!check.ok) {
              setToken(null);
              toast("Sitzung abgelaufen. Bitte erneut anmelden.", "error");
            }
          } catch {
            setToken(null);
            toast("Sitzung abgelaufen. Bitte erneut anmelden.", "error");
          }
        }
      }
      return res;
    };
    return () => { window.fetch = originalFetch; };
  }, [token, toast]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
      </div>
    );
  }

  if (!token) return <LoginScreen onLogin={setToken} />;

  const tabs: { id: Tab; label: string; icon: any; section?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Übersicht" },
    { id: "orders", label: "Bestellungen", icon: ShoppingCart, section: "E-Commerce" },
    { id: "products", label: "Produkte", icon: Package },
    { id: "customers", label: "Kunden", icon: Users },
    { id: "payments", label: "Zahlungen", icon: CreditCard },
    { id: "invoices", label: "Rechnungen", icon: Receipt },
    { id: "gateways", label: "Zahlungs-Gateways", icon: Wallet },
    { id: "coupons", label: "Gutscheine", icon: Percent, section: "Marketing" },
    { id: "campaigns", label: "E-Mail Kampagnen", icon: Mail },
    { id: "pages", label: "Seiten", icon: FileText, section: "CMS" },
    { id: "posts", label: "Blog / Beiträge", icon: BookOpen },
    { id: "media", label: "Medien", icon: ImageIcon },
    { id: "seo", label: "SEO", icon: Globe },
    { id: "settings", label: "Einstellungen", icon: Settings, section: "System" },
  ];

  async function handleLogout() {
    await fetch(`${API}/auth`, { method: "DELETE", credentials: "include" });
    setToken(null);
    toast("Erfolgreich abgemeldet");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay — closes sidebar when tapping outside */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — stays dark, drawer on mobile */}
      <aside className={`admin-sidebar w-64 border-r border-white/[0.06] bg-dark-900 flex flex-col${sidebarOpen ? " admin-sidebar-open" : ""}`}>
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">iKFZ Admin</h1>
            <p className="text-xs text-white/30 mt-1">E-Commerce & CMS</p>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Menü schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {tabs.map((t) => (
            <div key={t.id}>
              {t.section && <p className="text-[10px] uppercase tracking-widest text-white/20 font-semibold mt-4 mb-2 px-3">{t.section}</p>}
              <button
                onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${tab === t.id ? "bg-primary/10 text-primary" : "text-white/50 hover:bg-white/5 hover:text-white/80"}`}
              >
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <a href="/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-primary/10 hover:text-primary transition-colors">
            <ExternalLink className="w-4 h-4" /> Website ansehen
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" /> Abmelden
          </button>
        </div>
      </aside>

      {/* Main content — light mode */}
      <main className="admin-light flex-1 min-w-0 flex flex-col overflow-y-auto">
        {/* Mobile top bar with hamburger */}
        <div className="admin-mobile-header lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Menü öffnen"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-gray-900 text-sm font-semibold">iKFZ Admin</span>
          <span className="ml-auto text-xs text-gray-400 font-medium capitalize">{tab}</span>
        </div>

        {/* Content */}
        <div className="admin-main-content flex-1">
          <div className="max-w-6xl mx-auto">
            {tab === "dashboard" && <DashboardTab token={token} />}
            {tab === "pages" && <CMSListTab type="pages" token={token} />}
            {tab === "posts" && <BlogTab token={token} />}
            {tab === "seo" && <SEOTab token={token} />}
            {tab === "products" && <ProductsManager token={token || ''} />}
            {tab === "orders" && <OrdersTab token={token} />}
            {tab === "customers" && <CustomersTab token={token} />}
            {tab === "payments" && <PaymentsTab token={token} />}
            {tab === "invoices" && <InvoicesTab token={token} />}
            {tab === "gateways" && <GatewaysTab token={token} />}
            {tab === "coupons" && <CouponsTab token={token} />}
            {tab === "campaigns" && <EmailCampaignsTab token={token} />}
            {tab === "media" && <MediaLibraryTab token={token} />}
            {tab === "settings" && <SettingsTab token={token} />}
          </div>
        </div>
      </main>
    </div>
  );
}
