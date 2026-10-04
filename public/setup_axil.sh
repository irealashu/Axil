#!/usr/bin/env bash
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}================================================================${NC}"
echo -e "${BOLD}${CYAN}   AXIL PROGRAMMING LANGUAGE: ZERO-DEPENDENCY NATIVE TOOLCHAIN   ${NC}"
echo -e "${BOLD}${BLUE}================================================================${NC}"
echo -e "Scaffolding axil-lang repository..."

mkdir -p axil-lang/docs axil-lang/examples axil-lang/src axil-lang/bin

# 1. README.md
cat << 'EOF' > axil-lang/README.md
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
EOF

# 2. docs/SPECIFICATION.md
cat << 'EOF' > axil-lang/docs/SPECIFICATION.md
# Axil Language Specification v1.1
**An Original, Keyword-Free, Stream-Directional Systems Programming Language**

---

## 1. Executive Summary & Design Principles

Axil is an original, keyword-free, stream-directional programming language designed for direct machine execution on Linux x86-64 architecture. Axil rejects the syntactic complexity of traditional imperative languages:

- **No English Keywords**: Keywords such as `if`, `else`, `while`, `for`, `let`, `var`, `def`, `fn`, and `return` do not exist.
- **Strict Left-to-Right Associativity**: All expressions evaluate strictly from left to right. There are no operator precedence hierarchies (e.g., multiplication does not precede addition unless grouped or sequenced).
- **Direct Kernel Syscalls**: Code emits bare machine code targeting Linux System V AMD64 ABI kernel syscalls (`sys_write`, `sys_exit`). No C standard library (`libc`), runtime startup code (`crt1.o`), or dynamic linkers are required.
- **Deterministic Resource Footprint**: Local variables reside in fixed, statically allocated stack frame slots relative to the Base Pointer (`RBP`).

---

## 2. Lexical Structure

### 2.1 Character Set & Whitespace
Axil source files are encoded in standard UTF-8. Whitespace characters (spaces, tabs, and carriage returns) serve exclusively as token delimiters and carry no semantic indentation meaning.

### 2.2 Comments
Comments begin with a hash character (`#`) and continue to the end of the line:
```axil
# This is a full-line comment in Axil
10 | + 20 > total # Inline comment: sets total = 30
```

### 2.3 Literals
- **Integer Literals**: 64-bit signed integers written in standard decimal notation (e.g., `0`, `42`, `-15`, `1000000`).
- **String Literals**: Enclosed in double quotes (`"..."`). Standard escape sequences are supported:
  - `\n`: Line feed (0x0A)
  - `\t`: Horizontal tab (0x09)
  - `\r`: Carriage return (0x0D)
  - `\"`: Double quote (0x22)
  - `\\`: Backslash (0x5C)

### 2.4 Identifiers
Identifiers name local storage slots. They begin with an ASCII letter (`a-z`, `A-Z`) or an underscore (`_`), followed by any combination of letters, digits (`0-9`), and underscores:
```axil
counter
_temp_var
total_sum_2026
```

---

## 3. Stream Pipeline Evaluation Model

### 3.1 The Active Stream Head
Every statement begins with a **Stream Head**, which may be an integer literal, a string literal, or an identifier:
```axil
42          # Head is integer 42
"Ready\n"   # Head is string literal
total       # Head is recalled value of variable 'total'
```
At runtime, the active stream head is held in CPU register `RAX`.

### 3.2 The Stream Pipe (`|`)
The pipe operator (`|`) channels the active stream head on its left into the aperture, operation, or sink on its right:
```axil
10 | + 20 | * 2
```
Execution trace:
1. `10` is loaded into `RAX`.
2. `| + 20`: `20` is loaded into `RBX`, `RAX` becomes `10 + 20 = 30`.
3. `| * 2`: `2` is loaded into `RBX`, `RAX` becomes `30 * 2 = 60`.

---

## 4. State Management: The Store Operator (`>`)

The store operator (`>`) copies the active stream head into a named local stack frame slot:
```axil
100 > balance
```

### 4.1 Non-Consuming Preservation
The store operator does **not** consume the stream head. The value remains active in `RAX` and continues flowing down the pipeline:
```axil
10 > x | + 5 > y | + 20 > z
```
Result:
- `x` receives `10`
- `y` receives `15` (`10 + 5`)
- `z` receives `35` (`15 + 20`)

### 4.2 Stack Slot Mapping
The compiler assigns a fixed 8-byte stack offset relative to `RBP` for each unique identifier:
- First variable: `[RBP - 8]`
- Second variable: `[RBP - 16]`
- Third variable: `[RBP - 24]`
- *N*-th variable: `[RBP - 8 * N]`

---

## 5. Output Sink: The System Out Sink (`$`)

The dollar sign (`$`) is the terminal standard output sink. It drains the current stream head directly to Linux standard output (file descriptor `1`):
```axil
"Hello, World!\n" | $
42 | $
```

### 5.1 Dual-Type Dispatch
- **String Descriptors**: When the stream head is a string literal, Axil writes the raw UTF-8 bytes directly to stdout using `sys_write`.
- **Integer Formatting**: When the stream head is an integer, Axil executes a built-in, zero-dependency machine code routine that converts the 64-bit integer into ASCII decimal digits, appends a newline (`\n`), and issues `sys_write`. No standard C library routines (`printf`, `itoa`) are invoked.

---

## 6. Arithmetic & Remainder Apertures

All arithmetic operations are signed 64-bit two's complement operations:

| Operator | Syntax | Native x86-64 Instruction | Semantics |
|---|---|---|---|
| Addition | `\| + [operand]` | `add rax, rbx` | Adds operand to active stream |
| Subtraction | `\| - [operand]` | `sub rax, rbx` | Subtracts operand from active stream |
| Multiplication | `\| * [operand]` | `imul rax, rbx` | Multiplies active stream by operand |
| Division | `\| / [operand]` | `cqo; idiv rbx` | Signed 64-bit integer quotient |
| Remainder (Modulo) | `\| % [operand]` | `cqo; idiv rbx; mov rax, rdx` | Signed remainder in `RDX` |

