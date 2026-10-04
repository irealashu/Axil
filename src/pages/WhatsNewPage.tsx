import React from 'react';

export function WhatsNewPage() {
  const sections = [
    {
      title: "v1.0 Core Language & Compiler",
      items: [
        { title: "Zero-Dependency Standalone ELF64", desc: "Official v1.0 release of axilc.py capable of compiling keyword-free stream code directly into native Linux x86-64 ELF executables with zero libc or external assembler dependencies." },
        { title: "Structured Pattern Matching", desc: "Replaced limited ternary logic with powerful, readable match tables for cleaner control flow." },
        { title: "Tuple Streaming Primitives", desc: "Introduced native support for passing multiple values through the pipeline without auxiliary variables." },
        { title: "High-Precision Source Diagnostics", desc: "Compiler tracks precise column and line offsets for visual error indicators (^)." }
      ]
    },
    {
      title: "Developer Studio & Tooling",
      items: [
        { title: "Pure-Black Production Studio", desc: "Unified high-performance workspace with instant split-pane terminal inspection (stdout, strace, hexdump)." },
        { title: "Direct Pipeline Controls", desc: "Integrated the primary Run action directly into the code editor toolbar with instant keyboard execution (Ctrl+Enter / Cmd+Enter)." },
        { title: "Live Register & Stack Dock", desc: "Real-time state inspection for hardware registers (RAX, RBX, RBP, RSP), stack frame variables, and ELF64 header fields." }
      ]
    },
    {
      title: "Systems & Memory Foundations",
      items: [
        { title: "Sized Types & Pointers", desc: "Foundational implementation of native bit-width types (u8, u16, u32, u64, f64) and address-of/dereference operators for systems programming." },
        { title: "Linear Memory Scope Safety", desc: "Deterministic scope cleanup backed by direct kernel mmap allocations." }
      ]
    },
    {
      title: "Open Source & Distribution",
      items: [
        { title: "Official GitHub Release (v1.0)", desc: "Full open-source release on GitHub (irealashu/Axil) with Apache 2.0 license, contributing guide, and GitHub Actions CI/CD." },
        { title: "100% Automated Test Suite", desc: "Automated verification test runner (test_runner.sh) covering all language primitives with 100% pass verification." }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            What's New in Axil
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            v1.0
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Language evolution, compiler updates, and toolchain upgrades.
        </p>
      </div>

      {/* Release Sections */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 sm:p-6">
            <h2 className="text-base font-semibold text-white mb-4">{section.title}</h2>
            <div className="space-y-3.5">
              {section.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1 h-5 bg-cyan-400 rounded-full shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-xs sm:text-sm text-slate-200">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
