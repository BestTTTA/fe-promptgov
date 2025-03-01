"use client";
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { examplePrompt } from '@/prompt/example';

interface DocumentData {
    referenceNumber: string;
    date: string;
    subject: string;
    recipient: string;
    content: string;
    conclusion: string;
    signature: string;
}

/** 
 * The response from your API might look like:
 * {
 *   "document": {
 *     "referenceNumber": "...",
 *     "date": "...",
 *     "subject": "...",
 *     "recipient": "...",
 *     "content": "...",
 *     "conclusion": "...",
 *     "signature": "..."
 *   }
 * }
 */
export default function ExampleDoc() {
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pdfUrl, setPdfUrl] = useState<string>('');

    const handlePdfUpdate = () => {
        if (!documentData) return;

        const doc = new jsPDF();
        doc.addFont('/fonts/THSarabun.ttf', 'THSarabun', 'normal');
        doc.setFont('THSarabun');
        doc.setFontSize(16);

        const margin = 20;
        let yPos = margin;

        doc.text(documentData.referenceNumber, margin, yPos);
        yPos += 10;

        doc.text(documentData.date, margin, yPos);
        yPos += 10;

        doc.text(documentData.subject, margin, yPos);
        yPos += 10;

        doc.text(documentData.recipient, margin, yPos);
        yPos += 15;

        const splitContent = doc.splitTextToSize(documentData.content, doc.internal.pageSize.width - 2 * margin);
        doc.text(splitContent, margin, yPos);
        yPos += 10 * splitContent.length;

        doc.text(documentData.conclusion, margin, yPos);
        yPos += 15;

        const signatureLines = documentData.signature.split('\n');
        signatureLines.forEach((line: string) => {
            doc.text(line, margin, yPos);
            yPos += 10;
        });

        const pdfDataUri = doc.output('datauristring');
        setPdfUrl(pdfDataUri);
    };

    const handleRefresh = async () => {
        setLoading(true);
        setError('');

        const prompt = examplePrompt;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
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

    return (
        <div className="min-h-screen bg-gray-50 p-8 flex">
            {/* Left side - Form */}
            <div className="flex-1 pr-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Document Example
                </h1>

                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? 'Loading...' : 'Refresh Document'}
                </button>

                {error && (
                    <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {documentData && (
                    <div className="mt-8 max-w-2xl bg-white p-6 rounded-lg shadow">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Subject</label>
                            <input
                                type="text"
                                value={documentData.subject}
                                onChange={(e) => {
                                    setDocumentData(prev => ({
                                        ...prev!,
                                        subject: e.target.value
                                    }));
                                    handlePdfUpdate();
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                            <input
                                type="text"
                                value={documentData.referenceNumber}
                                onChange={(e) => {
                                    setDocumentData(prev => ({
                                        ...prev!,
                                        referenceNumber: e.target.value
                                    }));
                                    handlePdfUpdate();
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="text"
                                value={documentData.date}
                                onChange={(e) => {
                                    setDocumentData(prev => ({
                                        ...prev!,
                                        date: e.target.value
                                    }));
                                    handlePdfUpdate();
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Recipient</label>
                            <input
                                type="text"
                                value={documentData.recipient}
                                onChange={(e) => {
                                    setDocumentData(prev => ({
                                        ...prev!,
                                        recipient: e.target.value
                                    }));
                                    handlePdfUpdate();
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Content</label>
                            <textarea
                                value={documentData.content}
                                onChange={(e) => {
                                    setDocumentData(prev => ({
                                        ...prev!,
                                        content: e.target.value
                                    }));
                                    handlePdfUpdate();
                                }}
                                rows={6}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Conclusion</label>
                            <input
                                type="text"
                                value={documentData.conclusion}
                                onChange={(e) => {
                                    setDocumentData(prev => ({
                                        ...prev!,
                                        conclusion: e.target.value
                                    }));
                                    handlePdfUpdate();
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Signature</label>
                            <textarea
                                value={documentData.signature}
                                onChange={(e) => {
                                    setDocumentData(prev => ({
                                        ...prev!,
                                        signature: e.target.value
                                    }));
                                    handlePdfUpdate();
                                }}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Right side - PDF Preview */}
            <div className="flex-1 pl-4">
                {pdfUrl && (
                    <div className="sticky top-8">
                        <h2 className="text-xl font-bold mb-4">PDF Preview</h2>
                        <iframe
                            src={pdfUrl}
                            className="w-full h-[calc(100vh-8rem)] border rounded-lg shadow"
                            title="PDF Preview"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
