import React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
