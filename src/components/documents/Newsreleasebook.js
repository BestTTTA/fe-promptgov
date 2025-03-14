import jsPDF from 'jspdf';
import '../../fonts/THSarabun-normal';

const cmToPt = (cm) => cm * 28.346;

class ThaiDocument {
  constructor() {
    this.doc = new jsPDF({
      unit: 'pt',
      format: 'a4'
    });
    this.margins = {
      top: cmToPt(4.5),
      bottom: cmToPt(2),
      left: cmToPt(3),
      right: cmToPt(2)
    };

    // ตั้งค่าฟอนต์และขนาด
    this.doc.setFont('THSarabunNew');
    this.doc.setFontSize(16);

    // คำนวณความกว้างของหน้ากระดาษ (A4)
    this.pageWidth = 595.28;
    this.textWidth = this.pageWidth - this.margins.left - this.margins.right;
  }

  async addGaruda() {
    const garudaWidth = cmToPt(3);
    const garudaHeight = cmToPt(3);
    const garudaX = (this.pageWidth - garudaWidth) / 2;

    const garudaBase64 = ""; // ใส่ Base64 จริง

    try {
      this.doc.addImage(
        garudaBase64,
        'PNG',
        garudaX,
        this.margins.top,
        garudaWidth,
        garudaHeight
      );
      return this.margins.top + garudaHeight + 10;
    } catch (error) {
      console.error('Failed to load Garuda image:', error);
      return this.margins.top + 10;
    }
  }

  addHeaderInfo(DocumentData, startY) {
    const lineHeight = 20;
    let currentY = startY;

    // ✅ เลื่อนลง 4.5 ซม. (1 ซม. ≈ 28.35 pt)
    const offsetY = 4.5;
    currentY += offsetY;

    const leftMargin = this.margins.left + cmToPt(3);  // ขอบซ้ายขยับเข้ามา 3 ซม.
    const rightMargin = this.pageWidth - this.margins.right - cmToPt(2);  // ขอบขวาขยับเข้ามา 2 ซม.

    // ✅ คำนวณความกว้างของพื้นที่ที่เหลือ
    const availableWidth = rightMargin - leftMargin;

    // ✅ แสดงหน่วยงาน (department)
    const departmentText = `${DocumentData.department || "ชื่อส่วนราชการที่ออกข่าว"}`;
    const departmentWidth = this.doc.getTextWidth(departmentText);
    const departmentX = leftMargin + (availableWidth - departmentWidth) / 2;
    this.doc.text(departmentText, departmentX, currentY);
    currentY += lineHeight;

    // ✅ แสดงเรื่อง (subject)
    const subjectText = `เรื่อง  ${DocumentData.subject || "............................."}`;
    const subjectWidth = this.doc.getTextWidth(subjectText);
    const subjectX = leftMargin + (availableWidth - subjectWidth) / 2;
    this.doc.text(subjectText, subjectX, currentY);
    currentY += lineHeight;

    // ✅ แสดงฉบับที่ (documentNumber) เฉพาะเมื่อมีข้อมูล
    if (DocumentData.documentNumber) {
      // ถ้ามี documentNumber ให้แสดงเฉพาะตัวเลข และไม่ต้องใส่ department
      const documentText = `ฉบับที่ ${DocumentData.documentNumber}`;
      const documentWidth = this.doc.getTextWidth(documentText);
      const documentX = leftMargin + (availableWidth - documentWidth) / 2;
      this.doc.text(documentText, documentX, currentY);
      currentY += lineHeight;
    } else {
      // ถ้าไม่มี documentNumber ให้แสดง "ฉบับที่ ......." และเพิ่ม department
      const documentText = `ฉบับที่ .................. ${DocumentData.department ? `(${DocumentData.department})` : ""}`;
      const documentWidth = this.doc.getTextWidth(documentText);
      const documentX = leftMargin + (availableWidth - documentWidth) / 2;
      this.doc.text(documentText, documentX, currentY);
      currentY += lineHeight;
    }


    return currentY;
  }

  addContent(content, startY) {
    if (!content) return startY;

    // ทำความสะอาดข้อความ: ลบช่องว่างเกิน, จัดรูปแบบใหม่
    const normalizedContent = content.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    let currentY = startY;
    const lineHeight = 26;  // ปรับระยะห่างบรรทัดให้เหมาะสม
    const firstLineIndent = cmToPt(2.5); // เยื้องบรรทัดแรก
    const paragraphSpacing = lineHeight * 1.2; // ระยะเว้นวรรคระหว่างย่อหน้า
    const maxWidth = this.textWidth;
    const lines = [];
    let currentLine = '';
    let isFirstLine = true;

    // เพิ่มระยะห่างก่อนข้อความเริ่ม
    currentY += paragraphSpacing;

    // ใช้ตัดคำภาษาไทยแบบถูกต้อง (รองรับพยัญชนะ, สระ, วรรณยุกต์)
    const words = normalizedContent.match(/[\u0E00-\u0E7F]+|\S+/g) || [];

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
      const allowedWidth = isFirstLine ? (maxWidth - firstLineIndent) : maxWidth;
      const testWidth = this.doc.getTextWidth(testLine);

      if (testWidth > allowedWidth && currentLine !== '') {
        lines.push({ text: currentLine, isFirstLine });
        currentLine = words[i];
        isFirstLine = false;
      } else {
        currentLine = testLine;
      }
    }

