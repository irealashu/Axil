import React, { useState, useMemo, useEffect } from 'react';
import Prism from 'prismjs';
import '../utils/prism-axil';
import { Search, Copy, Check, Play, BookOpen, Terminal, ChevronRight, Layers, FileCode } from 'lucide-react';
import { DOCUMENTATION_EXAMPLES, DocExample } from '../data/documentationExamples';
import { SPEC_CHAPTERS, SpecChapter } from '../data/specificationChapters';

interface DocsPageProps {
  onLoadExampleToPlayground: (code: string) => void;
}

export function DocsPage({ onLoadExampleToPlayground }: DocsPageProps) {
  const [docView, setDocView] = useState<'examples' | 'spec'>('examples');
  const [selectedExampleId, setSelectedExampleId] = useState<string>(DOCUMENTATION_EXAMPLES[0].id);
  const [selectedChapterNum, setSelectedChapterNum] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [selectedExampleId, selectedChapterNum, docView]);

  const categories = ['Algorithms', 'Systems', 'Business Logic', 'Finance'] as const;

  const currentExample = useMemo(() => {
    return DOCUMENTATION_EXAMPLES.find((ex) => ex.id === selectedExampleId) || DOCUMENTATION_EXAMPLES[0];
  }, [selectedExampleId]);

  const currentChapter = useMemo(() => {
    return SPEC_CHAPTERS.find((c) => c.num === selectedChapterNum) || SPEC_CHAPTERS[0];
  }, [selectedChapterNum]);

  const filteredExamples = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return DOCUMENTATION_EXAMPLES;
    return DOCUMENTATION_EXAMPLES.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.problem.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleCopyExample = () => {
    navigator.clipboard.writeText(currentExample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Documentation
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Field examples and formal language specification.
          </p>
        </div>

        {/* View Switcher: Examples vs Specification */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 text-xs font-medium">
          <button
            onClick={() => setDocView('examples')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              docView === 'examples'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Field Examples (22)</span>
          </button>
          <button
            onClick={() => setDocView('spec')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              docView === 'spec'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Specification (7)</span>
          </button>
        </div>
      </div>

      {/* VIEW A: FIELD EXAMPLES */}
      {docView === 'examples' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar: Search & Grouped Example Tree */}
          <aside className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-3 sticky top-20 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 22 examples..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Grouped Category Index */}
            <div className="space-y-4 pt-1">
              {categories.map((cat) => {
                const catItems = filteredExamples.filter((item) => item.category === cat);
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1">
                    <div className="px-2 text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                      {cat}
                    </div>
                    <div className="space-y-0.5">
                      {catItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedExampleId(item.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition cursor-pointer flex items-center justify-between ${
                            selectedExampleId === item.id
                              ? 'bg-slate-800 text-cyan-300 font-medium border border-slate-700/60 shadow-xs'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
                          }`}
                        >
                          <span className="truncate">{item.title}</span>
                          {selectedExampleId === item.id && (
                            <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right Main Article / Runner Pane */}
          <main className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
            {/* Header Metadata */}
            <div className="space-y-2 pb-5 border-b border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="text-cyan-400 font-semibold">{currentExample.category}</span>
                <span className="text-slate-500">{currentExample.complexity}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                {currentExample.title}
              </h2>
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                {currentExample.problem}
              </p>
            </div>

            {/* Code Viewer Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Axil Source Code:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyExample}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => onLoadExampleToPlayground(currentExample.code)}
                    className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run in Studio</span>
                  </button>
                </div>
              </div>
              <div className="rounded-lg bg-black/90 border border-slate-850 p-4 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                <pre className="language-axil"><code>{currentExample.code}</code></pre>
              </div>
            </div>

            {/* Expected Output */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-400">Kernel Standard Output ($ sink):</div>
              <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800/80 font-mono text-xs text-emerald-400">
                <pre className="whitespace-pre-wrap">{currentExample.expectedOutput}</pre>
              </div>
            </div>

            {/* Architectural Notes */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono text-slate-400">Hardware &amp; Execution Mechanism:</div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed p-4 rounded-lg bg-slate-950/60 border border-slate-800/60">
                {currentExample.description}
              </p>
            </div>
          </main>
        </div>
      )}

      {/* VIEW B: LANGUAGE SPECIFICATION */}
      {docView === 'spec' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Chapters Sidebar */}
          <aside className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 flex flex-col gap-1 sticky top-20 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
            <div className="px-2.5 py-1.5 text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              Chapters Index
            </div>
            {SPEC_CHAPTERS.map((chap) => (
              <button
                key={chap.num}
                onClick={() => setSelectedChapterNum(chap.num)}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between text-xs cursor-pointer ${
                  selectedChapterNum === chap.num
                    ? 'bg-slate-800 text-cyan-300 font-medium border border-slate-700/80 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-slate-500 text-[11px]">0{chap.num}.</span>
                  <span className="truncate">{chap.title}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${selectedChapterNum === chap.num ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'}`} />
              </button>
            ))}
          </aside>

          {/* Right Main Chapter Reader */}
          <main className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="space-y-3 pb-6 border-b border-slate-800/80">
              <div className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                Chapter 0{currentChapter.num}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                {currentChapter.title}
              </h2>
              <p className="text-sm text-cyan-200/80 font-mono bg-cyan-950/40 border border-cyan-900/60 rounded-lg p-3">
                {currentChapter.summary}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-sans pt-2">
                {currentChapter.body}
              </p>
            </div>

            {/* Code Snippet Box */}
            {currentChapter.codeSnippet && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400">Formal Definition / Opcodes:</div>
                <div className="p-4 rounded-xl bg-black/85 border border-slate-800 leading-relaxed text-cyan-300 overflow-x-auto text-xs font-mono">
                  <pre className="language-axil"><code>{currentChapter.codeSnippet}</code></pre>
                </div>
              </div>
            )}

            {/* Tables */}
            {currentChapter.tableHeaders && currentChapter.tableRows && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400">Architecture Mapping:</div>
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <div className={`p-3 bg-slate-900 border-b border-slate-800 font-semibold text-slate-400 text-xs grid grid-cols-${currentChapter.tableHeaders.length}`}>
                    {currentChapter.tableHeaders.map((th, idx) => (
                      <span key={idx}>{th}</span>
                    ))}
                  </div>
                  <div className="divide-y divide-slate-850 text-xs font-mono">
                    {currentChapter.tableRows.map((row, rIdx) => (
                      <div key={rIdx} className={`p-3 grid grid-cols-${currentChapter.tableHeaders!.length} hover:bg-slate-900/30 transition`}>
                        {row.map((cell, cIdx) => (
                          <span key={cIdx} className={cIdx === 0 ? 'text-cyan-300 font-semibold' : cIdx === 1 ? 'text-slate-200' : 'text-slate-400'}>
                            {cell}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Architectural Bullet Points */}
            {currentChapter.details && currentChapter.details.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono text-slate-400">Key Guarantees:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentChapter.details.map((d, dIdx) => (
                    <div key={dIdx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <div className="text-cyan-300 font-semibold text-xs font-sans">{d.label}</div>
                      <div className="text-slate-400 text-xs leading-relaxed font-sans">{d.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