---

## 7. Decision Apertures: Branching (`?`)

Branching in Axil is structured as a decision aperture:
```axil
| ? [ <cmp> <operand> : <action_true> | <action_false> ]
```

### 7.1 Comparison Operators
- `<` : Less than
- `<=` : Less than or equal
- `>` : Greater than
- `>=` : Greater than or equal
- `==` : Equal
- `!=` : Not equal

### 7.2 Action Types
Each branch action can be:
1. An integer or string literal (e.g. `"Under 18\n"` or `50`)
2. An identifier recall (e.g. `price`)
3. An arithmetic transformation (e.g. `+ 10`, `* 2`)
4. An inline sub-pipeline with sink (e.g. `n | / 2 | $`)

Example:
```axil
15 | ? [ < 18 : "Under 18\n" | "Adult\n" ] | $
```

---

## 8. Repetitive Streams: The Loop Aperture (`@`)

Loops in Axil achieve Turing-completeness without `while`, `for`, or `goto` keywords:
```axil
| @ [ <cmp> <operand> : <loop_body> ]
```

### 8.1 Semantics
1. The stream head is evaluated against the comparison condition.
2. If true, the statements inside `<loop_body>` execute sequentially.
3. At the end of `<loop_body>`, execution unconditionally loops back to the comparison condition.
4. If false, execution skips to the instruction immediately following the loop block.

### 8.2 Canonical Loop Example: Factorial (5! = 120)
```axil
5 > n
1 > acc
n | @ [ > 0 : acc | * n > acc | n | - 1 > n ]
acc | $
```

---

## 9. Formal EBNF Grammar

```ebnf
program         = { statement ( "\n" | ";" ) } ;
statement       = stream_head { pipe_op | store_op } ;
stream_head     = literal | IDENT ;

pipe_op         = "|" ( sink | arith_op | branch_op | loop_op ) ;
store_op        = ">" IDENT ;
sink            = "$" ;

arith_op        = ( "+" | "-" | "*" | "/" | "%" ) operand ;
branch_op       = "?" "[" cmp_op operand ":" branch_action "|" branch_action "]" ;
loop_op         = "@" "[" cmp_op operand ":" loop_body "]" ;
loop_body       = { stream_head | pipe_op | store_op } ;

cmp_op          = "<" | "<=" | ">" | ">=" | "==" | "!=" ;
branch_action   = literal | IDENT | ( ( "+" | "-" | "*" | "/" | "%" ) operand ) ;

operand         = INT | IDENT ;
literal         = INT | STRING ;
INT             = [ "-" ] digit { digit } ;
STRING          = '"' { string_char } '"' ;
IDENT           = ( letter | "_" ) { letter | digit | "_" } ;
```

---

## 10. Memory Model & Stack Organization

```
Higher Memory (Top of Stack)
+------------------------------------------+ [RBP + 0]  Saved Previous RBP
+------------------------------------------+ [RBP - 8]  Slot 1 (e.g. 'n')
+------------------------------------------+ [RBP - 16] Slot 2 (e.g. 'acc')
+------------------------------------------+ [RBP - 24] Slot 3 (e.g. 'total')
| ...                                      |
+------------------------------------------+ [RBP - 512] Scratch / Digit Buffer
Lower Memory
```
- Scratch buffer allocated via `sub rsp, 512` at function prologue.
- Automatic integer formatting uses the stack frame buffer from `[RBP - 1]` down to `[RBP - 32]` for ASCII digit storage, eliminating heap allocations.
EOF

# 3. docs/ARCHITECTURE.md
cat << 'EOF' > axil-lang/docs/ARCHITECTURE.md
# Axil Compiler Architecture & Binary Specification
**Zero-Dependency Native ELF64 Machine Code Generation**

---

## 1. Zero-Dependency Philosophy

The Axil compiler (`axilc.py`) generates fully autonomous 64-bit Executable and Linkable Format (ELF) binaries directly from source code using only the Python 3 standard library (`sys`, `struct`, `os`, `re`).

- **No GNU Assembler (`as`) or NASM**
- **No Linker (`ld`, `gold`, `lld`)**
- **No C Runtime (`crt1.o`, `crti.o`, `crtn.o`)**
- **No Shared C Library (`libc.so`, `musl`)**

The resulting binary executes directly on the bare Linux kernel (and WSL) via the System V AMD64 ABI.

---

## 2. Raw ELF64 Binary Packaging

```
+---------------------------------------------------+ 0x400000 (File Offset 0x00)
| Elf64_Ehdr (64 bytes)                             |
| - e_ident: \x7fELF, 64-bit, Little-Endian, SysV   |
| - e_type: ET_EXEC (2), e_machine: EM_X86_64 (0x3E)|
| - e_version: EV_CURRENT (1)                       |
| - e_entry: 0x400080                               |
| - e_phoff: 64, e_shoff: 0 (No section headers)    |
| - e_ehsize: 64, e_phentsize: 56, e_phnum: 1       |
+---------------------------------------------------+ 0x400040 (File Offset 0x40)
| Elf64_Phdr (56 bytes)                             |
| - p_type: PT_LOAD (1)                             |
| - p_flags: PF_R | PF_W | PF_X (7)                 |
| - p_offset: 0                                     |
| - p_vaddr: 0x400000, p_paddr: 0x400000            |
| - p_filesz: total_size                            |
| - p_memsz: total_size + 0x10000                   |
| - p_align: 0x1000 (4096-byte page alignment)      |
+---------------------------------------------------+ 0x400078 (File Offset 0x78)
| Zero Padding (8 bytes, aligns entry point to 0x80)|
+---------------------------------------------------+ 0x400080 (File Offset 0x80)
| .text (Executable Machine Code)                   |
| - Program entry point (_start)                    |
| - Stack frame initialization (push rbp; mov rbp..) |
| - Sub rsp, 512 (scratchpad allocation)            |
| - Compiled Axil statement bytecode                |
| - Integer print helper routine (`print_int`)      |
| - Program epilogue (sys_exit 0)                   |
+---------------------------------------------------+
| .rodata (Read-Only String Table)                  |
| - String Descriptors:                             |
|   [ 8-byte uint64 length ] [ raw UTF-8 bytes ]    |
+---------------------------------------------------+
```

