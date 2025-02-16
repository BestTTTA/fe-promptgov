import React from 'react';
import Navbar from '@/components/Navbar';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Navbar />
      {children}
    </main>
  );
}
