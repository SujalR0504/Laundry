import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Shirt, CalendarCheck, Package, User } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenAuth }) => {
  const { currentView, setCurrentView, currentUser, getCartCount } = useApp();
  const cartCount = getCartCount();

  const handleNavClick = (view: any) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-4 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
      {/* Home */}
      <button
        onClick={() => handleNavClick('home')}
        className={`flex flex-col items-center justify-center p-1.5 transition-all ${
          currentView === 'home'
            ? 'text-sky-600 font-extrabold scale-105'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      {/* Services */}
      <button
        onClick={() => handleNavClick('services')}
        className={`flex flex-col items-center justify-center p-1.5 transition-all ${
          currentView === 'services'
            ? 'text-sky-600 font-extrabold scale-105'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <Shirt className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Services</span>
      </button>

      {/* Center Action: Book Pickup */}
      <button
        onClick={() => handleNavClick('booking')}
        className="relative -top-4 flex flex-col items-center justify-center p-3.5 bg-gradient-to-r from-sky-600 via-sky-700 to-sky-800 rounded-full text-white shadow-xl shadow-sky-600/40 ring-4 ring-white active:scale-95 transition-all"
        title="Schedule Pickup"
      >
        <CalendarCheck className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
            {cartCount}
          </span>
        )}
      </button>

      {/* Orders / Tracking */}
      <button
        onClick={() => handleNavClick('tracking')}
        className={`flex flex-col items-center justify-center p-1.5 transition-all ${
          currentView === 'tracking'
            ? 'text-sky-600 font-extrabold scale-105'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <Package className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Tracking</span>
      </button>

      {/* Profile / Dashboard */}
      <button
        onClick={() => {
          if (currentUser.role === 'customer') {
            handleNavClick('customer-dashboard');
          } else if (currentUser.role === 'admin' || currentUser.role === 'manager') {
            handleNavClick('admin-dashboard');
          } else if (currentUser.role === 'laundry_staff') {
            handleNavClick('laundry-dashboard');
          } else if (currentUser.role === 'delivery_staff') {
            handleNavClick('rider-dashboard');
          } else {
            onOpenAuth();
          }
        }}
        className={`flex flex-col items-center justify-center p-1.5 transition-all ${
          currentView.includes('dashboard')
            ? 'text-sky-600 font-extrabold scale-105'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">
          {currentUser.role === 'customer' ? 'Account' : 'Portal'}
        </span>
      </button>
    </div>
  );
};
