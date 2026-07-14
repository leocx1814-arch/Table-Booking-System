---
name: damrongdham-dev
description: กฎระเบียบและข้อกำหนดสำหรับการพัฒนาโครงการระบบจองโต๊ะโรงอาหารในสถานศึกษา ด้วย React 18, Vite 5, MUI 5, Node.js 20, Express 4, และ MySQL 8
---

# คู่มือนักพัฒนา AI: ระบบจองโต๊ะโรงอาหารในสถานศึกษา

เอกสารฉบับนี้คือ `SKILL.md` ซึ่งทำหน้าที่เป็นคู่มือข้อตกลงและกรอบการทำงานหลักสำหรับปัญญาประดิษฐ์ (AI Coding Assistant) ที่ปฏิบัติงานในโครงการพัฒนาเว็บแอปพลิเคชันระบบจองโต๊ะโรงอาหารในสถานศึกษา

---

## 1. Purpose
* เพื่อกำหนดมาตรฐาน รูปแบบ และกรอบกฎเกณฑ์ที่ชัดเจนสำหรับ AI ในการสร้าง บำรุงรักษา และทดสอบระบบ
* เพื่อให้แน่ใจว่า AI ทำงานอย่างเป็นระบบตามลำดับขั้นตอน (Phase) ไม่ข้ามขั้นตอน ไม่เขียนโค้ดนอกขอบเขต และรักษาสถาปัตยกรรมของโครงการไว้ตามข้อตกลง

## 2. Project Working Principles
* **Read Instructions First:** AI จะต้องอ่านและทำความเข้าใจข้อตกลงใน `SKILL.md` นี้ก่อนที่จะเริ่มปฏิบัติงานใด ๆ ในแต่ละ Turn
* **Understand Context:** ก่อนจะเริ่มเข้าสู่ขั้นตอนการเขียนโค้ด (Implementation) หรือวางแผนออกแบบ AI ต้องอ่านข้อมูลบริบทจาก `docs/planning/PROJECT_CONTEXT.md` (ถ้ามี) เสมอ
* **Respect Implementation Plan:** ก่อนที่จะเริ่มงานในแต่ละเฟสการพัฒนา AI ต้องทบทวนรายละเอียดและขั้นตอนย่อยจาก `docs/planning/10-implementation-plan.md` เพื่อจำกัดกรอบงานให้ถูกต้อง

## 3. AI General Rules
* **Role Alignment:** AI ต้องทำหน้าที่เป็น Technical Lead และ Senior Developer ที่มีความรัดกุมสูง
* **Incremental Design:** พัฒนาและเพิ่มโค้ดทีละขั้นอย่างต่อเนื่อง ห้ามทำการแก้ไขไฟล์จำนวนมากในคราวเดียวโดยไม่ได้ทดสอบผลกระทบ
* **No Code Modification without Logic:** ห้ามปรับแก้ ลบโค้ด หรือลบความเห็น (Comments) ส่วนเดิมของโครงการที่ไม่มีความเกี่ยวข้องกับการอัปเดตนั้น ๆ

## 4. Planning Rules
* **No Unapproved Coding:** ห้ามเริ่มเขียนโค้ด ดัดแปลงฐานข้อมูล หรือสร้างโฟลเดอร์พัฒนาขึ้นมาเอง หากแผนการดำเนินงานของ Phase นั้นยังไม่ผ่านการวิเคราะห์ ตรวจทาน และยอมรับจาก USER
* **Propose Implementation Plan:** แผนการทำงานต้องมีรายละเอียดผลกระทบของการเปลี่ยนแปลง (Affected Files), สัญญาการเชื่อมโยง (Contracts), และแผนการกู้คืนหากระบบล้มเหลว

## 5. Implementation by Phase Rules
* **Targeted Execution:** ทำงานเฉพาะเจาะจงกับ Phase ที่ได้รับมอบหมายเท่านั้น ห้ามเริ่มทำล่วงหน้าใน Phase ถัดไปเด็ดขาด
* **Feature Scope:** ห้ามคิดฟีเจอร์ใหม่ขึ้นมาเองโดยไม่มีอยู่ในแผนงาน (Out-of-Scope features)
* **Checklist for Delivery:** ในทุก Phase ที่ทำเสร็จสิ้น ต้องมีคู่มือการรันเพื่อใช้งาน (Run instructions), วิธีการทดสอบ (Verification instructions) และ Acceptance Criteria Checklist เสมอ
* **Git Suggestions:** นำเสนอ Commit Message สำหรับเฟสงานย่อยนั้น ๆ ให้สอดคล้องกับ Conventional Commits

