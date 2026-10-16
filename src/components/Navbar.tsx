import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
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
  MapPin,
  Calendar,
  MessageCircle,
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
    getCartSubtotal,
    cms,
    trackOrderById,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickTrackInput, setQuickTrackInput] = useState('');
  const [showTrackSearch, setShowTrackSearch] = useState(false);
  const [showBranchesModal, setShowBranchesModal] = useState(false);

  const cartCount = getCartCount();
  const cartSubtotal = getCartSubtotal();

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-sky-950 to-slate-950 text-white text-[11px] sm:text-xs py-2 px-3 sm:px-4 font-medium border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px] border border-amber-400/30 shrink-0">
              <Sparkles className="w-3 h-3 mr-1 text-amber-300" /> REWA (M.P.)
            </span>
            <span className="truncate text-slate-200 font-semibold text-[11px] sm:text-xs">
              {cms.announcementBar || 'The Laundry Lounge • 2 Retail Branches (Nehru Nagar & Ring Road Hari Om)'}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-xs shrink-0 font-semibold">
            {/* Quick mobile call button */}
            <a
              href="tel:9329838804"
              className="lg:hidden inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 hover:bg-emerald-500/30"
            >
              <Phone className="w-2.5 h-2.5" />
              <span>Call Rewa</span>
            </a>

            <div className="hidden lg:flex items-center space-x-3">
              <span className="text-slate-400 text-xs">Direct Order Lines:</span>
              <a
                href="tel:9329838804"
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-300 text-white transition-all text-xs"
                title="Branch 1 (Nehru Nagar)"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>9329838804</span>
              </a>
              <span className="text-slate-600">•</span>
              <a
                href="tel:9893733683"
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-300 text-white transition-all text-xs"
                title="Branch 2 (Hari Om - Ring Road)"
              >
                <span>9893733683</span>
              </a>
              <span className="text-slate-600">•</span>
              <a
                href="tel:07662334849"
                className="inline-flex items-center space-x-1 text-slate-300 hover:text-white transition-colors text-xs"
                title="Store Landline"
              >
                <span>07662-334849</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            onClick={() => setCurrentView('home')}
            className="cursor-pointer group py-1"
          >
            <BrandLogo size="md" showBranches={true} showTagline={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                currentView === 'home'
                  ? 'text-sky-600 bg-sky-50 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('services')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                currentView === 'services'
                  ? 'text-sky-600 bg-sky-50 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Services & Pricing
            </button>
            <button
              onClick={() => setCurrentView('booking')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                currentView === 'booking'
                  ? 'text-sky-600 bg-sky-50 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Book Pickup
            </button>
            <button
              onClick={() => setCurrentView('tracking')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                currentView === 'tracking'
                  ? 'text-sky-600 bg-sky-50 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Track Order
            </button>



            {/* Quick 2 Branches Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setShowBranchesModal(!showBranchesModal)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors shadow-2xs"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>2 Branches</span>
                <ChevronDown className="w-3 h-3 text-rose-500" />
              </button>

              {showBranchesModal && (
                <div className="absolute left-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-rose-600" />
                      <h4 className="font-extrabold text-sm text-slate-900">Our Retail Hubs in Rewa</h4>
                    </div>
                    <button
                      onClick={() => setShowBranchesModal(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 pt-3">
                    {/* Branch 1 */}
                    <div className="p-3 bg-sky-50/80 rounded-2xl border border-sky-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-sky-900">
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Branch 1 — Nehru Nagar (Main)</span>
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-sky-200">
                          Near Gayatri School
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium">
                        Near Gaytri School Nehru Nagar In FRONT Of Apna Super Bazar Rewa (M. P.)
                      </p>
                      <div className="flex items-center space-x-3 pt-1 font-bold text-sky-700">
                        <a href="tel:9329838804" className="hover:underline flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>9329838804</span>
                        </a>
                        <span>•</span>
                        <a href="tel:07662334849" className="hover:underline">
                          07662-334849
                        </a>
                      </div>
                    </div>

                    {/* Branch 2 */}
                    <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-rose-900">
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Branch 2 — Hari Om (Ring Road)</span>
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-rose-200">
                          Behind Vijay Villas
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium">
                        Behind Hotel The Vijay Villas Gadariya Ring Road Rewa (M. P.)
                      </p>
                      <div className="flex items-center space-x-3 pt-1 font-bold text-rose-700">
                        <a href="tel:9893733683" className="hover:underline flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>9893733683</span>
                        </a>
                        <span>•</span>
                        <a href="tel:9329838804" className="hover:underline">
                          9329838804
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2.5 shrink-0">
            {/* Quick Track Search popover button */}
            <div className="relative">
              <button
                onClick={() => setShowTrackSearch(!showTrackSearch)}
                className="p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                title="Search Order by ID"
              >
                <Search className="w-5 h-5" />
              </button>

              {showTrackSearch && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
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
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 font-medium"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Track
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Book Now Button (Desktop) */}
            <button
              onClick={() => setCurrentView('booking')}
              className="hidden md:flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white text-xs font-extrabold shadow-md shadow-sky-600/25 transition-all hover:scale-105 active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>Book Pickup</span>
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center space-x-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-soft-sm text-xs font-bold text-slate-800 transition-all hover:border-sky-300"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-sky-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">
                {cartCount > 0 ? `₹${cartSubtotal}` : 'Basket'}
              </span>
            </button>

            {/* Role Switcher Badge / Button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-sky-300 bg-white shadow-soft-sm text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              title="Change user role or profile"
            >
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="leading-tight font-bold text-slate-900 text-xs">
                  {currentUser.name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-sky-600 uppercase font-bold tracking-wider">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-3 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setCurrentView('home');
                  setMobileMenuOpen(false);
                }}
                className="text-center px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-800"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentView('services');
                  setMobileMenuOpen(false);
                }}
                className="text-center px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-800"
              >
                Services & Pricing
              </button>
              <button
                onClick={() => {
                  setCurrentView('booking');
                  setMobileMenuOpen(false);
                }}
                className="text-center px-4 py-2.5 rounded-xl font-bold text-xs bg-sky-600 text-white"
              >
                Book a Pickup
              </button>
              <button
                onClick={() => {
                  setCurrentView('tracking');
                  setMobileMenuOpen(false);
                }}
                className="text-center px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-800"
              >
                Track Order
              </button>
            </div>

            {/* 2 Branches Mobile Call Cards */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <p className="font-extrabold text-xs text-slate-700 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Our 2 Retail Branches in Rewa</span>
              </p>
              <div className="flex gap-2 text-xs">
                <a
                  href="tel:9329838804"
                  className="flex-1 p-2 rounded-xl bg-white border border-slate-200 text-center font-bold text-sky-700 flex items-center justify-center space-x-1 shadow-2xs"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>Nehru Nagar</span>
                </a>
                <a
                  href="tel:9893733683"
                  className="flex-1 p-2 rounded-xl bg-white border border-slate-200 text-center font-bold text-rose-700 flex items-center justify-center space-x-1 shadow-2xs"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>Ring Road</span>
                </a>
              </div>
            </div>



            <button
              onClick={() => {
                setCurrentView(dashInfo.view);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs bg-sky-50 text-sky-700 flex items-center space-x-2"
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
