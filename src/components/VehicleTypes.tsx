'use client';

import { motion } from 'framer-motion';
import {
  Car,
  Bike,
  Truck,
  Caravan,
  Home,
  Zap,
  Clock3,
} from 'lucide-react';
import { homepageContent } from '@/lib/content';

const vehicleIcons: Record<string, React.ElementType> = {
  'PKW / Auto': Car,
  'Motorrad': Bike,
  'Transporter / LKW': Truck,
  'Anhänger': Caravan,
  'Wohnmobil': Home,
  'Elektrofahrzeuge': Zap,
  'Oldtimer (H-Kennzeichen)': Clock3,
};

export default function VehicleTypes() {
  const { vehicles } = homepageContent;

  return (
    <section className="py-10 md:py-16 bg-warm relative overflow-hidden section-divider-top">
      {/* Design layer */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />
      <div className="container-main relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="section-label mb-5 inline-flex">
            <Car className="w-3.5 h-3.5" />
            Fahrzeugtypen
          </span>
          <h2 className="text-section-mobile md:text-section text-dark-900 mb-4 text-balance">
            {vehicles.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {vehicles.items.map((vehicle, index) => {
            const Icon = vehicleIcons[vehicle] || Car;
            return (
              <motion.div
                key={vehicle}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="group bg-white rounded-2xl p-6 text-center border border-dark-100/60 shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-14 h-14 mx-auto mb-3 bg-primary/8 rounded-2xl flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <span className="text-sm font-semibold text-dark-700">{vehicle}</span>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-dark-400 mt-8 text-[0.95rem]"
        >
          Auto online anmelden – deutschlandweit, mit klaren Kosten, einfachen Schritten und persönlicher Hilfe.
        </motion.p>
      </div>
    </section>
  );
}
