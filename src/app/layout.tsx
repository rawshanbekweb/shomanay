import type { Metadata } from 'next';
import './globals.css';
import './mm.css';
import { AppProvider } from '@/context/AppContext';
import { ShellGate } from '@/components/ShellGate';
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
      <body className="h-full bg-[#050508] text-slate-100 antialiased font-sans">
        <AppProvider>
          <ShellGate>{children}</ShellGate>
          <ObjectPassportModal />
        </AppProvider>
      </body>
    </html>
  );
}
