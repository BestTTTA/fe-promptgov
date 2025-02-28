import jsPDF from 'jspdf';
import '../../fonts/THSarabun-normal';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const cmToPt = (cm) => cm * 28.346;

class ThaiDocument {
    constructor() {
        this.doc = new jsPDF({
            unit: 'pt',
            format: 'a4'
        });

        this.pageWidth = 595.28;
        this.pageHeight = 841.89;

        this.margins = {
            top: cmToPt(1.5),
            bottom: cmToPt(2),
            left: cmToPt(3),
            right: cmToPt(2)
        };

        this.doc.setFont('THSarabunNew');
        this.doc.setFontSize(16);
        this.textWidth = this.pageWidth - this.margins.left - this.margins.right;
    }

    async addGaruda() {
        try {
            const garudaWidth = cmToPt(2.7);
            const garudaHeight = cmToPt(3);
            const response = await fetch('/img/krut-3-cm.png');
            if (!response.ok) {
                throw new Error('Failed to fetch image');
            }
            const blob = await response.blob();

            const img = new Image();
            const loadImagePromise = new Promise((resolve, reject) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width / 2.7;
                    canvas.height = img.height / 3;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });

                    if (!ctx) {
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    resolve(canvas.toDataURL('image/png', 1.0));
                };
                img.onerror = (e) => reject(new Error('Failed to load image: ' + e.message));
                img.src = URL.createObjectURL(blob);
            });

            const base64Image = await loadImagePromise;
            const centerX = (this.pageWidth - garudaWidth) / 2;
            this.doc.addImage(base64Image, 'PNG', centerX, this.margins.top, garudaWidth, garudaHeight);

            URL.revokeObjectURL(img.src);
            return this.margins.top + garudaHeight + 20;
        } catch (error) {
            console.error('Failed to add Garuda:', error);
            return this.margins.top + cmToPt(1.5) + 40;
        }
    }

    async generate(formData) {
        let currentY = this.margins.top;

        currentY += await this.addGaruda();

        currentY = this.addHeaderInfo(formData);

        currentY = this.addDocumentInfo(formData, currentY);

        currentY = this.addContent(formData.content, currentY);

        currentY = this.addSignature(formData, currentY);

        // Remove this line that's causing the error
        // this.addContactInfo(formData, currentY);

        return this.doc;
    }

    // Also remove the empty method
    // addContactInfo() {
    // }
    addHeaderInfo(formData) {
        const startY = this.margins.top - cmToPt(3.2);
        this.doc.setFontSize(16);
        return this.margins.top + cmToPt(3) + 8;
    }

    addDocumentInfo(formData, startY) {
        const lineHeight = 20;
        let currentY = startY;

        // Add document header
        this.doc.setFontSize(16);  // Set larger font size for header
        if (formData.documentNumber) {
            this.doc.text(formData.documentNumber, this.pageWidth / 2, currentY + 20, { align: 'center' });
        } else {
            this.doc.text('แถลงการณ์กองทัพบก', this.pageWidth / 2, currentY + 20, { align: 'center' });
        }
        this.doc.setFontSize(16);  // Reset font size for rest of document

        // Skip initial date display
        currentY += lineHeight * 1.6;

        // Rest of the document info
        this.doc.text(
            `เรื่อง ${formData.subject || ".................................................."}`,
            this.pageWidth / 2,
            currentY + 10,
            { align: 'center' }
        );
        currentY += lineHeight;

        // Adjust spacing for ฉบับที่
        if (formData.to) {
            this.doc.text(
                `(ฉบับที่ ${formData.to})`,
                this.pageWidth / 2,
                currentY + 10,
                { align: 'center' }
            );
            currentY += lineHeight; // Add extra line height when showing ฉบับที่
        }

        this.doc.setLineWidth(1);
        const lineWidth = cmToPt(4);
        const lineStartX = this.pageWidth / 2 - lineWidth / 2.1;
        this.doc.line(
            lineStartX,
            currentY + 16,  // Use consistent spacing regardless of ฉบับที่
            lineStartX + lineWidth,
            currentY + 16
        );
        currentY += 40;

        return currentY + 10;
    }

    addHeader(formData, startY) {
        this.doc.setFontSize(16);
        const lineHeight = cmToPt(0.8);
        let currentY = startY;

        this.doc.text(`ส่วนราชการ ${formData.department || "______"}`, this.margins.left, currentY);
        currentY += lineHeight;

        this.doc.text(`ที่ ${formData.documentNumber || "______"}`, this.margins.left, currentY);

        // Format date to Thai Buddhist year
        const formattedDate = formData.date
            ? format(new Date(formData.date), 'd MMMM yyyy', { locale: th })
                .replace(/\d{4}/, year => String(parseInt(year) + 543))
            : "____";
        const dateText = `วันที่ ${formattedDate}`;
        const dateWidth = this.doc.getTextWidth(dateText);
        const dateCenterX = (this.pageWidth - dateWidth) / 2;
        this.doc.text(dateText, dateCenterX, currentY);

        return currentY + lineHeight;
    }

    addContent(content, startY) {
        if (!content) {
            return startY + 4;
        }
    
        let currentY = startY + 4;
        const lineHeight = 20;
        const firstLineIndent = cmToPt(2.5);
        const maxWidth = this.textWidth;
        let isFirstLine = true;
    
        function splitThaiText(text, maxWidth, doc) {
            let segmenter = new Intl.Segmenter('th', { granularity: 'word' });
            let words = [...segmenter.segment(text)].map(seg => seg.segment);
            
            let lines = [];
            let currentLine = '';
            let currentWords = [];
    
            for (let i = 0; i < words.length; i++) {
                let testLine = currentLine + words[i];
                let allowedWidth = isFirstLine ? (maxWidth - firstLineIndent) : maxWidth;
                let testWidth = doc.getTextWidth(testLine);
    
                if (testWidth > allowedWidth && currentLine !== '') {
                    lines.push({ 
                        text: currentLine, 
                        words: currentWords,
                        isFirstLine 
                    });
                    currentLine = words[i];
                    currentWords = [words[i]];
                    isFirstLine = false;
                } else {
                    currentLine = testLine;
                    currentWords.push(words[i]);
                }
            }
    
            if (currentLine) {
                lines.push({ 
                    text: currentLine, 
                    words: currentWords,
                    isFirstLine 
                });
            }
    
            return lines;
        }
    
        const lines = splitThaiText(content, maxWidth, this.doc);
    
        lines.forEach((lineObj, index) => {
            const xPos = lineObj.isFirstLine
                ? this.margins.left + firstLineIndent
                : this.margins.left;

            if (index === lines.length - 1) {
                // Last line is not justified
                this.doc.text(lineObj.text, xPos, currentY);
            } else {
                // Calculate spacing for justified text
                const totalWidth = this.doc.getTextWidth(lineObj.text);
                const spaceNeeded = maxWidth - (lineObj.isFirstLine ? firstLineIndent : 0) - totalWidth;
                const spaceBetween = spaceNeeded / (lineObj.words.length - 1);
                
                let currentX = xPos;
                lineObj.words.forEach((word, wordIndex) => {
                    this.doc.text(word, currentX, currentY);
                    if (wordIndex < lineObj.words.length - 1) {
                        currentX += this.doc.getTextWidth(word) + spaceBetween;
                    }
                });
            }
            currentY += lineHeight;
        });
    
        return currentY + 5;
    }    

    addSignature(formData, startY) {
        const rightOffset = cmToPt(0.8);
        const signatureX = this.pageWidth / 2 + rightOffset;
        const dateX = signatureX - cmToPt(0.9); // Moved dateX declaration up
        let currentY = startY + 20;
        const lineHeight = 20;

        if (formData.attachment) {
            this.doc.text(formData.attachment, dateX, currentY, { align: 'left' });
        } else {
            this.doc.text('กองทัพบก', signatureX, currentY, { align: 'center' });
        }
        currentY += 30;
        // Calculate position for date to align with signature
        if (formData.date) {
            this.doc.text(formData.date, dateX, currentY, { align: 'left' });
        } else {
            this.doc.text('วัน เดือน ปี', dateX, currentY, { align: 'left' });
        }
        currentY += 20;
        
        //อ้างอิง
        if (formData.reference) {
            this.doc.text(formData.reference, this.margins.left, currentY);
        } else {
            this.doc.text('ส่วนราชการเจ้าของเรื่อง', this.margins.left, currentY);
        }
        currentY += 20;

        return currentY + 20;
    }
}

const createThaiDocument = async (formData) => {
    const thaiDoc = new ThaiDocument();
    const doc = await thaiDoc.generate(formData);
    return doc;
};

export default createThaiDocument;
