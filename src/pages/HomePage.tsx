import React from 'react';
import { ArrowRight, Download, Terminal } from 'lucide-react';
import { PageId } from '../components/Navbar';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[320px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Release Pill Badge */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => onNavigate('whats-new')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium hover:bg-cyan-500/20 transition cursor-pointer shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Axil v1.0 Released</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-300/90 hover:text-cyan-200">What's New &rarr;</span>
          </button>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
          Keyword-free code.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">
            Compiled straight to native ELF.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-5 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-balance">
          Axil is a stream-directional programming language that compiles directly into standalone Linux executables with zero external dependencies — no GCC, no Clang, no libc.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('studio')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('toolkit')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Toolkit</span>
          </button>
          <a
            href="https://github.com/irealashu/Axil"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current text-slate-400" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>

        {/* Quick Code Snippet Box */}
        <div className="mt-12 max-w-xl mx-auto rounded-xl bg-slate-950/80 border border-slate-800/80 p-4 text-left font-mono text-xs shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-900 text-slate-500">
            <span className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>main.axil</span>
            </span>
            <span>x86_64 ELF64</span>
          </div>
          <div className="text-cyan-300 space-y-1">
            <p className="text-slate-500">// Direct stream pipeline to Linux stdout</p>
            <p className="text-emerald-300 font-semibold">{`"Hello, World from Axil!\\n"`} <span className="text-cyan-400">|</span> <span className="text-amber-400">$</span></p>
          </div>
        </div>
      </section>

      {/* 2. ARCHITECTURAL PILLARS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5 p-6 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <h3 className="text-base font-semibold text-white">Stream Directionality</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Values flow linearly into operations via the pipe (<code className="text-cyan-300 font-mono">|</code>) operator. Variable assignments (<code className="text-cyan-300 font-mono">&gt;</code>) and stdout sinks (<code className="text-cyan-300 font-mono">$</code>) eliminate precedence ambiguity and keyword boilerplate.
            </p>
          </div>

          <div className="space-y-2.5 p-6 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <h3 className="text-base font-semibold text-white">Raw Linux Syscalls</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Generated binaries invoke <code className="text-cyan-300 font-mono">sys_write (1)</code> and <code className="text-cyan-300 font-mono">sys_exit (60)</code> via raw <code className="text-cyan-300 font-mono">0F 05</code> machine opcodes. No glibc, musl, or external C runtime files are referenced.
            </p>
          </div>

          <div className="space-y-2.5 p-6 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <h3 className="text-base font-semibold text-white">Standalone ELF64 Generation</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              The compiler packs the 64-byte Ehdr and 56-byte Phdr directly into a single loadable segment mapped to virtual address <code className="text-cyan-300 font-mono">0x400000</code> using standard Python 3.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
