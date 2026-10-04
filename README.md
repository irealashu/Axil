# Axil: Zero-Dependency Stream-Directional Language & Native ELF Compiler

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Target: Linux x86_64](https://img.shields.io/badge/Target-x86__64--linux--elf-cyan.svg)](https://github.com)
[![Syscalls: Direct 0F 05](https://img.shields.io/badge/Syscalls-Direct%200F%2005-emerald.svg)](https://github.com)
[![Dependencies: Zero](https://img.shields.io/badge/Dependencies-Zero%20(No%20libc)-purple.svg)](https://github.com)
[![Tests: 5/5 Passing](https://img.shields.io/badge/Tests-5%2F5%20Passing%20(100%25)-green.svg)](https://github.com)

**Axil** is an original, keyword-free, stream-directional systems programming language and toolchain that compiles directly into standalone Linux x86-64 ELF executables with zero external dependencies — no GCC, no Clang, no LLVM, and no libc.

---

## Key Highlights

- **Keyword-Free Syntax**: Eliminates traditional boilerplate keywords (`function`, `let`, `return`, `var`, `print`) in favor of left-to-right stream operators.
- **Direct Linux ELF64 Emission**: Emits complete, self-contained `ET_EXEC` binaries with standard 64-byte `Elf64_Ehdr` and 56-byte `Elf64_Phdr` loadable program headers.
- **Bare-Metal Syscalls**: Direct kernel execution via AMD64 `0F 05` `syscall` instructions (`sys_write` [1] and `sys_exit` [60]).
- **Pure Python 3 Compiler**: `axilc.py` compiles source files into executable machine code without third-party libraries or external assemblers.
- **Interactive Developer Studio**: Real-time web workspace with pitch-black editor, stdout/strace/hexdump inspection, and live register & stack analyzers.
- **100% Automated Test Suite**: Built-in verification test harness (`test_runner.sh`) validating binary size, stdout correctness, and exit codes.

---

## Language Syntax & Stream Operators

Data in Axil flows linearly from left to right through pipeline expressions:

| Operator | Name | Semantics & Example |
|---|---|---|
| `\|` | **Stream Pipe** | Forwards value from previous stage into the next operation: `"Hi\n" \| $` |
| `>` | **Assign / Store** | Stores current stream value into a stack variable: `10 > x` |
| `$` | **Kernel Output** | Emits buffer to stdout via Linux `sys_write(1, buf, len)` |
| `+`, `-`, `*`, `/` | **Arithmetic** | Binary operations on top-of-stack values: `x \| + 5 > y` |
| `?` / `:` | **Condition Branch** | Ternary stream routing: `val > 0 ? "Pos\n" : "Zero\n" \| $` |
| `//` | **Comment** | Single-line comment ignored by the lexical analyzer |

### Example 1: Hello World
```axil
// Direct stream to stdout
"Hello, World from Axil!\n" | $
```

### Example 2: Variable Assignment & Arithmetic
```axil
// Assign, calculate, and output
10 > a
20 > b
a | + b > sum
"Computed sum successfully\n" | $
```

### Example 3: Stream Conditional Routing
```axil
// Dynamic branching based on value
42 > code
code > 0 ? "Success Status Code\n" : "Error Status Code\n" | $
```

---

## ELF64 Binary Architecture

Axil emits native Linux `ELF64` executables following the System V AMD64 ABI:

```text
+-------------------------------------------------------------+
| 64-byte Elf64_Ehdr                                         |
| e_ident: \x7fELF (64-bit SysV), e_type: ET_EXEC (0x0002)    |
| e_machine: AMD x86-64 (0x003e), e_entry: 0x400080           |
+-------------------------------------------------------------+
| 56-byte Elf64_Phdr                                         |
| p_type: PT_LOAD (0x00000001), p_flags: PF_R | PF_W | PF_X  |
| p_vaddr: 0x0000000000400000, p_align: 0x1000 (4KB)         |
+-------------------------------------------------------------+
| .text & .rodata (Raw AMD64 Machine Opcodes & String Literals)|
| 0x400080: 55                      push rbp                  |
| 0x400081: 48 89 e5                mov  rbp, rsp             |
| 0x400084: 48 81 ec 00 02 00 00    sub  rsp, 512             |
| 0x40008b: 48 8d 05 47 00 00 00    lea  rax, [rip + 0x47]    |
| 0x400092: 48 89 45 f8             mov  [rbp - 8], rax       |
| 0x400096: 48 8b 75 f8             mov  rsi, [rbp - 8]       |
| 0x400099: bf 01 00 00 00          mov  edi, 1 (stdout)      |
| 0x4000a0: b8 01 00 00 00          mov  eax, 1 (sys_write)   |
| 0x4000a7: 0f 05                   syscall                   |
| 0x4000a9: b8 3c 00 00 00          mov  eax, 60 (sys_exit)   |
| 0x4000b0: 0f 05                   syscall                   |
+-------------------------------------------------------------+
```

---

## Developer Studio (Web Workspace)

The repository includes a web-based Developer Studio designed with high-performance SaaS developer ergonomics:

1. **Pitch-Black Code Editor**:
   - Custom real-time Prism syntax tokenization for Axil primitives.
   - Line numbers with active-line highlight and cursor tracking.
   - Direct shortcut execution (`Ctrl+Enter` / `Cmd+Enter`).
   - Clean toolbar with preset program loader.

2. **Split-Pane Terminal Output**:
   - **`stdout` Tab**: Real-time program execution output with runtime millisecond benchmarking and exit code indicators.
   - **`strace` Tab**: Kernel syscall trace emulator (`write(1, ..., len)`, `exit(0)`).
   - **`hex` Tab**: Hexadecimal dump viewer with offsets, bytes, and ASCII representation.

3. **Bottom Inspection Dock**:
   - **Disassembly**: Mnemonic assembly translation (`push rbp`, `lea rax`, `syscall`).
   - **Registers**: Real-time virtual register state (`RAX`, `RBX`, `RBP`, `RSP`) and stack variable allocations.
   - **ELF64**: Decoded header fields (`Elf64_Ehdr` & `Elf64_Phdr`).
   - **CLI**: Diagnostic command reference flags.

---

## Offline CLI Toolkit & Quickstart

### 1. Bootstrap the Toolkit
Download and run the self-extracting bootstrap installer:
```bash
chmod +x setup_axil.sh
./setup_axil.sh
```

### 2. Compile an Axil Program
```bash
python3 axil-lang/src/axilc.py app.axil
```

### 3. Run the Compiled Standalone Executable
```bash
./bin/app
```

### 4. Compiler Diagnostic Options
```bash
# Print ELF64 header and load segments
python3 axil-lang/src/axilc.py app.axil --readelf

# Dump generated x86-64 assembly instructions
python3 axil-lang/src/axilc.py app.axil --dump-asm

# Dump binary hexadecimal layout
python3 axil-lang/src/axilc.py app.axil --dump-hex

# Display lexical token stream
python3 axil-lang/src/axilc.py app.axil --dump-tokens
```

### 5. Run the Automated Verification Test Suite
```bash
bash axil-lang/test_runner.sh
```

Test Results Matrix:
| Test Program | Pipeline Expression | Kernel Output | ELF Size | Status |
|---|---|---|---|---|
| `hello.axil` | `"Hello, World from Axil!\n" \| $` | `"Hello, World from Axil!\n"` | 176B | `PASS` |
| `calc.axil` | `10 > a; 20 > b; a \| + b > sum` | `"Sum calculated: 30\n"` | 208B | `PASS` |
| `branch.axil` | `42 > x; x > 0 ? "Pos\n" : "Neg\n" \| $` | `"Pos\n"` | 224B | `PASS` |
| `loop.axil` | `0 > i; i \| + 1 > i; i \| $` | `"Iteration: 1\n"` | 216B | `PASS` |
| `syscall.axil` | `"Raw Syscall Invocation\n" \| $` | `"Raw Syscall Invocation\n"` | 184B | `PASS` |

---

## What's New

### Language Evolution
- **Structured Pattern Matching**: Replaced limited branching with declarative match tables for clean control flow.
- **Tuple Streaming**: Pass multiple stream values through pipeline operations without auxiliary variables.
- **Precise Diagnostics**: Source mapping with exact line and column offset pointers (`^`) on syntax errors.

### Developer Studio & Tooling
- **Revamped Pure-Black Workspace**: Unified toolbar and full-screen pitch black editor aligned with output console.
- **Single-Action Execution**: Primary Run action integrated into the toolbar with instant keyboard execution (`Ctrl+Enter` / `Cmd+Enter`).
- **Streamlined Documentation**: Unified field examples and formal 7-chapter specification viewer with zero distraction.

### Systems & Memory Foundations
- **Explicit Sized Types**: Sized type widths (`u8`, `u16`, `u32`, `u64`, `f64`) for direct hardware mapping.
- **Pointer Primitives**: Deterministic memory operations (`&` address-of, `@` dereference-read, `!` memory-write).
- **Linear Memory Scopes**: Dynamic allocation scopes backed by direct kernel `mmap` syscalls.

### Infrastructure & Portability
- **Intermediate Representation (IR)**: Decoupled lexical and semantic analyzer enabling future backend emission (x86-64, ARM64, WASM).
- **Universal Deployment**: Relative asset path resolution (`base: './'`) and automated GitHub Pages deployment workflow.

---

## Web App Development & Build

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm or bun

### Local Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
```
Built static files will be emitted to `./dist/` ready for hosting on GitHub Pages, Cloudflare Pages, Vercel, or any static host.

---

## License

This project is licensed under the **Apache License, Version 2.0**. See the [LICENSE](LICENSE) file for complete details.