## 6. Frontend Development Rules
* **Framework:** React 18 + Vite 5 + MUI 5 (Material-UI)
* **Design Philosophy:** 
  - ออกแบบหน้าจอให้เป็น Mobile-first และมีลักษณะ Responsive ที่สวยงาม
  - หลีกเลี่ยง ad-hoc style (สไตล์เขียนสดใน component) ให้เน้นใช้ MUI `ThemeProvider`, `sx` props หรือ CSS variables ควบคู่กับ Vanilla CSS ที่เป็นระเบียบ
* **Structure:** แยกส่วนแสดงผล (View Components) ออกจาก Logic/State management (Custom Hooks หรือ Service Layers) ให้ชัดเจน
* **Hot Module Replacement (HMR):** รักษาความสามารถของ HMR โดยไม่ใช้การตั้งค่าที่จะไปรบกวนโครงสร้าง Docker bind mount

## 7. Backend Development Rules
* **Runtime & Framework:** Node.js 20 LTS + Express 4
* **Port Rule:** รันบนพอร์ต `5001` ห้ามเปลี่ยนไปใช้พอร์ต `5000` เนื่องจากชนกับ macOS AirPlay
* **Code Structure:**
  - วางโครงสร้างแบบ Layered Architecture (Controllers -> Services -> Repositories/Models)
  - ห้ามเขียน SQL query ฝังไว้ใน controller โดยตรง ให้แยกเป็น Repository หรือ Service Layer
* **Error & Request Handling:**
  - ต้องมี Middleware สำหรับ Error handling ปลายทางของ Express app
  - ตรวจสอบ Request validation (เช่น สิทธิ์การเข้าถึง, ความถูกต้องของ params) เสมอ

## 8. Database Development Rules
* **Engine:** MySQL 8 (ใช้ charset `utf8mb4` และ collation `utf8mb4_unicode_ci` รองรับภาษาไทย)
* **Initialization:** ตารางและข้อมูลตั้งต้นต้องบันทึกไว้ในสคริปต์ `db/init/01-init.sql`
* **Local Port Mapping:** Host Port `3307` mapped to Container port `3306`
* **Schema Integrity:** ห้ามดัดแปลง Column, Data type หรือเพิ่มตารางตามอำเภอใจโดยไม่มีการบันทึกการตัดสินใจในข้อตกลงก่อนหน้า

## 9. API Development Rules
* **Protocol:** RESTful API ในรูปแบบ JSON format
* **Standard Response:** ทุก Response ต้องส่ง HTTP Status code ที่ถูกต้องและมีโครงสร้างสม่ำเสมอ เช่น:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
  หรือกรณี Error:
  ```json
  {
    "success": false,
    "error": {
      "message": "รายละเอียดของข้อผิดพลาด",
      "code": "ERROR_CODE"
    }
  }
  ```
* **Documentation:** API Endpoints ทั้งหมดต้องอัปเดตลงในเอกสาร API Contract ทันทีที่มีการเพิ่มหรือแก้ไข

## 10. Docker Development Rules
* **Compose Standards:**
  - ใช้ `docker-compose.yml` สำหรับรัน Development Environment
  - ห้ามใส่ property `version` ด้านบนของ compose file
* **Networking:** 
  - เชื่อมต่อทุก Services ผ่าน Custom network `booking_network`
  - Backend/phpMyAdmin คุยกับ DB ผ่าน hostname `db` และ internal port `3306` เท่านั้น ห้ามเชื่อมต่อผ่าน `localhost`
* **Volumes & Modules:**
  - โฟลเดอร์ต้นฉบับใช้ Bind Mount เพื่อให้เกิด Hot reload
  - โฟลเดอร์ `node_modules/` ในคอนเทนเนอร์ต้องใช้ Anonymous Volume เสมอ เพื่อลดผลกระทบของการทำงานต่างสถาปัตยกรรม
  - หากมีการติดตั้ง NPM package ใหม่ AI ต้องแจ้งให้ USER ทำการ Rebuild container เท่านั้น

## 11. Testing Rules
* **Run Commands:** ตรวจสอบความถูกต้องของโค้ดด้วยคำสั่งรันระบบและคำสั่งรัน Unit Tests หรือ Integration Tests ที่มี
* **Acceptance Criteria Verification:** ในการตอบกลับ AI ต้องตรวจสอบรายการ (Checklist) ของข้อกำหนดในเกณฑ์ส่งมอบงานและยืนยันสถานะ `[x]` หรือ `[ ]` อย่างชัดเจน

## 12. Debugging Rules
* **No Guesswork:** ใช้การอ่าน Error log หรือ Stack trace เพื่อค้นหาปัญหา ห้ามเปลี่ยนโค้ดไปเรื่อย ๆ โดยไม่มีทฤษฎีมารองรับ
* **Isolate Dependencies:** ทดสอบแยกทีละระดับ เช่น ใช้ phpMyAdmin ตรวจสอบสถานะ DB หรือใช้ REST Client ทดสอบหลังบ้าน แยกออกจากฝั่งหน้าบ้านเพื่อระบุจุดบั๊ก

