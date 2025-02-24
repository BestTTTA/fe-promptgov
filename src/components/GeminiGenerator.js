"use client";
import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCepgi4WqMvEfT-E41Njug_9ycaVfmkBXE");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const AIContentGenerator = ({ formData, setFormData }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerateContent = async () => {
    if (!formData.content.trim()) {
      alert("กรุณาป้อนข้อความก่อนที่จะใช้ AI Generate");
      return;
    }

    setLoading(true);
    try {
      const prompt = `
      สร้างเฉพาะเนื้อหาเอกสารทางการไทย โดยต้องไม่มีคำอธิบายเพิ่มเติม ไม่มีเกริ่นนำ ไม่มีการแนะนำ หรืออธิบายสิ่งที่ทำ แสดงเฉพาะเนื้อหาหลักของเอกสารที่มีรูปแบบเป็นทางการและตรงประเด็น

      ข้อมูลที่ให้มา:
      ${formData.content}

      **หมายเหตุ**: ตอบกลับเฉพาะข้อความเอกสารที่ต้องการ ไม่มีส่วนอื่นใดที่เกินจากเนื้อหาเอกสารที่ให้ไว้
      `;

      const result = await model.generateContent(prompt);
      let generatedText = result.response.text().trim();

      // Post-processing: ตัดข้อความที่ไม่เกี่ยวข้องออก
      const regexPattern = /เนื้อหา:\s*(.+)/s;
      const match = generatedText.match(regexPattern);
      if (match) {
        generatedText = match[1].trim(); // ดึงเฉพาะเนื้อหาหลัก
      }

      setFormData((prev) => ({ ...prev, content: generatedText }));
    } catch (error) {
      console.error("Failed to generate content:", error);
      alert("เกิดข้อผิดพลาดในการสร้างเนื้อหา กรุณาลองใหม่");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleGenerateContent}
      className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-4"
      disabled={loading}
    >
      {loading ? "กำลังสร้าง..." : "ให้ AI ช่วยเขียน"}
    </button>
  );
};

export default AIContentGenerator;