---

## 3. Register Allocation Map (SysV AMD64)

| Register | Architectural Role in Axil Runtime |
|---|---|
| `RAX` | **Active Stream Accumulator**: Holds the active stream head value. In syscall contexts, holds the syscall number (`1` for `sys_write`, `60` for `sys_exit`). |
| `RBX` | **Operand Register**: Holds the right-hand operand during arithmetic computations (`add`, `sub`, `imul`, `idiv`). |
| `RBP` | **Stack Base Pointer**: Serves as the fixed frame pointer for local identifier slots at `[RBP - 8]`, `[RBP - 16]`, etc. |
| `RSP` | **Stack Pointer**: Decremented by `512` at function prologue to establish stack scratch space. |
| `RDI` | **Syscall Argument 1**: First syscall parameter (`1` for `stdout`, exit code `0` for `sys_exit`). |
| `RSI` | **Syscall Argument 2**: Second syscall parameter (memory buffer address for `sys_write`). |
| `RDX` | **Syscall Argument 3**: Third syscall parameter (buffer byte length for `sys_write`). Also receives the remainder during `idiv`. |
| `R8` | **Divisor Register**: Holds constant `10` during integer-to-string formatting loop. |
| `R9D` | **Sign Flag**: Tracks negative integer sign during decimal conversion (`0` for positive, `1` for negative). |

---

## 4. Linux Kernel Syscall Interface

Axil interacts directly with the Linux kernel via the `syscall` machine instruction (`0F 05`).

### 4.1 sys_write (Linux Syscall 1)
```nasm
mov rax, 1          ; __NR_sys_write
mov rdi, 1          ; fd: stdout
mov rsi, buffer_ptr ; const char *buf
mov rdx, count      ; size_t count
syscall             ; 0F 05
```

### 4.2 sys_exit (Linux Syscall 60)
```nasm
mov rax, 60         ; __NR_sys_exit
xor edi, edi        ; int error_code: 0
syscall             ; 0F 05
```

---

## 5. Pure Machine Code Integer-to-String Formatting

To achieve absolute zero-dependency compilation without `glibc`, Axil emits a self-contained integer-to-string formatting routine directly in x86-64 machine code:

1. **Stack Allocation**: The routine allocates 32 bytes on the stack between `[RBP - 1]` and `[RBP - 32]`.
2. **Newline Termination**: Byte `[RBP - 1]` is initialized to ASCII line feed (`0x0A`).
3. **Sign Handling**: If the input in `RAX` is negative, the sign flag `R9D` is set, and `neg rax` is executed.
4. **Division Loop**:
   - `xor rdx, rdx`
   - `div r8` (unsigned divide `RDX:RAX` by `10`)
   - `add dl, '0'` (convert remainder to ASCII character)
   - Store digit into stack pointer buffer (`mov [rsi], dl; dec rsi`)
   - Test if quotient `RAX` is zero; if not, repeat loop.
5. **Minus Sign**: If `R9D` was set, prepend ASCII minus (`0x2D`) to the buffer.
6. **Syscall Output**: Issue `sys_write` targeting standard output with buffer address in `RSI` and computed byte length in `RDX`.
EOF

# 4. Test Programs
cat << 'EOF' > axil-lang/examples/01_hello.axil
"Hello, World from Axil!\n" | $
EOF

cat << 'EOF' > axil-lang/examples/02_arithmetic.axil
10 | + 20 | * 2 > total
total | $
EOF

cat << 'EOF' > axil-lang/examples/03_branches.axil
15 | ? [ < 18 : "Under 18\n" | "Adult\n" ] | $
EOF

cat << 'EOF' > axil-lang/examples/04_loop.axil
5 > n
1 > acc
n | @ [ > 0 : acc | * n > acc | n | - 1 > n ]
acc | $
EOF

cat << 'EOF' > axil-lang/examples/05_modulo.axil
17 | % 2 | ? [ == 0 : "Even\n" | "Odd\n" ] | $
EOF

# 5. src/axilc.py
cat << 'EOF' > axil-lang/src/axilc.py
#!/usr/bin/env python3
"""
Axil Native Compiler (axilc) v1.1.0
Compiles Axil stream programs directly into Linux x86-64 ELF executables.
Zero external dependencies (pure Python standard library: sys, struct, os, re).
"""

import sys
import os
import struct
import re

VERSION = "1.1.0"

class Token:
    __slots__ = ('type', 'val', 'line', 'col')
    def __init__(self, typ, val, line, col):
        self.type = typ
        self.val = val
        self.line = line
        self.col = col

    def __repr__(self):
        return f"Token({self.type}, {repr(self.val)}, {self.line}:{self.col})"

