export function WhatsNewPage() {
  const sections = [
    {
      title: "Language Evolution",
      items: [
        { title: "Structured Pattern Matching", desc: "Replaced limited ternary logic with powerful, readable match tables for cleaner control flow." },
        { title: "Tuple Streaming", desc: "Introduced support for passing multiple values through the pipeline without auxiliary variables." },
        { title: "Improved Diagnostics", desc: "Compiler now tracks precise column/line offsets for clearer error messages." }
      ]
    },
    {
      title: "Developer Studio & Tooling",
      items: [
        { title: "Revamped Workspace", desc: "The Developer Studio is now a dedicated, high-performance page with streamlined navigation." },
        { title: "Direct Pipeline Controls", desc: "Integrated the primary Run action directly into the code editor toolbar with instant keyboard execution (Ctrl+Enter)." },
        { title: "Optimized Documentation", desc: "Updated and improved the scrollability and view of the Documentation & Specification pages for better readability." }
      ]
    },
    {
      title: "Systems & Memory Foundations",
      items: [
        { title: "Sized Types & Pointers", desc: "Begun implementation of native bit-width types and address-of/dereference operators for systems programming." },
        { title: "Memory Safety", desc: "Initial work on linear memory scope management." }
      ]
    },
    {
      title: "Infrastructure",
      items: [
        { title: "Cross-Platform Readiness", desc: "Foundations for multi-architecture IR generation (x86, ARM, WASM) and cross-OS syscall abstraction." }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      <div className="pb-3 border-b border-slate-800/80">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          What's New
        </h1>
        <p className="mt-0.5 text-xs text-slate-400">
          Changelog and toolchain architectural upgrades.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 sm:p-6">
            <h2 className="text-base font-semibold text-white mb-4">{section.title}</h2>
            <div className="space-y-3.5">
              {section.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1 h-5 bg-cyan-400 rounded-full shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-xs sm:text-sm text-slate-200">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
