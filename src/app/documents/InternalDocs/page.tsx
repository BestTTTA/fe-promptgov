"use client";
import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import { internalDocsPrompt } from '@/prompt/internaldocs';
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
    department: string;
    subject: string;
    recipient: string;
    content: {
        reason: string;
        request: string;
        conclusion: string;
    };
    signature: string;
    position: string;
}

interface AutoSaveInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
}

export default function ExampleDoc() {
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const documentRef = useRef<HTMLDivElement>(null);
    const AutoSaveInput: React.FC<AutoSaveInputProps> = ({ label, value, onChange, onBlur }) => {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        );
    };

    interface AutoSaveTextAreaProps {
        label: string;
        value: string;
        onChange: (value: string) => void;
        onBlur: () => void;
    }

    const AutoSaveTextArea: React.FC<AutoSaveTextAreaProps> = ({ label, value, onChange, onBlur }) => {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                />
            </div>
        );
    };
    const generatePdfFromData = (documentData: DocumentData) => {
        try {
            // Create new PDF with Thai font support and A4 dimensions
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'cm',
                format: 'a4' // Standard A4 format
            });
            // Add Thai font support
            pdf.addFont('/fonts/THSarabunNew.ttf', 'THSarabunNew', 'normal');
            pdf.setFont('THSarabunNew');

            // Standard A4 margins and dimensions in cm
            const margin = 2.5;
            const pageWidth = 21.0; // A4 width in cm
            const pageHeight = 29.7; // A4 height in cm
            const contentWidth = pageWidth - (2 * margin);
            let yPosition = margin + 2; // Adjusted for header and Garuda

            // Add Garuda image
            const garudaWidth = 1.5;
            const garudaHeight = 1.5;
            pdf.addImage('/img/krut-3-cm.png', 'PNG', margin, margin, garudaWidth, garudaHeight);

            // Add header text with consistent spacing
            pdf.setFontSize(20);
            pdf.text('บ  ั  น  ท  ึ  ก  ข  ้  อ  ค  ว  า  ม', pageWidth / 2, margin + 1, { align: 'center' });

            // Set font sizes in proportion to cm with consistent character spacing
            pdf.setFontSize(11);
            pdf.text(documentData.referenceNumber.split('').join('  '), margin, yPosition);
            const dateText = documentData.date.split('').join('  ');
            const dateWidth = pdf.getStringUnitWidth(dateText) * pdf.getFontSize() / pdf.internal.scaleFactor;
            pdf.text(dateText, pageWidth - margin - dateWidth, yPosition);

            yPosition += 1.5;
            pdf.setFontSize(14);
            const subjectText = documentData.subject.split('').join('  ');
            pdf.text(subjectText, margin, yPosition);
            yPosition += 1;
            const recipientText = documentData.recipient.split('').join('  ');
            pdf.text(recipientText, margin, yPosition);
            yPosition += 1.5;
            pdf.setFontSize(12);

            // Content sections with consistent spacing
            const reasonText = documentData.content.reason.split('').join('  ');
            const reasonLines = pdf.splitTextToSize(reasonText, contentWidth);
            pdf.text(reasonLines, margin, yPosition);
            yPosition += (reasonLines.length * 0.7) + 1;

            const requestText = documentData.content.request.split('').join('  ');
            const requestLines = pdf.splitTextToSize(requestText, contentWidth);
            pdf.text(requestLines, margin, yPosition);
            yPosition += (requestLines.length * 0.7) + 1;

            const conclusionText = documentData.content.conclusion.split('').join('  ');
            const conclusionLines = pdf.splitTextToSize(conclusionText, contentWidth);
            pdf.text(conclusionLines, margin, yPosition);
            yPosition += (conclusionLines.length * 0.7) + 3;

            // Signature section with consistent spacing
            const signatureText = documentData.signature.split('').join('  ');
            const signatureLines = pdf.splitTextToSize(signatureText, contentWidth / 2);
            const signatureX = pageWidth - margin - (contentWidth / 4);
            pdf.text(signatureLines, signatureX, yPosition, { align: 'center' });
            yPosition += (signatureLines.length * 0.7) + 1;

            const positionText = documentData.position.split('').join('  ');
            const positionLines = pdf.splitTextToSize(positionText, contentWidth / 2);
            pdf.text(positionLines, signatureX, yPosition, { align: 'center' });

            return pdf.output('datauristring');
        } catch (err) {
            console.error('PDF generation error:', err);
            throw new Error(`PDF generation failed: ${err instanceof Error ? err.message : String(err)}`);
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
                    body: JSON.stringify({ prompt: internalDocsPrompt }),
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
                body: JSON.stringify({ prompt: internalDocsPrompt }),
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

    const previewRef = useRef<HTMLDivElement>(null);
    const handleSaveChanges = async () => {
        if (!documentData || !previewRef.current) return;
        setLoading(true);
        try {
            const pdfDataUri = await generatePdfFromData(documentData);
            setPdfUrl(pdfDataUri);
            setHasUnsavedChanges(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save document');
            console.error('PDF generation error:', err);
        } finally {
            setLoading(false);
        }
    };
    const handleDownloadPdf = async () => {
        if (!documentData || !previewRef.current) return;

        try {
            setLoading(true);

            // Use html2canvas to capture the preview as an image
            const canvas = await html2canvas(previewRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');

            // Create PDF with A4 dimensions
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // A4 dimensions in mm
            const pdfWidth = 210;
            const pdfHeight = 297;

            // Add the captured image to fill the PDF
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Save the PDF
            pdf.save('บันทึกข้อความ.pdf');
        } catch (err) {
            console.error('PDF download error:', err);
            setError(err instanceof Error ? err.message : 'Failed to download PDF');
        } finally {
            setLoading(false);
        }
    };

    // Move the auto-save effect outside of the JSX
    useEffect(() => {
        if (hasUnsavedChanges && !loading && documentData) {
            const timer = setTimeout(async () => {
                try {
                    const pdfDataUri = await generatePdfFromData(documentData);
                    setPdfUrl(pdfDataUri);
                    setHasUnsavedChanges(false);
                } catch (error) {
                    console.error('Auto-save error:', error);
                }
            }, 1000); // Auto-save after 1 second of inactivity

            return () => clearTimeout(timer);
        }
    }, [hasUnsavedChanges, documentData, loading]);

    return (
        <main className={`min-h-screen bg-gray-50 flex flex-col p-4`}>
            <div className='flex items-center gap-4 p-4 bg-white rounded-md drop-shadow-sm'>
                <h1 className="text-sm text-nowrap font-sm text-gray-800 ">
                    Document Internal
                </h1>
                <div className="flex gap-4 w-full">
                    <button
                        onClick={async () => {
                            setLoading(true);
                            try {
                                await handleRefresh();
                                await new Promise(resolve => setTimeout(resolve, 1500));
                                // Generate PDF URL after refresh
                                const pdfDataUri = await generatePdfFromData(documentData!);
                                setPdfUrl(pdfDataUri);
                            } catch (error) {
                                console.error('Error during refresh:', error);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'กำลังสร้างเนื้อหา...' : 'สร้างเนื้อหาใหม่ 5/5'}
                    </button>
                    <div className={`p-2 text-white rounded-md text-center ${loading ? '' : ''}`}>
                        {loading ? 'กำลังบันทึก...' : 'บันทึกอัตโนมัติ'}
                    </div>
                </div>
                <div className='w-fit flex text-nowrap'>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={!documentData || loading}
                        className={`px-6 py-2 ${documentData && !loading ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-md`}
                    >
                        ดาวน์โหลด PDF
                    </button>
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
                            <div className="mt-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">ส่วนราชการ</label>
                                        <input
                                            type="text"
                                            value={documentData.department}
                                            onChange={(e) => {
                                                setDocumentData(prev => ({
                                                    ...prev!,
                                                    department: e.target.value
                                                }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
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
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">วันที่</label>
                                            <input
                                                type="text"
                                                value={documentData.date.replace(/^วันที่ /, '')}
                                                onChange={(e) => {
                                                    setDocumentData(prev => ({
                                                        ...prev!,
                                                        date: `วันที่ ${e.target.value}`
                                                    }));
                                                    setHasUnsavedChanges(true);
                                                }}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">เรื่อง</label>
                                        <input
                                            type="text"
                                            value={documentData.subject.replace(/^เรื่อง: /, '')}
                                            onChange={(e) => {
                                                setDocumentData(prev => ({
                                                    ...prev!,
                                                    subject: `เรื่อง: ${e.target.value}`
                                                }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>



                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">เรียน</label>
                                        <input
                                            type="text"
                                            value={documentData.recipient.replace(/^เรียน /, '')}
                                            onChange={(e) => {
                                                setDocumentData(prev => ({
                                                    ...prev!,
                                                    recipient: `เรียน ${e.target.value}`
                                                }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">ภาคเหตุ</label>
                                        <textarea
                                            value={documentData.content.reason.replace(/^ภาคเหตุ: /, '')}
                                            onChange={(e) => {
                                                setDocumentData(prev => ({
                                                    ...prev!,
                                                    content: {
                                                        ...prev!.content,
                                                        reason: `ภาคเหตุ: ${e.target.value}`
                                                    }
                                                }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">ภาคความประสงค์</label>
                                        <textarea
                                            value={documentData.content.request.replace(/^ภาคความประสงค์: /, '')}
                                            onChange={(e) => {
                                                setDocumentData(prev => ({
                                                    ...prev!,
                                                    content: {
                                                        ...prev!.content,
                                                        request: `ภาคความประสงค์: ${e.target.value}`
                                                    }
                                                }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">ภาคสรุป</label>
                                        <textarea
                                            value={documentData.content.conclusion.replace(/^ภาคสรุป: /, '')}
                                            onChange={(e) => {
                                                setDocumentData(prev => ({
                                                    ...prev!,
                                                    content: {
                                                        ...prev!.content,
                                                        conclusion: `ภาคสรุป: ${e.target.value}`
                                                    }
                                                }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={4}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">ลายเซ็น</label>
                                        <input
                                            type="text"
                                            value={documentData.signature}
                                            onChange={(e) => {
                                                setDocumentData(prev => ({
                                                    ...prev!,
                                                    signature: e.target.value
                                                }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">ตำแหน่ง</label>
                                        <input
                                            type="text"
                                            value={documentData.position}
                                            onChange={(e) => {
                                                setDocumentData(prev => ({
                                                    ...prev!,
                                                    position: e.target.value
                                                }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {documentData && (
                    <div className="flex-1 p-2 bg-gray-600">
                        <h2 className="text-sm font-sm mb-4 text-white text-center">ตัวอย่าง  <strong className='text-red-400 font-extrabold'>PDF</strong></h2>
                        <div
                            id='preview-document'
                            ref={previewRef}
                            className={`mt-8 bg-white shadow ${sarabun.className}`}
                            style={{
                                width: '21cm',
                                height: '29.7cm',
                                margin: '0 auto',
                                padding: '2cm',
                                boxSizing: 'border-box',
                                position: 'relative',
                            }}
                        >
                            <div
                                className="text-center"
                                style={{
                                    position: 'absolute',
                                    top: '1.5cm',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '20pt',
                                    fontWeight: 'bold',
                                    width: '100%'
                                }}
                            >
                                บันทึกข้อความ
                            </div>

                            <div style={{
                                position: 'absolute',
                                top: '1.5cm',
                                left: '1.5cm',
                                width: '1.5cm',
                                height: '1.5cm'
                            }}>
                                <img
                                    src="/img/krut-3-cm.png"
                                    alt="Garuda"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>

                            <div className="mb-2" style={{ marginTop: '1.5cm' }}>
                                <span className="font-bold" style={{ fontSize: '12pt' }}>ส่วนราชการ</span>
                                <span className="ml-2" style={{
                                    width: '80%',
                                    paddingBottom: '0.2cm',
                                    fontSize: '12pt'
                                }}>
                                    {documentData.department}
                                </span>
                            </div>

                            <div className="flex mb-2">
                                <div className="flex-1">
                                    <span className="font-bold" style={{ fontSize: '12pt' }}>ที่</span>
                                    <span className="ml-2" style={{
                                        width: '80%',
                                        paddingBottom: '0.2cm',
                                        fontSize: '12pt'
                                    }}>
                                        {documentData.referenceNumber}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold" style={{ fontSize: '12pt' }}>วันที่</span>
                                    <span className="ml-2" style={{
                                        width: '80%',
                                        paddingBottom: '0.2cm',
                                        fontSize: '12pt'
                                    }}>
                                        {documentData.date.replace(/^วันที่ /, '')}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-2">
                                <span className="font-bold" style={{ fontSize: '12pt' }}>เรื่อง</span>
                                <span className="ml-2" style={{
                                    width: '80%',
                                    paddingBottom: '0.2cm',
                                    fontSize: '12pt'
                                }}>
                                    {documentData.subject.replace(/^เรื่อง: /, '')}
                                </span>
                            </div>

                            <div className="mb-6">
                                <span className="font-bold" style={{ fontSize: '12pt' }}>เรียน</span>
                                <span className="ml-2" style={{
                                    width: '80%',
                                    paddingBottom: '0.2cm',
                                    fontSize: '12pt'
                                }}>
                                    {documentData.recipient.replace(/^เรียน /, '')}
                                </span>
                            </div>

                            <div className="mb-4 text-justify">
                                <div className="mb-4 whitespace-pre-wrap" style={{
                                    textIndent: '2.5cm',
                                    lineHeight: '1.5',
                                    marginBottom: '1cm',
                                    fontSize: '12pt'
                                }}>
                                    {documentData.content.reason.replace(/^ภาคเหตุ: /, '')}
                                </div>

                                <div className="mb-4 whitespace-pre-wrap" style={{
                                    textIndent: '2.5cm',
                                    lineHeight: '1.5',
                                    marginBottom: '1cm',
                                    fontSize: '12pt'
                                }}>
                                    {documentData.content.request.replace(/^ภาคความประสงค์: /, '')}
                                </div>

                                <div className="mb-8 whitespace-pre-wrap" style={{
                                    textIndent: '2.5cm',
                                    lineHeight: '1.5',
                                    marginBottom: '1cm',
                                    fontSize: '12pt'
                                }}>
                                    {documentData.content.conclusion.replace(/^ภาคสรุป: /, '')}
                                </div>
                            </div>

                            <div style={{
                                position: 'relative',
                                textAlign: 'center',
                                marginTop: '3cm',
                                marginLeft: 'auto',
                                marginRight: '2cm',
                                width: '8cm',
                                float: 'right'
                            }}>
                                <div style={{
                                    fontSize: '12pt',
                                    marginTop: '1cm'
                                }}>
                                    ({documentData.signature})
                                </div>
                                <div style={{ fontSize: '12pt' }}>
                                    {documentData.position}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};