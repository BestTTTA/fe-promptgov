'use client';

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { ThaiInternalDocument } from '../../../components/documents/InternalDocs';
import '../../../fonts/THSarabun-normal';

// Function to convert Arabic numerals to Thai numerals
const toThaiNumber = (num: number | string): string => {
  const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return num.toString().split('').map(char => {
    const digit = parseInt(char);
    return isNaN(digit) ? char : thaiNumerals[digit];
  }).join('');
};

interface FormData {
  documentNumber?: string;
  department?: string;
  date?: string;
  subject?: string;
  to?: string;
  reference?: string;
  reason?: string;
  purpose?: string;
  conclusion?: string;
  signature?: string;
  position?: string;
}

const InternalDocPage = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Convert numbers in the input to Thai numerals
    let processedValue = value.replace(/[0-9]/g, match => toThaiNumber(match));
    
    // For textarea fields (content sections)
    if (e.target.tagName.toLowerCase() === 'textarea') {
      // Preserve line breaks but normalize other whitespace
      processedValue = processedValue
        .replace(/[ \t]+/g, ' ')  // Replace multiple spaces/tabs with single space
        .replace(/\n{3,}/g, '\n\n')  // Replace 3+ consecutive line breaks with 2
        .trim();
      
      // Don't add automatic line breaks after punctuation as it might cause issues with Thai text
    } 
    // For input fields (single line)
    else {
      // Normalize all whitespace for single line inputs
      processedValue = processedValue.replace(/\s+/g, ' ').trim();
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const buddhistYear = date.getFullYear() + 543;
      const day = toThaiNumber(date.getDate());
      const formattedDate = `${day} ${format(date, 'MMMM', { locale: th })} ${toThaiNumber(buddhistYear)}`;
      setFormData(prev => ({
        ...prev,
        date: formattedDate
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        date: ''
      }));
    }
  };
  const handlePreview = async () => {
    try {
      const doc = new ThaiInternalDocument();
      const pdf = await doc.generate(formData);
      const pdfDataUri = pdf.output('datauristring');
      window.open(pdfDataUri, '_blank');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการแสดงตัวอย่าง PDF กรุณาลองใหม่อีกครั้ง');
    }
  };
  const handleDownload = async () => {
    try {
      const doc = new ThaiInternalDocument();
      const pdf = await doc.generate(formData);
      pdf.save('internal-document.pdf');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">สร้างหนังสือราชการภายใน</h1>
        <div className="container mx-auto p-4 border bg-white shadow-xl rounded-xl" role="main">
          <div className="space-y-4">
            <div>
              <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 mb-1">เลขที่หนังสือ</label>
              <input
                id="documentNumber"
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">ส่วนราชการ</label>
              <input
                id="department"
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">วันที่</label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="d MMMM yyyy"
                locale={th}
                className="w-full p-2 border rounded"
                placeholderText="เลือกวันที่"
                showMonthDropdown
                showYearDropdown
                scrollableMonthYearDropdown
                yearDropdownItemNumber={100}
                minDate={new Date('1900-01-01')}
                maxDate={new Date('2100-12-31')}
                renderCustomHeader={({
                  date,
                  changeYear,
                  changeMonth,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div className="flex items-center justify-between px-2 py-2">
                    <button
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                      className="px-2 py-1 hover:bg-gray-100 rounded"
                    >
                      {"<"}
                    </button>
                    <div className="flex space-x-2">
                      <select
                        value={date.getMonth()}
                        onChange={({ target: { value } }) => changeMonth(Number(value))}
                        className="px-2 py-1 rounded border"
                      >
                        {[
                          "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                          "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
                        ].map((month, i) => (
                          <option key={month} value={i}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        value={date.getFullYear() + 543}
                        onChange={({ target: { value } }) => changeYear(Number(value) - 543)}
                        className="px-2 py-1 rounded border"
                      >
                        {Array.from({ length: 201 }, (_, i) => date.getFullYear() - 100 + i).map(
                          (year) => (
                            <option key={year + 543} value={year + 543}>
                              {toThaiNumber(year + 543)}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <button
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                      className="px-2 py-1 hover:bg-gray-100 rounded"
                    >
                      {">"}
                    </button>
                  </div>
                )}
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">เรื่อง</label>
              <input
                id="subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">เรียน</label>
              <input
                id="to"
                type="text"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">อ้างถึง</label>
              <input
                id="reference"
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">ภาคเหตุ</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="w-full p-2 border rounded h-32"
              />
            </div>
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">ภาคความประสงค์</label>
              <textarea
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full p-2 border rounded h-32"
              />
            </div>
            <div>
              <label htmlFor="conclusion" className="block text-sm font-medium text-gray-700 mb-1">ภาคสรุป</label>
              <textarea
                id="conclusion"
                name="conclusion"
                value={formData.conclusion}
                onChange={handleInputChange}
                className="w-full p-2 border rounded h-32"
              />
            </div>
            <div>
              <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-1">ลงชื่อ</label>
              <input
                id="signature"
                type="text"
                name="signature"
                value={formData.signature}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
              <input
                id="position"
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handlePreview}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Preview
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                ดาวน์โหลด PDF
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default InternalDocPage;
