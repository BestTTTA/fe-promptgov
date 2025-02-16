import jsPDF from 'jspdf';
import '../fonts/THSarabun-normal';
// import garudaBase64 from './garudaImage';

const cmToPt = (cm) => cm * 28.346;

class ThaiDocument {
  constructor() {
    this.doc = new jsPDF({
      unit: 'pt',
      format: 'a4'
    });
    
    this.margins = {
      top: cmToPt(2.5),
      bottom: cmToPt(2),
      left: cmToPt(3),
      right: cmToPt(2)
    };

    // ตั้งค่าฟอนต์และขนาด
    this.doc.setFont('THSarabunNew');
    this.doc.setFontSize(16);
    
    // คำนวณความกว้างของหน้ากระดาษ (A4)
    this.pageWidth = 595.28; // (jsPDF A4 width in points)
    this.textWidth = this.pageWidth - this.margins.left - this.margins.right;
  }

  async addGaruda() {
    const garudaWidth = cmToPt(3);
    const garudaHeight = cmToPt(3);
    const garudaX = (this.pageWidth - garudaWidth) / 2;

    try {
      this.doc.addImage(
        garudaBase64,
        'PNG',
        garudaX,
        this.margins.top,
        garudaWidth,
        garudaHeight
      );
      return garudaHeight + 8;
    } catch (error) {
      console.error('Failed to load Garuda image:', error);
      return 8;
    }
  }

  addHeaderInfo(formData) {
    const startY = this.margins.top + cmToPt(3) + 8;
    
    // กำหนดตำแหน่งของ "ที่ ... " (documentNumber) ฝั่งซ้าย
    this.doc.text(
      `ที่ ${formData.documentNumber || "_________"}`,
      this.margins.left,
      startY
    );
    
    // กำหนดตำแหน่งของ "ส่วนราชการ" ฝั่งขวา
    const rightAlignX = this.pageWidth - this.margins.right;
    this.doc.text(
      formData.department || "ส่วนราชการ",
      rightAlignX,
      startY,
      { align: 'right' }
    );
    
    return startY + 40;
  }

  addDocumentInfo(formData, startY) {
    const lineHeight = 20;
    let currentY = startY;
    
    // คำนวณตำแหน่งกึ่งกลางหน้ากระดาษ A4
    const centerX = this.pageWidth / 2;
    
    // วันที่ - ปรับให้เริ่มจากกึ่งกลางกระดาษ
    if (formData.date) {
      this.doc.text(formData.date, centerX, currentY, { align: 'left' });
    } else {
      this.doc.text('วันที่ _________', centerX, currentY, { align: 'left' });
    }
    currentY += lineHeight;
    
    // เรื่อง
    this.doc.text(`เรื่อง ${formData.subject || "_________"}`, this.margins.left, currentY);
    currentY += lineHeight;
    
    // เรียน
    this.doc.text(`เรียน ${formData.to || "_________"}`, this.margins.left, currentY);
    currentY += lineHeight;
  
    // อ้างถึง
    if (formData.reference) {
      this.doc.text(`อ้างถึง ${formData.reference}`, this.margins.left, currentY);
      currentY += lineHeight;
    }
  
    // สิ่งที่ส่งมาด้วย
    if (formData.attachment) {
      this.doc.text(`สิ่งที่ส่งมาด้วย ${formData.attachment}`, this.margins.left, currentY);
      currentY += lineHeight;
    }
  
    return currentY + 10;
  }

