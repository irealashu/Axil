import React, { useRef, useState, useEffect } from 'react';
import Prism from 'prismjs';
import '../utils/prism-axil';

interface AxilEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  placeholder?: string;
  filename?: string;
}

export function AxilEditor({ value, onChange, onRun, placeholder, filename }: AxilEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });

  // Update cursor line and column on selection change or keystroke
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;
    const selStart = textareaRef.current.selectionStart || 0;
    const linesUpToCursor = text.substring(0, selStart).split('\n');
    const line = linesUpToCursor.length;
    const col = linesUpToCursor[linesUpToCursor.length - 1].length + 1;
    setCursorPos({ line, col });
  };

  const handleScroll = () => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      if (preRef.current) {
        preRef.current.scrollTop = scrollTop;
        preRef.current.scrollLeft = scrollLeft;
      }
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = scrollTop;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Run on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun?.();
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          updateCursorPosition();
        }
      }, 0);
      return;
    }

    // Auto-close brackets and quotes
    const pairs: Record<string, string> = {
      '[': ']',
      '(': ')',
      '{': '}',
      '"': '"'
    };

    if (pairs[e.key]) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // If nothing is selected, insert pair and keep cursor in middle
      if (start === end) {
        const nextChar = value[start];
        // If typing quote and already before matching quote, skip over
        if (e.key === '"' && nextChar === '"') {
          e.preventDefault();
          textarea.selectionStart = textarea.selectionEnd = start + 1;
          updateCursorPosition();
          return;
        }

        e.preventDefault();
        const closeChar = pairs[e.key];
        const newValue = value.substring(0, start) + e.key + closeChar + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
            updateCursorPosition();
          }
        }, 0);
        return;
      }
    }

    // Backspace: delete matching pair if adjacent
    if (e.key === 'Backspace') {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end && start > 0) {
        const prev = value[start - 1];
        const next = value[start];
        if (
          (prev === '[' && next === ']') ||
          (prev === '(' && next === ')') ||
          (prev === '{' && next === '}') ||
          (prev === '"' && next === '"')
        ) {
          e.preventDefault();
          const newValue = value.substring(0, start - 1) + value.substring(start + 1);
          onChange(newValue);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start - 1;
              updateCursorPosition();
            }
          }, 0);
          return;
        }
      }
    }

    setTimeout(updateCursorPosition, 0);
  };

  const lines = (value || '').split('\n');
  const lineCount = Math.max(lines.length, 1);
  const totalChars = value.length;

  const highlightedHtml = Prism.highlight(
    value || '',
    Prism.languages.axil || Prism.languages.clike,
    'axil'
  );

  return (
    <div className="relative flex-1 w-full min-h-[340px] flex flex-col bg-black font-mono text-[13px] overflow-hidden select-text">
      {/* Editor Body */}
      <div className="relative flex-1 flex h-full overflow-hidden bg-black">
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-12 select-none py-3.5 text-right pr-3 border-r border-white/[0.08] bg-black font-mono text-[12px] leading-[1.65rem] overflow-hidden shrink-0"
        >
          {Array.from({ length: lineCount }).map((_, i) => {
            const lineNum = i + 1;
            const isCurrent = lineNum === cursorPos.line;
            return (
              <div
                key={i}
                className={`h-[1.65rem] leading-[1.65rem] transition-colors ${
                  isCurrent ? 'text-cyan-400 font-bold' : 'text-slate-600'
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Text Area & Syntax Highlight Pane */}
        <div className="relative flex-1 h-full overflow-hidden bg-black">
          {/* Active Line Glow */}
          <div
            className="pointer-events-none absolute left-0 right-0 h-[1.65rem] bg-cyan-500/[0.04] border-y border-cyan-500/10 transition-all duration-75"
            style={{
              top: `${(cursorPos.line - 1) * 1.65 + 0.875}rem`
            }}
          />

          {/* Highlighted Syntax Layer Underneath */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="language-axil pointer-events-none absolute inset-0 m-0 p-3.5 font-mono text-[13px] leading-[1.65rem] whitespace-pre overflow-hidden bg-black"
            style={{ tabSize: 2 }}
            dangerouslySetInnerHTML={{
              __html: highlightedHtml + (value.endsWith('\n') ? '\n ' : '')
            }}
          />

          {/* Real Transparent Textarea for User Inputs */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              updateCursorPosition();
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onSelect={updateCursorPosition}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder={placeholder || 'Type Axil stream expression...'}
            className="absolute inset-0 m-0 p-3.5 w-full h-full resize-none font-mono text-[13px] leading-[1.65rem] whitespace-pre overflow-auto bg-transparent text-transparent caret-cyan-400 focus:outline-none selection:bg-cyan-500/25 selection:text-transparent placeholder:text-slate-600"
            style={{ tabSize: 2 }}
          />
        </div>
      </div>

      {/* Editor Status Bar */}
      <div className="h-6 border-t border-white/[0.08] bg-black px-3 flex items-center justify-between text-[11px] text-slate-500 font-mono select-none">
        <span className="text-slate-400">
          Ln {cursorPos.line}, Col {cursorPos.col}
        </span>
        <div className="flex items-center gap-3 text-slate-500 text-[10px]">
          <span>UTF-8</span>
          <span className="text-slate-600">·</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
}
