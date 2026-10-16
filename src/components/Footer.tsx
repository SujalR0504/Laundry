import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, switchUserRole, showToast, businessSettings, serviceAreas, categories } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs pt-16 pb-24 sm:pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => setCurrentView('home')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-700 p-0.5 flex items-center justify-center overflow-hidden">
                <img
                  src="/logo-icon.png"
                  alt="The Laundry Lounge"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo-icon.jpg';
                  }}
                />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white">
                  The Laundry <span className="text-red-500">Lounge</span>
                </span>
                <p className="text-[11px] text-sky-400 font-semibold">Rewa, Madhya Pradesh</p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Rewa’s premier fabric care destination. Specialized dry cleaning, organic gentle wash,
              steam roll pressing, and convenient doorstep pickup across Rewa from our two dedicated branches.
            </p>

            {/* Branches Card */}
            <div className="space-y-2.5 pt-1">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-sky-400 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>Branch 1 (Nehru Nagar):</span>
                </div>
                <p className="text-slate-300 pl-5">
                  Near Gaytri School Nehru Nagar In FRONT Of Apna Super Bazar Rewa (M. P.)
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-sky-400 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>Branch 2 — Hari Om (Ring Road):</span>
                </div>
                <p className="text-slate-300 pl-5">
                  Behind Hotel The Vijay Villas Gadariya Ring Road Rewa (M. P.)
                </p>
              </div>
            </div>

            {/* Contact Phones */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center space-x-2.5 text-slate-200">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="flex flex-wrap gap-x-3 gap-y-1 font-semibold">
                  <a href="tel:9329838804" className="hover:text-amber-400 text-white">
                    9329838804
                  </a>
                  <span className="text-slate-600">|</span>
                  <a href="tel:9893733683" className="hover:text-amber-400 text-white">
                    9893733683
                  </a>
                  <span className="text-slate-600">|</span>
                  <a href="tel:07662334849" className="hover:text-amber-400 text-sky-300">
                    07662-334849
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-sky-400" />
                <a href={`mailto:${businessSettings.email}`} className="hover:text-white">
                  {businessSettings.email}
                </a>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-300">
                <Clock className="w-4 h-4 text-sky-400" />
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
              <li>
                <button
                  onClick={() => {
                    switchUserRole('admin');
                    setCurrentView('admin-dashboard');
                    showToast('Switched to Operations Control Admin Suite', 'info');
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center space-x-1"
                >
                  <span>🛡️ Operations Admin Suite</span>
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
            © {new Date().getFullYear()} The Laundry Lounge (Rewa). All rights reserved. GSTIN:{' '}
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
