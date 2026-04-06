'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ArrowRight, UserCircle, MapPin } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { cn } from '@/lib/utils';
import { useCustomerAuth } from '@/components/CustomerAuthProvider';

type NavChild = { readonly label: string; readonly href: string };
type NavItem = { readonly label: string; readonly href: string; readonly children?: readonly NavChild[] };

const navItems = siteConfig.nav as readonly NavItem[];
const START_CTA_HREF = '/product/auto-online-anmelden/';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { customer, loading: authLoading } = useCustomerAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-white/90 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] py-2'
          : 'bg-transparent py-4'
      )}
      style={{ top: 'var(--promo-banner-height, 0px)' }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 z-50 group">
          <Image
            src="/logo-ikfz.svg"
            alt="IKFZ Digital Zulassung"
            width={180}
            height={49}
            className={cn(
              'transition-all duration-300',
              scrolled ? '' : 'brightness-0 invert'
            )}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const hasChildren = !!item.children;
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => hasChildren && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200',
                    scrolled
                      ? 'text-dark-600 hover:text-primary hover:bg-primary/5'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  {item.label.toUpperCase()}
                  {hasChildren && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-elevated border border-dark-100/50 overflow-hidden p-2"
                    >
                      {item.children.map((child, childIdx) => {
                        const isLast = childIdx === item.children!.length - 1;
                        const isCities = item.label === 'Städte';
                        const isViewAll = isCities && isLast;
                        return (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={cn(
                              'flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-150',
                              isViewAll
                                ? 'text-primary font-semibold bg-primary/5 hover:bg-primary/10 mt-1 border-t border-dark-100/30 pt-3'
                                : 'text-dark-600 hover:bg-primary/5 hover:text-primary'
                            )}
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                              {isCities ? <MapPin className="w-3.5 h-3.5 text-primary" /> : <ArrowRight className="w-3.5 h-3.5 text-primary" />}
                            </div>
                            {child.label}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Account Icon + CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Login / Account Icon */}
          {!authLoading && (
            <Link
              href={customer ? '/konto' : '/anmelden'}
              title={customer ? 'Mein Konto' : 'Anmelden'}
              className={cn(
                'relative p-2 rounded-xl transition-all duration-200',
                scrolled
                  ? 'text-dark-500 hover:text-primary hover:bg-primary/5'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {customer ? (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {(customer.firstName?.[0] || customer.email[0]).toUpperCase()}
                </div>
              ) : (
                <UserCircle className="w-6 h-6" />
              )}
            </Link>
          )}

          {/* Divider */}
          <div
            className={cn(
              'hidden md:block w-px h-6 transition-colors',
              scrolled ? 'bg-dark-200' : 'bg-white/20'
            )}
          />

          <Link
            href={START_CTA_HREF}
            className={cn(
              'hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300',
              scrolled
                ? 'bg-primary text-white shadow-button hover:shadow-button-hover hover:-translate-y-0.5'
                : 'bg-white text-primary hover:bg-white/90 shadow-lg'
            )}
          >
            Jetzt starten
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'lg:hidden p-2.5 rounded-xl transition-all duration-200 z-50',
              scrolled || isOpen
                ? 'text-dark-600 hover:bg-dark-50'
                : 'text-white hover:bg-white/10'
            )}
            aria-label="Menü öffnen"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white z-40 lg:hidden shadow-2xl"
            >
              <div className="pt-20 px-6 pb-8 h-full overflow-y-auto">
                <div className="space-y-1">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-4 py-3.5 text-[15px] font-semibold text-dark-800 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      >
                        {item.label}
                        <ArrowRight className="w-4 h-4 text-dark-300" />
                      </Link>

                      {item.children && (
                        <div className="pl-4 space-y-0.5 mb-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              onClick={() => setIsOpen(false)}
                              className="block px-4 py-2.5 text-sm text-dark-500 hover:text-primary transition-colors rounded-lg"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-dark-100">
                  {/* Mobile Account Link */}
                  <Link
                    href={customer ? '/konto' : '/anmelden'}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-semibold text-dark-800 hover:text-primary hover:bg-primary/5 rounded-xl transition-all mb-3"
                  >
                    {customer ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                          {(customer.firstName?.[0] || customer.email[0]).toUpperCase()}
                        </div>
                        Mein Konto
                      </>
                    ) : (
                      <>
                        <UserCircle className="w-5 h-5" />
                        Anmelden
                      </>
                    )}
                  </Link>

                  <Link
                    href={START_CTA_HREF}
                    onClick={() => setIsOpen(false)}
                    className="btn-primary w-full text-center"
                  >
                    Jetzt online starten
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
