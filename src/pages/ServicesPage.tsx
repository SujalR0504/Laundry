import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  Clock,
  Sparkles,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  ArrowRight,
  Info,
  BookOpen,
  X,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ServiceItem } from '../types';

export const ServicesPage: React.FC = () => {
  const { categories, services, cart, addToCart, updateCartQuantity, setCurrentView, getCartCount, getCartSubtotal } =
    useApp();

  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'turnaround'>('default');
  const [selectedNotes, setSelectedNotes] = useState<{ [serviceId: string]: string }>({});
  const [starchChoices, setStarchChoices] = useState<{ [serviceId: string]: boolean }>({});
  const [showFabricCareModal, setShowFabricCareModal] = useState(false);

  let filteredServices = services.filter((svc) => {
    if (!svc.active) return false;
    const matchesCat = selectedCatId === 'all' || svc.categoryId === selectedCatId;
    const matchesSearch =
      svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Sorting
  if (sortBy === 'price-low') {
    filteredServices.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredServices.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'turnaround') {
    filteredServices.sort((a, b) => a.turnaroundHours - b.turnaroundHours);
  }

  const getItemCartQuantity = (serviceId: string) => {
    const item = cart.find((i) => i.serviceId === serviceId);
    return item ? item.quantity : 0;
  };

  const handleAddService = (service: ServiceItem) => {
    const notes = selectedNotes[service.id] || '';
    const starch = starchChoices[service.id] || false;
    addToCart(service, 1, service.price, notes, starch);
  };

  const cartCount = getCartCount();
  const subtotal = getCartSubtotal();

  const fabricCareTips = [
    {
      fabric: 'Pure Silk & Kanjivaram',
      process: 'Chemical dry clean with non-aqueous silicon solvent & mild steam rolling at 60°C.',
      icon: '🥻',
    },
    {
      fabric: 'Fine Wool & Cashmere',
      process: 'Low agitation wash with lanolin conditioning to prevent shrinkage and fiber felting.',
      icon: '🧶',
    },
    {
      fabric: 'Zari & Wedding Embroidery',
      process: 'Sealed nylon net encapsulation & hand spot-treatment of beads and mirrors.',
      icon: '✨',
    },
    {
      fabric: 'Egyptian Cotton & Linens',
      process: 'Sanitizing 70°C ozone wash with natural rice starching for crisp structure.',
      icon: '👔',
    },
    {
      fabric: 'Leather & Suede Bags',
      process: 'pH-neutral specialized saddle balm conditioning, stain lift, and water-repellent seal.',
      icon: '👜',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Transparent Price Catalogue
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Services & Doorstep Pricing
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Browse our complete menu of dry cleaning, normal wash & steam iron, and rolling press. No
          hidden fees, 100% itemized billing.
        </p>

        {/* Fabric Care Guide Button */}
        <div className="pt-1">
          <button
            onClick={() => setShowFabricCareModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-600" />
            <span>Read Fabric Care & Solvent Standards</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-soft-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pill Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCatId === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Services ({services.filter((s) => s.active).length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCatId === cat.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Right side: Search & Sorting */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="default">Sort by: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="turnaround">Turnaround: Fast first</option>
          </select>

          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garment (e.g. Saree, Kurta)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredServices.map((service) => {
          const qty = getItemCartQuantity(service.id);
          const hasStarch = service.hasStarchOption;

          let displayPrice = `₹${service.price}`;
          if (service.priceType === 'range') {
            displayPrice = `₹${service.minPrice} – ₹${service.maxPrice}`;
          } else if (service.priceType === 'custom_quote') {
            displayPrice = `₹${service.minPrice} – ₹${service.maxPrice}`;
          }

          return (
            <div
              key={service.id}
              className={`bg-white rounded-3xl border transition-all p-4 flex flex-col justify-between ${
                qty > 0
                  ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-soft-md'
                  : 'border-slate-200 shadow-soft-sm hover:shadow-soft-md hover:border-slate-300'
              }`}
            >
              <div>
                {/* Image */}
                <div className="relative h-40 rounded-2xl overflow-hidden mb-3 bg-slate-100 group">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-accent-400" />
                    <span>{service.turnaroundHours}h</span>
                  </div>

                  {service.customQuoteRequired && (
                    <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Quote on inspection
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{service.name}</h3>
                </div>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                {/* Starch choice option if applicable */}
                {hasStarch && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Starch Option:</span>
                    <button
                      onClick={() =>
                        setStarchChoices((prev) => ({
                          ...prev,
                          [service.id]: !prev[service.id],
                        }))
                      }
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                        starchChoices[service.id]
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {starchChoices[service.id] ? 'With Starch' : 'Without Starch'}
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Price & Add to Cart Controls */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-base font-extrabold text-slate-900 leading-tight">
                    {displayPrice}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">per {service.unit}</div>
                </div>

                {qty > 0 ? (
                  <div className="flex items-center space-x-2 bg-brand-50 border border-brand-200 rounded-xl p-1">
                    <button
                      onClick={() => updateCartQuantity(service.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white text-brand-700 flex items-center justify-center font-bold text-xs shadow-2xs hover:bg-brand-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black text-brand-900 px-1.5">{qty}</span>
                    <button
                      onClick={() => updateCartQuantity(service.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white text-brand-700 flex items-center justify-center font-bold text-xs shadow-2xs hover:bg-brand-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddService(service)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <p className="text-slate-500 font-medium">No garments match your search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCatId('all');
            }}
            className="mt-3 px-4 py-2 bg-brand-50 text-brand-700 rounded-xl text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* FABRIC CARE STANDARDS MODAL */}
      {showFabricCareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setShowFabricCareModal(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl z-10 border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  AquaPure Fabric Care & Solvent Standards
                </h3>
              </div>
              <button
                onClick={() => setShowFabricCareModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              We employ strict German hydrocarbon cleaning, low-temperature tumble drying, and vacuum
              steam finishing machines calibrated specifically per garment fiber:
            </p>

            <div className="space-y-3">
              {fabricCareTips.map((tip, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1">
                    <span className="text-lg">{tip.icon}</span>
                    <span>{tip.fabric}</span>
                  </div>
                  <p className="text-slate-600 pl-7 text-[11px] leading-relaxed">{tip.process}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowFabricCareModal(false)}
                className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs"
              >
                Got It, Thank You
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Checkout Bar when items added */}
      {cartCount > 0 && (
        <div className="fixed bottom-14 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-accent-300" />
              </div>
              <div>
                <div className="font-extrabold text-sm">{cartCount} items selected</div>
                <div className="text-xs text-brand-300">Subtotal: ₹{subtotal}</div>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('booking')}
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 transition-transform active:scale-95"
            >
              <span>Book Pickup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