    // เพิ่มบรรทัดสุดท้ายถ้ามีข้อความเหลือ
    if (currentLine) {
      lines.push({ text: currentLine, isFirstLine });
    }

    // จัดข้อความให้สวยงาม
    lines.forEach((lineObj, index) => {
      const xPos = lineObj.isFirstLine ? this.margins.left + firstLineIndent : this.margins.left;
      this.doc.text(lineObj.text, xPos, currentY);
      currentY += (index === lines.length - 1) ? paragraphSpacing : lineHeight;
    });

    return currentY + 10;
  }

  addSignature(DocumentData, startY) {
    // ✅ เริ่มต้นที่ระยะห่างจากขอบบน 4.5 ซม.
    let currentY = startY + (2 * 2); // 1 ซม. ≈ 28.35 pt

    // ✅ คำนวณขอบซ้ายและขวาที่ถูกขยับ
    const leftMargin = this.margins.left + cmToPt(3);  // ขอบซ้ายขยับเข้ามา 3 ซม.
    const rightMargin = this.pageWidth - this.margins.right - cmToPt(2);  // ขอบขวาขยับเข้ามา 2 ซม.
    const availableWidth = rightMargin - leftMargin;
    const centerX = leftMargin + availableWidth / 2;

    // ✅ ข้อความ "ส่วนราชการที่ออกข่าว"
    const fullText = DocumentData.signature || "ส่วนราชการที่ออกข่าว";
    const firstChar = fullText.charAt(0); // ตัวแรก "ส"
    const remainingText = fullText.slice(1);
    const firstCharWidth = this.doc.getTextWidth(firstChar);
    const remainingTextWidth = this.doc.getTextWidth(remainingText);
    const firstCharX = centerX - (firstCharWidth / 2);
    this.doc.text(firstChar, firstCharX, currentY);
    const remainingTextX = firstCharX + firstCharWidth;
    this.doc.text(remainingText, remainingTextX, currentY);

    // ✅ Enter ลงมา 12 บรรทัด
    currentY += 2 * 12;
    
    const dateText = DocumentData.date || "วัน เดือน ปี";
    const dateWidth = this.doc.getTextWidth(dateText);

    // ✅ วางให้ "วัน เดือน ปี" อยู่ตรงกลางของ "ส่วนราชการที่ออกข่าว"
    const fullSignatureWidth = firstCharWidth + remainingTextWidth;
    const dateX = firstCharX + (fullSignatureWidth / 2) - (dateWidth / 2);
    this.doc.text(dateText, dateX, currentY);

    return currentY + 20;
  }


  // ... existing code ...

  addContactInfo(DocumentData, startY) {
    if (!DocumentData.contactPerson && !DocumentData.contactPosition &&
      !DocumentData.contactDepartment && !DocumentData.contactTel &&
      !DocumentData.contactFax) {
      return startY;
    }

    let currentY = startY + 20; // Add some spacing
    const lineHeight = 20;

    // Calculate margins similar to other sections
    const leftMargin = this.margins.left + cmToPt(3);
    const rightMargin = this.pageWidth - this.margins.right - cmToPt(2);

    // Add contact information
    if (DocumentData.contactPerson) {
      const contactPersonText = ` ${DocumentData.contactPerson}`;
      const contactPersonX = this.margins.left + cmToPt(1); // ✅ กำหนดให้ชิดซ้าย (3 ซม. จากขอบซ้าย)

      this.doc.text(contactPersonText, contactPersonX, currentY);
      currentY += lineHeight;
    }

    if (DocumentData.contactDepartment) {
      this.doc.text(`หน่วยงาน: ${DocumentData.contactDepartment}`, leftMargin, currentY);
      currentY += lineHeight;
    }

    return currentY;
  }

  async generate(DocumentData) {
    let currentY = this.margins.top;

    // ✅ โหลดและเพิ่มตราครุฑก่อน
    currentY = await this.addGaruda();

    // ✅ เรียกใช้ addHeaderInfo พร้อมส่งค่า startY
    currentY = this.addHeaderInfo(DocumentData, currentY);

    // ✅ เพิ่มเนื้อหา
    currentY = this.addContent(DocumentData.content, currentY);

    // ✅ เพิ่มลายเซ็น
    currentY = this.addSignature(DocumentData, currentY);

    // ✅ เพิ่มข้อมูลติดต่อ
    this.addContactInfo(DocumentData, currentY);

    return this.doc;
  }
}

// ฟังก์ชันหลักสำหรับใช้งานภายนอก
const createThaiDocument = async (DocumentData) => {
  const thaiDoc = new ThaiDocument();
  const doc = await thaiDoc.generate(DocumentData);
  return doc;
};

export default createThaiDocument;
