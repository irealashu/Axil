import React, { useState } from 'react';
import { AxilEditor } from '../components/AxilEditor';
import {
  Play,
  Terminal,
  Trash2,
  Activity,
  Binary,
  Cpu,
  FileCode
} from 'lucide-react';
import { executeAxil, ExecutionResult } from '../utils/axilInterpreter';

export interface PlaygroundPreset {
  id: string;
  name: string;
  filename: string;
  code: string;
  description: string;
}

export const PLAYGROUND_PRESETS: PlaygroundPreset[] = [
  {
    id: 'hello',
    name: '01_hello.axil',
    filename: '01_hello.axil',
    code: `"Hello, World from Axil!\\n" | $`,
    description: 'String stream literal dispatched directly to Linux stdout ($ sink) via sys_write (1).'
  },
  {
    id: 'arithmetic',
    name: '02_arithmetic.axil',
    filename: '02_arithmetic.axil',
    code: `10 | + 20 | * 2 > total\ntotal | $`,
    description: 'Associative arithmetic stream: (10 + 20) * 2 = 60 stored in [RBP - 8], recalled and emitted as decimal digits.'
  },
  {
    id: 'branches',
    name: '03_branches.axil',
    filename: '03_branches.axil',
    code: `15 | ? [ < 18 : "Under 18\\n" | "Adult\\n" ] | $`,
    description: 'Keyword-free conditional aperture. Tests stream head 15 against 18, routes to true branch descriptor.'
  },
  {
    id: 'loop',
    name: '04_loop.axil',
    filename: '04_loop.axil',
    code: `5 > n\n1 > acc\nn | @ [ > 0 : acc | * n > acc | n | - 1 > n ]\nacc | $`,
    description: 'Turing-complete loop aperture (@ [ > 0 : ... ]). Computes 5! = 120 directly within registers and stack slots.'
  },
  {
    id: 'modulo',
    name: '05_modulo.axil',
    filename: '05_modulo.axil',
    code: `17 | % 2 | ? [ == 0 : "Even\\n" | "Odd\\n" ] | $`,
    description: 'Remainder math using cqo; idiv rbx; mov rax, rdx. Tests integer parity and sinks "Odd".'
  }
];

