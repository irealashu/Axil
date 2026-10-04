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
