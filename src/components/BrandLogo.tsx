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
      title: 'text-sm font-bold',
      tagline: 'text-[9px]',
      badge: 'text-[8px] px-1 py-0.2',
    },
    sm: {
      img: 'w-10 h-10',
      title: 'text-base font-bold',
      tagline: 'text-[10px]',
      badge: 'text-[9px] px-1.5 py-0.5',
    },
    md: {
      img: 'w-10 h-10 sm:w-12 sm:h-12',
      title: 'text-lg sm:text-xl font-bold',
      tagline: 'text-[11px]',
      badge: 'text-[10px] px-2 py-0.5',
    },
    lg: {
      img: 'w-12 h-12 sm:w-16 sm:h-16',
      title: 'text-xl sm:text-2xl font-bold',
      tagline: 'text-xs',
      badge: 'text-xs px-2.5 py-1',
    },
    xl: {
      img: 'w-16 h-16 sm:w-20 sm:h-20',
      title: 'text-2xl sm:text-3xl font-bold',
      tagline: 'text-sm',
      badge: 'text-xs px-3 py-1',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center space-x-2 sm:space-x-3 select-none ${className}`}>
      {/* 3D Rounded Logo Frame with subtle glow */}
      <div
        className={`relative ${currentSize.img} rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200/90 flex items-center justify-center p-1 transition-all duration-300 group-hover:scale-105 shrink-0`}
      >
        <img
          src="/logo-icon.png"
          alt="The Laundry Lounge Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo-icon.jpg';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center min-w-0 shrink-0">
          <div className="flex items-center space-x-2 leading-none whitespace-nowrap">
            <span
              className={`${currentSize.title} tracking-tight shrink-0 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              The Laundry{' '}
              <span className="text-[#e11d48] font-bold">Lounge</span>
            </span>
          </div>

          {showTagline && (
            <p
              className={`${currentSize.tagline} ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              } font-medium mt-1 hidden md:flex items-center space-x-1.5 whitespace-nowrap`}
            >
              <span className="text-sky-600 font-bold">2 Branches:</span>
              <span className="text-slate-600">Arun Nagar &amp; Ring Road</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