## 13. Documentation Rules
* **Language:** บันทึกและวิเคราะห์ด้วยภาษาไทยเป็นภาษาหลักสำหรับการวางแผน
* **Clickable Links:** ทุกครั้งที่มีการพูดถึงไฟล์หรือตำแหน่งในโค้ด ต้องระบุเป็น Markdown Links ที่สามารถคลิกได้ทันที (เช่น `[server.js](file:///d:/Table-Booking-System/backend/src/server.js)`)
* **Context Preservation:** หากแก้ไขโครงสร้างโฟลเดอร์ พอร์ต หรือ dependencies ต้องปรับปรุง `README.md` หรือเอกสารโครงสร้างโครงการให้ตรงความจริงเสมอ

## 14. Git Commit Rules
* **Conventional Commits:** ยึดถือข้อกำหนดแบบ Conventional เช่น:
  - `feat(frontend):`
  - `fix(backend):`
  - `docs(planning):`
  - `chore(deps):`
* **Commit Recommendation:** เมื่อ AI ทำงานครบรอบ Phase ต้องเสนอข้อความ Commit Message สำหรับขั้นตอนนั้นเพื่อให้ USER คัดลอกไปทำ Commit ได้ทันที

## 15. Security Rules
* **Secrets Separation:** ห้ามเขียน API Key, Token, Credentials หรือข้อมูลลับใด ๆ ลงในไฟล์โค้ด (เช่น `.js`, `.jsx`, `.yml`) หรือเอกสาร Markdown (เช่น README, plan)
* **Variables Only:** ให้ระบุโครงสร้างตัวแปรใน `.env.example` และรันด้วย `.env` บน local ส่วนบน Production (เช่น Railway) ต้องรันผ่าน Config vars บน UI เท่านั้น
* **No Real PII:** ห้ามบันทึกข้อมูลส่วนบุคคลของจริงของนักเรียนหรือบุคลากรลงในฐานข้อมูลทดสอบเด็ดขาด

## 16. Forbidden Actions
* ❌ ห้ามข้ามสเต็ปหรือแอบพัฒนา Feature ของ Phase อื่นล่วงหน้า
* ❌ ห้ามอัปโหลดหรือ commit ข้อมูลลับ/ไฟล์ `.env` เข้า Git repository
* ❌ ห้ามแก้ API Contract หรือ Database schema โดยไม่มีการระบุการอนุมัติ
* ❌ ห้ามเขียน Placeholder หรือทิ้ง TODO คอมเมนต์เปล่าไว้ในไฟล์โค้ดจริง

## 17. Required Response Format
เมื่อส่งมอบแผนการทำงานหรือข้อมูลตอบกลับ USER ให้ใช้โครงสร้างดังนี้:
1. **งานที่กำลังดำเนินการ (Current Task):** สิ่งที่ AI กำลังทำ
2. **ไฟล์ที่เกี่ยวข้อง (Affected Files):** รายชื่อ Markdown Links ของไฟล์ที่สร้าง/แก้ไข
3. **ผลลัพธ์การทำงาน (Output Detail):** รายละเอียดอธิบายการแก้ไขหรือแผนงานแบบกระชับ
4. **คำสั่งรันระบบและทดสอบ (Commands):** ลิสต์คำสั่งสำหรับรันเช็คผลลัพธ์
5. **ข้อเสนอแนะ Git Commit:** ข้อความ Conventional commit แนะนำ

## 18. Phase Completion Report Format
เมื่อจบ Phase งานหลัก AI ต้องแสดงผลลัพธ์ด้วยหัวข้อดังนี้:
```markdown
# รายงานผลการทำงาน Phase [เลขเฟส]

## 1. ผลสัมฤทธิ์ (Completed Items)
* [x] รายการความต้องการที่ทำเสร็จแล้ว...
* [x] รายการความต้องการที่ทำเสร็จแล้ว...

## 2. ไฟล์ที่มีการเปลี่ยนแปลง (File Changes)
* [NEW/MODIFY/DELETE] [filename](file:///absolute/path/to/file)

## 3. ผลการรันและการทดสอบ (Execution & Test Results)
* รายละเอียดการทดสอบและข้อความยืนยันความพร้อมของระบบ

## 4. ปัญหาที่พบและมาตรการแก้ไข (Issues & Mitigations)
* อุปสรรคและแนวทางแก้ไขที่ผ่านมา

## 5. แผนการรัน Git Commit
* **Commit Message:** `conventional-commit-message`

## 6. คำแนะนำสำหรับสเต็ปถัดไป (Next Steps)
* แนวทางเริ่มต้นทำงานในเฟสถัดไป
```