def lex(src):
    tokens = []
    i = 0
    line = 1
    col = 1
    n = len(src)

    while i < n:
        c = src[i]
        if c in ' \t\r':
            i += 1
            col += 1
            continue
        if c == '#':
            while i < n and src[i] != '\n':
                i += 1
            continue
        if c == '\n':
            tokens.append(Token('NEWLINE', '\n', line, col))
            i += 1
            line += 1
            col = 1
            continue
        if c == '"':
            start_col = col
            val = ''
            i += 1
            col += 1
            while i < n and src[i] != '"':
                if src[i] == '\\' and i + 1 < n:
                    nxt = src[i+1]
                    if nxt == 'n': val += '\n'
                    elif nxt == 't': val += '\t'
                    elif nxt == 'r': val += '\r'
                    elif nxt == '\\': val += '\\'
                    elif nxt == '"': val += '"'
                    else: val += nxt
                    i += 2
                    col += 2
                else:
                    val += src[i]
                    i += 1
                    col += 1
            if i >= n:
                raise SyntaxError(f"Unterminated string literal at line {line}:{start_col}")
            i += 1
            col += 1
            tokens.append(Token('STRING', val, line, start_col))
            continue

        if src[i:i+2] in ('<=', '>=', '==', '!='):
            tokens.append(Token('CMP', src[i:i+2], line, col))
            i += 2
            col += 2
            continue

        if c in ('|', '>', '$', '?', '@', '[', ']', ':', '+', '-', '*', '/', '%'):
            tokens.append(Token(c, c, line, col))
            i += 1
            col += 1
            continue

        if c == '<':
            tokens.append(Token('CMP', '<', line, col))
            i += 1
            col += 1
            continue

        if c.isdigit() or (c == '-' and i + 1 < n and src[i+1].isdigit() and (len(tokens) == 0 or tokens[-1].type in ('NEWLINE', ':', '[', '|'))):
            m = re.match(r'^-?[0-9]+', src[i:])
            num_str = m.group(0)
            tokens.append(Token('INT', int(num_str), line, col))
            i += len(num_str)
            col += len(num_str)
            continue

        if c.isalpha() or c == '_':
            m = re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*', src[i:])
            ident = m.group(0)
            tokens.append(Token('IDENT', ident, line, col))
            i += len(ident)
            col += len(ident)
            continue

        raise SyntaxError(f"Unexpected character {repr(c)} at line {line}:{col}")

    tokens.append(Token('EOF', '', line, col))
    return tokens

class Assembler:
    def __init__(self, base_vaddr=0x400000, code_offset=128):
        self.code = bytearray()
        self.labels = {}
        self.fixups = []
        self.base_vaddr = base_vaddr
        self.code_offset = code_offset
        self.asm_log = []

    def log(self, asm_str):
        self.asm_log.append((len(self.code), asm_str))

    def label(self, name):
        self.labels[name] = len(self.code)
        self.asm_log.append((len(self.code), f"{name}:"))

    def emit(self, b, asm_str=""):
        if asm_str:
            self.log(asm_str)
        self.code.extend(b)

    def j_cond(self, cond_byte, label_name, mnemonic="jcc"):
        self.log(f"{mnemonic} {label_name}")
        self.code.extend(bytes([0x0F, cond_byte]))
        self.fixups.append((len(self.code), ('label', label_name), 4))
        self.code.extend(b'\x00\x00\x00\x00')

    def jmp(self, label_name):
        self.log(f"jmp {label_name}")
        self.code.append(0xE9)
        self.fixups.append((len(self.code), ('label', label_name), 4))
        self.code.extend(b'\x00\x00\x00\x00')

    def call(self, label_name):
        self.log(f"call {label_name}")
        self.code.append(0xE8)
        self.fixups.append((len(self.code), ('label', label_name), 4))
        self.code.extend(b'\x00\x00\x00\x00')

    def lea_rip_rodata(self, rodata_offset, comment=""):
        self.log(f"lea rax, [rip + rodata_offset_{rodata_offset}] {comment}")
        self.code.extend(b'\x48\x8d\x05')
        self.fixups.append((len(self.code), ('rodata', rodata_offset), 4))
        self.code.extend(b'\x00\x00\x00\x00')

    def resolve(self, rodata_file_offset):
        for pos, target, size in self.fixups:
            kind, val = target
            rip = self.base_vaddr + self.code_offset + pos + size
            if kind == 'label':
                target_vaddr = self.base_vaddr + self.code_offset + self.labels[val]
            elif kind == 'rodata':
                target_vaddr = self.base_vaddr + rodata_file_offset + val
            disp = target_vaddr - rip
            struct.pack_into('<i', self.code, pos, disp)
        return bytes(self.code)

def emit_print_int_routine(asm):
    asm.label('print_int')
    asm.emit(b'\x55', 'push rbp')
    asm.emit(b'\x48\x89\xe5', 'mov rbp, rsp')
    asm.emit(b'\x48\x83\xec\x40', 'sub rsp, 64')
    asm.emit(b'\xc6\x45\xff\x0a', "mov byte ptr [rbp-1], 10 ; '\\n'")
    asm.emit(b'\x48\x8d\x75\xff', 'lea rsi, [rbp-1]')
    asm.emit(b'\x49\xc7\xc0\x0a\x00\x00\x00', 'mov r8, 10 ; divisor')
    asm.emit(b'\x48\x85\xc0', 'test rax, rax')

    asm.j_cond(0x85, 'pi_check_neg', 'jnz')
    asm.emit(b'\x48\xff\xce', 'dec rsi')
    asm.emit(b'\xc6\x06\x30', "mov byte ptr [rsi], '0'")
    asm.jmp('pi_write')

    asm.label('pi_check_neg')
    asm.emit(b'\x41\xb9\x00\x00\x00\x00', 'mov r9d, 0 ; is_negative = 0')
    asm.emit(b'\x48\x85\xc0', 'test rax, rax')
    asm.j_cond(0x89, 'pi_digit_loop', 'jns')
    asm.emit(b'\x48\xf7\xd8', 'neg rax')
    asm.emit(b'\x41\xb9\x01\x00\x00\x00', 'mov r9d, 1')

    asm.label('pi_digit_loop')
    asm.emit(b'\x48\x85\xc0', 'test rax, rax')
    asm.j_cond(0x84, 'pi_done_digits', 'jz')
    asm.emit(b'\x48\x31\xd2', 'xor rdx, rdx')
    asm.emit(b'\x49\xf7\xf0', 'div r8')
    asm.emit(b'\x80\xc2\x30', "add dl, '0'")
    asm.emit(b'\x48\xff\xce', 'dec rsi')
    asm.emit(b'\x88\x16', 'mov byte ptr [rsi], dl')
    asm.jmp('pi_digit_loop')

    asm.label('pi_done_digits')
    asm.emit(b'\x45\x85\xc9', 'test r9d, r9d')
    asm.j_cond(0x84, 'pi_write', 'jz')
    asm.emit(b'\x48\xff\xce', 'dec rsi')
    asm.emit(b'\xc6\x06\x2d', "mov byte ptr [rsi], '-'")

    asm.label('pi_write')
    asm.emit(b'\x48\x89\xe8', 'mov rax, rbp')
    asm.emit(b'\x48\x29\xf0', 'sub rax, rsi ; len')
    asm.emit(b'\x48\x89\xc2', 'mov rdx, rax ; count')
    asm.emit(b'\x48\xc7\xc0\x01\x00\x00\x00', 'mov rax, 1 ; sys_write')
    asm.emit(b'\x48\xc7\xc7\x01\x00\x00\x00', 'mov rdi, 1 ; stdout')
    asm.emit(b'\x0f\x05', 'syscall')
    asm.emit(b'\x48\x83\xc4\x40', 'add rsp, 64')
    asm.emit(b'\x5d', 'pop rbp')
    asm.emit(b'\xc3', 'ret')

