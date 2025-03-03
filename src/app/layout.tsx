import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  weight: ['400'],
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Prompt Governance',
  description: 'Generated thai document by AI',
  keywords: ['prompt', 'PromptGov', 'promptgov', 'pomgov', 'prompgob', 'promtgov', 'promptgov', 'governance', 'AI', 'thai', 'document', 'generated', 'thai document', 'thai language', 'เอกสาร', 'ภาษาไทย', 'ราชการ', 'การบริหาร', 'การกำกับดูแล', 'สร้างเอกสารด้วย AI', 'เอกสารภาษาไทย', 'เอกสาร Template'],

  openGraph: {
    title: 'Prompt Governance',
    description: 'Generated thai document by AI',
    siteName: 'Prompt Governance',
    locale: 'th_TH',
    type: 'website',
    url: 'https://prompt-governance.vercel.app/',
    images: [
      {
        url: 'https://prompt-governance.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Prompt Governance OpenGraph Image',
      },
    ],
  },

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        cz-shortcut-listen="true"
        className={`${inter.className} antialiased`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
