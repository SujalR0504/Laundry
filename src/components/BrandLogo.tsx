import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBranches?: boolean;
  showTagline?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showBranches = true,
  showTagline = true,
  theme = 'light',
  className = '',
}) => {
  const sizeMap = {
    xs: {
      img: 'w-8 h-8',
      title: 'text-sm font-black',
      tagline: 'text-[9px]',
      badge: 'text-[8px] px-1 py-0.2',
    },
    sm: {
      img: 'w-10 h-10',
      title: 'text-base font-black',
      tagline: 'text-[10px]',
      badge: 'text-[9px] px-1.5 py-0.5',
    },
    md: {
      img: 'w-10 h-10 sm:w-14 sm:h-14',
      title: 'text-lg sm:text-2xl font-black',
      tagline: 'text-[11px]',
      badge: 'text-[10px] px-2 py-0.5',
    },
    lg: {
      img: 'w-14 h-14 sm:w-20 sm:h-20',
      title: 'text-xl sm:text-3xl font-black',
      tagline: 'text-xs',
      badge: 'text-xs px-2.5 py-1',
    },
    xl: {
      img: 'w-20 h-20 sm:w-28 sm:h-28',
      title: 'text-2xl sm:text-5xl font-black',
      tagline: 'text-sm',
      badge: 'text-xs px-3 py-1',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center space-x-2 sm:space-x-3 select-none ${className}`}>
      {/* 3D Rounded Logo Frame with subtle glow */}
      <div
        className={`relative ${currentSize.img} rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-md shadow-sky-500/20 border border-slate-200/90 flex items-center justify-center p-1 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-sky-500/30 shrink-0 ring-1 sm:ring-2 ring-sky-100`}
      >
        <img
          src="/logo-icon.png"
          alt="The Laundry Lounge Logo"
          className="w-full h-full object-contain filter drop-shadow-xs"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo-icon.jpg';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center space-x-1.5 sm:space-x-2 leading-none">
            <span
              className={`${currentSize.title} font-display tracking-tight truncate ${
                theme === 'dark' ? 'text-white' : 'text-sky-600'
              }`}
            >
              The Laundry{' '}
              <span className="text-rose-600 font-display font-black">Lounge</span>
            </span>
            {showBranches && (
              <span
                className={`${currentSize.badge} uppercase font-black tracking-wider rounded-full bg-rose-500/10 text-rose-600 border border-rose-300/70 shadow-2xs hidden sm:inline-flex items-center space-x-1 backdrop-blur-xs`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>Rewa (M.P.)</span>
              </span>
            )}
          </div>

          {showTagline && (
            <p
              className={`${currentSize.tagline} ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              } font-semibold mt-0.5 hidden sm:flex items-center space-x-1.5 truncate`}
            >
              <span className="text-sky-600 font-bold">2 Branches:</span>
              <span className="truncate text-slate-600">Nehru Nagar & Hari Om (Ring Road)</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