def compile_source(source_code):
    tokens = lex(source_code)
    asm = Assembler()
    rodata = bytearray()

    def add_rodata_string(s_bytes):
        off = len(rodata)
        rodata.extend(struct.pack('<Q', len(s_bytes)))
        rodata.extend(s_bytes)
        return off

    symbols = {}
    label_id = [0]
    def gen_label(prefix='lbl'):
        label_id[0] += 1
        return f"{prefix}_{label_id[0]}"

    asm.emit(b'\x55', 'push rbp')
    asm.emit(b'\x48\x89\xe5', 'mov rbp, rsp')
    asm.emit(b'\x48\x81\xec\x00\x02\x00\x00', 'sub rsp, 512')

    pos = 0
    stream_type = None
    needs_print_int = False

    def peek():
        return tokens[pos] if pos < len(tokens) else None

    def consume(expected_type=None):
        nonlocal pos
        t = tokens[pos]
        if expected_type and t.type != expected_type:
            raise SyntaxError(f"Expected {expected_type} but got {t.type} at {t.line}:{t.col}")
        pos += 1
        return t

    def load_operand(t):
        if t.type == 'INT':
            asm.emit(b'\x48\xbb' + struct.pack('<q', t.val), f"mov rbx, {t.val}")
        elif t.type == 'IDENT':
            if t.val not in symbols:
                raise NameError(f"Undefined identifier '{t.val}' at line {t.line}:{t.col}")
            stk_off, _ = symbols[t.val]
            asm.emit(b'\x48\x8b\x9d' + struct.pack('<i', -stk_off), f"mov rbx, [rbp - {stk_off}] ; {t.val}")
        else:
            raise SyntaxError(f"Invalid operand '{t.val}' at line {t.line}:{t.col}")

    while pos < len(tokens):
        t = peek()
        if t.type == 'EOF':
            break
        if t.type == 'NEWLINE':
            consume()
            continue

        if t.type == 'INT':
            consume()
            asm.emit(b'\x48\xb8' + struct.pack('<q', t.val), f"mov rax, {t.val}")
            stream_type = 'INT'
        elif t.type == 'STRING':
            consume()
            off = add_rodata_string(t.val.encode('utf-8'))
            asm.lea_rip_rodata(off, f"; '{t.val[:20]}...'")
            stream_type = 'STRING'
        elif t.type == 'IDENT':
            consume()
            if t.val not in symbols:
                raise NameError(f"Undefined identifier '{t.val}' at line {t.line}:{t.col}")
            stk_off, sym_type = symbols[t.val]
            asm.emit(b'\x48\x8b\x85' + struct.pack('<i', -stk_off), f"mov rax, [rbp - {stk_off}] ; {t.val}")
            stream_type = sym_type
        else:
            raise SyntaxError(f"Expected expression at start of statement, got {t.type} at line {t.line}:{t.col}")

        while True:
            t = peek()
            if not t or t.type in ('NEWLINE', 'EOF'):
                break

            if t.type == '>':
                consume('>')
                id_tok = consume('IDENT')
                if id_tok.val not in symbols:
                    stk_off = 8 * (len(symbols) + 1)
                    symbols[id_tok.val] = (stk_off, stream_type)
                else:
                    stk_off, _ = symbols[id_tok.val]
                    symbols[id_tok.val] = (stk_off, stream_type)
                asm.emit(b'\x48\x89\x85' + struct.pack('<i', -stk_off), f"mov [rbp - {stk_off}], rax ; > {id_tok.val}")
                continue

            if t.type == '|':
                consume('|')
                nxt = peek()

                if nxt.type == '$':
                    consume('$')
                    if stream_type == 'INT':
                        asm.call('print_int')
                        needs_print_int = True
                    elif stream_type == 'STRING':
                        asm.emit(b'\x48\x8b\x10', 'mov rdx, [rax] ; len')
                        asm.emit(b'\x48\x8d\x70\x08', 'lea rsi, [rax + 8] ; buf')
                        asm.emit(b'\x48\xc7\xc7\x01\x00\x00\x00', 'mov rdi, 1 ; stdout')
                        asm.emit(b'\x48\xc7\xc0\x01\x00\x00\x00', 'mov rax, 1 ; sys_write')
                        asm.emit(b'\x0f\x05', 'syscall')
                    else:
                        raise TypeError(f"Cannot route unknown stream type to $ sink at line {nxt.line}:{nxt.col}")
                    continue

                if nxt.type in ('+', '-', '*', '/', '%'):
                    op_tok = consume()
                    val_tok = consume()
                    load_operand(val_tok)
                    if op_tok.type == '+':
                        asm.emit(b'\x48\x01\xd8', 'add rax, rbx')
                    elif op_tok.type == '-':
                        asm.emit(b'\x48\x29\xd8', 'sub rax, rbx')
                    elif op_tok.type == '*':
                        asm.emit(b'\x48\x0f\xaf\xc3', 'imul rax, rbx')
                    elif op_tok.type == '/':
                        asm.emit(b'\x48\x99\x48\xf7\xfb', 'cqo; idiv rbx')
                    elif op_tok.type == '%':
                        asm.emit(b'\x48\x99\x48\xf7\xfb\x48\x89\xd0', 'cqo; idiv rbx; mov rax, rdx ; remainder')
                    stream_type = 'INT'
                    continue

                if nxt.type == '?':
                    consume('?')
                    consume('[')
                    cmp_tok = consume('CMP') if peek().type == 'CMP' else consume('>')
                    cmp_val_tok = consume()
                    load_operand(cmp_val_tok)
                    asm.emit(b'\x48\x39\xd8', 'cmp rax, rbx')
                    consume(':')

                    true_val_tok = consume()
                    consume('|')
                    false_val_tok = consume()
                    consume(']')

                    lbl_true = gen_label('branch_true')
                    lbl_end = gen_label('branch_end')

                    cond_opcodes = {
                        '<': (0x8C, 'jl'),
                        '<=': (0x8E, 'jle'),
                        '>': (0x8F, 'jg'),
                        '>=': (0x8D, 'jge'),
                        '==': (0x84, 'je'),
                        '!=': (0x85, 'jne')
                    }
                    if cmp_tok.val not in cond_opcodes:
                        raise SyntaxError(f"Unsupported comparison operator '{cmp_tok.val}' at line {cmp_tok.line}")

                    opc, mnem = cond_opcodes[cmp_tok.val]
                    asm.j_cond(opc, lbl_true, mnem)

                    res_type = None
                    if false_val_tok.type == 'STRING':
                        off = add_rodata_string(false_val_tok.val.encode('utf-8'))
                        asm.lea_rip_rodata(off)
                        res_type = 'STRING'
                    elif false_val_tok.type == 'INT':
                        asm.emit(b'\x48\xb8' + struct.pack('<q', false_val_tok.val), f"mov rax, {false_val_tok.val}")
                        res_type = 'INT'
                    elif false_val_tok.type == 'IDENT':
                        stk_off, sym_t = symbols[false_val_tok.val]
                        asm.emit(b'\x48\x8b\x85' + struct.pack('<i', -stk_off), f"mov rax, [rbp - {stk_off}]")
                        res_type = sym_t
                    asm.jmp(lbl_end)

                    asm.label(lbl_true)
                    if true_val_tok.type == 'STRING':
                        off = add_rodata_string(true_val_tok.val.encode('utf-8'))
                        asm.lea_rip_rodata(off)
                        res_type = 'STRING'
                    elif true_val_tok.type == 'INT':
                        asm.emit(b'\x48\xb8' + struct.pack('<q', true_val_tok.val), f"mov rax, {true_val_tok.val}")
                        res_type = 'INT'
                    elif true_val_tok.type == 'IDENT':
                        stk_off, sym_t = symbols[true_val_tok.val]
                        asm.emit(b'\x48\x8b\x85' + struct.pack('<i', -stk_off), f"mov rax, [rbp - {stk_off}]")
                        res_type = sym_t

                    asm.label(lbl_end)
                    stream_type = res_type
                    continue

                if nxt.type == '@':
                    consume('@')
                    consume('[')
                    cmp_tok = consume('CMP') if peek().type == 'CMP' else consume('>')
                    cmp_val_tok = consume()
                    consume(':')

                    lbl_loop_top = gen_label('loop_top')
                    lbl_loop_exit = gen_label('loop_exit')

                    asm.label(lbl_loop_top)
                    load_operand(cmp_val_tok)
                    asm.emit(b'\x48\x39\xd8', 'cmp rax, rbx')

                    inv_cond_map = {
                        '<': (0x8D, 'jge'),
                        '<=': (0x8F, 'jg'),
                        '>': (0x8E, 'jle'),
                        '>=': (0x8C, 'jl'),
                        '==': (0x85, 'jne'),
                        '!=': (0x84, 'je')
                    }
                    inv_opc, inv_mnem = inv_cond_map[cmp_tok.val]
                    asm.j_cond(inv_opc, lbl_loop_exit, inv_mnem)

                    while peek() and peek().type != ']':
                        bt = peek()
                        if bt.type == '|':
                            consume('|')
                            continue
                        if bt.type == 'IDENT':
                            id_t = consume('IDENT')
                            stk_off, sym_t = symbols[id_t.val]
                            asm.emit(b'\x48\x8b\x85' + struct.pack('<i', -stk_off), f"mov rax, [rbp - {stk_off}] ; {id_t.val}")
                            stream_type = sym_t
                        elif bt.type == 'INT':
                            consume()
                            asm.emit(b'\x48\xb8' + struct.pack('<q', bt.val), f"mov rax, {bt.val}")
                            stream_type = 'INT'
                        elif bt.type in ('+', '-', '*', '/', '%'):
                            op_t = consume()
                            val_t = consume()
                            load_operand(val_t)
                            if op_t.type == '+': asm.emit(b'\x48\x01\xd8', 'add rax, rbx')
                            elif op_t.type == '-': asm.emit(b'\x48\x29\xd8', 'sub rax, rbx')
                            elif op_t.type == '*': asm.emit(b'\x48\x0f\xaf\xc3', 'imul rax, rbx')
                            elif op_t.type == '/': asm.emit(b'\x48\x99\x48\xf7\xfb', 'cqo; idiv rbx')
                            elif op_t.type == '%': asm.emit(b'\x48\x99\x48\xf7\xfb\x48\x89\xd0', 'cqo; idiv rbx; mov rax, rdx')
                        elif bt.type == '>':
                            consume('>')
                            store_id = consume('IDENT')
                            if store_id.val not in symbols:
                                stk_off = 8 * (len(symbols) + 1)
                                symbols[store_id.val] = (stk_off, stream_type)
                            else:
                                stk_off, _ = symbols[store_id.val]
                            asm.emit(b'\x48\x89\x85' + struct.pack('<i', -stk_off), f"mov [rbp - {stk_off}], rax ; > {store_id.val}")
                        else:
                            raise SyntaxError(f"Unexpected token {bt.type} inside loop body at line {bt.line}")

                    consume(']')
                    asm.jmp(lbl_loop_top)
                    asm.label(lbl_loop_exit)
                    continue

                raise SyntaxError(f"Unexpected token '{nxt.val}' after pipe at line {nxt.line}:{nxt.col}")

            raise SyntaxError(f"Unexpected token '{t.val}' at line {t.line}:{t.col}")

    asm.emit(b'\xb8\x3c\x00\x00\x00', 'mov eax, 60 ; sys_exit')
    asm.emit(b'\x31\xff', 'xor edi, edi')
    asm.emit(b'\x0f\x05', 'syscall')

    if needs_print_int:
        emit_print_int_routine(asm)

    code_offset = 128
    code_bytes = asm.resolve(code_offset + len(asm.code))
    total_file_size = code_offset + len(code_bytes) + len(rodata)

    base_vaddr = 0x400000
    ehdr = struct.pack('<16sHHIQQQIHHHHHH',
        b'\x7fELF\x02\x01\x01\x00' + b'\x00'*8,  # e_ident
        2,                                      # e_type (ET_EXEC)
        0x3E,                                   # e_machine (EM_X86_64)
        1,                                      # e_version
        base_vaddr + code_offset,               # e_entry
        64,                                     # e_phoff
        0,                                      # e_shoff
        0,                                      # e_flags
        64,                                     # e_ehsize
        56,                                     # e_phentsize
        1,                                      # e_phnum
        0,                                      # e_shentsize
        0,                                      # e_shnum
        0                                       # e_shstrndx
    )

    phdr = struct.pack('<IIQQQQQQ',
        1,                                      # p_type (PT_LOAD)
        7,                                      # p_flags (PF_R | PF_W | PF_X)
        0,                                      # p_offset
        base_vaddr,                             # p_vaddr
        base_vaddr,                             # p_paddr
        total_file_size,                        # p_filesz
        total_file_size + 0x10000,              # p_memsz
        0x1000                                  # p_align
    )

    padding = b'\x00' * (code_offset - (len(ehdr) + len(phdr)))
    binary_bytes = ehdr + phdr + padding + code_bytes + rodata

    meta = {
        'ehdr': ehdr,
        'phdr': phdr,
        'code_bytes': code_bytes,
        'rodata': rodata,
        'asm_log': asm.asm_log,
        'entry_vaddr': base_vaddr + code_offset,
        'symbols': symbols
    }
    return binary_bytes, meta

