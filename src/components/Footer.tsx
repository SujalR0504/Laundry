import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, businessSettings, serviceAreas, categories } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs pt-16 pb-24 sm:pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => setCurrentView('home')}
              className="flex items-center space-x-2.5 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shadow-glow">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Aqua<span className="text-accent-400">Pure</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Delhi NCR’s premier fabric care destination. Specialized dry cleaning, organic wet wash,
              steam roll pressing, and guaranteed punctual doorstep collection and delivery.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-accent-400" />
                <a href={`tel:${businessSettings.phone}`} className="hover:text-white">
                  {businessSettings.phone}
                </a>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-accent-400" />
                <a href={`mailto:${businessSettings.email}`} className="hover:text-white">
                  {businessSettings.email}
                </a>
              </div>
              <div className="flex items-start space-x-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-accent-400 flex-shrink-0 mt-0.5" />
                <span>{businessSettings.address}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-300">
                <Clock className="w-4 h-4 text-accent-400" />
                <span>{businessSettings.supportHours}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentView('home')}
                  className="hover:text-accent-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('services')}
                  className="hover:text-accent-400 transition-colors"
                >
                  Price List & Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('booking')}
                  className="hover:text-accent-400 transition-colors"
                >
                  Schedule a Pickup
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('tracking')}
                  className="hover:text-accent-400 transition-colors"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('customer-dashboard')}
                  className="hover:text-accent-400 transition-colors"
                >
                  Customer Account
                </button>
              </li>
            </ul>
          </div>

          {/* Service Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Our Services</h4>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setCurrentView('services')}
                    className="hover:text-accent-400 transition-colors text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
              <li>
                <span className="text-slate-500">Express 24h Turnaround</span>
              </li>
              <li>
                <span className="text-slate-500">Bridal Lehenga & Gowns</span>
              </li>
              <li>
                <span className="text-slate-500">Curtains & Heavy Quilts</span>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Service Hubs</h4>
            <ul className="space-y-1.5">
              {serviceAreas.map((sa) => (
                <li key={sa.id} className="text-slate-400 flex items-center justify-between">
                  <span>{sa.areaName}</span>
                  <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-accent-400">
                    {sa.pincode}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] space-y-4 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} AquaPure Cleaners Pvt Ltd. All rights reserved. GSTIN:{' '}
            <span className="text-slate-300 font-mono">{businessSettings.gstin}</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Razorpay Verified Merchant</span>
            </span>
            <span>•</span>
            <span>100% Eco-Safe Cleaning</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
