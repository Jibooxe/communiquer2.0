import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        viewBox="0 0 550 550"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
        role="img"
        aria-label="Logo Communiquer2.0"
      >
        {/* Laptop Icon */}
        <g>
          {/* Main Body (Blue) */}
          <rect x="40" y="100" width="160" height="100" rx="8" fill="#1D4ED8" />
          {/* Screen (Dark Blue) */}
          <rect x="50" y="110" width="140" height="80" rx="4" fill="#0D1B4E" />
          {/* Base */}
          <path d="M30 200 H210 V215 C210 220 205 225 200 225 H40 C35 225 30 220 30 215 V200 Z" fill="#1D4ED8" />
          <rect x="100" y="205" width="40" height="4" rx="2" fill="#172554" opacity="0.3" />
          
          {/* Decorative Cubes on Screen */}
          <rect x="60" y="120" width="22" height="22" rx="2" fill="#60A5FA" />
          <rect x="86" y="120" width="20" height="20" rx="2" fill="#1D4ED8" />
          <rect x="175" y="115" width="14" height="14" rx="2" fill="#172554" />
          <rect x="60" y="146" width="22" height="18" rx="2" fill="#1D4ED8" />
          <rect x="86" y="144" width="20" height="20" rx="2" fill="#60A5FA" />
          <rect x="110" y="144" width="22" height="20" rx="2" fill="#3B82F6" />
          <rect x="86" y="168" width="20" height="18" rx="2" fill="#1D4ED8" />
        </g>
        
        {/* Floating Pixels */}
        <rect x="195" y="15" width="16" height="16" rx="2" fill="#60A5FA" />
        <rect x="185" y="38" width="28" height="28" rx="4" fill="#3B82F6" />
        <rect x="215" y="65" width="12" height="12" rx="2" fill="#1D4ED8" />

        {/* Square Speech Bubble */}
        <g>
          <path d="M220 70 H330 C340 70 348 78 348 88 V145 C348 155 340 163 330 163 H235 L225 180 L223 163 H220 C210 163 202 155 202 145 V88 C202 78 210 70 220 70 Z" fill="#172554" />
          <rect x="220" y="92" width="80" height="10" rx="2" fill="#3B82F6" />
          <rect x="220" y="110" width="80" height="10" rx="2" fill="#3B82F6" />
          <rect x="220" y="128" width="70" height="10" rx="2" fill="#3B82F6" />
        </g>

        {/* Round Speech Bubble */}
        <g>
          <ellipse cx="430" cy="130" rx="80" ry="60" fill="#0D1B4E" />
          <path d="M375 175 L360 200 L395 182" fill="#0D1B4E" />
          <circle cx="400" cy="130" r="8" fill="white" />
          <circle cx="430" cy="130" r="8" fill="white" />
          <circle cx="460" cy="130" r="8" fill="white" />
          
          {/* Small thought bubbles */}
          <circle cx="370" cy="195" r="9" fill="#0D1B4E" />
          <circle cx="395" cy="210" r="6" fill="#0D1B4E" />
          <circle cx="410" cy="220" r="4" fill="#0D1B4E" />
        </g>

        {/* Head Silhouette Outline */}
        <g stroke="#0D1B4E" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M255 310 C255 240 365 240 365 310 C365 360 345 375 345 390 L345 405 H275 L275 390 C275 375 255 360 255 310 Z" />
          <path d="M245 415 S275 405 310 405 S375 415 375 415" />
          {/* Invisible support lines */}
          <path d="M275 385 H345" strokeOpacity="0.1" />
        </g>

        {/* Main Branding Text */}
        <text
          x="275"
          y="480"
          className="fill-[#0D1B4E] dark:fill-white font-black"
          style={{ fontSize: '50px', textAnchor: 'middle', letterSpacing: '2px', fontFamily: 'Inter, sans-serif' }}
        >
          COMMUNIQUER2.0
        </text>

        {/* Subtle separator line */}
        <rect x="175" y="500" width="200" height="1.5" fill="#94A3B8" opacity="0.5" />

        {/* Educational Slogan */}
        <text
          x="275"
          y="535"
          className="fill-blue-500 font-bold uppercase tracking-[0.4em]"
          style={{ fontSize: '18px', textAnchor: 'middle', fontFamily: 'Inter, sans-serif' }}
        >
          APPRENDRE AUTREMENT
        </text>
      </svg>
    </div>
  );
};
