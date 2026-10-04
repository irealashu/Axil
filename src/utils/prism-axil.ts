import Prism from 'prismjs';

Prism.languages.axil = {
  comment: {
    pattern: /(^|[^\\])(?:\/\/.*|\/\*[\s\S]*?\*\/)/,
    lookbehind: true,
    greedy: true
  },
  string: {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true
  },
  register: /\b(?:rax|rbx|rcx|rdx|rsi|rdi|rbp|rsp|r8|r9|r10|r11|r12|r13|r14|r15|rip|flags)\b/,
  keyword: /\b(?:u8|u16|u32|u64|f64|syscall|mmap|mprotect|munmap|if|else|while|for|fn|return|var)\b/,
  number: /\b(?:0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b/,
  operator: /\||>|@|!|&|\?|:|\+|-|\*|\/|%|\$|==|!=|<=|>=|<|>/,
  punctuation: /[\[\](){},;.]/
};

export default Prism;
