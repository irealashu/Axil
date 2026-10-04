export interface SpecDetail {
  label: string;
  text: string;
}

export interface SpecChapter {
  num: number;
  title: string;
  summary: string;
  body: string;
  codeSnippet?: string;
  tableHeaders?: string[];
  tableRows?: string[][];
  details?: SpecDetail[];
}

export const SPEC_CHAPTERS: SpecChapter[] = [
  {
    num: 1,
    title: 'Stream Semantics & Directionality',
    summary: 'Linear execution model without operator precedence hierarchies or keywords.',
    body: 'Axil operates strictly left-to-right without operator precedence hierarchies, postfix stack inversion, or English keywords. Computation is conceptualized as a fluid stream of state held within AMD64 CPU register RAX, modified by inline apertures, and captured by sinks.',
    codeSnippet: '10 | + 20 | * 2 > total | $',
    details: [
      { label: 'Head Evaluation', text: 'Loads an integer literal, string literal, or variable identifier into register RAX accumulator.' },
      { label: 'Pipes (|)', text: 'Channels the active stream head from left to right into the next operation, aperture, or sink.' },
      { label: 'Linear Order', text: 'Evaluates (10 + 20) * 2 = 60 without precedence ambiguity or parentheses requirements.' },
      { label: 'Direct Kernel Dispatch', text: 'Sinks directly to Linux file descriptor 1 ($) via unmediated sys_write syscall.' }
    ]
  },
  {
    num: 2,
    title: 'State Storage & Stack Frame Allocation',
    summary: 'Non-consuming store operator (>) with fixed Base Pointer (RBP) offset slots.',
    body: 'The store operator (>) copies the active stream head into a named local stack slot without consuming it. Variable storage slots are mapped deterministically relative to Base Pointer (RBP), maintaining strict quadword alignment.',
    tableHeaders: ['Stack Offset', 'Slot Assignment', 'Architectural Semantics'],
    tableRows: [
      ['[RBP - 8]', 'First Identifier (x)', '8-byte quadword local storage slot'],
      ['[RBP - 16]', 'Second Identifier (y)', '8-byte quadword local storage slot'],
      ['[RBP - 24]', 'Third Identifier (z)', '8-byte quadword local storage slot'],
      ['[RBP - 512]', 'Scratch Frame Buffer', 'Sub rsp, 512 function prologue buffer for intermediate strings & itoa']
    ],
    details: [
      { label: 'Non-Consuming Copy', text: 'Executing `10 > x | + 5 > y` assigns 10 to x, adds 5 to stream (15), and assigns 15 to y.' },
      { label: 'Zero Heap Overhead', text: 'All variables reside exclusively in CPU registers and the static stack frame; no malloc or GC.' }
    ]
  },
  {
    num: 3,
    title: 'Terminal Output Sink ($) & Integer Formatter',
    summary: 'Direct sys_write kernel dispatch and zero-libc machine code decimal conversion.',
    body: 'The $ sink drains the active stream head directly to file descriptor 1 (stdout) using Linux sys_write. Axil includes an inlined, pure machine-code integer-to-string conversion routine, completely bypassing glibc printf/itoa.',
    codeSnippet: `mov rax, 1   ; sys_write (Linux 64-bit)
mov rdi, 1   ; stdout file descriptor
mov rsi, buf ; stack buffer address
mov rdx, len ; calculated digit byte length
syscall      ; opcode 0F 05`,
    details: [
      { label: 'Stack Buffer', text: 'Digits populated in reverse from [RBP - 1] down to [RBP - 32].' },
      { label: 'Hardware Division', text: 'Repeated div r8 (divisor 10) extracts ASCII digits.' },
      { label: 'Sign Handling', text: 'Prepends ASCII minus sign (0x2D) if RAX sign flag is active.' },
      { label: 'Zero Linker', text: 'Direct syscall invocation with 0F 05 requires no external C runtime or startup objects.' }
    ]
  },
  {
    num: 4,
    title: 'Arithmetic & Remainder Apertures',
    summary: 'Signed 64-bit integer arithmetic directly inside AMD64 hardware registers.',
    body: 'All operations operate on 64-bit signed two\'s complement integers directly inside AMD64 hardware registers without temporary heap objects or runtime allocations.',
    tableHeaders: ['Aperture', 'Opcode', 'Assembly Instruction', 'Semantics'],
    tableRows: [
      ['| + [val]', '48 01 d8', 'add rax, rbx', 'Signed 64-bit addition'],
      ['| - [val]', '48 29 d8', 'sub rax, rbx', 'Signed 64-bit subtraction'],
      ['| * [val]', '48 0f af c3', 'imul rax, rbx', 'Signed 64-bit multiplication'],
      ['| / [val]', '48 99; 48 f7 fb', 'cqo; idiv rbx', 'Signed 64-bit division'],
      ['| % [val]', '48 89 d0', 'mov rax, rdx', 'Remainder (modulo) in RDX']
    ],
    details: [
      { label: 'Dividend Sign Extension', text: '`cqo` extends 64-bit RAX into RDX:RAX 128-bit pair before division.' },
      { label: 'Quotient & Remainder', text: '`idiv` produces quotient in RAX and remainder in RDX simultaneously.' }
    ]
  },
  {
    num: 5,
    title: 'Control Flow: Branching (?) & Pattern Matching',
    summary: 'Keyword-free decision apertures and multi-branch pattern matching.',
    body: 'Control flow is expressed via decision apertures (?) and Turing-complete iterative streams (@). Pattern matching enables readable handling of multiple conditions without deep nesting.',
    codeSnippet: `15 | ? [ < 18 : "Under 18\\n" | "Adult\\n" ] | $
status | ? [
  0 : "Idle\\n"
  1 : "Running\\n"
  _ : "Unknown\\n"
] | $`,
    details: [
      { label: 'Condition Checking', text: 'Evaluates stream head against operands using cmp rax, rbx.' },
      { label: 'Multi-Branch Matching', text: 'Matches stream head against literal table, with _ acting as the default catch-all.' },
      { label: 'Direct Compilation', text: 'Translated to optimal jump tables or conditional branch sequences.' }
    ]
  },
  {
    num: 6,
    title: 'Complete Formal EBNF Grammar',
    summary: 'Exact 15-line formal grammar governing the entire language syntax.',
    body: 'The entire syntax of Axil is formally defined in exactly 15 production rules:',
    codeSnippet: `program         = { statement ( "\\n" | ";" ) } ;
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
IDENT           = ( letter | "_" ) { letter | digit | "_" } ;`
  },
  {
    num: 7,
    title: 'ELF64 Container & Virtual Memory Map',
    summary: '64-byte Ehdr and 56-byte Phdr packed directly into standalone executable.',
    body: 'The Axil compiler produces static, standalone Linux ELF executables (ET_EXEC) with zero external linkers (no ld, gold, or lld). The binary is mapped directly into user space at 0x400000.',
    tableHeaders: ['ELF Component', 'Size (Bytes)', 'Offset', 'Field Values'],
    tableRows: [
      ['Elf64_Ehdr', '64 B', '0x0000', 'e_ident: \\x7fELF (64-bit SysV), e_type: ET_EXEC (2), e_entry: 0x400080'],
      ['Elf64_Phdr', '56 B', '0x0040', 'p_type: PT_LOAD (1), p_flags: PF_R|PF_W|PF_X (7), p_vaddr: 0x400000'],
      ['Code Segment', 'Variable', '0x0080', 'Machine opcodes (.text) including stream pipeline & itoa'],
      ['Rodata Segment', 'Variable', 'Post-Code', 'Length-prefixed string literals with 8-byte count prefix']
    ]
  },
  {
    num: 8,
    title: 'Advanced Language Specification (Roadmap)',
    summary: 'Planned architectural upgrades for production-grade capability.',
    body: 'The Axil language is evolving to include explicit memory management, sized types, and cross-architecture portability.',
    details: [
      { label: 'Sized Types', text: 'Support for u8, u16, u32, u64, and f64 for low-level protocol mapping.' },
      { label: 'Interpolation', text: 'Inline string formatting: `"Result: {total}\n" | $`.' },
      { label: 'Memory Control', text: 'Linear scopes using kernel `mmap`/`munmap` with explicit pointers (&, @, !).' },
      { label: 'Portability', text: 'Decoupled IR to support x86-64, ARM64, RISC-V, and WebAssembly targets.' }
    ]
  }
];
