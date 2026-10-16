import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { cart, removeFromCart, updateCartQuantity, getCartSubtotal, businessSettings } = useApp();

  if (!isOpen) return null;

  const subtotal = getCartSubtotal();
  const freeThreshold = businessSettings.freeDeliveryThreshold;
  const neededForFree = Math.max(0, freeThreshold - subtotal);
  const minOrder = businessSettings.minOrderValue;
  const isBelowMin = subtotal < minOrder;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-brand-900 to-brand-800 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Your Laundry Basket</h3>
                <p className="text-xs text-brand-200">
                  {cart.length} {cart.length === 1 ? 'service item' : 'service items'} selected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free delivery threshold progress bar */}
          <div className="bg-brand-50 p-4 border-b border-brand-100">
            {neededForFree > 0 ? (
              <div>
                <div className="flex justify-between text-xs font-semibold text-brand-900 mb-1">
                  <span>Add ₹{neededForFree} more for FREE Delivery</span>
                  <span>₹{subtotal} / ₹{freeThreshold}</span>
                </div>
                <div className="w-full h-2 bg-brand-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center text-xs font-bold text-emerald-700 space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>🎉 Congratulations! You unlocked FREE Delivery!</span>
              </div>
            )}
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-slate-300" />
                </div>
                <h4 className="font-bold text-slate-700 text-lg">Your basket is empty</h4>
                <p className="text-sm mt-1 text-slate-500 max-w-xs">
                  Select services from dry cleaning, wash & iron, or steam pressing to schedule a pickup.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.serviceId}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-brand-200 transition-all shadow-soft-sm flex space-x-3.5"
                >
                  <img
                    src={item.service.image}
                    alt={item.service.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">
                          {item.service.name}
                        </h4>
                        <span className="text-xs text-brand-600 font-medium">
                          ₹{item.selectedPrice} / {item.service.unit}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.serviceId)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.specialInstructions && (
                      <p className="text-xs text-slate-500 mt-1 italic truncate">
                        Note: {item.specialInstructions}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => updateCartQuantity(item.serviceId, -1)}
                          className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center shadow-xs hover:bg-slate-200 text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.serviceId, 1)}
                          className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center shadow-xs hover:bg-slate-200 text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="font-extrabold text-slate-900 text-sm">
                        ₹{item.selectedPrice * item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Actions */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 safe-area-bottom">
              <div className="space-y-1.5 mb-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Estimated GST (18%)</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Doorstep Pickup</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
              </div>

              {isBelowMin && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium mb-3">
                  ⚠️ Minimum order amount is ₹{minOrder}. Add ₹{minOrder - subtotal} more to schedule
                  pickup.
                </div>
              )}

              <button
                disabled={isBelowMin}
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 text-white shadow-lg transition-all ${
                  isBelowMin
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-700 active:scale-[0.99] shadow-brand-500/25'
                }`}
              >
                <span>Select Address & Pickup Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-3 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sanitized wash • Eco solvents • On-time guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
