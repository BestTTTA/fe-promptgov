"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import { Sarabun } from 'next/font/google';
import html2canvas from 'html2canvas';
import { newsreleasebookPrompt } from '@/prompt/newsreleasebook';
import { useMediaQuery } from 'react-responsive';

const sarabun = Sarabun({
    weight: ['300'],
    variable: '--font-sarabun',
    subsets: ['thai'],
});

interface DocumentData {
    documentNumber: string;
    date: string;
    subject: string;
    content: string;
    signature: string;
    department: string;
    contactPerson: string;
}

export default function newsreleasebook() {
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
    const [showPreviewOnly, setShowPreviewOnly] = useState(false);

    const formRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement | null>(null);

    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1024px)' });

    const fetchDocumentData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: newsreleasebookPrompt
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to generate content');
            }
            const parsedData = typeof result.data === 'string'
                ? JSON.parse(result.data)
                : result.data;
            if (!parsedData?.document) {
                throw new Error('Response does not contain "document" key.');
            }
            setDocumentData(parsedData.document);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocumentData();
    }, [fetchDocumentData]);

    const keyword = 'จึงแถลงมาเพื่อทราบโดยทั่วกัน';

    let contentLines: string[] = [];

    if (documentData?.content) {
        const contentWithBreak = documentData.content.includes(`\n${keyword}`)
            ? documentData.content
            : documentData.content.replace(keyword, `\n${keyword}`);

        contentLines = contentWithBreak.split('\n');
    }

    const handleDownloadPDF = useCallback(async () => {
        if (!previewRef.current || !documentData) return;
        setIsPdfGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 21 * 37.8,
                windowHeight: 29.7 * 37.8,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'cm',
                format: 'a4',
            });

            const imgWidth = 21;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.setProperties({
                title: 'ข่าวแจก',
                subject: documentData.subject,
                creator: 'Document System',
                author: 'System',
            });

            const fileName = `ข่าวแจก_${documentData.documentNumber || 'ไม่ระบุ'}.pdf`;
            pdf.save(fileName);
        } catch (err) {
            setError('Failed to generate PDF: ' + (err instanceof Error ? err.message : String(err)));
            console.error('PDF generation error:', err);
        } finally {
            setIsPdfGenerating(false);
        }
    }, [documentData]);

    const handleRefresh = useCallback(async () => {
        setLoading(true);
        setError('');
        await fetchDocumentData();
    }, [fetchDocumentData]);

    const handlePreviewScroll = () => {
        setShowPreviewOnly(true);
    };

    const handleClosePreview = () => {
        setShowPreviewOnly(false);
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col p-4">
            <div className="flex flex-wrap items-center gap-2 p-4 bg-white rounded-md drop-shadow-sm">
                <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">Document newsreleasebook</h1>
                <div className="flex flex-wrap gap-2 w-full">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed max-w-full"
                    >
                        {loading ? 'กำลังสร้างเนื้อหา...' : 'สร้างเนื้อหาใหม่'} 5/5
                    </button>
                    {isTabletOrMobile && (
                        <button
                            onClick={handlePreviewScroll}
                            className="ml-auto px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 max-w-full whitespace-nowrap"
                        >
                            ดูตัวอย่าง PDF
                        </button>
                    )}
                    {!isTabletOrMobile && (
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isPdfGenerating}
                            className="ml-auto px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-gray-400"
                        >
                            {isPdfGenerating ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF'}
                        </button>
                    )}
                </div>
            </div>
            {isTabletOrMobile && showPreviewOnly ? (
                <div className="fixed inset-0 bg-black/50 bg-opacity-90 z-50 flex flex-col items-center justify-center">
                    <button
                        onClick={handleClosePreview}
                        className="absolute top-4 right-4 text-white text-2xl font-bold"
                    >
                        ✕
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isPdfGenerating}
                        className="mb-4 px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-gray-400"
                    >
                        {isPdfGenerating ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF'}
                    </button>
                    <div className="w-full overflow-x-auto max-h-[90vh] overflow-y-auto px-2">
                        <div
                            id="document-preview"
                            ref={previewRef}
                            className={`bg-white shadow-lg ${sarabun.className} p-[1cm] box-border overflow-hidden relative`}
                            style={{
                                boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                                border: '1px solid #ddd',
                                transform: 'scale(0.9)',
                                transformOrigin: 'top center',
                                width: '21cm',
                                height: '29.7cm',
                                minWidth: '21cm',
                                margin: '0 auto',
                            }}
                        >
                            <div className="text-center relative mt-[2.5cm] pl-[0.8cm] mb-[0.3cm]">
                                <div className="text-2xl">{documentData?.department}</div>
                            </div>

                            <div className="text-center mb-[5.5cm] pl-[3cm] pr-[2cm] relative">
                                <div className="mb-[0.3cm] text-xl">
                                    <span>{documentData?.subject}</span>
                                </div>
                                <div className="text-center mb-[0.5cm] mt-[0.1cm] pl-[2cm] pr-[2cm] text-xl">
                                    <div>{documentData?.documentNumber}</div>
                                </div>
                            </div>

                            <div className="absolute left-[80mm] right-[70mm] h-[10px] border-b border-black mt-[-51mm]" />

                            <div
                                className="mx-auto pl-[1.5cm] pr-[0.8cm] leading-[1.5]"
                                style={{
                                    textIndent: '2.5cm',
                                    marginTop: '-4.2cm',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    textAlign: 'start',
                                    WebkitHyphens: 'auto',
                                    MozHyphens: 'auto',
                                    hyphens: 'auto',
                                    fontKerning: 'auto',
                                    fontFamily: '"TH SarabunPSK", "Sarabun", "Noto Sans Thai", sans-serif',
                                    fontSize: '18px',
                                    lineHeight: '1.8',
                                    maxWidth: '18cm',
                                }}
                            >
                                {contentLines.map((line, index) => (
                                    <div
                                        key={index}
                                        className={line.trim() === keyword ? 'text-right pr-[6.8cm]' : 'text-justify'}
                                        style={{
                                            textIndent: line.trim() === keyword ? undefined : '2.5cm',
                                            marginBottom: line.trim() === keyword ? '0.1rem' : '0.2rem',
                                        }}
                                    >
                                        {line}
                                    </div>
                                ))}
                            </div>

                            <div className="text-center pl-[4.1cm] mb-[0.4cm] mt-10 text-xl">
                                {documentData?.signature}
                            </div>
                            <div className="text-center pl-[4.3cm] mb-[0.5cm] text-xl">
                                {documentData?.date}
                            </div>
                            <div className="text-left pl-[2cm] pr-[6cm] relative mb-[1.6cm]">
                                <div className="text-lg">{documentData?.contactPerson}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className={`w-full ${isTabletOrMobile ? 'max-w-md mx-auto' : 'lg:w-1/2'}`}>

                            {documentData && (
                                <div
                                    id="document-form"
                                    ref={formRef}
                                    className={`mt-8 bg-white shadow ${sarabun.className} w-full max-w-[21cm] min-h-[29.7cm] mx-auto p-[2cm] box-border overflow-y-auto`}
                                >
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">หน่วยงาน</label>
                                        <input
                                            type="text"
                                            value={documentData.department}
                                            onChange={(e) => setDocumentData(prev => prev ? { ...prev, department: e.target.value } : null)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="mt-8">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">เรื่อง</label>
                                            <input
                                                type="text"
                                                value={documentData.subject}
                                                onChange={(e) => setDocumentData(prev => prev ? { ...prev, subject: e.target.value } : null)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">ฉบับที่</label>
                                            <input
                                                type="text"
                                                value={documentData.documentNumber}
                                                onChange={(e) => setDocumentData(prev => prev ? { ...prev, documentNumber: e.target.value } : null)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">วัน เดือน ปี</label>
                                            <input
                                                type="text"
                                                value={documentData.date}
                                                onChange={(e) => setDocumentData(prev => prev ? { ...prev, date: e.target.value } : null)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">ลงชื่อ</label>
                                            <input
                                                type="text"
                                                value={documentData.signature}
                                                onChange={(e) => setDocumentData(prev => prev ? { ...prev, signature: e.target.value } : null)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">ส่วนราชการเจ้าของเรื่อง</label>
                                            <input
                                                type="text"
                                                value={documentData.contactPerson ?? ""}
                                                onChange={(e) => setDocumentData(prev => prev ? { ...prev, contactPerson: e.target.value } : null)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">เนื้อหา</label>
                                            <textarea
                                                value={documentData.content}
                                                onChange={(e) => setDocumentData(prev => prev ? { ...prev, content: e.target.value } : null)}
                                                className="w-full border p-2 rounded h-32 whitespace-pre-wrap overflow-wrap break-words"
                                                style={{ lineHeight: '1.5' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {!isTabletOrMobile && documentData && (
                            <div className="w-full lg:w-1/2 p-2 bg-gray-600 overflow-hidden">
                                <h2 className="text-xl font-bold mb-4 text-white text-center">
                                    ตัวอย่าง <strong className="text-red-400 font-extrabold">PDF</strong>
                                </h2>
                                <div className="flex justify-center">
                                    <div
                                        id="document-preview"
                                        ref={previewRef}
                                        className={`mt-8 bg-white shadow-lg ${sarabun.className} p-[1cm] box-border overflow-hidden relative`}
                                        style={{
                                            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                                            border: '1px solid #ddd',
                                            transform: 'scale(0.9)',
                                            transformOrigin: 'top center',
                                            width: '30cm',
                                            height: '29.7cm',
                                            maxWidth: '100%',
                                            margin: '0 auto',
                                        }}
                                    >
                                        <div className="text-center relative mt-[2.5cm] pl-[0.8cm] mb-[0.3cm]">
                                            <div className="text-2xl">{documentData.department}</div>
                                        </div>

                                        <div className="text-center mb-[5.5cm] pl-[3cm] pr-[2cm] relative">
                                            <div className="mb-[0.3cm] text-xl">
                                                <span>{documentData.subject}</span>
                                            </div>
                                            <div className="text-center mb-[0.5cm] mt-[0.1cm] pl-[2cm] pr-[2cm] text-xl">
                                                <div>{documentData.documentNumber}</div>
                                            </div>
                                        </div>

                                        <div className="absolute left-[80mm] right-[70mm] h-[10px] border-b border-black mt-[-51mm]" />

                                        <div
                                            className="mx-auto pl-[1.5cm] pr-[0.8cm] leading-[1.5]"
                                            style={{
                                                textIndent: '2.5cm',
                                                marginTop: '-4.2cm',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                                overflowWrap: 'break-word',
                                                textAlign: 'start',
                                                WebkitHyphens: 'auto',
                                                MozHyphens: 'auto',
                                                hyphens: 'auto',
                                                fontKerning: 'auto',
                                                fontFamily: '"TH SarabunPSK", "Sarabun", "Noto Sans Thai", sans-serif',
                                                fontSize: '18px',
                                                lineHeight: '1.8',
                                                maxWidth: '18cm',
                                            }}
                                        >
                                            {contentLines.map((line, index) => (
                                                <div
                                                    key={index}
                                                    className={line.trim() === keyword ? 'text-right pr-[6.8cm]' : 'text-justify'}
                                                    style={{
                                                        textIndent: line.trim() === keyword ? undefined : '2.5cm',
                                                        marginBottom: line.trim() === keyword ? '0.1rem' : '0.2rem',
                                                    }}
                                                >
                                                    {line}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="text-center pl-[4.1cm] mb-[0.4cm] mt-10 text-xl">
                                            {documentData.signature}
                                        </div>
                                        <div className="text-center pl-[4.3cm] mb-[0.5cm] text-xl">
                                            {documentData.date}
                                        </div>
                                        <div className="text-left pl-[2cm] pr-[6cm] relative mb-[1.6cm]">
                                            <div className="text-lg">{documentData.contactPerson}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );}
