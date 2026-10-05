import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { InvoiceModal } from './components/InvoiceModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { BookingPage } from './pages/BookingPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LaundryStaffPage } from './pages/LaundryStaffPage';
import { DeliveryStaffPage } from './pages/DeliveryStaffPage';

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { currentView, setCurrentView, toasts, dismissToast } = useApp();

  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-brand-500 selection:text-white pb-16 sm:pb-0">
      {/* Top Navigation */}
      <Navbar
        onOpenCart={() => setCartOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'services' && <ServicesPage />}
        {currentView === 'booking' && <BookingPage />}
        {currentView === 'tracking' && <OrderTrackingPage />}
        {currentView === 'customer-dashboard' && <CustomerDashboardPage />}
        {currentView === 'admin-dashboard' && <AdminDashboardPage />}
        {currentView === 'laundry-dashboard' && <LaundryStaffPage />}
        {currentView === 'rider-dashboard' && <DeliveryStaffPage />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile App Style Bottom Navigation Bar */}
      <MobileBottomNav onOpenAuth={() => setAuthOpen(true)} />

      {/* Floating WhatsApp Action */}
      <FloatingWhatsApp />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onProceedToCheckout={() => setCurrentView('booking')}
      />

      {/* Role Switcher & Auth Modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Printable Tax Invoice Modal */}
      <InvoiceModal />

      {/* Global Toast Notifications Stack */}
      <div className="fixed bottom-20 sm:bottom-6 left-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white transition-all transform animate-in slide-in-from-bottom-2 ${
              toast.type === 'error'
                ? 'bg-rose-600'
                : toast.type === 'info'
                ? 'bg-slate-900'
                : 'bg-emerald-600'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="ml-2 p-0.5 rounded hover:bg-white/20"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
