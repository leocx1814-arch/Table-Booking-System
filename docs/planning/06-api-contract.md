# สัญญาเชื่อมต่อ REST API เบื้องต้น (REST API Contract Specifications)

เอกสารฉบับนี้จัดทำขึ้นโดย Senior Software Architect และ Backend Architect เพื่อกำหนดสัญญาข้อตกลงการเชื่อมโยงระบบ (REST API Contract) ระหว่างส่วนควบคุมหน้าบ้าน (React 18 Frontend) และหลังบ้าน (Node.js 20 + Express 4 Backend) สำหรับ **ระบบจองโต๊ะโรงอาหารในสถานศึกษา (Canteen Table Booking System)**

ข้อมูลในสัญญานี้สอดคล้องตามโครงสร้างสถาปัตยกรรมใน [01-system-overview.md](file:///d:/Table-Booking-System/docs/planning/01-system-overview.md), ข้อกำหนดใน [02-requirements.md](file:///d:/Table-Booking-System/docs/planning/02-requirements.md), โครงสร้างบทบาทสิทธิ์ใน [03-roles-permissions.md](file:///d:/Table-Booking-System/docs/planning/03-roles-permissions.md), กระบวนการเวิร์กโฟลว์ใน [04-complaint-workflow.md](file:///d:/Table-Booking-System/docs/planning/04-complaint-workflow.md) และโครงสร้างการจัดเก็บข้อมูลใน [05-database-design.md](file:///d:/Table-Booking-System/docs/planning/05-database-design.md)

---

## 1. รูปแบบข้อมูลมาตรฐานการส่งกลับ (Standard API Response Formats)

เพื่อความเป็นระบบและมาตรฐานในการส่งกลับข้อมูลของ Express API ทุกช่องทางเชื่อมต่อจะใช้โครงสร้าง JSON ร่วมกับ HTTP Status Codes ดังนี้:

### 1.1 กรณีดำเนินงานสำเร็จ (Success Response - 200 OK / 201 Created)
```json
{
  "success": true,
  "data": { ... }
}
```

### 1.2 กรณีทำงานผิดพลาด (Error Response - 400, 401, 403, 404, 409, 500)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "รายละเอียดของข้อผิดพลาดเพื่อนำไปแสดงผลหน้าบ้าน"
  }
}
```

---

## 2. ตารางสัญญาการเชื่อมต่อ REST API (API Contract Table)

| Module | Method | Endpoint | Description | Request Body สรุป | Response สรุป | Auth Required | Role ที่ใช้งานได้ | หมายเหตุ / ข้อควรระวัง |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **1. Auth** | `POST` | `/api/v1/auth/login` | ลงชื่อเข้าใช้ระบบเพื่อแลก JWT Token | `{ "username": "...", "password": "..." }` | `{ "token": "JWT_TOKEN", "user": { "id": 1, "username": "...", "role": "student" } }` | No | All (ผู้ใช้ทุกคน) | คืนเวลาวันหมดอายุ Token ภายใน Payload |
| | `POST` | `/api/v1/auth/logout` | ออกจากระบบและยกเลิกความถูกต้อง Token | `None` | `{ "message": "Logout successful" }` | Yes | All | ล้างค่า Cookie หรือ Token ฝั่ง Client |
| | `POST` | `/api/v1/auth/refresh` | ขอต่ออายุอายุ JWT Token | `{ "refresh_token": "..." }` | `{ "token": "NEW_JWT_TOKEN" }` | Yes | All | ป้องกัน Token หมดอายุระหว่างกำลังใช้งาน |
| **2. Users** | `GET` | `/api/v1/users/profile` | ดูโปรไฟล์ คะแนนประพฤติ และสถิติส่วนบุคคล | `None` | `{ "id": 1, "first_name": "...", "penalty_points": 100, "is_blacklisted": false }` | Yes | All | ปิดบังรหัสผ่านใน Logic การดึงข้อมูล |
| | `GET` | `/api/v1/users/bookings/active` | ตรวจสอบข้อมูลการจองที่ค้างอยู่ของตนเอง | `None` | `{ "booking_id": 12, "table_number": "A03", "status": "pending", "grace_expired_at": "..." }` | Yes | Student, Staff | จำกัด 1 สิทธิ์การจองต่อ 1 บัญชีผู้ใช้งาน |
| | `POST` | `/api/v1/users/bookings` | ทำธุรกรรมจองโต๊ะอาหาร | `{ "table_id": 5 }` | `{ "booking_id": 102, "status": "pending", "grace_expired_at": "..." }` | Yes | Student, Staff | ทำ **Pessimistic Locking (`FOR UPDATE`)** หลังบ้าน |
| | `POST` | `/api/v1/users/bookings/:id/check-in` | สแกน QR + ส่งพิกัดดาวเทียมเช็คอินโต๊ะจริง | `{ "qr_code_hash": "...", "latitude": 13.75, "longitude": 100.5 }` | `{ "booking_id": 102, "status": "active", "checked_in_at": "..." }` | Yes | Student, Staff | ต้องคำนวณระยะพิกัดโรงอาหาร GPS <= 50 เมตร |
| | `POST` | `/api/v1/users/bookings/:id/check-out` | กดเช็คเอาต์แมนนวลคืนสิทธิ์พื้นที่โต๊ะว่าง | `None` | `{ "booking_id": 102, "status": "completed", "checked_out_at": "..." }` | Yes | Student, Staff | ปรับปรุงโต๊ะเป็น `need_cleaning` เพื่อเรียกแม่บ้าน |
| **3. Agencies** | `GET` | `/api/v1/agencies` | ดึงหน่วยงาน/แผนกรับผิดชอบพื้นที่โรงอาหาร | `None` | `[{ "agency_id": 1, "name": "ฝ่ายปกครอง", "zone_responsible": "Zone A" }]` | Yes | All | ในบริบทสถานศึกษาคือแผนกดูแลรักษาความสงบ/พัสดุ |
| | `POST` | `/api/v1/agencies` | เพิ่มหน่วยงานผู้รับผิดชอบใหม่ | `{ "name": "ฝ่ายทำความสะอาด", "zone_id": 2 }` | `{ "agency_id": 3, "name": "..." }` | Yes | Admin | ป้องกันการสร้างข้อมูลขยะเข้าฐานข้อมูล |
| **4. Complaint Categories** | `GET` | `/api/v1/complaint-categories` | ดูรายการประเภทปัญหาร้องเรียนและคะแนนหัก | `None` | `[{ "id": 1, "category_name": "วางของกั๊กโต๊ะ", "default_penalty": 20 }]` | Yes | All | ตาราง Master สำหรับประกอบฟอร์มร้องเรียนหน้าบ้าน |
| | `POST` | `/api/v1/complaint-categories` | เพิ่มประเภทหรือปรับคะแนนหักมาตรฐาน | `{ "category_name": "...", "default_penalty": 15 }` | `{ "id": 5, "category_name": "..." }` | Yes | Admin | จะมีผลต่อการหักคะแนนความประพฤติอัตโนมัติ |
| **5. Complaints** | `POST` | `/api/v1/complaints` | ยื่นข้อร้องเรียนปัญหาโต๊ะอาหารผ่านเว็บไซต์ | `{ "table_id": 2, "category_id": 1, "description": "...", "evidence_url": "...", "is_anonymous": true }` | `{ "complaint_id": 401, "status": "pending_review" }` | Yes | All | รองรับ `is_anonymous` ซ่อนไอดีผู้แจ้ง (PDPA) |
| | `GET` | `/api/v1/complaints` | ดึงรายการข้อร้องเรียนทั้งหมด (กรองตามช่องทาง) | `None` (Query: `?status=pending&source=web`) | `[{ "complaint_id": 401, "table_number": "05", "status": "pending_review" }]` | Yes | Inspector, Admin, Executive | สามารถคัดกรองจัดลำดับตามความเร่งด่วนของเวลา |
| | `POST` | `/api/v1/complaints/phone-log` | บันทึกรับเรื่องร้องเรียนจากโทรศัพท์ | `{ "reporter_name": "...", "table_id": 2, "category_id": 1, "description": "..." }` | `{ "complaint_id": 402, "status": "pending_review" }` | Yes | Admin | บันทึก `receiver_admin_id` ลงข้อมูลธุรกรรม |
| | `POST` | `/api/v1/complaints/import-central` | รับนำเข้าข้อร้องเรียนจาก API ระบบกลาง | `{ "central_id": "C-99", "issue_type": "canteen", "details": "..." }` | `{ "complaint_id": 403, "status": "pending_review" }` | Yes | Admin, System API Key | รองรับการทำ API Token ยืนยันสิทธิ์จากส่วนกลาง |
| **6. Complaint Assignment** | `POST` | `/api/v1/complaints/:id/assign` | มอบหมายสารวัตรเวรประจำจุดลงตรวจสอบ | `{ "assigned_inspector_id": 8 }` | `{ "complaint_id": 401, "status": "investigating", "assigned_to": "..." }` | Yes | Inspector, Admin | ยิงแจ้งเตือนเตือนไปที่อุปกรณ์ผู้รับมอบงานโดยตรง |
| **7. Complaint Updates** | `PATCH` | `/api/v1/complaints/:id/status` | อัปเดตสถานะ ตัดสินความผิด และหักแต้มประพฤติ | `{ "status": "resolved", "remarks": "เคลียร์โต๊ะแล้ว", "verify_violation": true }` | `{ "complaint_id": 401, "status": "resolved", "points_deducted": 20 }` | Yes | Inspector, Admin | หาก `verify_violation` เป็นจริง จะหักแต้มเป้าหมาย |
| **8. Attachments** | `POST` | `/api/v1/attachments/upload` | อัปโหลดรูปภาพหลักฐานพยานกั๊กโต๊ะ | `Multipart Form Data (file: Image)` | `{ "url": "https://storage.railway.com/.../img.jpg" }` | Yes | All | **ข้อควรระวัง:** ต้องผ่านการจำกัดขนาดไฟล์ <= 5MB |
| **9. Notifications** | `GET` | `/api/v1/notifications` | ดึงรายการแจ้งเตือนเตือนของตนเอง | `None` | `[{ "id": 1, "message": "การจองใกล้หมดเวลา", "is_read": false }]` | Yes | All | ใช้ในหน้ากระดิ่งแจ้งเตือนเตือน |
| | `GET` | `/api/v1/notifications/stream` | รับการซิงก์แผนที่และแจ้งเตือนเตือนสด (SSE) | `None` | `Server-Sent Events Stream (HTTP Text/Event-Stream)` | Yes | All | ประหยัดทรัพยากรการดึงข้อมูล ดีกว่า Polling |
| **10. Dashboard** | `GET` | `/api/v1/dashboard/canteen-status` | สรุปยอดความแออัดเรียลไทม์และสัดส่วนโต๊ะว่าง | `None` | `{ "occupancy_rate": 68.5, "available": 32, "occupied": 68 }` | Yes | All | หน้าแรกของระบบและบอร์ดมอนิเตอร์โรงอาหาร |
| **11. Reports** | `GET` | `/api/v1/reports/violations` | สถิติและอัตราส่วนคนฝ่าฝืนกฎ รายชื่อคนแบน | `None` (Query: `?start_date=...`) | `{ "total_violations": 120, "blacklist_active": 5 }` | Yes | Admin, Executive | สิทธิ์เข้าใช้แบบอ่านอย่างเดียวสำหรับผู้บริหาร |
| **12. Audit Logs** | `GET` | `/api/v1/audit-logs/booking-history` | ดึงข้อมูลสืบประวัติการยกเลิกจองและเปลี่ยนสถานะ | `None` | `[{ "log_id": 1, "booking_id": 5, "old_status": "pending", "new_status": "expired" }]` | Yes | Admin | ป้องกันการแอบอ้างสิทธิ์แก้ไขประวัติโดยแฮกเกอร์ |

---

## 3. มาตรการตรวจสอบความถูกต้องของข้อมูลความปลอดภัย (Request Validation Rules)

เพื่อป้องกันข้อมูลขยะและอันตรายจากการยิง Request โจมตีหลังบ้าน:
1. **การตรวจสอบ JWT Token (Authentication Middleware):**
   * ทุก Endpoints ที่มีสถานะ `Auth Required = Yes` จะต้องสกัดข้อมูล JWT Token จาก Request Header `Authorization: Bearer <JWT_TOKEN>` ก่อนรัน Logic เสมอ
   * หากไม่มีหรือหมดอายุ ให้ดีดกลับทันทีด้วย HTTP Status Code `401 Unauthorized`
2. **การยืนยันพิกัด GPS (Check-in Validation Logic):**
   * Endpoint `/api/v1/users/bookings/:id/check-in` ต้องมี Middleware ตรวจสอบประเภทและค่าข้อมูลพิกัด `latitude` และ `longitude` ต้องเป็นตัวเลขพิกัดดาวเทียมจริง และคำนวณระยะห่างห่างจากจุดศูนย์กลางโรงอาหารด้วยสูตร **Haversine Formula** หากระยะห่างห่างกันเกิน 50 เมตร ให้ระงับธุรกรรมการเช็คอินและคืนรหัส error `400 Bad Request`
3. **การตรวจสอบขนาดไฟล์รูปภาพอัปโหลด (Attachment Constraints):**
   * Endpoint `/api/v1/attachments/upload` ต้องตรวจประเภทไฟล์ภาพ (รองรับเฉพาะ JPEG/PNG) และบล็อกไฟล์ขนาดใหญ่เกิน 5MB เพื่อป้องกันพื้นที่การใช้สิทธิ์คลาวด์บวมและรักษาเสถียรภาพเครือข่าย

---
*เอกสารนี้จัดเตรียมขึ้นตามข้อบังคับความปลอดภัยการพัฒนาโครงการและสัญญาระบบ REST API*
*สเต็ปถัดไปในการสร้างเอกสารวิเคราะห์ระบบคือการทำออกแบบหน้าจอการเข้าถึงใน [07-frontend-pages.md](file:///d:/Table-Booking-System/docs/planning/07-frontend-pages.md)*