  /**
   * addContent: ตัดบรรทัดแบบ Character-based
   *  - บรรทัดแรกเยื้อง (indent) 2.5 ซม.
   *  - บรรทัดถัดไปไม่เยื้อง
   */
  addContent(content, startY) {
    if (!content) return startY;

    // ทำความสะอาดข้อความ
    const normalizedContent = content
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    let currentY = startY;
    const lineHeight = 20;

    // ระยะเยื้องสำหรับบรรทัดแรก
    const firstLineIndent = cmToPt(2.5);

    // กำหนดความกว้างบรรทัดสูงสุด
    const maxWidth = this.textWidth;

    // ตัวแปรสำหรับเก็บแต่ละบรรทัด
    const lines = [];
    let currentLine = '';
    let isFirstLine = true;

    for (let i = 0; i < normalizedContent.length; i++) {
      const testLine = currentLine + normalizedContent[i];

      // หากเป็นบรรทัดแรก ให้ตัดเมื่อเกิน (maxWidth - firstLineIndent)
      // หากเป็นบรรทัดอื่น ให้ตัดเมื่อเกิน maxWidth เต็ม
      const allowedWidth = isFirstLine
        ? (maxWidth - firstLineIndent)
        : maxWidth;

      const testWidth = this.doc.getTextWidth(testLine);

      if (testWidth > allowedWidth && currentLine !== '') {
        // ถ้าเกินความกว้างที่อนุญาตแล้ว
        lines.push({ text: currentLine, isFirstLine });
        currentLine = normalizedContent[i];
        isFirstLine = false; // บรรทัดถัดไปไม่ใช่บรรทัดแรกแล้ว
      } else {
        currentLine = testLine;
      }
    }

    // บรรทัดสุดท้าย
    if (currentLine) {
      lines.push({ text: currentLine, isFirstLine });
    }

    // วาดทีละบรรทัด
    lines.forEach((lineObj) => {
      // ถ้าเป็นบรรทัดแรกให้ indent 2.5 ซม., ถ้าไม่ใช่ก็ชิด margin ซ้าย
      const xPos = lineObj.isFirstLine
        ? this.margins.left + firstLineIndent
        : this.margins.left;

      this.doc.text(lineObj.text, xPos, currentY);
      currentY += lineHeight;
    });

    return currentY + 10;
  }

  addSignature(formData, startY) {
    const signatureX = this.pageWidth / 2;
    let currentY = startY + 20;

    this.doc.text('ขอแสดงความนับถือ', signatureX, currentY, { align: 'center' });
    currentY += 40;

    this.doc.text(`(${formData.signature || "_________"})`, signatureX, currentY, { align: 'center' });
    currentY += 20;

    this.doc.text(formData.position || "ตำแหน่ง", signatureX, currentY, { align: 'center' });

    return currentY + 20;
  }

  addContactInfo(formData, startY) {
    let currentY = startY + 20;
    const lineHeight = 20;

    this.doc.text(formData.department || "หน่วยงาน", this.margins.left, currentY);
    currentY += lineHeight;

    this.doc.text(`โทร. ${formData.tel || "_________"}`, this.margins.left, currentY);
    currentY += lineHeight;

    this.doc.text(`โทรสาร ${formData.fax || "_________"}`, this.margins.left, currentY);
  }

  async generate(formData) {
    let currentY = this.margins.top;
    
    // เพิ่มครุฑ
    currentY += await this.addGaruda();

    // ส่วนหัว
    currentY = this.addHeaderInfo(formData);

    // รายละเอียดเอกสาร (วันที่, เรื่อง, เรียน, อ้างถึง, สิ่งที่ส่งมาด้วย)
    currentY = this.addDocumentInfo(formData, currentY);

    // เนื้อหา
    currentY = this.addContent(formData.content, currentY);

    // ลายเซ็น
    currentY = this.addSignature(formData, currentY);

    // ข้อมูลติดต่อ
    this.addContactInfo(formData, currentY);

    // ส่งคืน doc ที่สร้างเสร็จ
    return this.doc;
  }
}

// ฟังก์ชันหลักสำหรับใช้งานภายนอก
const createThaiDocument = async (formData) => {
  const thaiDoc = new ThaiDocument();
  const doc = await thaiDoc.generate(formData);
  return doc;
};

export default createThaiDocument;
