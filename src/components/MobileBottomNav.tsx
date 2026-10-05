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
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
      {/* Home */}
      <button
        onClick={() => handleNavClick('home')}
        className={`flex flex-col items-center justify-center p-1 ${
          currentView === 'home' ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      {/* Services */}
      <button
        onClick={() => handleNavClick('services')}
        className={`flex flex-col items-center justify-center p-1 ${
          currentView === 'services' ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Shirt className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Services</span>
      </button>

      {/* Center Action: Book Pickup */}
      <button
        onClick={() => handleNavClick('booking')}
        className="relative -top-3 flex flex-col items-center justify-center p-2.5 bg-gradient-to-r from-brand-600 to-accent-600 rounded-full text-white shadow-lg shadow-brand-500/30 active:scale-95 transition-transform"
      >
        <CalendarCheck className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-400 text-brand-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
            {cartCount}
          </span>
        )}
      </button>

      {/* Orders / Tracking */}
      <button
        onClick={() => handleNavClick('tracking')}
        className={`flex flex-col items-center justify-center p-1 ${
          currentView === 'tracking' ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Package className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Orders</span>
      </button>

      {/* Profile / Dashboard based on role */}
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
        className={`flex flex-col items-center justify-center p-1 ${
          currentView.includes('dashboard') ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">
          {currentUser.role === 'customer' ? 'Profile' : 'Dashboard'}
        </span>
      </button>
    </div>
  );
};
