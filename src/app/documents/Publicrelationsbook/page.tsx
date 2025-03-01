"use client";
import React, { useState } from "react";
import createThaiPublicrelationsbook from "../../../components/documents/Publicrelationsbook";
import AIContentGenerator from "../../../components/GeminiGenerator";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { th } from "date-fns/locale";

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

const PublicRelationsBook: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState<FormData>({
    documentNumber: '',
    date: '',
    subject: '',
    to: '',
    reference: '',
    attachment: '',
    content: '',
    signature: '',
    position: '',
    department: '',
    tel: '',
    fax: ''
  });
  
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      date: date ? format(date, 'd MMMM yyyy', { locale: th })
        .replace(/\d{4}/, year => String(parseInt(year) + 543)) : ''
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;

    if (name === 'content') {
      // 1. แทนที่การขึ้นบรรทัดใหม่ที่ไม่ได้ต้องการ (single newlines) ด้วยช่องว่าง
      // 2. เก็บการขึ้นบรรทัดใหม่ที่ต้องการ (double newlines) ไว้สำหรับแบ่งย่อหน้า
      const cleanValue = value
        .replace(/[\t ]+/g, ' ')
        .trim();

      setFormData((prev: FormData) => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const doc = await createThaiPublicrelationsbook(formData);
      doc.save('thai-document.pdf');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handlePreviewPDF = async () => {
    try {
      const doc = await createThaiPublicrelationsbook(formData);
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
          <label className="block text-gray-700">แถลงการณ์กองทัพบก:</label>
          <input
            name="documentNumber"
            type="text"
            value={formData.documentNumber}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        {/* Fix DatePicker container structure */}
        <div className="relative"></div>
          <label className="block text-gray-700">วันที่:</label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="d MMMM yyyy"
            locale={th}
            className="w-full border p-2 rounded"
            placeholderText="เลือกวันที่"
            showMonthDropdown
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={50}
            minDate={new Date('1900-01-01')}
            maxDate={new Date('2100-12-31')}
            renderCustomHeader={({
              date,
              changeYear,
              changeMonth,
              decreaseYear,
              increaseYear,
              prevYearButtonDisabled,
              nextYearButtonDisabled,
            }) => (
              <div className="flex justify-between px-2 py-2">
                <button onClick={decreaseYear} disabled={prevYearButtonDisabled}>
                  {"<"}
                </button>
                <div className="flex space-x-2">
                  <select
                    value={date.getMonth()}
                    onChange={({ target: { value } }) => changeMonth(Number(value))}
                    className="px-2 py-1 w-full"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {format(new Date(2000, i, 1), 'MMMM', { locale: th })}
                      </option>
                    ))}
                  </select>
                  <select
                    value={date.getFullYear()}
                    onChange={({ target: { value } }) => changeYear(Number(value))}
                    className="px-2 py-1 w-full"
                  >
                    {Array.from({ length: 201 }, (_, i) => date.getFullYear() - 100 + i).map(
                      (year) => (
                        <option key={year} value={year}>
                          {year + 543}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <button onClick={increaseYear} disabled={nextYearButtonDisabled}>
                  {">"}
                </button>
              </div>
          )}
        />
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
          <label className="block text-gray-700">ฉบับที่:</label>
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
          <label className="block text-gray-700">กองทัพบก:</label>
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
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
              lineHeight: '1.8',
              fontFamily: 'THSarabun',
              textAlign: 'justify',
              padding: '1em'
            }}
          />
          <AIContentGenerator formData={formData} setFormData={setFormData} />
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
};

export default PublicRelationsBook;
