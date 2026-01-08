import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Carleton CS Prerequisite Visualizer',
  description: 'Interactive visualization of Carleton University Computer Science course prerequisites',
};

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

