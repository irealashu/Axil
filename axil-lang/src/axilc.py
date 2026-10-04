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
