import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  Sparkles,
  Camera,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ServiceItem } from '../../types';

// Curated high quality preset images for common laundry and dry cleaning items
export const PRESET_GARMENT_IMAGES = [
  {
    id: 'p-shirt',
    label: 'Formal Shirt',
    category: 'Tops',
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-tshirt',
    label: 'T-Shirt (Folded)',
    category: 'Tops',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-trousers',
    label: 'Pant / Trousers',
    category: 'Bottoms',
    url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-jeans',
    label: 'Jeans / Denim',
    category: 'Bottoms',
    url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-kurta',
    label: 'Kurta (Traditional)',
    category: 'Ethnic',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-pajama',
    label: 'Pajama / Cotton Pants',
    category: 'Ethnic',
    url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-suit',
    label: 'Suit / Blazer / Coat',
    category: 'Formals',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-saree',
    label: 'Silk Saree / Designer',
    category: 'Ethnic',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-sherwani',
    label: 'Sherwani / Indo-Western',
    category: 'Ethnic',
    url: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-jacket',
    label: 'Jacket / Winter Coat',
    category: 'Winter',
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-sweater',
    label: 'Woolen Sweater',
    category: 'Winter',
    url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-blanket',
    label: 'Blanket / Heavy Quilt',
    category: 'Home Linen',
    url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-bedsheet',
    label: 'Bedsheet / Linen',
    category: 'Home Linen',
    url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-curtains',
    label: 'Curtains / Drapes',
    category: 'Home Linen',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-shoes',
    label: 'Sneakers / Shoes',
    category: 'Footwear',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'p-basket',
    label: 'Clean Laundry Basket',
    category: 'General',
    url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80',
  },
];

/**
 * Resizes and compresses image file via canvas to keep it lightweight (<80KB) for localStorage.
 */
export const compressImageFile = (
  file: File,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.8
): Promise<{ dataUrl: string; sizeKb: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
          resolve({ dataUrl, sizeKb });
        } else {
          const rawUrl = event.target?.result as string;
          resolve({ dataUrl: rawUrl, sizeKb: Math.round(file.size / 1024) });
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface ChangeServiceImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  onSave: (serviceId: string, newImageUrl: string) => void;
}

export const ChangeServiceImageModal: React.FC<ChangeServiceImageModalProps> = ({
  isOpen,
  onClose,
  service,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileSizeInfo, setFileSizeInfo] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [presetCategory, setPresetCategory] = useState<string>('all');

  useEffect(() => {
    if (service) {
      setSelectedImageUrl(service.image || '');
      setUrlInput(service.image || '');
      setFileSizeInfo('');
      setErrorMsg('');
    }
  }, [service, isOpen]);

  if (!isOpen || !service) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsProcessingFile(true);
      setErrorMsg('');
      const { dataUrl, sizeKb } = await compressImageFile(file, 600, 600, 0.82);
      setSelectedImageUrl(dataUrl);
      setFileSizeInfo(`Ready! Optimized to ~${sizeKb} KB`);
    } catch (err) {
      setErrorMsg('Failed to process image file. Please try another image.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Please enter a valid image URL');
      return;
    }
    setSelectedImageUrl(urlInput.trim());
    setErrorMsg('');
  };

  const handleSave = () => {
    if (!selectedImageUrl) {
      setErrorMsg('Please select or upload an image first.');
      return;
    }
    onSave(service.id, selectedImageUrl);
    onClose();
  };

  const presetCategories = ['all', 'Tops', 'Bottoms', 'Ethnic', 'Formals', 'Winter', 'Home Linen', 'Footwear'];
  const filteredPresets = PRESET_GARMENT_IMAGES.filter(
    (p) => presetCategory === 'all' || p.category === presetCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl z-10 border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-brand-50 text-brand-600 rounded-lg">
                <Camera className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-base text-slate-900">
                Change Service Image
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Updating photo for: <span className="font-bold text-slate-800">{service.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1.5 pt-4 pb-2 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload from Device</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'presets'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preset Gallery</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'url'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL Link</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: DEVICE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center transition-all bg-slate-50/50 hover:bg-brand-50/30">
                <input
                  type="file"
                  id="service-image-file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="service-image-file"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center shadow-sm">
                    {isProcessingFile ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-brand-700 hover:underline">
                      Click to choose image file
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select photo from your phone or computer (JPG, PNG, WebP)
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 font-semibold">
                    Auto-optimized for instant fast loading
                  </span>
                </label>
              </div>

              {fileSizeInfo && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{fileSizeInfo}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRESET GALLERY */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                {presetCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPresetCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                      presetCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Preset Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedImageUrl === preset.url;
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => {
                        setSelectedImageUrl(preset.url);
                        setErrorMsg('');
                      }}
                      className={`group relative rounded-xl overflow-hidden border-2 text-left transition-all aspect-square flex flex-col justify-end p-2 ${
                        isSelected
                          ? 'border-brand-600 shadow-md ring-2 ring-brand-500/30'
                          : 'border-slate-200 hover:border-brand-400'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="relative z-10">
                        <span className="text-[11px] font-bold text-white block truncate leading-tight">
                          {preset.label}
                        </span>
                        <span className="text-[9px] text-slate-300 uppercase font-semibold">
                          {preset.category}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-sm z-10">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="font-bold text-xs text-slate-700 block mb-1">
                  Paste Online Image URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW SECTION */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Photo Preview Comparison
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Current Image */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                  Current Photo
                </span>
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                  <img
                    src={service.image}
                    alt="Current"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
              </div>

              {/* Selected / New Image */}
              <div className="p-3 bg-brand-50/50 rounded-2xl border border-brand-200 flex flex-col items-center">
                <span className="text-[10px] font-bold text-brand-700 uppercase mb-1.5">
                  New Selected Photo
                </span>
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-200 border-2 border-brand-500 shadow-sm relative">
                  {selectedImageUrl ? (
                    <img
                      src={selectedImageUrl}
                      alt="New Selected"
                      className="w-full h-full object-cover"
                      onError={() => setErrorMsg('Image failed to load. Check URL or choose another image.')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedImageUrl || isProcessingFile}
            className="px-6 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Update Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
