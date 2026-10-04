import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AxilLogo } from './AxilLogo';

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
          title="Axil v1.0 Home"
        >
          <AxilLogo className="w-7 h-7 object-contain drop-shadow-[0_2px_10px_rgba(6,182,212,0.35)] group-hover:scale-105 transition-transform" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-white font-mono">Axil</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 tracking-wide">
              v1.0
            </span>
          </div>
        </button>

        {/* Desktop Navigation: Pushed to Right */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium ml-auto">
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

          {/* GitHub Repository Link */}
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <a
            href="https://github.com/irealashu/Axil"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 transition border border-transparent hover:border-slate-800"
            title="GitHub: irealashu/Axil"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
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
          <a
            href="https://github.com/irealashu/Axil"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-900 flex items-center gap-2"
          >
            <svg className="w-4 h-4 fill-current text-slate-400" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub Repository</span>
          </a>
        </div>
      )}
    </header>
  );
}
