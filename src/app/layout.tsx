import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { ObjectPassportModal } from '@/components/ObjectPassportModal';

export const metadata: Metadata = {
  title: 'Shomanay Rayonı Hákimligi — Operativ Basqarıw Platforması',
  description: 'Shomanay tumani davlat raqamli boshqaruv platformasi, GIS xarita va qarorlarni qo‘llab-quvvatlash tizimi',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kaa-Latn" className="h-full dark">
      <body className="min-h-full bg-[#060d17] text-slate-100 antialiased flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <AppProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <ObjectPassportModal />
          
          <footer className="mt-auto border-t border-slate-800/80 bg-[#07101f] py-5 px-6 text-xs text-slate-400">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-[1680px] mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-md bg-[#0a3d8f] text-white flex items-center justify-center font-bold text-xs border border-blue-400/40">
                  SH
                </div>
                <span className="text-slate-300 font-medium">Qaraqalpaqstan Respublikası · Shomanay Rayonı Hákimligi Rásmiy Portalı</span>
              </div>
              <div className="flex items-center space-x-6 text-slate-500">
                <span>FERGA Situaciyalıq Oray Integraciyası</span>
                <span>•</span>
                <span>Asia/Tashkent waqtı</span>
                <span>•</span>
                <span>Versiya 2.0 (2026)</span>
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
