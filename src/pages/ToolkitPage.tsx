import React, { useState } from 'react';
import { Download, Copy, Check, Terminal, CheckCircle2, FolderTree, Cpu, ShieldCheck, ExternalLink } from 'lucide-react';
import { FULL_SCRIPT_TEXT } from '../scriptText';

interface ToolkitPageProps {
  onDownloadScript: () => void;
}

export function ToolkitPage({ onDownloadScript }: ToolkitPageProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(FULL_SCRIPT_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testResults = [
    { file: '01_hello.axil', pipeline: '"Hello, World from Axil!\\n" | $', output: 'Hello, World from Axil!\n', size: '210 B', status: 'Passed' },
    { file: '02_arithmetic.axil', pipeline: '10 | + 20 | * 2 > total; total | $', output: '60\n', size: '345 B', status: 'Passed' },
    { file: '03_branches.axil', pipeline: '15 | ? [ < 18 : "Under 18\\n" | "Adult\\n" ] | $', output: 'Under 18\n', size: '250 B', status: 'Passed' },
    { file: '04_loop.axil', pipeline: '5 > n; 1 > acc; n | @ [ > 0 : ... ]; acc | $', output: '120\n', size: '418 B', status: 'Passed' },
    { file: '05_modulo.axil', pipeline: '17 | % 2 | ? [ == 0 : "Even" | "Odd" ] | $', output: 'Odd\n', size: '262 B', status: 'Passed' }
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-3">
            <span>Toolkit &amp; Compiler</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              v1.0
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>5/5 Tests Passing</span>
            </span>
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Download the self-extracting <code className="text-cyan-300 font-mono text-xs">setup_axil.sh</code> package to bootstrap the compiler and verification test suite.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-md bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white border border-slate-800 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied script' : 'Copy setup_axil.sh'}</span>
          </button>
          <button
            onClick={onDownloadScript}
            className="px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download (.sh)</span>
          </button>
        </div>
      </div>

      {/* 3-Step Setup Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
          <div className="text-cyan-400 font-mono text-xs font-semibold">01. Save Installer</div>
          <div className="text-xs text-slate-300 font-medium">Download or copy script</div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Make the file executable in your workspace directory:
          </p>
          <div className="p-2 rounded bg-black/80 font-mono text-xs text-cyan-300 border border-slate-850">
            chmod +x setup_axil.sh
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
          <div className="text-cyan-400 font-mono text-xs font-semibold">02. Bootstrap &amp; Test</div>
          <div className="text-xs text-slate-300 font-medium">Execute self-extraction</div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Scaffolds repo and compiles all 5 test programs:
          </p>
          <div className="p-2 rounded bg-black/80 font-mono text-xs text-cyan-300 border border-slate-850">
            ./setup_axil.sh
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
          <div className="text-cyan-400 font-mono text-xs font-semibold">03. Compile Native ELF</div>
          <div className="text-xs text-slate-300 font-medium">Build any .axil program</div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Emits standalone executable without linkers or libc:
          </p>
          <div className="p-2 rounded bg-black/80 font-mono text-xs text-cyan-300 border border-slate-850">
            python3 axil-lang/src/axilc.py app.axil
          </div>
        </div>
      </div>

      {/* Automated Test Harness Verification Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400 font-semibold uppercase">
            Test Harness Results (axil-lang/test_runner.sh)
          </div>
          <span className="text-xs font-mono text-emerald-400 font-medium">100% Automated Coverage</span>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Test Program</th>
                <th className="py-2.5 px-4 font-semibold hidden md:table-cell">Expression</th>
                <th className="py-2.5 px-4 font-semibold">Kernel Stdout</th>
                <th className="py-2.5 px-4 font-semibold hidden sm:table-cell">ELF Size</th>
                <th className="py-2.5 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {testResults.map((t) => (
                <tr key={t.file} className="hover:bg-slate-850/40 transition">
                  <td className="py-2.5 px-4 text-cyan-300 font-semibold">{t.file}</td>
                  <td className="py-2.5 px-4 text-slate-400 truncate max-w-xs hidden md:table-cell">{t.pipeline}</td>
                  <td className="py-2.5 px-4 text-slate-200">{JSON.stringify(t.output.trim())}</td>
                  <td className="py-2.5 px-4 text-slate-400 hidden sm:table-cell">{t.size}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="text-emerald-400 font-medium">{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scaffolding File Tree & Diagnostic Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
              <FolderTree className="w-3.5 h-3.5" />
              <span>Repository Scaffolding</span>
            </div>
            <a
              href="https://github.com/irealashu/Axil"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition flex items-center gap-1"
            >
              <span>github.com/irealashu/Axil</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="p-3.5 rounded-lg bg-black/85 border border-slate-850 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
            <pre>{`axil-lang/
├── src/axilc.py              # Pure Python 3 native ELF compiler
├── examples/                 # Canonical test programs
├── bin/                      # Compiled standalone executables
├── docs/                     # Full offline specification
└── test_runner.sh            # Automated verification harness`}</pre>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            <span>Compiler Diagnostic Flags</span>
          </div>
          <div className="p-3.5 rounded-lg bg-black/85 border border-slate-850 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto space-y-1.5">
            <div><span className="text-cyan-400">--readelf</span> : Decode and print ELF64 headers &amp; segments</div>
            <div><span className="text-cyan-400">--dump-asm</span>: Print generated x86-64 assembly instructions</div>
            <div><span className="text-cyan-400">--dump-hex</span>: Output colorized binary hexadecimal dump</div>
            <div><span className="text-cyan-400">--dump-tokens</span>: Display lexical token stream</div>
          </div>
        </div>
      </div>
    </div>
  );
}
