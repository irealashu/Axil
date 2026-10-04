import React, { useState, useEffect } from 'react';
import { Navbar, PageId } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { DeveloperStudioPage } from './pages/DeveloperStudioPage';
import { DocsPage } from './pages/DocsPage';
import { ToolkitPage } from './pages/ToolkitPage';
import { WhatsNewPage } from './pages/WhatsNewPage';
import { FULL_SCRIPT_TEXT } from './scriptText';

function getPageFromHash(): PageId {
  const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (hash === 'studio') return 'studio';
  if (hash === 'docs' || hash === 'documentation' || hash === 'spec' || hash === 'specification') return 'docs';
  if (hash === 'toolkit' || hash === 'download' || hash === 'install' || hash === 'toolchain' || hash === 'tests') return 'toolkit';
  if (hash === 'whats-new' || hash === 'new') return 'whats-new';
  return 'home';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(getPageFromHash);
  const [activeStudioCode, setActiveStudioCode] = useState<string | undefined>(undefined);

  // Sync hash changes (browser back/forward buttons & direct links)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '/' : `/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadExampleToStudio = (code: string) => {
    setActiveStudioCode(code);
    handleNavigate('studio');
  };

  const handleDownloadScript = () => {
    const blob = new Blob([FULL_SCRIPT_TEXT], { type: 'application/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'setup_axil.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Header Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* 2. Main Page View */}
      <main className="flex-1 flex flex-col">
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}
        {currentPage === 'studio' && (
          <DeveloperStudioPage initialStudioCode={activeStudioCode} />
        )}
        {currentPage === 'docs' && (
          <DocsPage onLoadExampleToPlayground={handleLoadExampleToStudio} />
        )}
        {currentPage === 'toolkit' && (
          <ToolkitPage onDownloadScript={handleDownloadScript} />
        )}
        {currentPage === 'whats-new' && (
          <WhatsNewPage />
        )}
      </main>

      {/* 3. Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
