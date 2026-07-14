# แผนการพัฒนาและลำดับขั้นตอนการดำเนินงาน (Project Implementation Plan)

เอกสารฉบับนี้จัดทำขึ้นโดย Senior Software Architect, DevOps Engineer และ Project Manager เพื่อนำเสนอแผนการพัฒนาและลำดับขั้นตอนการดำเนินงาน (Implementation Plan) ในการสร้าง **ระบบจองโต๊ะโรงอาหารในสถานศึกษา (Canteen Table Booking System)** 

แผนการพัฒนานี้แบ่งออกเป็น 16 เฟสการทำงานย่อย (Phase 0 ถึง Phase 15) ซึ่งมีเป้าหมาย ตัวชี้วัด และการจัดการความเสี่ยงเพื่อเป็นกรอบการพัฒนาของโครงการ โดยอ้างอิงข้อมูลสถาปัตยกรรมจาก [01-system-overview.md](file:///d:/Table-Booking-System/docs/planning/01-system-overview.md), ข้อกำหนดความต้องการใน [02-requirements.md](file:///d:/Table-Booking-System/docs/planning/02-requirements.md), โครงสร้างสิทธิ์ใน [03-roles-permissions.md](file:///d:/Table-Booking-System/docs/planning/03-roles-permissions.md), ไดอะแกรมขั้นตอนใน [04-complaint-workflow.md](file:///d:/Table-Booking-System/docs/planning/04-complaint-workflow.md), สเปกฐานข้อมูลใน [05-database-design.md](file:///d:/Table-Booking-System/docs/planning/05-database-design.md), สัญญาเชื่อมต่อ API ใน [06-api-contract.md](file:///d:/Table-Booking-System/docs/planning/06-api-contract.md), โครงสร้างหน้าจอใน [07-frontend-pages.md](file:///d:/Table-Booking-System/docs/planning/07-frontend-pages.md), แดชบอร์ดวิเคราะห์ใน [08-dashboard-report-notification.md](file:///d:/Table-Booking-System/docs/planning/08-dashboard-report-notification.md) และสถาปัตยกรรมคอนเทนเนอร์ใน [09-project-docker-architecture.md](file:///d:/Table-Booking-System/docs/planning/09-project-docker-architecture.md)

---

## สรุปรายการแผนงานพัฒนาแบ่งรายเฟส (Implementation Roadmap)

```mermaid
gantt
    title แผนงานพัฒนาระบบจองโต๊ะโรงอาหารแบ่งรายเฟส
    dateFormat  YYYY-MM-DD
    section Phase 0 - 2
    Phase 0: Requirement & Architecture    :active, p0, 2026-07-01, 3d
    Phase 1: Project Workspace Setup       :after p0, p1, 1d
    Phase 2: Database Schema & Seeds       :after p1, p2, 2d
    section Backend
    Phase 3: Backend Core Server           :after p2, p3, 2d
    Phase 4: Auth & Guards API             :after p3, p4, 2d
    Phase 5: Booking & Complaint API       :after p4, p5, 3d
    Phase 6: Status Workflow & Cron        :after p5, p6, 3d
    Phase 7: Dashboard & Report API        :after p6, p7, 2d
    section Frontend
    Phase 8: Frontend Shell & Router       :after p4, f1, 2d
    Phase 9: Frontend Login & Auth Context :after f1, f2, 2d
    Phase 10: Complaint UI Console         :after f2, f3, 3d
    Phase 11: Seat Map & Cleaner UI        :after f3, f4, 3d
    section Integration
    Phase 12: Real-time SSE & SLA Alert    :after f4, p7, int1, 3d
    Phase 13: Docker Local Integration     :after int1, int2, 2d
    Phase 14: Testing & Bug Fix (QA)       :after int2, qa, 3d
    Phase 15: Production Release Guide     :after qa, deploy, 2d
```

---

## รายละเอียดข้อกำหนดแต่ละเฟสการพัฒนา (Phase Specifications)

### Phase 0: Requirement and Architecture
* **เป้าหมาย:** สรุปและอนุมัติความต้องการเชิงระบบ บทบาทสิทธิ์การใช้งาน และกรอบสถาปัตยกรรมทั้งหมด
* **งานที่ต้องทำ:** ศึกษาความเป็นไปได้ จัดทำเอกสารข้อกำหนดความต้องการ สถาปัตยกรรม และวิเคราะห์กระบวนการทำงานข้อร้องเรียน
* **ไฟล์ที่เกี่ยวข้อง:** เอกสารใน [docs/planning/](file:///d:/Table-Booking-System/docs/planning/) ทั้งหมด (ไฟล์ 00 ถึง 09)
* **ผลลัพธ์ที่ส่งมอบ:** เอกสารวางแผน Markdown จำนวน 9 ฉบับที่ได้รับการเซ็นอนุมัติผ่าน Git
* **วิธีทดสอบ:** ทำการตรวจสอบเอกสาร (Document Peer Review) กับผู้มีส่วนได้ส่วนเสีย
* **Acceptance Criteria:**
  * [x] ขอบเขต Tech Stack และพอร์ตได้รับการยืนยัน
  * [x] โครงสร้างฐานข้อมูลเชิงสัมพันธ์และโมเดล API ได้รับการยอมรับ
* **Dependency:** ไม่มี (เป็นเฟสเริ่มต้น)
* **Git Commit Message แนะนำ:** `docs(planning): complete initial requirements and architecture design`
* **ความเสี่ยงและการรับมือ:** การปรับเปลี่ยนความต้องการในภายหลัง (Scope Creep) อาจกระทบต่อฐานข้อมูล แก้ไขโดยการล็อกสเปกข้อตกลงก่อนเริ่มเฟสถัดไป

---

### Phase 1: Project Setup
* **เป้าหมาย:** เตรียมโครงสร้างโปรเจกต์ Monorepo, การติดตั้งเครื่องมือทดสอบ และการล้างสิทธิ์ Gitignore
* **งานที่ต้องทำ:** สร้างโฟลเดอร์สำหรับหน้าบ้าน หลังบ้าน และฐานข้อมูล, ตั้งค่าไฟล์ `package.json` ของแต่ละส่วน, สร้างไฟล์ `.env.example` และ `.gitignore`
* **ไฟล์ที่เกี่ยวข้อง:** 
  * [package.json](file:///d:/Table-Booking-System/backend/package.json) (หลังบ้าน)
  * [package.json](file:///d:/Table-Booking-System/frontend/package.json) (หน้าบ้าน)
  * [.gitignore](file:///d:/Table-Booking-System/.gitignore) / [.env.example](file:///d:/Table-Booking-System/.env.example)
* **ผลลัพธ์ที่ส่งมอบ:** โครงสร้าง Monorepo พร้อมทำงาน สามารถรัน `npm install` ผ่านโดยไม่มีข้อผิดพลาด
* **วิธีทดสอบ:** รันคำสั่ง `npm install` ทั้งในฝั่ง `frontend/` และ `backend/` และตรวจสอบว่าไม่มีไฟล์ `.env` หลุดเข้าใน Staging Area ของ Git
* **Acceptance Criteria:**
  * [x] โฟลเดอร์ `backend/`, `frontend/`, และ `db/init/` ถูกสร้างถูกต้อง
  * [x] Dependencies พื้นฐาน เช่น Express, React, MUI ถูกประกาศครบถ้วน
* **Dependency:** Phase 0
* **Git Commit Message แนะนำ:** `chore(setup): initialize monorepo workspace directories and package configurations`
* **ความเสี่ยงและการรับมือ:** เวอร์ชันของ Node.js ในเครื่องนักพัฒนาต่างกัน แก้ไขโดยระบุเครื่องยนต์ที่รองรับ `"engines": { "node": ">=20.0.0" }` ใน `package.json`

---

### Phase 2: Database Schema and Seed Data
* **เป้าหมาย:** สร้างไฟล์ตั้งค่า Schema ฐานข้อมูลและข้อมูล Master Seed เริ่มต้นสำหรับรันระบบจำลอง
* **งานที่ต้องทำ:** เขียนคำสั่ง DDL สร้างเทเบิล คีย์หลัก คีย์นอก ดัชนีช่วยเร่งความเร็ว และ DML เพิ่มบทบาทเริ่มต้น รายชื่อโต๊ะ และผู้ใช้ทดสอบ
* **ไฟล์ที่เกี่ยวข้อง:** 
  * [01-init.sql](file:///d:/Table-Booking-System/db/init/01-init.sql)
* **ผลลัพธ์ที่ส่งมอบ:** สคริปต์ SQL ที่พร้อมนำไปดึงโครงสร้างตารางเข้าสู่ฐานข้อมูล MySQL 8
* **วิธีทดสอบ:** รันรหัส SQL บนฐานข้อมูล MySQL 8 เปล่า ตรวจดูใน phpMyAdmin ว่าตาราง ความสัมพันธ์ และข้อมูลเบื้องต้นแสดงผลครบถ้วนและไม่พบ Syntax error
* **Acceptance Criteria:**
  * [x] ตารางที่ออกแบบไว้ทั้ง 13 ตารางถูกสร้างเสร็จสิ้น
  * [x] โครงสร้างรองรับภาษาไทยผ่านการตั้งค่า `utf8mb4_unicode_ci`
* **Dependency:** Phase 1
* **Git Commit Message แนะนำ:** `feat(db): add initial database schema and master seed data script`
* **ความเสี่ยงและการรับมือ:** คำสั่งสร้าง Foreign Key ล้มเหลวเนื่องจากลำดับการสร้างตารางไม่สอดคล้อง แก้ไขโดยจัดเรียงลำดับคำสั่งสร้างเทเบิลโดยเริ่มจาก Master Data ก่อนธุรกรรม

---

### Phase 3: Backend Core and MySQL Connection
* **เป้าหมาย:** จัดตั้งเซิร์ฟเวอร์ Express พื้นฐาน ระบบเชื่อมโยงฐานข้อมูล MySQL และ Middleware จัดการความผิดพลาด
* **งานที่ต้องทำ:** เขียนโค้ดเชื่อมฐานข้อมูลผ่าน Connection Pool, เขียน Logic ตรวจสอบและวนซ้ำเชื่อมต่อ (Retry Connection Logic) เมื่อเริ่มระบบ และสร้าง Middleware จัดการพฤติกรรม Error ปลายทาง
* **ไฟล์ที่เกี่ยวข้อง:**
  * [server.js](file:///d:/Table-Booking-System/backend/src/server.js)
  * `backend/src/config/database.js`
  * `backend/src/middlewares/errorHandler.js`
* **ผลลัพธ์ที่ส่งมอบ:** แอปพลิเคชันหลังบ้านสตาร์ทพอร์ต 5001 และเชื่อมโยง MySQL สำเร็จ
* **วิธีทดสอบ:** ทดสอบรันและสั่งหยุดการทำงานของฐานข้อมูล จำลองการรอเชื่อมโยงของหลังบ้าน (ต้องรันคำเตือน retry ทุก 5 วินาทีแทนการปิดแครชกะทันหัน)
* **Acceptance Criteria:**
  * [x] หลังบ้านรันที่พอร์ต 5001 
  * [x] กลไก Retry Connection ทำงานสำเร็จและกู้คืนการทำงานได้เมื่อฐานข้อมูลกลับมาออนไลน์
* **Dependency:** Phase 2
* **Git Commit Message แนะนำ:** `feat(backend): set up express server structure and database connection pool`
* **ความเสี่ยงและการรับมือ:** การชนกันของพอร์ตในระบบปฏิบัติการ macOS (พอร์ต 5000 Airplay) แก้ไขโดยระบุพอร์ตหลังบ้านเป็น `5001` อย่างเข้มงวด

---

### Phase 4: Authentication and Authorization
* **เป้าหมาย:** ระบบลงทะเบียนผู้ใช้ ลงชื่อเข้าใช้ (Login) การออกและต่ออายุ JWT Token และ Middleware ตรวจเช็คสิทธิ์ (Role-based Authorization)
* **งานที่ต้องทำ:** สร้างฟังก์ชันเข้ารหัสลับรหัสผ่านด้วย bcrypt, ออก Token JWT, ตรวจสอบความถูกต้องของ Token ก่อนอนุญาตให้ดึง API และเปรียบเทียบสิทธิ
* **ไฟล์ที่เกี่ยวข้อง:**
  * `backend/src/controllers/authController.js`
  * `backend/src/middlewares/authMiddleware.js`
  * `backend/src/routes/authRoutes.js`
* **ผลลัพธ์ที่ส่งมอบ:** Endpoints การล็อกอิน, ดึงโปรไฟล์ส่วนตัว และการสกัดสิทธิ์ตามบทบาทผู้ใช้
* **วิธีทดสอบ:** ใช้ Rest Client ยิงคำขอ `/login` เพื่อตรวจความถูกต้องของ JWT Token และยิงดึงหน้าประวัติโดยไม่แนบ header Bearer (ต้องถูกดีดกลับด้วย `401 Unauthorized`)
* **Acceptance Criteria:**
  * [x] ข้อมูลรหัสผ่านถูกแฮชลงฐานข้อมูล
  * [x] นักเรียนไม่สามารถเข้าถึง API ของแอดมินระบบได้ (คืนค่า `403 Forbidden`)
* **Dependency:** Phase 3
* **Git Commit Message แนะนำ:** `feat(auth): implement jwt authentication and role-based authorization middlewares`
* **ความเสี่ยงและการรับมือ:** การดึง JWT Key ล้มเหลว แก้ไขโดยกำหนดให้ระบบตรวจสอบและแจ้งเตือนทันทีตั้งแต่ตัวบูทเซิร์ฟเวอร์หากไม่มีค่า `JWT_SECRET` ใน `.env`

---

### Phase 5: Complaint CRUD API
* **เป้าหมาย:** พัฒนาระบบ API รองรับการส่งเรื่องร้องเรียน (แนบภาพ) ของผู้ใช้ และระบบจองโต๊ะเบื้องต้น
* **งานที่ต้องทำ:** สร้าง Endpoint ยื่นคำขอจองโต๊ะ, เช็คอิน (ตรวจพิกัด GPS รัศมีโรงอาหาร), เช็คเอาต์ และฟอร์มยื่นเรื่องร้องเรียนปัญหาโต๊ะ
* **ไฟล์ที่เกี่ยวข้อง:**
  * `backend/src/controllers/bookingController.js`
  * `backend/src/controllers/complaintController.js`
  * `backend/src/routes/bookingRoutes.js`
  * `backend/src/routes/complaintRoutes.js`
* **ผลลัพธ์ที่ส่งมอบ:** API ธุรกรรมการจองที่ปลอดภัย และ API การลงบันทึกรับเรื่องร้องเรียนพร้อมรูปภาพหลักฐาน
* **วิธีทดสอบ:** จำลองการยิง Request เช็คอินด้วยตำแหน่ง GPS ห่าง 100 เมตร (ต้องล้มเหลว) และเช็คอินด้วยพิกัด GPS ห่าง 20 เมตร (ต้องผ่าน)
* **Acceptance Criteria:**
  * [x] ระบบคำนวณระยะพิกัดละติจูดลองจิจูดด้วยสูตร Haversine สำเร็จและแม่นยำ
  * [x] การจองโต๊ะเดียวกันถูกจำกัดและทำ **Pessimistic Row Lock (`SELECT FOR UPDATE`)** เพื่อสกัดกั้นการจองซ้อน
* **Dependency:** Phase 4
* **Git Commit Message แนะนำ:** `feat(api): implement booking and complaint crud api endpoints`
* **ความเสี่ยงและการรับมือ:** คำนวณคณิตศาสตร์ GPS ผิดพลาดบนหลังบ้าน แก้ไขโดยดึงชุดคำสั่งสูตร Haversine ที่ผ่านการทำ Unit Test และมี mock ข้อมูลพิกัดตรวจสอบ

---

### Phase 6: Assignment and Status Workflow API
* **เป้าหมาย:** ระบบเวิร์กโฟลว์ความคืบหน้าร้องเรียน ระบบมอบหมายงาน และ Cron Service ล้างสิทธิ์จองที่หมดอายุเช็คอินอัตโนมัติ
* **งานที่ต้องทำ:** พัฒนาฟังก์ชันการส่งต่อและอัปเดตสถานะคำร้องร้องเรียน (`Pending_Review` -> `Investigating` -> `Resolved`), อัปเดตคะแนนลงโทษ และทำ Node-cron กวาดล้าง Pending booking ที่เลยเวลา 10 นาที
* **ไฟล์ที่เกี่ยวข้อง:**
  * `backend/src/controllers/inspectorController.js`
  * `backend/src/services/cronService.js`
  * `backend/src/routes/inspectorRoutes.js`
* **ผลลัพธ์ที่ส่งมอบ:** API การจัดการสถานะร้องเรียน และระบบกวาดล้างข้อมูลจองหมดอายุที่รันอัตโนมัติในเบื้องหลังทุกนาที
* **วิธีทดสอบ:** กดจองโต๊ะทดสอบแต่ไม่ต้องเช็คอิน ปรับแต่งจำลองเวลาหลังบ้านให้เลย 10 นาที หรือทดสอบด้วยความถี่ระบบ รอดูว่าโต๊ะเปลี่ยนกลับมาเป็นว่างและประวัติผู้ใช้นั้นโดนหัก 5 คะแนนจริงหรือไม่
* **Acceptance Criteria:**
  * [x] สารวัตรโรงอาหารเปลี่ยนสถานะเพื่อตัดแต้มความประพฤติเข้าตาราง log ได้สมบูรณ์
  * [x] Cron Job ตื่นขึ้นมาประมวลผลล้างสิทธิ์และเปลี่ยนสีสถานะโต๊ะคืนสำเร็จทุก 1 นาที
* **Dependency:** Phase 5
* **Git Commit Message แนะนำ:** `feat(api): add assignment status workflow endpoints and auto-release cron service`
* **ความเสี่ยงและการรับมือ:** การรัน Cron คลาดเคลื่อนเนื่องจากความแตกต่างของโซนเวลาเซิร์ฟเวอร์ แก้ไขโดยบังคับล็อก UTC/Bangkok Timezone ใน config การเขียนฐานข้อมูลและระบบรัน Node

---

### Phase 7: Dashboard and Report API
* **เป้าหมาย:** สร้าง APIs สรุปผลความหนาแน่นเรียลไทม์ และสถิติสำหรับผู้บริหารเชิงลึก
* **งานที่ต้องทำ:** พัฒนาตัวคัดกรองจัดกลุ่ม SQL (Group By, Count, Average) ดึงอัตราเฉลี่ยความแออัดโรงอาหาร สถิติจำนวนคนเบี้ยวเช็คอินแยกรายสัปดาห์ และความเร็วการแก้ปัญหาของฝ่ายสนับสนุน (แม่บ้านเช็ดโต๊ะ/สารวัตรปิดเรื่อง)
* **ไฟล์ที่เกี่ยวข้อง:**
  * `backend/src/controllers/reportController.js`
  * `backend/src/routes/reportRoutes.js`
* **ผลลัพธ์ที่ส่งมอบ:** APIs สำหรับป้อนข้อมูลลงแดชบอร์ดหน้าร้านและสถิติพิมพ์รายงานผู้บริหาร
* **วิธีทดสอบ:** สอบถาม APIs สรุปผลความหนาแน่นและทดสอบส่งประเด็นร้องเรียนเพิ่มขึ้น รอดูว่ากราฟสรุปจำนวนและเปอร์เซ็นต์เปลี่ยนแปลงถูกต้อง
* **Acceptance Criteria:**
  * [x] APIs แสดงสถิติ Zone Popularity และ SLA Health สำเร็จ
  * [x] การเข้าถึง API รายงานของผู้บริหารต้องติดการเช็คการอนุญาตบทบาทสิทธิ์ (Executive/Admin Only)
* **Dependency:** Phase 6
* **Git Commit Message แนะนำ:** `feat(api): implement dashboard analytics and executive reporting endpoints`
* **ความเสี่ยงและการรับมือ:** Query ขนาดใหญ่อาจโหลดช้าเมื่อทราฟฟิกโต แก้ไขโดยวาง Index บนคอลัมน์ที่ถูกจัดกลุ่ม (เช่น `status`, `zone_id`, `created_at`)

---

### Phase 8: Frontend Layout and Routing
* **เป้าหมาย:** จัดตั้งเค้าโครงหน้าหลัก (App Layouts) และการนำทางระบบด้วย React Router
* **งานที่ต้องทำ:** พัฒนาโครงสร้างการเข้าถึงหน้าเว็บ แยกแถบนำทางส่วนล่าง (Bottom Nav) สำหรับผู้ใช้มือถือ และ Sidebar เมนูด้านข้างสำหรับแอดมิน
* **ไฟล์ที่เกี่ยวข้อง:**
  * [main.jsx](file:///d:/Table-Booking-System/frontend/src/main.jsx)
  * `frontend/src/routes/AppRoutes.jsx`
  * `frontend/src/components/Layout/` (Topbar, BottomNav, Sidebar)
* **ผลลัพธ์ที่ส่งมอบ:** โครงร่าง UI หน้าบ้านที่รองรับขนาดหน้าจอแบบ Responsive และสลับ Layout ต่าง ๆ ได้ถูกต้องตาม URL Path
* **วิธีทดสอบ:** รันเปิดแอปพลิเคชันหน้าบ้าน ขยายและหดหน้าจอขนาดแท็บเล็ต/มือถือ ตรวจสอบว่าปุ่มเมนูสเกลตัวสอดคล้องกับขนาดจอ
* **Acceptance Criteria:**
  * [x] แถบนำทางด้านล่างแสดงผลสวยงามบนขนาดหน้าจอพกพา (Mobile Viewports)
  * [x] การคลิก URL เปลี่ยนเส้นทาง (Routing) โหลด component ตรงจุดโดยไม่มีการรีเฟรชหน้าจอเต็มเว็บ
* **Dependency:** Phase 4
* **Git Commit Message แนะนำ:** `feat(frontend): set up routing structure app layouts and responsive navigation shell`
* **ความเสี่ยงและการรับมือ:** หน้าจอแสดงผลเบี้ยวบนบางเว็บบราวเซอร์ แก้ไขโดยนำระบบ CSS Reset (CssBaseline จาก MUI) มาใช้งาน

---

### 9. Phase 9: Frontend Authentication
* **เป้าหมาย:** เชื่อมโยงหน้าจอล็อกอิน จัดเก็บ JWT Token และทำ Guard ปกป้องเส้นทางการเข้าถึง (Route Guards)
* **งานที่ต้องทำ:** พัฒนาหน้าจอ Login, สร้าง Context คอยดึงเก็บและลบ Token ใน LocalStorage/Cookies, และสร้าง Protected Routes สกัดผู้ใช้ที่ไม่มีสิทธิ์ไม่ให้เข้าหน้างาน
* **ไฟล์ที่เกี่ยวข้อง:**
  * `frontend/src/pages/Login.jsx`
  * `frontend/src/hooks/useAuth.js`
  * `frontend/src/routes/PrivateRoute.jsx`
* **ผลลัพธ์ที่ส่งมอบ:** หน้าจอล็อกอินอินเตอร์เฟสและระบบรักษาความปลอดภัยความลับการนำทางหน้าบ้าน
* **วิธีทดสอบ:** ทดสอบพิมพ์ URL `/admin/dashboard` ตรง ๆ โดยไม่ผ่านการล็อกอิน (ต้องถูก Redirect กลับไปหน้า `/login` ทันที)
* **Acceptance Criteria:**
  * [x] Token ถูกล้างจากพื้นที่หน่วยความจำเมื่อกดปุ่ม Logout
  * [x] สิทธิ์ผู้ใช้ทั่วไปกดปุ่มเข้าหน้าตั้งค่าของแอดมินไม่ได้
* **Dependency:** Phase 8
* **Git Commit Message แนะนำ:** `feat(frontend): build login view and integrate authentication route guards`
* **ความเสี่ยงและการรับมือ:** ข้อมูลเซสชันการล็อกอินหลุดหายเมื่อผู้ใช้กด Refresh หน้าเบราว์เซอร์ แก้ไขโดยให้มีกระบวนการดึงตรวจสอบสิทธิ์ Profile ทุกรอบการ Mount ในขั้นแรกสุด

---

### Phase 10: Complaint Management UI
* **เป้าหมาย:** สร้างอินเตอร์เฟสฟอร์มส่งข้อร้องเรียน และหน้าจอตรวจสอบของสารวัตรโรงอาหาร
* **งานที่ต้องทำ:** พัฒนาระบบอัปโหลดภาพหลักฐานการกั๊กโต๊ะ, หน้าฟอร์มป้อนข้อมูลร้องเรียน และหน้ากระดานสำหรับสารวัตรกดมอนิเตอร์และสั่งการหักคะแนนประพฤติ
* **ไฟล์ที่เกี่ยวข้อง:**
  * `frontend/src/pages/NewComplaint.jsx`
  * `frontend/src/pages/InspectorDashboard.jsx`
* **ผลลัพธ์ที่ส่งมอบ:** หน้าจอยื่นเรื่องร้องเรียนและหน้าจอปฏิบัติหน้าที่ตรวจสอบของสารวัตร/แอดมิน
* **วิธีทดสอบ:** ทดลองยื่นเรื่องร้องเรียนแนบภาพจำลอง ตรวจสอบประวัติตาราง Inspector Dashboard ว่ารายการร้องเรียนใหม่ปรากฏและแสดงปุ่มกดตอบสนองครบ
* **Acceptance Criteria:**
  * [x] การอัปโหลดรูปภาพผ่านเว็บแอปพลิเคชันมือถือเสร็จสิ้นโดยภาพไม่เบี้ยว
  * [x] สารวัตรโรงอาหารสามารถกดยืนยันการลงโทษ/ยกเลิกคำร้องเรียน และอัปเดตสถานะสำเร็จ
* **Dependency:** Phase 9 และ Phase 5
* **Git Commit Message แนะนำ:** `feat(frontend): build complaint filing and inspector tracking interfaces`
* **ความเสี่ยงและการรับมือ:** ขนาดไฟล์ภาพถ่ายนักเรียนใหญ่มหึมาทำให้การอัปโหลดช้าและล้มเหลว แก้ไขโดยทำระบบย่อขนาดไฟล์รูปภาพ (Image Compression) ฝั่งหน้าบ้านก่อนส่งยิงอัปโหลดหลังบ้าน

---

### Phase 11: Seat Map and Cleaner UI
* **เป้าหมาย:** สร้างแผนผังโต๊ะอาหารจำลองกราฟิกเรียลไทม์ และหน้าจอควบคุมงานเช็ดถูของแม่บ้านประจำจุด
* **งานที่ต้องทำ:** ออกแบบผังจำลองโรงอาหารด้วยกราฟิก SVG/Grid ตรวจสอบสีสถานะการใช้งานจริง และสร้างหน้า UI การ์ดงานเช็คสถานะเช็ดโต๊ะสำหรับแม่บ้าน
* **ไฟล์ที่เกี่ยวข้อง:**
  * `frontend/src/pages/CanteenMap.jsx`
  * `frontend/src/pages/CleanerDashboard.jsx`
* **ผลลัพธ์ที่ส่งมอบ:** แผนที่โรงอาหารจำลองแบบคลิกโต้ตอบได้ และแผงควบคุมงานของแม่บ้าน
* **วิธีทดสอบ:** คลิกโต๊ะสีเขียวในหน้าผังที่นั่งโรงอาหารเพื่อจำลองจอง, สังเกตการเปลี่ยนสีโต๊ะเป็นเหลืองและแดง และตรวจในหน้าแม่บ้านว่าโต๊ะที่เช็คเอาต์แสดงสัญลักษณ์สีส้ม "ต้องการทำความสะอาด" ทันที
* **Acceptance Criteria:**
  * [x] ผังโรงอาหารจำลองแสดงแถบสีสถานะตรงกับฐานข้อมูล และแสดงเวลานับถอยหลังการครองสิทธิ์
  * [x] หน้าจอของแม่บ้านรองรับการสัมผัสปุ่มด้วยขนาดใหญ่เพื่อสะดวกต่อการใช้งาน
* **Dependency:** Phase 10
* **Git Commit Message แนะนำ:** `feat(frontend): implement interactive seat map cleaner console and analytical charts`
* **ความเสี่ยงและการรับมือ:** ผังโต๊ะแสดงผลทับซ้อนบิดเบี้ยวบนหน้าจอขนาดเล็กพิเศษ แก้ไขโดยใช้ระบบ Layout Scrollable หรือจัดกลุ่มความกว้างให้ยืดหยุ่นด้วย Flexbox ของ MUI

---

### Phase 12: Notification and SLA Alert
* **เป้าหมาย:** เชื่อมโยงระบบส่งข้อมูลเรียลไทม์ผ่าน Server-Sent Events (SSE) และการสลับสีเตือนภัย SLA
* **งานที่ต้องทำ:** พัฒนาตัวดักฟีดเหตุการณ์ SSE บนหน้าบ้าน, ฟังก์ชันส่งข้อความพุชสั่นเตือนในแอป และตั้งค่า UI แดชบอร์ดให้กระพริบไอคอนโต๊ะที่ละเมิดเวลา SLA ของแม่บ้าน/สารวัตร
* **ไฟล์ที่เกี่ยวข้อง:**
  * `frontend/src/hooks/useSSE.js`
  * `frontend/src/components/NotificationBell.jsx`
  * `backend/src/services/sseService.js`
* **ผลลัพธ์ที่ส่งมอบ:** แผนที่โรงอาหารและระบบกระดิ่งที่เปลี่ยนข้อมูลสดวินาทีต่อวินาทีโดยไม่ต้องทำระบบ Polling
* **วิธีทดสอบ:** เปิดบราวเซอร์ 2 หน้าจอ จอหนึ่งเป็นแอดมิน จอหนึ่งเป็นนักเรียน กดเช็คอินโต๊ะในฝั่งนักเรียนและสังเกตว่าไอคอนโต๊ะในหน้าจอแอดมินเปลี่ยนเป็นสีแดงทันทีในเวลาไม่เกิน 2 วินาที
* **Acceptance Criteria:**
  * [x] ข้อมูลอัปเดตผ่านสัญญาณ SSE ไหลผ่านโดยการเชื่อมต่อไม่สะดุด
  * [x] สัญญาณกระพริบไอคอนและ SLA High Status ทำงานถูกต้องเมื่อเวลาค้างส่งร้องเรียนนานเกิน 5 นาที
* **Dependency:** Phase 11 และ Phase 7
* **Git Commit Message แนะนำ:** `feat(integration): integrate real-time map updates via sse and sla alerts`
* **ความเสี่ยงและการรับมือ:** การเชื่อมต่อ SSE ขาดเมื่อเน็ตเวิร์กช้า แก้ไขโดยเขียน Logic ใน React Hook ให้ทำ Auto-reconnect เชื่อมต่อใหม่ทันทีเมื่อสัญญาณขาดหาย

---

### Phase 13: Docker Integration
* **เป้าหมาย:** พัฒนาโครงสร้างการรันด้วย Docker Compose ปิดระบบ Dev Environment พร้อมชุดตัวแปรครบถ้วน
* **งานที่ต้องทำ:** พัฒนา Dockerfile สำหรับเฟสพัฒนา จัดเก็บ volumes ซิงก์โค้ดสำหรับ hot-reload และเชื่อมโยง network ภายในคอมโพส
* **ไฟล์ที่เกี่ยวข้อง:**
  * [docker-compose.yml](file:///d:/Table-Booking-System/docker-compose.yml)
  * `backend/Dockerfile.dev`
  * `frontend/Dockerfile.dev`
* **ผลลัพธ์ที่ส่งมอบ:** บริการ DB, phpMyAdmin, backend, frontend รันคู่ขนานกันผ่านการยิงคอมมานด์เดียว
* **วิธีทดสอบ:** รันคำสั่ง `docker-compose up --build` ตรวจสอบว่าทั้ง 4 คอนเทนเนอร์อยู่ในสถานะ Healthy และเข้าใช้งานได้ทุกพอร์ต (5173 / 5001 / 8081)
* **Acceptance Criteria:**
  * [x] คอนเทนเนอร์หลังบ้านทำงานสำเร็จโดยรอก่อนจน db อยู่ในสภาพ healthy
  * [x] การแก้ไขโค้ด React/Node ฝั่งเครื่อง Host สะท้อนเข้าทำงานภายใน Container ทันที
* **Dependency:** Phase 12
* **Git Commit Message แนะนำ:** `chore(docker): configure docker-compose for local development environment`
* **ความเสี่ยงและการรับมือ:** ปัญหาความแตกต่างของระบบปฏิบัติการ (Windows WSL2 vs Mac Apple Silicon) แก้ไขโดยระบุ platform และ anonymous volumes ในคอมโพสเพื่อไม่ให้ node_modules ทับซ้อน

---

### Phase 14: Testing and Bug Fix
* **เป้าหมาย:** ทดสอบความเสถียรรอบด้าน (Integration & System Regression QA) และคลี่คลายบั๊กที่หลงเหลือ
* **งานที่ต้องทำ:** รันการจำลองกรณีใช้พร้อมกันหนาแน่น (Peak load test), ตรวจสอบรอยแตกรอยต่อ และตรวจสอบความปลอดภัยด้าน Secrets
* **ไฟล์ที่เกี่ยวข้อง:** ทุกไฟล์ระบบ
* **ผลลัพธ์ที่ส่งมอบ:** รายงานผลลัพธ์ทดสอบความมั่นคงของเว็บแอปพลิเคชัน (QA Report Template) และรหัสโปรแกรมที่พร้อมขึ้นระบบจริง
* **วิธีทดสอบ:** ประเมินความมั่นคงผ่านการยิง Request จองโต๊ะซ้ำ ๆ ถี่ ๆ, สแกน QR และทดสอบกลไกล้างสิทธิ์
* **Acceptance Criteria:**
  * [x] บั๊กความรุนแรงระดับ High/Blocker ทั้งหมดได้รับการแก้ไข
  * [x] ทุก Endpoint API สามารถรันสำเร็จและคืนสถานะตาม API Contract
* **Dependency:** Phase 13
* **Git Commit Message แนะนำ:** `fix(qa): resolve integration bugs and update testing reports`
* **ความเสี่ยงและการรับมือ:** พบบั๊กจำนวนมากส่งผลให้ล้าช้ากว่าแผนงาน แก้ไขโดยการจำกัดขอบเขตงานให้โฟกัสเฉพาะความต้องการเชิงธุรกิจหลักก่อน

---

### Phase 15: Production Deployment Guide
* **เป้าหมาย:** สร้างสคริปต์ Release คอนเทนเนอร์เดี่ยวสำหรับ Railway และคู่มือ On-Premise
* **งานที่ต้องทำ:** เขียน Multi-stage Dockerfile สำหรับขึ้นระบบจริง, ตั้งค่าไฟล์ `railway.toml` และจัดทำคู่มือนำขึ้นระบบ
* **ไฟล์ที่เกี่ยวข้อง:**
  * [Dockerfile](file:///d:/Table-Booking-System/backend/Dockerfile) (Multi-stage ใน Root)
  * [railway.toml](file:///d:/Table-Booking-System/railway.toml)
  * [01-railway-deployment-guide.md](file:///d:/Table-Booking-System/docs/deployment/01-railway-deployment-guide.md)
* **ผลลัพธ์ที่ส่งมอบ:** สคริปต์สเปกสำหรับประกอบร่างนำขึ้นระบบจริงและไฟล์คู่มือช่วยเหลือทีมไอทีของสถานศึกษา
* **วิธีทดสอบ:** ทดสอบรันการ Build Docker image ในเครื่องแบบ Multi-stage และทดสอบเปิดบราวเซอร์พอร์ตเดียวเพื่อดึงดูดทั้งหน้าบ้านและหลังบ้าน
* **Acceptance Criteria:**
  * [x] Dockerfile Build ผ่านโดยส่งออก Static front-end assets ฝั่ง public folder Express ได้เรียบร้อย
  * [x] คู่มืออธิบายวิธีการระบุ Config variables ปลายทางครบถ้วนชัดเจน
* **Dependency:** Phase 14
* **Git Commit Message แนะนำ:** `docs(deploy): add production multi-stage dockerfile and deployment guide`
* **ความเสี่ยงและการรับมือ:** Railway ปิดปรับบริการหรือเกิดปัญหาพอร์ตผูกขาดกะทันหัน แก้ไขโดยจัดเก็บ config และ Docker setup ให้เป็นสากลเพื่อย้ายไปรันบน Ubuntu / Linux ด้วย Nginx ได้ทันที

---
*เอกสารฉบับนี้กำหนดลำดับการสร้างและประเมินผลโครงการอย่างสมบูรณ์โดยทีมสถาปัตยกรรมระบบ*
