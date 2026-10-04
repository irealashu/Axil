import React from 'react';
import { PageId } from './Navbar';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-slate-850 bg-slate-950 px-4 sm:px-6 lg:px-8 py-6 text-xs text-slate-500 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Axil Logo" className="w-4 h-4 object-contain" />
          <span className="font-mono text-slate-300 font-semibold text-xs">Axil</span>
        </div>

        {/* Required Attribution */}
        <div className="text-slate-400 font-mono text-[11px] text-center">
          &copy; 2026 The Axil Language, Ashutosh Singh (@irealashu) &amp; Contributors. Released under the Apache 2.0 Licence.
        </div>
      </div>
    </footer>
  );
}
