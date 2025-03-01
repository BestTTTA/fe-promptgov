import jsPDF from 'jspdf';
import '../../fonts/THSarabun-normal';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
const cmToPt = (cm) => cm * 28.346;
class ThaiInternalDocument {
  constructor() {
    this.doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
      putOnlyUsedFonts: true
    });
    this.margins = {
      top: cmToPt(1.5),
      bottom: cmToPt(2),
      left: cmToPt(3),
      right: cmToPt(2)
    };
    this.doc.setFont('THSarabunNew', 'normal');
    this.doc.setFontSize(16);
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.textWidth = this.pageWidth - this.margins.left - this.margins.right;
  }
  async addGaruda() {
    try {
      const garudaWidth = cmToPt(2);
      const response = await fetch('/img/krut-3-cm.png');
      const blob = await response.blob();
      const img = new Image();
      const loadImagePromise = new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width / 2;
          canvas.height = img.height / 2;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });

      const base64Image = await loadImagePromise;
      this.doc.addImage(base64Image, 'PNG', this.margins.left, this.margins.top, garudaWidth, garudaWidth);

      this.doc.setFontSize(32);
      const headerText = "บันทึกข้อความ";
      const textWidth = this.doc.getTextWidth(headerText);
      const textCenterX = (this.pageWidth - textWidth) / 2;
      const textY = this.margins.top + garudaWidth / 1.4;
      this.doc.text(headerText, textCenterX, textY);

      this.doc.setFont('THSarabunNew', 'normal');
      this.doc.setFontSize(16);

      URL.revokeObjectURL(img.src);
      return this.margins.top + garudaWidth + 20;
    } catch (error) {
      console.error('Failed to add Garuda:', error);
      return this.margins.top + cmToPt(1.5) + 40;
    }
  }
  // Add this function at the beginning of the class
  convertToThaiNumber(number) {
    const thaiNumbers = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
    return String(number).replace(/\d/g, digit => thaiNumbers[digit]);
  }

  addHeader(formData, startY) {
    this.doc.setFontSize(16);
    const lineHeight = cmToPt(0.8);
    let currentY = startY;

    // Convert any numbers in department to Thai numerals
    const department = formData.department ? formData.department.replace(/\d+/g, match => this.convertToThaiNumber(match)) : "______";
    this.doc.text(`ส่วนราชการ ${department}`, this.margins.left, currentY);
    currentY += lineHeight;

    // Convert any numbers in document number to Thai numerals
    const docNumber = formData.documentNumber ? formData.documentNumber.replace(/\d+/g, match => this.convertToThaiNumber(match)) : "______";
    this.doc.text(`ที่ ${docNumber}`, this.margins.left, currentY);

    // Date is already in Thai numerals from the form
    const dateText = `วันที่ ${formData.date || "______"}`;
    const dateWidth = this.doc.getTextWidth(dateText);
    const dateCenterX = (this.pageWidth - dateWidth) / 2;
    this.doc.text(dateText, dateCenterX, currentY);

    return currentY + lineHeight;
  }
  addSubjectAndReference(formData, startY) {
    let currentY = startY;

    // Convert any numbers in subject to Thai numerals
    const subject = formData.subject ? formData.subject.replace(/\d+/g, match => this.convertToThaiNumber(match)) : "______";
    this.doc.text(`เรื่อง ${subject}`, this.margins.left, currentY);
    currentY += cmToPt(0.8);

    // Convert any numbers in to field to Thai numerals
    const to = formData.to ? formData.to.replace(/\d+/g, match => this.convertToThaiNumber(match)) : "______";
    this.doc.text(`เรียน ${to}`, this.margins.left, currentY);
    currentY += cmToPt(0.8);

    if (formData.reference) {
      // Convert any numbers in reference to Thai numerals
      const reference = formData.reference.replace(/\d+/g, match => this.convertToThaiNumber(match));
      this.doc.text(`อ้างถึง ${reference}`, this.margins.left, currentY);
      currentY += cmToPt(0.8);
    }

    if (formData.attachment) {
      // Convert any numbers in attachment to Thai numerals
      const attachment = formData.attachment.replace(/\d+/g, match => this.convertToThaiNumber(match));
      this.doc.text(`สิ่งที่ส่งมาด้วย ${attachment}`, this.margins.left, currentY);
      currentY += cmToPt(0.8);
    }

    return currentY;
  }
  addContent(formData, startY) {
    // Adjust width to match the example document
    const maxWidth = this.pageWidth - this.margins.left - cmToPt(2); // Further reduced right margin for better alignment
    let currentY = startY + cmToPt(0.8);
    const bottomMargin = this.doc.internal.pageSize.getHeight() - this.margins.bottom;
    
    this.doc.setFont('THSarabunNew', 'normal');

    const sections = [
      formData.reason ? formData.reason.replace(/\d+/g, match => this.convertToThaiNumber(match)) : "______",
      formData.purpose ? formData.purpose.replace(/\d+/g, match => this.convertToThaiNumber(match)) : "______",
      formData.conclusion ? formData.conclusion.replace(/\d+/g, match => this.convertToThaiNumber(match)) : "______"
    ];

    // Process each section (reason, purpose, conclusion)
    sections.forEach((text, index) => {
      // Split text into paragraphs
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
      
      paragraphs.forEach((paragraph, pIndex) => {
        // First line indent - match the example document
        const firstLineIndent = cmToPt(2.5);
        
        // Use jsPDF's built-in text wrapping with specific width
        const lines = this.doc.splitTextToSize(paragraph, maxWidth);
        
        // Process each line with proper indentation
        lines.forEach((line, lineIndex) => {
          // Check if we need a new page
          if (currentY + cmToPt(0.8) > bottomMargin) {
            this.doc.addPage();
            currentY = this.margins.top;
          }

          // Calculate x position - indent only first line of paragraph
          const xPos = lineIndex === 0 ? 
            this.margins.left + firstLineIndent : 
            this.margins.left;
          
          // Draw the text with justification
          this.doc.text(line, xPos, currentY);
          currentY += cmToPt(0.8); // Line height
        });

        // Add spacing between paragraphs to match example
        if (pIndex < paragraphs.length - 1) {
          currentY += cmToPt(0.8); // One line space between paragraphs
        }
      });

      // Add spacing between sections to match example
      if (index < sections.length - 1) {
        currentY += cmToPt(1.6); // Two line spaces between sections
      }
    });

    return currentY;
  }
  addSignature(formData, startY) {
    let currentY = startY + cmToPt(3.2); // Increased spacing from content

    const signature = formData.signature ? formData.signature.replace(/\d+/g, match => this.convertToThaiNumber(match)) : "(________________)"
    const position = formData.position ? formData.position.replace(/\d+/g, match => this.convertToThaiNumber(match)) : "(ตำแหน่ง)";

    // Calculate center position
    const centerX = this.pageWidth / 2;

    // Add name in parentheses
    const nameWidth = this.doc.getTextWidth(signature);
    this.doc.text(signature, centerX - (nameWidth / 2) + cmToPt(2), currentY);
    currentY += cmToPt(0.8);

    // Add position in parentheses
    const posWidth = this.doc.getTextWidth(position);
    this.doc.text(position, centerX - (posWidth / 2) + cmToPt(2), currentY);

    return currentY;
  }
  async generate(formData) {
    let currentY = await this.addGaruda();
    currentY = this.addHeader(formData, currentY);
    currentY = this.addSubjectAndReference(formData, currentY);
    currentY = this.addContent(formData, currentY);
    currentY = this.addSignature(formData, currentY);
    return this.doc;
  }
}

export { ThaiInternalDocument };
