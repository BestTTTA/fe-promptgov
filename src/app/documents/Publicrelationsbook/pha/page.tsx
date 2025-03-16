"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import { Sarabun } from 'next/font/google';
import html2canvas from 'html2canvas';
import { publicRelationsBookPrompt } from '../../../../prompt/publicRelationsBook';

// Font configuration
const sarabun = Sarabun({
    weight: ['300'],
    variable: '--font-sarabun',
    subsets: ['thai'],
});

// Document data interface
interface DocumentData {
    title: string;
    subject: string;
    issue_number: string;
    content: string;
    issuer: string;
    date: string;
    department: string;
}

export default function ExampleDoc() {
    // State management
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);

    // Refs for DOM elements
    const formRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    // Fetch document data from API
    const fetchDocumentData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: publicRelationsBookPrompt }),
            });
            
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to generate content');
            }

            const result = await response.json();
            const parsedData = typeof result.data === 'string'
                ? JSON.parse(result.data)
                : result.data;

            if (!parsedData?.document) {
                throw new Error('Response does not contain "document" key.');
            }

            setDocumentData(parsedData.document);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchDocumentData();
    }, [fetchDocumentData]);

    // Handle PDF generation and download
    const handleDownloadPDF = useCallback(async () => {
        if (!previewRef.current || !documentData) return;
        
        setIsPdfGenerating(true);
        try {
            // Generate canvas from DOM element
            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: previewRef.current.scrollWidth,
                windowHeight: previewRef.current.scrollHeight,
            });

            // Create PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // Calculate dimensions
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add image and metadata
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.setProperties({
                title: 'แถลงการณ์กองทัพบก',
                subject: documentData.subject,
                creator: 'Document System',
                author: 'System',
            });

            pdf.save('document.pdf');
        } catch (err) {
            setError('Failed to generate PDF: ' + (err instanceof Error ? err.message : String(err)));
            console.error('PDF generation error:', err);
        } finally {
            setIsPdfGenerating(false);
        }
    }, [documentData]);

    // Handle refresh button click
    const handleRefresh = useCallback(async () => {
        setLoading(true);
        setError('');
        await fetchDocumentData();
    }, [fetchDocumentData]);

    // Render component
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col p-4">
            {/* Header controls */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-md drop-shadow-sm">
                <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">Document Example</h1>
                <div className="flex gap-4 w-full">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'กำลังสร้างเนื้อหา...' : 'สร้างเนื้อหาใหม่'} 5/5
                    </button>
                </div>
                <div className="flex whitespace-nowrap w-fit">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isPdfGenerating}
                        className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-gray-400"
                    >
                        {isPdfGenerating ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF'}
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex mt-6">
                {/* Form section */}
                <div className="flex-1 pr-0 md:pr-4 mb-8 md:mb-0">
                    {error && (
                        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    {documentData && (
                        <div
                            id="document-form"
                            ref={formRef}
                            className={`mt-8 bg-white shadow ${sarabun.className} w-[595px] min-h-[842px] mx-auto p-10 box-border overflow-y-auto`}
                        >
                            {/* Form fields */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">อ้างอิง</label>
                                <input
                                    type="text"
                                    value={documentData.title}
                                    onChange={(e) => setDocumentData(prev => ({ ...prev!, title: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mt-8">
                                <label className="block text-sm font-medium text-gray-700">เรื่อง</label>
                                <input
                                    type="text"
                                    placeholder="เรื่อง"
                                    value={documentData.subject}
                                    onChange={(e) => setDocumentData(prev => ({ 
                                        ...prev!, 
                                        subject: e.target.value
                                    }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">ฉบับที่</label>
                                    <input
                                        type="text"
                                        value={documentData.issue_number}
                                        onChange={(e) => setDocumentData(prev => ({ ...prev!, issue_number: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">เนื้อหา</label>
                                    <textarea
                                        value={documentData.content}
                                        onChange={(e) => setDocumentData(prev => ({ ...prev!, content: e.target.value }))}
                                        className="w-full border p-4 rounded min-h-[200px] whitespace-pre-wrap overflow-wrap break-words"
                                        style={{ 
                                            lineHeight: '1.8',
                                            textAlign: 'justify',
                                            fontFamily: '"Sarabun", "Noto Sans Thai", sans-serif',
                                        }}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">ถึง</label>
                                    <input
                                        type="text"
                                        value={documentData.issuer}
                                        onChange={(e) => setDocumentData(prev => ({ ...prev!, issuer: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">วันที่</label>
                                    <input
                                        type="text"
                                        value={documentData.date}
                                        onChange={(e) => setDocumentData(prev => ({ ...prev!, date: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">ลายเซ็น</label>
                                    <textarea
                                        value={documentData.department}
                                        onChange={(e) => setDocumentData(prev => ({ ...prev!, department: e.target.value }))}
                                        rows={1}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        style={{ textAlign: 'left', height: '40px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview section */}
                {documentData && (
                    <div className="flex-1 p-2 bg-gray-600">
                        <h2 className="text-xl font-bold mb-4 text-white text-center">
                            ตัวอย่าง <strong className="text-red-400 font-extrabold">PDF</strong>
                        </h2>
                        <div
                            id="document-preview"
                            ref={previewRef}
                            className={`mt-8 bg-white shadow ${sarabun.className} w-[210mm] min-h-[297mm] mx-auto p-10 box-border overflow-y-auto relative`}
                        >
                            {/* Document header */}
                            <div className="flex justify-center items-center mb-[2px] mt-[1.5mm] pl-[30mm] pr-[20mm]">
                                <img
                                    src="/img/krut-3-cm.png"
                                    alt="ครุฑ"
                                    className="w-[27mm] h-[30mm] object-contain block mx-auto"
                                />
                            </div>
                            <div className="text-center mb-[5px] mt-[2mm] pl-[30mm] pr-[20mm]">
                                <div>{documentData.title}</div>
                            </div>
                            <div className="text-center mb-[55px] pl-[30mm] pr-[20mm] relative">
                                <div className="mb-[2px]">
                                    <span>เรื่อง {documentData.subject}</span>
                                </div>
                                {documentData.issue_number && !/^ฉบับที่\s*/.test(documentData.issue_number) && (
                                    <div className="mb-[8px]">
                                        <span>(ฉบับที่ {documentData.issue_number})</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute left-[80mm] right-[70mm] h-[10px] border-b border-black mt-[-10mm]" />
                            <div className="max-w-[715px] pl-[2cm] pr-[10mm] mb-[20px] leading-[1.8] break-words"
                                style={{
                                    textIndent: '2.5cm',
                                    textAlign: 'justify',
                                    whiteSpace: 'pre-wrap',
                                    wordSpacing: '-1px',
                                    letterSpacing: '-0.1px',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    WebkitHyphens: 'none',
                                    MozHyphens: 'none',
                                    hyphens: 'none',
                                    fontKerning: 'normal',
                                    fontFamily: '"Sarabun", "Noto Sans Thai", sans-serif',
                                }}
                            >
                                {documentData.content}
                            </div>
                            
                            {/* Document footer */}
                            <div className="text-center pl-[28mm] mb-[10.6px] text-[16px]">
                                {documentData.issuer}
                            </div>
                            <div className="text-center pl-[42mm] mb-[10px] text-[16px]">
                                {documentData.date}
                            </div>
                            <div className="text-left pl-[20mm] pr-[60mm] relative mb-[16px]">
                                {documentData.department}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