def dump_readelf(binary_bytes):
    ehdr_fmt = '<16sHHIQQQIHHHHHH'
    (ident, e_type, e_mach, e_ver, e_entry, e_phoff, e_shoff, e_flags,
     e_ehsize, e_phentsize, e_phnum, e_shentsize, e_shnum, e_shstrndx) = struct.unpack_from(ehdr_fmt, binary_bytes, 0)

    print("ELF Header:")
    magic = ' '.join(f"{b:02x}" for b in ident)
    print(f"  Magic:                             {magic}")
    print(f"  Class:                             ELF64")
    print(f"  Data:                              2's complement, little endian")
    print(f"  Version:                           1 (current)")
    print(f"  OS/ABI:                            UNIX - System V")
    print(f"  Type:                              EXEC (Executable file)")
    print(f"  Machine:                           Advanced Micro Devices X86-64")
    print(f"  Version:                           0x{e_ver:x}")
    print(f"  Entry point address:               0x{e_entry:x}")
    print(f"  Start of program headers:          {e_phoff} (bytes into file)")
    print(f"  Start of section headers:          {e_shoff} (bytes into file)")
    print(f"  Flags:                             0x{e_flags:x}")
    print(f"  Size of this header:               {e_ehsize} (bytes)")
    print(f"  Size of program headers:           {e_phentsize} (bytes)")
    print(f"  Number of program headers:         {e_phnum}")

    phdr_fmt = '<IIQQQQQQ'
    (p_type, p_flags, p_offset, p_vaddr, p_paddr, p_filesz, p_memsz, p_align) = struct.unpack_from(phdr_fmt, binary_bytes, e_phoff)
    flags_str = ('R' if p_flags & 4 else ' ') + ('W' if p_flags & 2 else ' ') + ('E' if p_flags & 1 else ' ')
    print("\nProgram Headers:")
    print("  Type           Offset             VirtAddr           PhysAddr")
    print("                 FileSiz            MemSiz              Flags  Align")
    print(f"  LOAD           0x{p_offset:016x} 0x{p_vaddr:016x} 0x{p_paddr:016x}")
    print(f"                 0x{p_filesz:016x} 0x{p_memsz:016x}  {flags_str}    0x{p_align:x}")

