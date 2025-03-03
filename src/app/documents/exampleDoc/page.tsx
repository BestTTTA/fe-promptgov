"use client";
import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import { examplePrompt } from '@/prompt/example';
import { Sarabun } from 'next/font/google';
import html2canvas from 'html2canvas';

const sarabun = Sarabun({
    weight: ['300'],
    variable: '--font-sarabun',
    subsets: ['thai'],
});

interface DocumentData {
    referenceNumber: string;
    date: string;
    subject: string;
    recipient: string;
    content: string;
    conclusion: string;
    signature: string;
}

export default function ExampleDoc() {
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const documentRef = useRef<HTMLDivElement>(null);

    const generatePdfFromData = (documentData: DocumentData) => {
        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            pdf.setFont("helvetica", "normal");

            const margin = 20;
            const pageWidth = 210;
            const contentWidth = pageWidth - (2 * margin);
            let yPosition = margin;

            pdf.setFontSize(11);
            pdf.text(documentData.referenceNumber, margin, yPosition);

            const dateText = "วันที่ " + documentData.date;
            const dateWidth = pdf.getStringUnitWidth(dateText) * pdf.getFontSize() / pdf.internal.scaleFactor;
            pdf.text(dateText, pageWidth - margin - dateWidth, yPosition);

            yPosition += 15;
            pdf.setFontSize(14);
            pdf.text("เรื่อง " + documentData.subject, margin, yPosition);

            yPosition += 10;
            pdf.text("เรียน " + documentData.recipient, margin, yPosition);

            yPosition += 15;
            pdf.setFontSize(12);
            const contentLines = pdf.splitTextToSize(documentData.content, contentWidth);
            pdf.text(contentLines, margin, yPosition);

            yPosition += contentLines.length * 7;

            yPosition += 10;
            pdf.text(documentData.conclusion, margin, yPosition);
            yPosition += 30;
            const signatureLines = pdf.splitTextToSize(documentData.signature, contentWidth / 2);
            const signatureX = pageWidth - margin - (pdf.getStringUnitWidth(signatureLines[0]) * pdf.getFontSize() / pdf.internal.scaleFactor);
            pdf.text(signatureLines, signatureX, yPosition);

            return pdf.output('datauristring');
        } catch (err) {
            console.error('PDF generation error:', err);
            throw new Error(`PDF generation failed: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const generatePdfFromDOM = async () => {
        if (!documentRef.current || !documentData) return '';

        try {
            const pdfPreviewEl = document.createElement('div');
            pdfPreviewEl.className = sarabun.className;
            pdfPreviewEl.style.width = '595px'; // A4 width at 72 DPI
            pdfPreviewEl.style.minHeight = '842px'; // A4 height
            pdfPreviewEl.style.padding = '40px';
            pdfPreviewEl.style.position = 'fixed';
            pdfPreviewEl.style.top = '0'; // Changed from -9999px to be visible during debugging
            pdfPreviewEl.style.left = '0'; // Changed from -9999px to be visible during debugging
            pdfPreviewEl.style.backgroundColor = 'white';
            pdfPreviewEl.style.zIndex = '9999'; // Changed to be visible during debugging
            pdfPreviewEl.style.overflow = 'hidden';

            pdfPreviewEl.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px;">
                    <div>${documentData.referenceNumber}</div>
                    <div>วันที่ ${documentData.date}</div>
                </div>
                <div style="font-size: 14px; margin-bottom: 10px;">เรื่อง ${documentData.subject}</div>
                <div style="font-size: 14px; margin-bottom: 20px;">เรียน ${documentData.recipient}</div>
                <div style="font-size: 12px; margin-bottom: 20px; white-space: pre-wrap; line-height: 1.5;">${documentData.content}</div>
                <div style="font-size: 12px; margin-bottom: 30px;">${documentData.conclusion}</div>
                <div style="font-size: 12px; text-align: right; margin-top: 30px; white-space: pre-wrap;">${documentData.signature}</div>
            `;

            document.body.appendChild(pdfPreviewEl);

            await new Promise(resolve => setTimeout(resolve, 1000));
            await document.fonts.ready;

            const canvas = await html2canvas(pdfPreviewEl, {
                scale: 2,
                useCORS: true,
                logging: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                foreignObjectRendering: false
            });

            document.body.removeChild(pdfPreviewEl);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            return pdf.output('datauristring');
        } catch (err) {
            console.error('PDF capture error:', err);
            throw new Error(`PDF capture failed: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const generateSimplePdf = (documentData: DocumentData) => {
        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            pdf.setFont("helvetica", "normal");

            pdf.setFontSize(12);
            pdf.text(`${documentData.referenceNumber}`, 20, 20);
            pdf.text(`วันที่ ${documentData.date}`, 150, 20);
            pdf.text(`เรื่อง ${documentData.subject}`, 20, 40);
            pdf.text(`เรียน ${documentData.recipient}`, 20, 50);

            const contentLines = pdf.splitTextToSize(documentData.content, 170);
            pdf.text(contentLines, 20, 70);

            pdf.text(documentData.conclusion, 20, 130);
            pdf.text(documentData.signature, 120, 150);

            return pdf.output('datauristring');
        } catch (err) {
            console.error('Simple PDF generation error:', err);
            return '';
        }
    };

    const generatePdf = async (documentData: DocumentData) => {
        try {

            const domPdf = await generatePdfFromDOM();
            if (domPdf) return domPdf;

            const dataPdf = generatePdfFromData(documentData);
            if (dataPdf) return dataPdf;

            return generateSimplePdf(documentData);
        } catch (err) {
            console.error('All PDF generation methods failed:', err);

            return generateSimplePdf(documentData);
        }
    };

    const handleSaveChanges = async () => {
        if (!documentData) return;
        setLoading(true);
        try {
            const pdfDataUri = await generatePdf(documentData);

            console.log("Generated PDF URL length:", pdfDataUri.length);
            console.log("PDF URL starts with:", pdfDataUri.substring(0, 50));

            if (!pdfDataUri.startsWith('data:application/pdf;')) {
                setPdfUrl('data:application/pdf;base64,' + pdfDataUri);
            } else {
                setPdfUrl(pdfDataUri);
            }

            setHasUnsavedChanges(false);
            setError('');
        } catch (err) {
            setError('Failed to generate PDF: ' + (err instanceof Error ? err.message : String(err)));
            console.error('PDF generation error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchDocument = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt: examplePrompt }),
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
        };

        fetchDocument();
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        setError('');
        setHasUnsavedChanges(false);
        setPdfUrl('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: examplePrompt }),
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
            // Don't generate PDF automatically - wait for user to click button

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={`min-h-screen bg-gray-50 flex flex-col p-4`}>
            <div className='flex items-center gap-4 p-4 bg-white rounded-md drop-shadow-sm'>
                <h1 className="text-xl text-nowrap font-bold text-gray-800 ">
                    Document Example
                </h1>


                <div className="flex gap-4 w-full">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'กำลังสร้างเนื้อหา...' : 'สร้างเนื้อหาใหม่'} 5/5
                    </button>
                    <button
                        onClick={handleSaveChanges}
                        disabled={loading || !documentData}
                        className="p-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'กำลังบันทึก...' : 'บันทึกเอกสาร'}
                    </button>
                </div>

                <div className='w-fit flex text-nowrap'>
                    <a
                        href={pdfUrl}
                        download="document.pdf"
                        className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                    >
                        ดาวน์โหลด PDF
                    </a>
                </div>
            </div>

            <div className='flex mt-6'>
                {/* Left side - Form */}
                <div className="flex-1 pr-0 md:pr-4 mb-8 md:mb-0">
                    {error && (
                        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    {documentData && (
                        <div
                            id='document'
                            ref={documentRef}
                            className={`mt-8 bg-white shadow ${sarabun.className}`}
                            style={{
                                width: '595px',
                                minHeight: '842px',
                                margin: '0 auto',
                                padding: '40px',
                                boxSizing: 'border-box',
                                overflowY: 'auto'
                            }}
                        >
                            <div className="mt-8">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">เรื่อง</label>
                                    <input
                                        type="text"
                                        value={documentData.subject}
                                        onChange={(e) => {
                                            setDocumentData(prev => ({
                                                ...prev!,
                                                subject: e.target.value
                                            }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">เลขที่อ้างอิง</label>
                                    <input
                                        type="text"
                                        value={documentData.referenceNumber}
                                        onChange={(e) => {
                                            setDocumentData(prev => ({
                                                ...prev!,
                                                referenceNumber: e.target.value
                                            }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">วันที่</label>
                                    <input
                                        type="text"
                                        value={documentData.date}
                                        onChange={(e) => {
                                            setDocumentData(prev => ({
                                                ...prev!,
                                                date: e.target.value
                                            }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">ถึง</label>
                                    <input
                                        type="text"
                                        value={documentData.recipient}
                                        onChange={(e) => {
                                            setDocumentData(prev => ({
                                                ...prev!,
                                                recipient: e.target.value
                                            }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">เนื้อหา</label>
                                    <textarea
                                        value={documentData.content}
                                        onChange={(e) => {
                                            setDocumentData(prev => ({
                                                ...prev!,
                                                content: e.target.value
                                            }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        rows={6}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">ข้อสรุป</label>
                                    <input
                                        type="text"
                                        value={documentData.conclusion}
                                        onChange={(e) => {
                                            setDocumentData(prev => ({
                                                ...prev!,
                                                conclusion: e.target.value
                                            }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">ลายเซ็น</label>
                                    <textarea
                                        value={documentData.signature}
                                        onChange={(e) => {
                                            setDocumentData(prev => ({
                                                ...prev!,
                                                signature: e.target.value
                                            }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {documentData && (
                    <div className="flex-1 p-2 bg-gray-600">
                        <h2 className="text-xl font-bold mb-4 text-white text-center">ตัวอย่าง  <strong className='text-red-400 font-extrabold'>PDF</strong></h2>
                        <div
                            id='document'
                            ref={documentRef}
                            className={`mt-8 bg-white shadow ${sarabun.className}`}
                            style={{
                                width: '595px',
                                minHeight: '842px',
                                margin: '0 auto',
                                padding: '40px',
                                boxSizing: 'border-box',
                                overflowY: 'auto'
                            }}
                        >
                            <div className="flex justify-between mb-4">
                                <div>{documentData.referenceNumber}</div>
                                <div>วันที่ {documentData.date}</div>
                            </div>

                            <div className="mb-6">
                                <div className="text-lg mb-2">เรื่อง {documentData.subject}</div>
                                <div className="text-lg">เรียน {documentData.recipient}</div>
                            </div>

                            <div className="mb-6 whitespace-pre-wrap">
                                {documentData.content}
                            </div>

                            <div className="mb-6">
                                {documentData.conclusion}
                            </div>

                            <div className="text-right whitespace-pre-wrap">
                                {documentData.signature}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </main>
    );
}