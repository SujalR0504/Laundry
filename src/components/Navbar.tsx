import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ShoppingBag,
  User,
  Shield,
  Bike,
  Shirt,
  Search,
  Phone,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenAuth }) => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    getCartCount,
    cms,
    businessSettings,
    trackOrderById,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickTrackInput, setQuickTrackInput] = useState('');
  const [showTrackSearch, setShowTrackSearch] = useState(false);

  const cartCount = getCartCount();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackInput.trim()) {
      trackOrderById(quickTrackInput.trim());
      setQuickTrackInput('');
      setShowTrackSearch(false);
      setMobileMenuOpen(false);
    }
  };

  const getDashboardLabel = () => {
    switch (currentUser.role) {
      case 'admin':
        return { label: 'Admin Portal', view: 'admin-dashboard' as const, icon: Shield };
      case 'manager':
        return { label: 'Manager Hub', view: 'admin-dashboard' as const, icon: Shield };
      case 'laundry_staff':
        return { label: 'Wash Line', view: 'laundry-dashboard' as const, icon: Shirt };
      case 'delivery_staff':
        return { label: 'Rider App', view: 'rider-dashboard' as const, icon: Bike };
      default:
        return { label: 'My Account', view: 'customer-dashboard' as const, icon: User };
    }
  };

  const dashInfo = getDashboardLabel();
  const DashIcon = dashInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Announcement Bar */}
      {cms.announcementBar && (
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-accent-400 flex-shrink-0" />
          <span className="truncate">{cms.announcementBar}</span>
          <span className="hidden md:inline-block text-brand-300">|</span>
          <a
            href={`tel:${businessSettings.phone}`}
            className="hidden md:inline-flex items-center space-x-1 text-accent-300 hover:text-white"
          >
            <Phone className="w-3 h-3" />
            <span>{businessSettings.phone}</span>
          </a>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-700 to-accent-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform text-white">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-brand-900">
                  Aqua<span className="text-accent-500">Pure</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 hidden sm:inline-block">
                  Express Care
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-1 hidden sm:block">
                Laundry & Dry Cleaning
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'home'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('services')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'services'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Services & Pricing
            </button>
            <button
              onClick={() => setCurrentView('booking')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'booking'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Book a Pickup
            </button>
            <button
              onClick={() => setCurrentView('tracking')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'tracking'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Track Order
            </button>

            {/* Role specific quick jump */}
            <button
              onClick={() => setCurrentView(dashInfo.view)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentView === dashInfo.view
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <DashIcon className="w-3.5 h-3.5 text-accent-500" />
              <span>{dashInfo.label}</span>
            </button>
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Track Search popover button */}
            <div className="relative">
              <button
                onClick={() => setShowTrackSearch(!showTrackSearch)}
                className="p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                title="Search Order by ID"
              >
                <Search className="w-5 h-5" />
              </button>

              {showTrackSearch && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
                  <form onSubmit={handleTrackSubmit} className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Track by Order ID (e.g. LD-2026-000101)
                    </label>
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        value={quickTrackInput}
                        onChange={(e) => setQuickTrackInput(e.target.value)}
                        placeholder="LD-2026-..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
                      >
                        Track
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center space-x-2 p-2 sm:px-3.5 sm:py-2 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-xl font-bold text-xs sm:text-sm transition-all"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-brand-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Basket</span>
            </button>

            {/* Role Demo Switcher Badge / Button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-300 bg-white shadow-soft-sm text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              title="Change user role or profile"
            >
              <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="leading-tight font-bold text-slate-900 text-xs">
                  {currentUser.name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-brand-600 uppercase font-bold tracking-wider">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-2 animate-in slide-in-from-top-2">
            <button
              onClick={() => {
                setCurrentView('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm text-slate-800 hover:bg-slate-50"
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentView('services');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm text-slate-800 hover:bg-slate-50"
            >
              Services & Pricing
            </button>
            <button
              onClick={() => {
                setCurrentView('booking');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm text-slate-800 hover:bg-slate-50"
            >
              Book a Pickup
            </button>
            <button
              onClick={() => {
                setCurrentView('tracking');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm text-slate-800 hover:bg-slate-50"
            >
              Track Order
            </button>
            <button
              onClick={() => {
                setCurrentView(dashInfo.view);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm bg-brand-50 text-brand-700 flex items-center space-x-2"
            >
              <DashIcon className="w-4 h-4" />
              <span>Go to {dashInfo.label}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
