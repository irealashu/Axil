# Axil Programming Language

> **Zero-Dependency, Keyword-Free, Stream-Directional Language**  
> Direct Native Linux x86-64 ELF Executable Compiler (`axilc.py`)

Axil is an original, keyword-free, stream-directional programming language designed for mechanical sympathy and direct execution. It abandons English keywords (`if`, `while`, `let`, `def`, `return`), operator precedence hierarchies, and complex runtime dependencies.

Instead, Axil models computation as a linear, left-to-right stream of values flowing through apertures and operations:

- **Stream Pipe (`|`)**: Channels the stream head into an operation, aperture, or sink.
- **Store Operator (`>`)**: Copies the active stream value into a named local stack slot.
- **System Out Sink (`$`)**: Emits the current stream head directly to standard output via direct `sys_write` kernel syscall.
- **Arithmetic Apertures**: `| + [val]`, `| - [val]`, `| * [val]`, `| / [val]`, `| % [val]`.
- **Branching Aperture**: `| ? [ < [val] : [action_true] | [action_false] ]`.
- **Loop Aperture**: `| @ [ <cmp> [val] : [loop_body] ]`.

---

## Zero-Dependency Architecture

Unlike traditional toolchains that rely on GCC, Clang, NASM, GNU `as`, `ld`, or `glibc`, the Axil compiler (`src/axilc.py`) compiles `.axil` source code directly into fully functional, standalone Linux x86-64 ELF64 binaries using only the standard Python 3 runtime (`sys`, `struct`, `os`, `re`).

- **No C runtime (`crt1.o`, `libc.so`) required.**
- **No external linker or assembler required.**
- **Executable files run natively on bare Linux kernels and WSL.**
- **Embedded Integer-to-String formatting routine in pure machine code.**
- **Built-in inspection flags: `--readelf`, `--dump-asm`, `--dump-hex`, `--dump-tokens`.**

---

## Directory Structure

```
axil-lang/
├── README.md               # Overview and toolchain instructions
├── docs/
│   ├── SPECIFICATION.md    # Language syntax, mechanics, and formal EBNF
│   └── ARCHITECTURE.md     # ELF64 packaging, register map, and syscall ABI
├── examples/
│   ├── 01_hello.axil       # String literal emission to $ sink
│   ├── 02_arithmetic.axil  # Arithmetic chaining and variable assignment
│   ├── 03_branches.axil    # Conditional branching aperture
│   ├── 04_loop.axil        # Turing-complete loop aperture (Factorial)
│   └── 05_modulo.axil      # Modulo arithmetic and branch decision
├── src/
│   └── axilc.py            # Zero-dependency Python 3 native ELF compiler
└── test_runner.sh          # Automated test harness and verification suite
```

---

## Quick Start

### 1. Compile a Program
```bash
python3 src/axilc.py examples/01_hello.axil -o bin/01_hello
./bin/01_hello
```

### 2. Inspect with Built-in Readelf and Disassembler
```bash
python3 src/axilc.py examples/01_hello.axil --readelf --dump-asm
```

### 3. Run the Full Test Suite
```bash
./test_runner.sh
```
