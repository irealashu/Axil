import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export type PageId = 'home' | 'studio' | 'docs' | 'toolkit' | 'whats-new';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'studio', label: 'Developer Studio' },
    { id: 'docs', label: 'Documentation' },
    { id: 'toolkit', label: 'Toolkit' },
    { id: 'whats-new', label: 'What\'s New' }
  ];

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-white/[0.06] bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        {/* Brand Left */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 group focus:outline-none cursor-pointer text-left shrink-0"
          title="Axil Home"
        >
          <img
            src="/logo.svg"
            alt="Axil Logo"
            className="w-7 h-7 object-contain drop-shadow-[0_2px_10px_rgba(6,182,212,0.35)] group-hover:scale-105 transition-transform"
          />
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg tracking-tight text-white font-mono">Axil</span>
          </div>
        </button>

        {/* Desktop Navigation: Pushed to Right */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium ml-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                currentPage === item.id
                  ? 'bg-slate-800/90 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer ml-auto"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-850 bg-slate-950 px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition cursor-pointer flex items-center justify-between ${
                currentPage === item.id
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>{item.label}</span>
              {currentPage === item.id && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
