// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:       'TaskEarn Pro — Micro Job Marketplace',
  description: 'Earn money completing micro tasks or hire workers for your projects.',
  keywords:    'micro jobs, earn money online, task marketplace, freelance',
  openGraph: {
    title:       'TaskEarn Pro',
    description: 'Earn money completing micro tasks',
    type:        'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
