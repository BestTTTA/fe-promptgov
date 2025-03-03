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
      top: cmToPt(2.5),
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

  addHeaderInfo(formData, startY) {
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
    const departmentText = `${formData.department || "ชื่อส่วนราชการที่ออกข่าว"}`;
    const departmentWidth = this.doc.getTextWidth(departmentText);
    const departmentX = leftMargin + (availableWidth - departmentWidth) / 2;
    this.doc.text(departmentText, departmentX, currentY);
    currentY += lineHeight;

    // ✅ แสดงเรื่อง (subject)
    const subjectText = `เรื่อง  ${formData.subject || "............................."}`;
    const subjectWidth = this.doc.getTextWidth(subjectText);
    const subjectX = leftMargin + (availableWidth - subjectWidth) / 2;
    this.doc.text(subjectText, subjectX, currentY);
    currentY += lineHeight;

    // ✅ แสดงฉบับที่ (documentNumber) เฉพาะเมื่อมีข้อมูล
    if (formData.documentNumber) {
      const documentText = `ฉบับที่ ${formData.documentNumber} ${formData.department ? `(${formData.department})` : ""}`;
      const documentWidth = this.doc.getTextWidth(documentText);
      const documentX = leftMargin + (availableWidth - documentWidth) / 2;
      this.doc.text(documentText, documentX, currentY);
      currentY += lineHeight;
    }

    return currentY;
  }

  addContent(content, startY) {
    if (!content) return startY;

    const normalizedContent = content.replace(/\n/g, ' ').replace(/\s+/g, '').trim();
    let currentY = startY;
    const lineHeight = 20;
    const firstLineIndent = cmToPt(2.5);
    const maxWidth = this.textWidth;
    const lines = [];
    let currentLine = '';
    let isFirstLine = true;

    currentY += lineHeight * 2;

    for (let i = 0; i < normalizedContent.length; i++) {
      const testLine = currentLine + normalizedContent[i];
      const allowedWidth = isFirstLine ? (maxWidth - firstLineIndent) : maxWidth;
      const testWidth = this.doc.getTextWidth(testLine);

      if (testWidth > allowedWidth && currentLine !== '') {
        lines.push({ text: currentLine, isFirstLine });
        currentLine = normalizedContent[i];
        isFirstLine = false;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push({ text: currentLine, isFirstLine });
    }

    lines.forEach((lineObj) => {
      const xPos = lineObj.isFirstLine ? this.margins.left + firstLineIndent : this.margins.left;
      this.doc.text(lineObj.text, xPos, currentY);
      currentY += lineHeight;
    });

    return currentY + 10;
  }

  addSignature(formData, startY) {
    // ✅ เริ่มต้นที่ระยะห่างจากขอบบน 4.5 ซม.
    let currentY = startY + (2 * 2); // 1 ซม. ≈ 28.35 pt

    // ✅ คำนวณขอบซ้ายและขวาที่ถูกขยับ
    const leftMargin = this.margins.left + cmToPt(3);  // ขอบซ้ายขยับเข้ามา 3 ซม.
    const rightMargin = this.pageWidth - this.margins.right - cmToPt(2);  // ขอบขวาขยับเข้ามา 2 ซม.
    const availableWidth = rightMargin - leftMargin;
    const centerX = leftMargin + availableWidth / 2;

    // ✅ ข้อความ "ส่วนราชการที่ออกข่าว"
    const fullText = formData.signature || "ส่วนราชการที่ออกข่าว";
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
    const dateText = formData.date || "วัน เดือน ปี";
    const dateWidth = this.doc.getTextWidth(dateText);

    // ✅ วางให้ "วัน เดือน ปี" อยู่ตรงกลางของ "ส่วนราชการที่ออกข่าว"
    const fullSignatureWidth = firstCharWidth + remainingTextWidth;
    const dateX = firstCharX + (fullSignatureWidth / 2) - (dateWidth / 2);
    this.doc.text(dateText, dateX, currentY);

    return currentY + 20;
  }


  // ... existing code ...

  addContactInfo(formData, startY) {
    if (!formData.contactPerson && !formData.contactPosition &&
      !formData.contactDepartment && !formData.contactTel &&
      !formData.contactFax) {
      return startY;
    }

    let currentY = startY + 20; // Add some spacing
    const lineHeight = 20;

    // Calculate margins similar to other sections
    const leftMargin = this.margins.left + cmToPt(3);
    const rightMargin = this.pageWidth - this.margins.right - cmToPt(2);

    // Add contact information
    if (formData.contactPerson) {
      const contactPersonText = ` ${formData.contactPerson}`;
      const contactPersonX = this.margins.left + cmToPt(1); // ✅ กำหนดให้ชิดซ้าย (3 ซม. จากขอบซ้าย)

      this.doc.text(contactPersonText, contactPersonX, currentY);
      currentY += lineHeight;
    }

    if (formData.contactDepartment) {
      this.doc.text(`หน่วยงาน: ${formData.contactDepartment}`, leftMargin, currentY);
      currentY += lineHeight;
    }

    return currentY;
  }

  async generate(formData) {
    let currentY = this.margins.top;

    // ✅ โหลดและเพิ่มตราครุฑก่อน
    currentY = await this.addGaruda();

    // ✅ เรียกใช้ addHeaderInfo พร้อมส่งค่า startY
    currentY = this.addHeaderInfo(formData, currentY);

    // ✅ เพิ่มเนื้อหา
    currentY = this.addContent(formData.content, currentY);

    // ✅ เพิ่มลายเซ็น
    currentY = this.addSignature(formData, currentY);

    // ✅ เพิ่มข้อมูลติดต่อ
    this.addContactInfo(formData, currentY);

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
