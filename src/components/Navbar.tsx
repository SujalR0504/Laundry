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
      {/* Top Announcement Bar - Clean & Decent */}
      <div className="bg-slate-900 text-slate-300 text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="font-extrabold text-sky-400 tracking-tight shrink-0">The Laundry Lounge</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="truncate text-slate-300 text-[11px] sm:text-xs font-normal">
              2 Flagship Retail Branches in Rewa (Arun Nagar &amp; Ring Road) • Express Doorstep Service
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs shrink-0 font-medium">
            <a
              href="tel:9893733683"
              className="inline-flex items-center space-x-1.5 text-slate-200 hover:text-emerald-300 transition-colors font-semibold"
              title="Call Store"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>9893733683</span>
              <span className="text-slate-500 hidden sm:inline">/ 9329838804</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo */}
          <div
            onClick={() => setCurrentView('home')}
            className="cursor-pointer group py-1 shrink-0"
          >
            <BrandLogo size="md" showBranches={false} showTagline={false} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'text-sky-600 bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentView('services')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'services'
                  ? 'text-sky-600 bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Services &amp; Pricing
            </button>
            <button
              onClick={() => setCurrentView('tracking')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'tracking'
                  ? 'text-sky-600 bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Track Order
            </button>

            {/* Quick 2 Branches Dropdown Pill */}
            <div className="relative ml-1">
              <button
                onClick={() => setShowBranchesModal(!showBranchesModal)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>2 Branches</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
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
                          <span>The Laundry Lounge (Branch 1 - Arun Nagar)</span>
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-sky-200">
                          Near Gayatri School
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium">
                        Near Gaytri School Arun Nagar, Rewa (M. P.)
                      </p>
                      <div className="flex items-center space-x-3 pt-1 font-bold text-sky-700">
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
              className="hidden md:flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Pickup</span>
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center space-x-1.5 p-2 sm:px-3 sm:py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
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

            {/* LOGIN & ADMIN PORTAL BUTTONS */}
            {currentUser.role === 'admin' ? (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setCurrentView('admin-dashboard')}
                  className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    currentView === 'admin-dashboard'
                      ? 'bg-slate-900 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  title="Open Admin Dashboard"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Panel</span>
                  <span className="sm:hidden">Admin</span>
                </button>
                <button
                  onClick={onOpenAuth}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs transition-colors"
                  title="Switch Role / Logout"
                >
                  <User className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 text-xs font-bold transition-all shadow-2xs"
                title="Login (Customer & Admin)"
              >
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>Login</span>
              </button>
            )}

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
                  <span>The Laundry Lounge (Arun Nagar)</span>
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



            {/* Mobile Login Button */}
            <div className="pt-1">
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white flex items-center justify-center space-x-2 shadow-sm"
              >
                <User className="w-4 h-4 text-sky-400" />
                <span>Login</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
