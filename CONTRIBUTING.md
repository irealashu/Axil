# Contributing to Axil

Thank you for your interest in contributing to **Axil**! We welcome contributions from systems engineers, compiler designers, documentation writers, and developers of all backgrounds.

---

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all community members with respect and professionalism.

---

## How Can You Contribute?

You can contribute in multiple areas:
1. **Compiler Frontend & Grammar**: Enhance tokenization, syntax validation, and pattern matching rules.
2. **Intermediate Representation (IR)**: Expand the decoupled IR for optimization passes.
3. **Backend Machine Code Generation**:
   - AMD64/x86-64 opcode emission.
   - Experimental backends (AArch64 / ARM64, RISC-V, WASM).
4. **Developer Studio**: Improve web IDE features, terminal inspection tabs, syntax token themes, and layout performance.
5. **Documentation & Field Examples**: Add new canonical examples in `docs/` and improve architectural explanations.
6. **Testing & Verification**: Add test cases to `axil-lang/test_runner.sh`.

---

## Development Setup

### 1. Fork & Clone the Repository
```bash
git clone https://github.com/irealashu/Axil.git
cd Axil
```

### 2. Local Compiler Testing (Python 3)
Axil's standalone native compiler requires standard Python 3.8+ without external dependencies:
```bash
# Compile an example
python3 axil-lang/src/axilc.py axil-lang/examples/hello.axil

# Run the test harness
bash axil-lang/test_runner.sh
```

### 3. Local Web App & Developer Studio (Node.js)
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to test the web interface.

---

## Architectural Guidelines

- **Zero-Dependency Mandate**: The core compiler (`axilc.py`) MUST remain self-contained and runnable on pure Python 3 without requiring external libraries or C toolchains (no GCC, Clang, or libc).
- **Bare-Metal Syscalls**: All generated Linux binaries must invoke Linux kernel syscalls via raw `0F 05` machine instructions conforming to the System V AMD64 ABI.
- **Deterministic ELF64 Packaging**: Binaries must adhere to the standard 64-byte `Elf64_Ehdr` and 56-byte `Elf64_Phdr` single loadable segment mapped at `0x400000`.

---

## Adding New Test Cases

1. Create a new `.axil` source file in `axil-lang/examples/`.
2. Add the test file and its expected kernel stdout to `axil-lang/test_runner.sh`.
3. Verify that `bash axil-lang/test_runner.sh` executes with all tests passing (100% coverage).

---

## Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Ensure all tests and linter checks pass:
   ```bash
   npm run lint
   npm run build
   bash axil-lang/test_runner.sh
   ```
3. Commit your changes with descriptive, conventional commit messages:
   ```bash
   git commit -m "feat(compiler): add support for tuple stream decomposition"
   ```
4. Push your branch to GitHub and open a Pull Request at [https://github.com/irealashu/Axil/pulls](https://github.com/irealashu/Axil/pulls).

---

## Community & Discussions

- **GitHub Issues**: [https://github.com/irealashu/Axil/issues](https://github.com/irealashu/Axil/issues)
- **Author**: Ashutosh Singh ([@irealashu](https://github.com/irealashu))

Thank you for helping build the future of keyword-free, stream-directional systems programming!
