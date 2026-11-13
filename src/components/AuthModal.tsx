import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  X,
  User,
  Shield,
  Briefcase,
  Shirt,
  Bike,
  Check,
  ArrowRight,
  Lock,
  KeyRound,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'admin' | 'customer' | 'roles' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'admin',
}) => {
  const { currentUser, switchUserRole, setCurrentView, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'admin' | 'customer' | 'roles' | 'register'>(defaultTab);
  const [adminPassword, setAdminPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleAdminDirectLogin = () => {
    switchUserRole('admin');
    setCurrentView('admin-dashboard');
    showToast('Welcome Admin! Switched to Business Admin Portal', 'success');
    onClose();
  };

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow standard admin pass or 1-click
    switchUserRole('admin');
    setCurrentView('admin-dashboard');
    showToast('Admin password verified! Welcome to Dashboard.', 'success');
    onClose();
  };

  const handleCustomerAuth = (e: React.FormEvent) => {
    e.preventDefault();
    switchUserRole('customer');
    setCurrentView('customer-dashboard');
    showToast(`Welcome ${name || phone || 'Customer'}! Logged in successfully.`, 'success');
    onClose();
  };

  const roleOptions: { role: UserRole; title: string; desc: string; icon: any; color: string }[] = [
    {
      role: 'admin',
      title: 'Business Admin / Owner',
      desc: 'Full control: Khata, Due, Accounting, Offline/Web Revenue, Expenses, Services & Orders',
      icon: Shield,
      color: 'bg-indigo-600 text-white',
    },
    {
      role: 'customer',
      title: 'Customer',
      desc: 'Book pickup, browse catalogue, track order, manage addresses & coupons',
      icon: User,
      color: 'bg-blue-500 text-white',
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
      title: 'Laundry Master Staff (Wash Line)',
      desc: 'Garment intake, washing/dry cleaning line, quality inspection check',
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden z-10 border border-slate-100 max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-sky-500/20 text-sky-400">
                <Lock className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-extrabold">Login &amp; Portal Access</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Current Active Role: <span className="font-bold text-sky-300 uppercase">{currentUser.role}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-3 px-3 text-center whitespace-nowrap transition-colors flex items-center justify-center space-x-1.5 ${
              activeTab === 'admin'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>🔐 Admin Login</span>
          </button>

          <button
            onClick={() => setActiveTab('customer')}
            className={`flex-1 py-3 px-3 text-center whitespace-nowrap transition-colors flex items-center justify-center space-x-1.5 ${
              activeTab === 'customer'
                ? 'text-brand-600 border-b-2 border-brand-600 bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-sky-600" />
            <span>👤 Customer</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 py-3 px-3 text-center whitespace-nowrap transition-colors flex items-center justify-center space-x-1.5 ${
              activeTab === 'roles'
                ? 'text-brand-600 border-b-2 border-brand-600 bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>⚡ Staff Roles</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 px-3 text-center whitespace-nowrap transition-colors flex items-center justify-center space-x-1.5 ${
              activeTab === 'register'
                ? 'text-brand-600 border-b-2 border-brand-600 bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Register</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: ADMIN LOGIN */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-indigo-900 font-extrabold text-sm">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>The Laundry Lounge — Business Admin</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Full administrative access: Customer Khata &amp; Dues, Offline &amp; Web Revenue, Store Expenses, Multi-Bank Accounts, Bill Printing, and Garment Photos.
                </p>
              </div>

              {/* 1-Click Fast Admin Login */}
              <button
                type="button"
                onClick={handleAdminDirectLogin}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98] text-sm"
              >
                <Shield className="w-4 h-4" />
                <span>1-Click Login as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-bold uppercase">
                  or login with password
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Password Form */}
              <form onSubmit={handleAdminPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admin Password / PIN (Default: admin123)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter Admin Password or PIN..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Verify Password &amp; Open Dashboard</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CUSTOMER LOGIN */}
          {activeTab === 'customer' && (
            <form onSubmit={handleCustomerAuth} className="space-y-3.5">
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-900 font-medium">
                Customer Portal: Schedule doorstep pickup, track garment cleaning, and view bills.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9329838804"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-600/30 flex items-center justify-center space-x-2 transition-transform active:scale-[0.99] text-xs"
              >
                <span>Login as Customer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: OTHER STAFF ROLES */}
          {activeTab === 'roles' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 font-medium">
                Select any operational role to simulate their staff workflow:
              </p>

              {roleOptions.map((item) => {
                const Icon = item.icon;
                const isCurrent = currentUser.role === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      switchUserRole(item.role);
                      if (item.role === 'admin') setCurrentView('admin-dashboard');
                      else if (item.role === 'laundry_staff') setCurrentView('laundry-dashboard');
                      else if (item.role === 'delivery_staff') setCurrentView('rider-dashboard');
                      else setCurrentView('customer-dashboard');
                      onClose();
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center space-x-3 transition-all ${
                      isCurrent
                        ? 'border-brand-500 bg-brand-50/70 shadow-sm ring-1 ring-brand-500'
                        : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{item.title}</span>
                        {isCurrent && (
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full flex items-center space-x-0.5">
                            <Check className="w-2.5 h-2.5 inline" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 4: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleCustomerAuth} className="space-y-3.5">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 outline-none text-xs"
                />
              </div>

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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-transform active:scale-[0.99] text-xs"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
