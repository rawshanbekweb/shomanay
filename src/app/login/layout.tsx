import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Kirish — Shomanay Rayonı Boshqaruv Platformasi',
  description: 'Shomanay tumani boshqaruv platformasiga kirish',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
