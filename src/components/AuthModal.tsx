import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { X, User, Shield, Briefcase, Shirt, Bike, Check, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchUserRole, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'demo-switch' | 'login' | 'register'>('demo-switch');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const roleOptions: { role: UserRole; title: string; desc: string; icon: any; color: string }[] = [
    {
      role: 'customer',
      title: 'Customer (Aarav Sharma)',
      desc: 'Book pickup, browse catalogue, track order, manage addresses & coupons',
      icon: User,
      color: 'bg-blue-500 text-white',
    },
    {
      role: 'admin',
      title: 'Business Admin / Owner',
      desc: 'Full control over orders, services, pricing ranges, coupons, CRM, CMS & analytics',
      icon: Shield,
      color: 'bg-indigo-600 text-white',
    },
    {
      role: 'manager',
      title: 'Operations Manager',
      desc: 'Assign riders, manage processing queues, monitor SLAs',
      icon: Briefcase,
      color: 'bg-amber-600 text-white',
    },
    {
      role: 'laundry_staff',
      title: 'Laundry Master Staff',
      desc: 'Garment intake, inspection notes, washing/dry cleaning line, quality check',
      icon: Shirt,
      color: 'bg-emerald-600 text-white',
    },
    {
      role: 'delivery_staff',
      title: 'Pickup & Delivery Rider',
      desc: 'Mobile-friendly tasks: Today’s pickups, route navigation, OTP verification',
      icon: Bike,
      color: 'bg-cyan-600 text-white',
    },
  ];

  const handleCustomAuth = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Welcome ${name || email || 'Customer'}! Logged in successfully.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden z-10 border border-slate-100 max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold">Account & Role Switcher</h3>
            <p className="text-xs text-brand-200 mt-0.5">
              Current Active Role: <span className="font-semibold text-accent-300 uppercase">{currentUser.role}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('demo-switch')}
            className={`flex-1 py-2.5 sm:py-3 text-center transition-colors ${
              activeTab === 'demo-switch'
                ? 'text-brand-600 border-b-2 border-brand-600 bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Demo Roles
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 sm:py-3 text-center transition-colors ${
              activeTab === 'login'
                ? 'text-brand-600 border-b-2 border-brand-600 bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 sm:py-3 text-center transition-colors ${
              activeTab === 'register'
                ? 'text-brand-600 border-b-2 border-brand-600 bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'demo-switch' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Click any role below to instantly simulate their full dashboard, permissions, and workflow:
              </p>

              {roleOptions.map((item) => {
                const Icon = item.icon;
                const isCurrent = currentUser.role === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      switchUserRole(item.role);
                      onClose();
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center space-x-3.5 transition-all ${
                      isCurrent
                        ? 'border-brand-500 bg-brand-50/70 shadow-sm ring-1 ring-brand-500'
                        : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{item.title}</span>
                        {isCurrent && (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center space-x-0.5">
                            <Check className="w-3 h-3 inline" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {(activeTab === 'login' || activeTab === 'register') && (
            <form onSubmit={handleCustomAuth} className="space-y-4">
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Gupta"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 93298 38804"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-transform active:scale-[0.99] text-sm"
              >
                <span>{activeTab === 'login' ? 'Send OTP & Login' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-slate-400 mt-2">
                By continuing, you agree to our Terms of Service & Privacy Policy.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
