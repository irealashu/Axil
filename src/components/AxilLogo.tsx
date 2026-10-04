import React from 'react';

interface AxilLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function AxilLogo({ className = 'w-7 h-7', ...props }: AxilLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      aria-label="Axil Logo"
      role="img"
      {...props}
    >
      <defs>
        <radialGradient id="nav-axil-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.32" />
          <stop offset="60%" stopColor="#0284c7" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="nav-facet-top" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="35%" stopColor="#22d3ee" />
          <stop offset="70%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>

        <linearGradient id="nav-facet-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="25%" stopColor="#0284c7" />
          <stop offset="65%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>

        <linearGradient id="nav-facet-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="35%" stopColor="#0f766e" />
          <stop offset="75%" stopColor="#115e59" />
          <stop offset="100%" stopColor="#042f2e" />
        </linearGradient>

        <linearGradient id="nav-facet-front-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        <linearGradient id="nav-facet-front-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#134e4a" />
        </linearGradient>

        <linearGradient id="nav-core-plasma" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#a5f3fc" />
          <stop offset="55%" stopColor="#38bdf8" />
          <stop offset="85%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="nav-specular-top" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#a5f3fc" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
        </linearGradient>

        <linearGradient id="nav-specular-spine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#67e8f9" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#0284c7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#083344" stopOpacity="0.2" />
        </linearGradient>

        <linearGradient id="nav-inner-void" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="60%" stopColor="#041226" />
          <stop offset="100%" stopColor="#08203e" />
        </linearGradient>

        <filter id="nav-shadow-floor" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="24" stdDeviation="20" floodColor="#020617" floodOpacity="0.9" />
        </filter>

        <filter id="nav-laser-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur1" />
          <feGaussianBlur stdDeviation="2" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient Radial Aura */}
      <circle cx="256" cy="256" r="235" fill="url(#nav-axil-glow)" />

      {/* Ground Shadow */}
      <ellipse cx="256" cy="460" rx="170" ry="38" fill="#010409" opacity="0.75" />

      {/* Main 3D Prism Structure */}
      <g filter="url(#nav-shadow-floor)">
        {/* Left Isometric Facet */}
        <path d="M 256 52 L 78 155 L 78 355 L 256 458 L 256 255 Z" fill="url(#nav-facet-left)" />

        {/* Right Isometric Facet */}
        <path d="M 256 52 L 434 155 L 434 355 L 256 458 L 256 255 Z" fill="url(#nav-facet-right)" />

        {/* Top Roof Cap */}
        <path d="M 256 52 L 434 155 L 256 255 L 78 155 Z" fill="url(#nav-facet-top)" />

        {/* Inner Chamber */}
        <g>
          <path d="M 256 120 L 372 186 L 372 340 L 256 406 L 140 340 L 140 186 Z" fill="url(#nav-inner-void)" />
          <path d="M 140 186 L 256 252 L 256 406 L 140 340 Z" fill="#031f38" opacity="0.9" />
          <path d="M 256 252 L 372 186 L 372 340 L 256 406 Z" fill="#032a26" opacity="0.95" />
          <path d="M 256 120 L 372 186 L 256 252 L 140 186 Z" fill="#063e5e" opacity="0.8" />
        </g>

        {/* Monolith A Structure */}
        <path d="M 256 116 L 256 160 L 182 358 L 132 358 Z" fill="url(#nav-facet-front-left)" />
        <path d="M 256 116 L 256 160 L 330 358 L 380 358 Z" fill="url(#nav-facet-front-right)" />
        <path d="M 174 274 L 338 274 L 324 308 L 188 308 Z" fill="#0284c7" />

        {/* Specular Edges */}
        <path d="M 78 155 L 256 52" stroke="url(#nav-specular-top)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M 256 52 L 434 155" stroke="url(#nav-specular-top)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
        <path d="M 256 255 L 256 458" stroke="url(#nav-specular-spine)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M 78 155 L 78 355" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 434 155 L 434 355" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M 78 355 L 256 458 L 434 355" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />

        {/* Neon Core Conduit */}
        <g filter="url(#nav-laser-glow)">
          <path d="M 158 350 L 256 152 L 354 350" fill="none" stroke="url(#nav-core-plasma)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 198 262 L 314 262" fill="none" stroke="#e0f2fe" strokeWidth="12" strokeLinecap="round" />
          <polygon points="256,128 266,150 256,144 246,150" fill="#ffffff" />
          <circle cx="256" cy="152" r="8" fill="#ffffff" />
          <circle cx="256" cy="262" r="7" fill="#67e8f9" />
          <circle cx="198" cy="262" r="5" fill="#38bdf8" />
          <circle cx="314" cy="262" r="5" fill="#2dd4bf" />
          <circle cx="158" cy="350" r="6" fill="#06b6d4" />
          <circle cx="354" cy="350" r="6" fill="#10b981" />
        </g>

        {/* Lens Glint */}
        <g transform="translate(256, 52)">
          <ellipse cx="0" cy="0" rx="14" ry="1.5" fill="#ffffff" opacity="0.9" />
          <ellipse cx="0" cy="0" rx="1.5" ry="14" fill="#ffffff" opacity="0.9" />
          <circle cx="0" cy="0" r="3" fill="#ffffff" />
        </g>
      </g>
    </svg>
  );
}
