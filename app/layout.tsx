import type { Metadata } from 'next';
import './globals.css';
import { APP_INFO } from '@/constants/urls';

export const metadata: Metadata = {
  title: APP_INFO.TITLE,
  description: APP_INFO.DESCRIPTION,
};

/**
 * Root layout component
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