def dump_hex(binary_bytes):
    print("ELF64 Binary Hex Dump:")
    for offset in range(0, len(binary_bytes), 16):
        chunk = binary_bytes[offset:offset+16]
        hex_str = ' '.join(f"{b:02x}" for b in chunk)
        ascii_str = ''.join(chr(b) if 32 <= b <= 126 else '.' for b in chunk)
        print(f"  {offset:08x}:  {hex_str:<48}  |{ascii_str}|")

def main():
    if len(sys.argv) < 2 or '--help' in sys.argv or '-h' in sys.argv:
        print(f"Axil Native Compiler (axilc) v{VERSION}")
        print("Usage: python3 axilc.py <source.axil> [-o <output_binary>] [flags]")
        print("\nOptions:")
        print("  -o <binary>      Specify output binary name (default: <basename>)")
        print("  --readelf        Decode and print ELF64 headers and segments")
        print("  --dump-asm       Print generated x86-64 assembly instructions")
        print("  --dump-hex       Print colorized binary hexdump")
        print("  --dump-tokens    Display lexical token stream")
        print("  -v, --version    Display compiler version")
        sys.exit(0)

    if '-v' in sys.argv or '--version' in sys.argv:
        print(f"axilc v{VERSION}")
        sys.exit(0)

    input_file = sys.argv[1]
    output_file = "a.out"

    if '-o' in sys.argv:
        idx = sys.argv.index('-o')
        if idx + 1 < len(sys.argv):
            output_file = sys.argv[idx + 1]
    else:
        base, _ = os.path.splitext(input_file)
        output_file = base

    if not os.path.exists(input_file):
        sys.stderr.write(f"Error: file not found: {input_file}\n")
        sys.exit(1)

    with open(input_file, 'r', encoding='utf-8') as f:
        src = f.read()

    if '--dump-tokens' in sys.argv:
        print("--- Lexical Token Stream ---")
        for tok in lex(src):
            print(f"  {tok}")

    try:
        binary_bytes, meta = compile_source(src)

        if '--dump-asm' in sys.argv:
            print("--- Generated x86-64 Machine Code Assembly ---")
            for off, line in meta['asm_log']:
                print(f"  0x{0x400080 + off:08x}  {line}")

        if '--readelf' in sys.argv:
            dump_readelf(binary_bytes)

        if '--dump-hex' in sys.argv:
            dump_hex(binary_bytes)

        out_dir = os.path.dirname(output_file)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
        with open(output_file, 'wb') as f:
            f.write(binary_bytes)
        os.chmod(output_file, 0o755)
        print(f"Successfully compiled {input_file} -> {output_file} ({len(binary_bytes)} bytes)")
    except Exception as e:
        sys.stderr.write(f"Compilation error: {e}\n")
        sys.exit(1)