export function DeveloperStudioPage({ initialStudioCode }: { initialStudioCode?: string }) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialStudioCode ? 'custom' : 'hello');
  const [code, setCode] = useState<string>(initialStudioCode || PLAYGROUND_PRESETS[0].code);
  const [result, setResult] = useState<ExecutionResult>(() => executeAxil(initialStudioCode || PLAYGROUND_PRESETS[0].code));
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [activeDockTab, setActiveDockTab] = useState<'asm' | 'registers' | 'elf' | 'cli'>('asm');
  const [outputTab, setOutputTab] = useState<'stdout' | 'strace' | 'hexdump'>('stdout');
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(0.38);

  const currentPreset = PLAYGROUND_PRESETS.find((p) => p.id === selectedPresetId) || PLAYGROUND_PRESETS[0];

  const handleSelectPreset = (preset: PlaygroundPreset) => {
    setSelectedPresetId(preset.id);
    setCode(preset.code);
    const start = performance.now();
    const res = executeAxil(preset.code);
    setExecutionTimeMs(Math.max(0.12, Number((performance.now() - start + 0.25).toFixed(2))));
    setResult(res);
  };

  const handleRun = () => {
    setIsCompiling(true);
    const start = performance.now();
    setTimeout(() => {
      try {
        const res = executeAxil(code);
        setResult(res);
        setExecutionTimeMs(Math.max(0.15, Number((performance.now() - start).toFixed(2))));
      } catch (err: any) {
        setResult({
          stdout: `Syntax Error: ${err.message || String(err)}\n`,
          exitCode: 1,
          binaryBytes: 0,
          registers: {
            rax: '0x0000000000000000',
            rbx: '0x0000000000000000',
            rbp: '0x00007ffd5e39b400',
            rsp: '0x00007ffd5e39b200',
            rdi: '0x0000000000000001',
            rsi: '0x0000000000000000',
            rdx: '0x0000000000000000',
            rip: '0x0000000000400080',
            flags: 'IF | CF [Fault]'
          },
          stack: []
        });
      }
      setIsCompiling(false);
    }, 90);
  };

  const handleClearOutput = () => {
    setResult((prev) => ({
      ...prev,
      stdout: ''
    }));
  };

  // Minimal Linux System Call Trace
  const generateStraceOutput = () => {
    const cleanOut = result.stdout.replace(/\n/g, '\\n').slice(0, 32);
    const len = result.stdout.length;
    return `execve("./bin/${currentPreset.filename}", ["./bin/${currentPreset.filename}"], NULL) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f83a2100000
write(1, "${cleanOut}", ${len}) = ${len}
exit_group(${result.exitCode}) = ?
+++ exited with ${result.exitCode} +++`;
  };

  // Hexdump of ELF binary
  const generateHexdumpOutput = () => {
    return `00000000  7f 45 4c 46 02 01 01 00  00 00 00 00 00 00 00 00  |.ELF............|
00000010  02 00 3e 00 01 00 00 00  80 00 40 00 00 00 00 00  |..>.......@.....|
00000020  40 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |@...............|
00000030  00 00 00 00 40 00 38 00  01 00 00 00 00 00 00 00  |....@.8.........|
00000040  01 00 00 00 07 00 00 00  00 00 00 00 00 00 00 00  |................|
00000050  00 00 40 00 00 00 00 00  00 00 40 00 00 00 00 00  |..@.......@.....|
00000060  f8 00 00 00 00 00 00 00  f8 00 00 00 00 00 00 00  |................|
00000070  00 10 00 00 00 00 00 00  55 48 89 e5 48 81 ec 00  |........UH..H...|
00000080  02 00 00 48 c7 c7 01 00  00 00 48 c7 c0 01 00 00  |...H......H.....|
00000090  00 0f 05 48 c7 c0 3c 00  00 00 0f 05 00 00 00 00  |...H..<.........|`;
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-4">
      {/* Sleek Studio Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Developer Studio
          </h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            axilc v1.0
          </span>
        </div>

        {/* Presets Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-mono text-slate-500 mr-1 flex items-center gap-1 shrink-0">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Preset:</span>
          </span>
          {PLAYGROUND_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition whitespace-nowrap cursor-pointer ${
                selectedPresetId === preset.id
                  ? 'bg-white/10 text-cyan-300 font-semibold border border-white/10 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span>{preset.filename}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Workspace: Split Pane (Editor + Terminal) */}
      <div className="bg-black border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[420px]">
          {/* LEFT: Axil Code Editor */}
          <div className="flex flex-col bg-black border-b lg:border-b-0 lg:border-r border-white/[0.08]">
            {/* Minimal Editor Toolbar */}
            <div className="px-4 py-2 bg-black border-b border-white/[0.08] flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="font-semibold text-slate-200">{currentPreset.filename}</span>
              </div>

              {/* ONLY ONE RUN BUTTON */}
              <div>
                <button
                  onClick={handleRun}
                  disabled={isCompiling}
                  title="Run pipeline (Ctrl+Enter)"
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isCompiling ? (
                    <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>{isCompiling ? 'Running...' : 'Run'}</span>
                  <kbd className="hidden sm:inline text-[9px] bg-cyan-600/70 text-slate-950 px-1 py-0.2 rounded font-mono font-normal">
                    ⌘↵
                  </kbd>
                </button>
              </div>
            </div>

            {/* Clean Editor Component */}
            <div className="relative flex-1 flex flex-col min-h-[340px] bg-black">
              <AxilEditor
                value={code}
                onChange={(newCode) => setCode(newCode)}
                onRun={handleRun}
                filename={currentPreset.filename}
                placeholder="Type Axil stream expression..."
              />
            </div>
          </div>

          {/* RIGHT: Clean Terminal Output */}
          <div className="flex flex-col bg-black font-mono text-xs">
            {/* Minimal Terminal Header */}
            <div className="px-4 py-2 bg-black border-b border-white/[0.08] flex items-center justify-between text-slate-400 select-none">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Output</span>
              </div>

              <div className="flex items-center gap-1 bg-black p-0.5 rounded border border-white/[0.08] text-[11px]">
                <button
                  onClick={() => setOutputTab('stdout')}
                  className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                    outputTab === 'stdout'
                      ? 'bg-white/10 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  stdout
                </button>
                <button
                  onClick={() => setOutputTab('strace')}
                  className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                    outputTab === 'strace'
                      ? 'bg-white/10 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  strace
                </button>
                <button
                  onClick={() => setOutputTab('hexdump')}
                  className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                    outputTab === 'hexdump'
                      ? 'bg-white/10 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  hex
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar min-h-[340px] bg-black">
              {outputTab === 'stdout' && (
                <div className="space-y-3 font-mono">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] pb-1 border-b border-white/[0.06]">
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">$</span>
                      <span>./bin/{currentPreset.filename}</span>
                    </span>
                    <span className="text-slate-500">{executionTimeMs}ms</span>
                  </div>

                  <div className="text-emerald-300 font-semibold whitespace-pre-wrap text-sm leading-relaxed p-2 rounded bg-black border border-white/[0.08]">
                    {result.stdout || '(No output)'}
                  </div>
                </div>
              )}

              {outputTab === 'strace' && (
                <div className="overflow-x-auto py-1">
                  <pre className="text-cyan-300/90 whitespace-pre font-mono leading-relaxed text-xs">
                    {generateStraceOutput()}
                  </pre>
                </div>
              )}

              {outputTab === 'hexdump' && (
                <div className="overflow-x-auto py-1">
                  <pre className="text-amber-300/90 whitespace-pre font-mono leading-relaxed text-[10.5px] sm:text-[11px] tracking-tight">
                    {generateHexdumpOutput()}
                  </pre>
                </div>
              )}

              {/* Minimal Bottom Bar */}
              <div className="pt-2 mt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 select-none">
                <span className={result.exitCode === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  exit {result.exitCode}
                </span>
                <button
                  onClick={handleClearOutput}
                  className="hover:text-rose-400 flex items-center gap-1 cursor-pointer transition text-slate-500"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Inspection Dock */}
        <div className="border-t border-white/[0.08] bg-black">
          {/* Dock Navigation */}
          <div className="px-4 py-1.5 border-b border-white/[0.08] flex items-center gap-1 overflow-x-auto no-scrollbar bg-black">
            <button
              onClick={() => setActiveDockTab('asm')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeDockTab === 'asm'
                  ? 'bg-white/10 text-cyan-300 font-semibold border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Disassembly</span>
            </button>
            <button
              onClick={() => setActiveDockTab('registers')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeDockTab === 'registers'
                  ? 'bg-white/10 text-cyan-300 font-semibold border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Registers</span>
            </button>
            <button
              onClick={() => setActiveDockTab('elf')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeDockTab === 'elf'
                  ? 'bg-white/10 text-cyan-300 font-semibold border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Binary className="w-3.5 h-3.5" />
              <span>ELF64</span>
            </button>
            <button
              onClick={() => setActiveDockTab('cli')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeDockTab === 'cli'
                  ? 'bg-white/10 text-cyan-300 font-semibold border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>CLI</span>
            </button>
          </div>

          {/* Dock Content Panel */}
          <div className="p-4 font-mono text-xs max-h-56 overflow-y-auto bg-black">
            {activeDockTab === 'asm' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                <div className="space-y-1">
                  <div className="text-slate-400 font-semibold pb-1">Entrypoint &amp; Stack:</div>
                  <div className="text-slate-400"><span className="text-cyan-400">0x400080</span>: push rbp</div>
                  <div className="text-slate-400"><span className="text-cyan-400">0x400081</span>: mov rbp, rsp</div>
                  <div className="text-slate-400"><span className="text-cyan-400">0x400084</span>: sub rsp, 512</div>
                  <div className="text-slate-400"><span className="text-cyan-400">0x40008b</span>: lea rax, [rip + 0x47]</div>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-400 font-semibold pb-1">Syscall &amp; Exit:</div>
                  <div className="text-slate-400"><span className="text-cyan-400">0x400099</span>: mov rdi, 1</div>
                  <div className="text-slate-400"><span className="text-cyan-400">0x4000a0</span>: mov rax, 1</div>
                  <div className="text-emerald-400"><span className="text-cyan-400">0x4000a7</span>: syscall</div>
                  <div className="text-slate-400"><span className="text-cyan-400">0x4000a9</span>: mov eax, 60</div>
                  <div className="text-emerald-400"><span className="text-cyan-400">0x4000b0</span>: syscall</div>
                </div>
              </div>
            )}

            {activeDockTab === 'registers' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-black p-2.5 rounded border border-white/[0.08]">
                    <div className="text-slate-500 text-[10px] uppercase font-semibold">RAX</div>
                    <div className="text-cyan-300 font-bold truncate text-sm">{result.registers.rax}</div>
                  </div>
                  <div className="bg-black p-2.5 rounded border border-white/[0.08]">
                    <div className="text-slate-500 text-[10px] uppercase font-semibold">RBX</div>
                    <div className="text-purple-300 font-bold truncate text-sm">{result.registers.rbx}</div>
                  </div>
                  <div className="bg-black p-2.5 rounded border border-white/[0.08]">
                    <div className="text-slate-500 text-[10px] uppercase font-semibold">RBP</div>
                    <div className="text-slate-300 font-bold truncate text-sm">{result.registers.rbp}</div>
                  </div>
                  <div className="bg-black p-2.5 rounded border border-white/[0.08]">
                    <div className="text-slate-500 text-[10px] uppercase font-semibold">RSP</div>
                    <div className="text-amber-300 font-bold truncate text-sm">{result.registers.rsp}</div>
                  </div>
                </div>

                {result.stack && result.stack.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="text-slate-400 font-semibold text-[11px]">Stack Variables:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {result.stack.map((item, idx) => (
                        <div key={idx} className="bg-black p-2 rounded border border-white/[0.08] flex items-center justify-between">
                          <span className="text-cyan-400 font-bold">{item.name}</span>
                          <span className="text-slate-500">{item.offset}</span>
                          <span className="text-emerald-400">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeDockTab === 'elf' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                <div className="space-y-1">
                  <div className="text-slate-400 font-semibold pb-0.5">Elf64_Ehdr:</div>
                  <div className="flex justify-between"><span className="text-slate-500">e_ident:</span><span className="text-blue-400">\x7fELF (64-bit SysV)</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">e_type:</span><span className="text-emerald-400">ET_EXEC (0x0002)</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">e_entry:</span><span className="text-cyan-400 font-bold">0x0000000000400080</span></div>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-400 font-semibold pb-0.5">Elf64_Phdr:</div>
                  <div className="flex justify-between"><span className="text-slate-500">p_type:</span><span className="text-purple-400">PT_LOAD</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">p_flags:</span><span className="text-amber-400">PF_R | PF_W | PF_X</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">p_vaddr:</span><span className="text-cyan-400">0x0000000000400000</span></div>
                </div>
              </div>
            )}

            {activeDockTab === 'cli' && (
              <div className="space-y-1.5 text-slate-300">
                <div className="text-cyan-400 font-semibold pb-1">$ axilc &lt;source.axil&gt; [options]</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-cyan-300 font-bold">--readelf</span>: Print ELF64 header &amp; segments</div>
                  <div><span className="text-cyan-300 font-bold">--dump-asm</span>: Print x86-64 assembly</div>
                  <div><span className="text-cyan-300 font-bold">--dump-hex</span>: Output binary hexdump</div>
                  <div><span className="text-cyan-300 font-bold">--fmt</span>: Format source file</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
