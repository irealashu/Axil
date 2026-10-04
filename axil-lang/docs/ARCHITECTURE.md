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