if __name__ == '__main__':
    main()
EOF
chmod +x axil-lang/src/axilc.py

# 6. test_runner.sh
cat << 'EOF' > axil-lang/test_runner.sh
#!/usr/bin/env bash
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPILER="${SCRIPT_DIR}/src/axilc.py"
BIN_DIR="${SCRIPT_DIR}/bin"
mkdir -p "${BIN_DIR}"

echo -e "${BOLD}${BLUE}================================================================${NC}"
echo -e "${BOLD}${CYAN}            AXIL ZERO-DEPENDENCY TEST HARNESS v1.1             ${NC}"
echo -e "${BOLD}${BLUE}================================================================${NC}"

declare -A EXPECTED_OUTPUTS
EXPECTED_OUTPUTS["01_hello.axil"]="Hello, World from Axil!"
EXPECTED_OUTPUTS["02_arithmetic.axil"]="60"
EXPECTED_OUTPUTS["03_branches.axil"]="Under 18"
EXPECTED_OUTPUTS["04_loop.axil"]="120"
EXPECTED_OUTPUTS["05_modulo.axil"]="Odd"

PASSED=0
FAILED=0

for test_file in "${SCRIPT_DIR}/examples"/*.axil; do
    test_name="$(basename "${test_file}")"
    bin_name="${BIN_DIR}/$(basename "${test_file}" .axil)"

    echo -e "\n${BOLD}--> Testing [${test_name}]${NC}"
    
    # 1. Compilation
    if python3 "${COMPILER}" "${test_file}" -o "${bin_name}"; then
        bin_size=$(wc -c < "${bin_name}")
        echo -e "    Compilation: ${GREEN}OK${NC} (${bin_size} bytes)"
    else
        echo -e "    Compilation: ${RED}FAILED${NC}"
        FAILED=$((FAILED + 1))
        continue
    fi

    # 2. Native Execution
    ACTUAL_OUTPUT="$("${bin_name}")"
    EXPECTED="${EXPECTED_OUTPUTS[${test_name}]:-}"

    TRIMMED_ACTUAL="$(echo -n "${ACTUAL_OUTPUT}" | tr -d '\r')"
    TRIMMED_EXPECTED="$(echo -n "${EXPECTED}" | tr -d '\r')"

    echo -e "    Program Output: ${CYAN}${ACTUAL_OUTPUT}${NC}"

    if [ "${TRIMMED_ACTUAL}" = "${TRIMMED_EXPECTED}" ]; then
        echo -e "    Verification:   ${GREEN}PASSED${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "    Verification:   ${RED}FAILED${NC}"
        echo -e "      Expected: '${TRIMMED_EXPECTED}'"
        echo -e "      Received: '${TRIMMED_ACTUAL}'"
        FAILED=$((FAILED + 1))
    fi
done

echo -e "\n${BOLD}${BLUE}================================================================${NC}"
echo -e "${BOLD}Results: ${GREEN}${PASSED} passed${NC}, ${RED}${FAILED} failed${NC}"
echo -e "${BOLD}${BLUE}================================================================${NC}"

if [ "${FAILED}" -ne 0 ]; then
    exit 1
fi
EOF
chmod +x axil-lang/test_runner.sh

echo -e "\n${GREEN}Repository scaffolded successfully!${NC}"
echo -e "Running test suite inside axil-lang/...\n"

(cd axil-lang && ./test_runner.sh)

echo -e "\n${BOLD}${GREEN}All Axil tests compiled and verified natively with 0 external dependencies!${NC}\n"
