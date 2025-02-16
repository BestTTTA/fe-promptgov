// CreateDocumentPage.tsx
"use client";
import React, { useState } from "react";
import createThaiDocument from "../../../components/MyDocument";

function CreateDocumentPage() {
  const [formData, setFormData] = useState({
    documentNumber: "",
    date: "",
    subject: "",
    to: "",
    reference: "",
    attachment: "",
    content: "",
    signature: "",
    position: "",
    department: "",
    tel: "",
    fax: "",
  });

  interface FormData {
    documentNumber: string;
    date: string;
    subject: string;
    to: string;
    reference: string;
    attachment: string;
    content: string;
    signature: string;
    position: string;
    department: string;
    tel: string;
    fax: string;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;

    if (name === 'content') {
      // 1. แทนที่การขึ้นบรรทัดใหม่ที่ไม่ได้ต้องการ (single newlines) ด้วยช่องว่าง
      // 2. เก็บการขึ้นบรรทัดใหม่ที่ต้องการ (double newlines) ไว้สำหรับแบ่งย่อหน้า
      const cleanValue = value
        // .replace(/([^\n])\n([^\n])/g, '$1 $2')  // แทนที่การขึ้นบรรทัดเดี่ยวด้วยช่องว่าง
        // .replace(/\n\s*\n/g, '\n\n')            // รักษาการขึ้นบรรทัดคู่สำหรับย่อหน้าใหม่
        .replace(/[\t ]+/g, ' ')                // แทนที่ช่องว่างหลายๆ อันด้วยช่องว่างเดียว
        .trim();                                // ตัดช่องว่างหัวท้าย

      setFormData((prev: FormData) => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const doc = await createThaiDocument(formData);
      doc.save('thai-document.pdf');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handlePreviewPDF = async () => {
    try {
      const doc = await createThaiDocument(formData);
      const pdfData = doc.output('datauristring');
      window.open(pdfData, '_blank');
    } catch (error) {
      console.error('Failed to preview PDF:', error);
      alert('เกิดข้อผิดพลาดในการแสดงตัวอย่าง PDF กรุณาลองใหม่อีกครั้ง');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">สร้างเอกสารใหม่</h1>

      <form className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label className="block text-gray-700">ที่:</label>
          <input
            name="documentNumber"
            type="text"
            value={formData.documentNumber}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">วัน เดือน ปี:</label>
          <input
            name="date"
            type="text"
            value={formData.date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">เรื่อง:</label>
          <input
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">เรียน:</label>
          <input
            name="to"
            type="text"
            value={formData.to}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">อ้างถึง:</label>
          <input
            name="reference"
            type="text"
            value={formData.reference}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">สิ่งที่ส่งมาด้วย:</label>
          <input
            name="attachment"
            type="text"
            value={formData.attachment}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">เนื้อหา:</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full border p-2 rounded h-32"
            style={{
              whiteSpace: 'pre-wrap',       // รักษาการขึ้นบรรทัดใหม่
              overflowWrap: 'break-word',   // ตัดคำเมื่อเกินขอบ
              lineHeight: '1.8',            // เพิ่มระยะห่างระหว่างบรรทัด
              fontFamily: 'THSarabun',
                    // ตัดคำเมื่อจำเป็น
              textAlign: 'justify',         // จัดข้อความชิดขอบทั้งสองด้าน
              padding: '1em'
            }}
          />
        </div>
        <div>
          <label className="block text-gray-700">ลงชื่อ:</label>
          <input
            name="signature"
            type="text"
            value={formData.signature}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">ตำแหน่ง:</label>
          <input
            name="position"
            type="text"
            value={formData.position}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">หน่วยงาน:</label>
          <input
            name="department"
            type="text"
            value={formData.department}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">โทร:</label>
          <input
            name="tel"
            type="text"
            value={formData.tel}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700">โทรสาร:</label>
          <input
            name="fax"
            type="text"
            value={formData.fax}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
      </form>
      <div className="mt-6 flex space-x-4">
        <button
          onClick={handlePreviewPDF}
          className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
        >
          Preview
        </button>
        <button
          onClick={handleGeneratePDF}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          ดาวน์โหลด PDF
        </button>
      </div>
    </div>
  );
}

export default CreateDocumentPage;