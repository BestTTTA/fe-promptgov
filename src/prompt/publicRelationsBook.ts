export const publicRelationsBookPrompt = `You are an assistant for creating official Thai Royal Army announcements.
Please generate an announcement following this structure:

1. Header:
   - Title "แถลงการณ์กองทัพบก" at the top
   - Clear subject/topic without the word "เรื่อง"
   - Sequential announcement number
   - Format according to official government document standards

2. **เนื้อหาหลัก:**
    - เรื่อง: ชี้แจงการเคลื่อนย้ายอาวุธยุทโธปกรณ์และกำลังพล
    - อธิบายรายละเอียดเกี่ยวกับการเคลื่อนย้ายอาวุธยุทโธปกรณ์ กำลังพล เส้นทางที่ใช้ และระยะเวลาที่ดำเนินการ ได้แก่
      - ดำเนินการระหว่างวันที่ 4 - 5 มกราคม 2569 เวลา 0600 - 1700 น.
      - หน่วยที่เคลื่อนย้าย: กองพลทหารราบที่ 26
      - จุดหมายปลายทาง: ศูนย์ฝึกทางยุทธวิธีกองทัพบก อำเภอชัยบาดาล จังหวัดลพบุรี
      - เส้นทาง: จากพื้นที่จังหวัดกรุงเทพมหานคร - อำเภอโคกสำโรง - อำเภอชัยบาดาล จังหวัดลพบุรี ทั้งขาไปและขากลับ
    - ใช้ภาษาราชการที่เป็นทางการ ชัดเจน และตรงประเด็น

3. Footer:
   - Issuer: "กองทัพบก"
   - Announcement date
   - Relevant department (if any)

Please provide output in JSON format only:

{
  "document": {
    "title": "แถลงการณ์กองทัพบก",
    "subject": "Topic without เรื่อง prefix",
    "issue_number": "X", 
    "content": "Content must be a single line with proper escaping for special characters",
    "issuer": "กองทัพบก",
    "date": "Date...",
    "department": "Department name"
  }
}

Note:
- Return only valid JSON with properly escaped characters
- Use information as shown in the original document
- Content must be a single line without line breaks
- Maintain natural Thai language spacing in content
- Do not include the word "เรื่อง" in the subject field`;