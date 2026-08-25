# รายงานผลการทดสอบความเสถียรและคุณภาพระบบ (System Integration & QA Report)

> **เอกสารนี้เป็นผลลัพธ์การดำเนินงานสำหรับ Phase 14: Testing and Bug Fix**  
> จัดทำโดย: Senior Code Reviewer & QA Engineer  
> วันที่ทดสอบ: 11 สิงหาคม 2026

---

## 1. บทสรุปผลการทดสอบ (Executive Summary)

โครงการระบบจองโต๊ะโรงอาหารในสถานศึกษา (Canteen Table Booking System) ได้ผ่านการทดสอบแบบบูรณาการ (System Integration & Regression Testing) ครอบคลุมทั้ง 38 ชุดการทดสอบ (38 Subtests) บนสภาพแวดล้อมจริงผ่าน Docker Container

### สรุปตัวเลขผลการทดสอบ

| รายการ | จำนวน | สถานะ |
|---|:---:|:---:|
| **จำนวนการทดสอบทั้งหมด (Total Tests)** | 38 | 100% |
| **ผ่านการทดสอบ (Passed)** | 38 | ✅ 100% |
| **ไม่ผ่าน (Failed)** | 0 | 0% |
| **ข้ามการทดสอบ (Skipped)** | 0 | 0% |
| **ระยะเวลาประมวลผลรวม (Duration)** | ~3.5 วินาที | Fast & Reliable |

---

## 2. รายละเอียดการทดสอบจำแนกตามโมดูล (Test Suites Breakdown)

### 2.1 Authentication Module (`tests/auth.test.js`) — 10/10 PASS
* [x] `POST /api/v1/auth/login` — เข้าสู่ระบบสำเร็จสำหรับ Admin (`admin`)
* [x] `POST /api/v1/auth/login` — เข้าสู่ระบบสำเร็จสำหรับ นักเรียน (`student1`)
* [x] `POST /api/v1/auth/login` — เข้าสู่ระบบสำเร็จสำหรับ สารวัตรนักเรียน (`inspector1`)
* [x] `POST /api/v1/auth/login` — เข้าสู่ระบบสำเร็จสำหรับ แม่บ้าน (`cleaner1`)
* [x] `POST /api/v1/auth/login` — ปฏิเสธเมื่อรหัสผ่านผิด (HTTP 401)
* [x] `POST /api/v1/auth/login` — ปฏิเสธเมื่อไม่พบชื่อผู้ใช้งาน (HTTP 401)
* [x] `POST /api/v1/auth/login` — ปฏิเสธเมื่อลืมกรอกข้อมูล (HTTP 400)
* [x] `GET /api/v1/auth/me` — ดึงข้อมูลโปรไฟล์ถูกต้องเมื่อมี JWT Token
* [x] `GET /api/v1/auth/me` — ปฏิเสธเมื่อไม่มี Token (HTTP 401)
* [x] `GET /api/v1/auth/me` — ปฏิเสธเมื่อ Token ไม่ถูกต้อง/ถูกปลอมแปลง (HTTP 401)

### 2.2 Booking Module (`tests/booking.test.js`) — 5/5 PASS
* [x] `POST /api/v1/users/bookings` — ปฏิเสธ request ที่ไม่มี Token (HTTP 401)
* [x] `GET /api/v1/users/bookings/active` — คืนค่าว่างถูกต้องเมื่อยังไม่มีรายการจอง
* [x] **Full Booking Lifecycle** — ทดสอบวงจรสมบูรณ์: จองสำเร็จ (201) → เช็คอินด้วย GPS (200, status `active`) → เช็คเอาต์ (200, status `completed`)
* [x] **Concurrency & Lock Guard** — ป้องกันการจองซ้อนโต๊ะเดียวกัน (HTTP 409/400)
* [x] `POST /api/v1/users/bookings` — ปฏิเสธเมื่อไม่ส่ง `table_id` (HTTP 400)

### 2.3 Complaint & Inspector Workflow Module (`tests/complaint.test.js`) — 11/11 PASS
* [x] `GET /api/v1/complaint-categories` — คืนรายการประเภทเรื่องร้องเรียน
* [x] `GET /api/v1/complaint-categories` — ปฏิเสธการเข้าถึงแบบไม่มี Token (HTTP 401)
* [x] `POST /api/v1/complaints` — นักเรียนส่งเรื่องร้องเรียนสำเร็จ (HTTP 201, status `pending_review`)
* [x] `POST /api/v1/complaints` — ปฏิเสธการยื่นเรื่องร้องเรียนแบบไม่มี Token (HTTP 401)
* [x] `POST /api/v1/complaints` — ปฏิเสธการยื่นเรื่องร้องเรียนเมื่อลืมระบุ `table_id` หรือ `complaint_type_id` (HTTP 400)
* [x] `GET /api/v1/complaints` — ดึงรายการเรื่องร้องเรียนสำหรับผู้ใช้งานทั่วไปและเจ้าหน้าที่
* [x] `POST /api/v1/complaints/:id/assign` — สารวัตรนักเรียนรับเรื่องร้องเรียนสำเร็จ (status `investigating`)
* [x] `POST /api/v1/complaints/:id/assign` — ปฏิเสธนักเรียนไม่ให้รับเรื่องร้องเรียน (HTTP 403 Forbidden)
* [x] `PATCH /api/v1/complaints/:id/status` — สารวัตรยืนยันการแก้ไขสำเร็จ (status `resolved`)
* [x] `PATCH /api/v1/complaints/:id/status` — สารวัตรปฏิเสธเรื่องร้องเรียนสำเร็จ (status `rejected`)
* [x] `PATCH /api/v1/complaints/:id/status` — ปฏิเสธนักเรียนไม่ให้แก้ไขสถานะเรื่องร้องเรียน (HTTP 403 Forbidden)

### 2.4 Report & Dashboard Module (`tests/report.test.js`) — 8/8 PASS
* [x] `GET /api/v1/dashboard/canteen-status` — เข้าถึงได้จากผู้ใช้งานทุกบทบาทที่ผ่านการยืนยันตัวตน
* [x] `GET /api/v1/dashboard/canteen-status` — ปฏิเสธเมื่อไม่มี Token (HTTP 401)
* [x] `GET /api/v1/dashboard/canteen-status` — คืนโครงสร้างตัวเลขอัตราครองโต๊ะ (Occupancy rate) ถูกต้อง
* [x] `GET /api/v1/reports/violations` — ผู้ดูแลระบบ (Admin) เข้าถึงรายงานการกระทำผิดสำเร็จ
* [x] `GET /api/v1/reports/violations` — ปฏิเสธนักเรียนไม่ให้เข้าถึงรายงานผู้กระทำผิด (HTTP 403)
* [x] `GET /api/v1/reports/violations` — ปฏิเสธแม่บ้านไม่ให้เข้าถึงรายงานผู้กระทำผิด (HTTP 403)
* [x] `GET /api/v1/reports/violations` — ปฏิเสธสารวัตรนักเรียนไม่ให้เข้าถึงรายงานผู้กระทำผิด (HTTP 403)
* [x] `GET /api/v1/reports/violations` — ปฏิเสธการเข้าถึงแบบไม่มี Token (HTTP 401)

### 2.5 Table Management Module (`tests/tableRoutes.test.js`) — 1/1 PASS
* [x] `GET /api/v1/tables` & `PATCH /api/v1/tables/:id/status` — ดึงผังโต๊ะสดและอัปเดตสถานะทำความสะอาดสำเร็จ

### 2.6 Security & Error Handling (`tests/report.test.js`) — 3/3 PASS
* [x] **Secrets Protection** — หน้าสัมผัส `/api/status` ไม่รั่วไหล `JWT_SECRET` หรือรหัสผ่านฐานข้อมูล
* [x] **Global 404 Handler** — URL ที่ไม่มีจริงภายใต้ `/api/v1/*` คืนสถานะ HTTP 404 พร้อมโครงสร้าง JSON มาตรฐาน
* [x] **Grace Expiration SQL Sync** — การคำนวณหมดเวลา Grace Period ใน SQL ใช้เวลาของระบบฐานข้อมูล ป้องกันปัญหา Timezone Drift

---

## 3. บั๊กที่พบค้นพบและการแก้ไข (Issues Found & Resolved)

ระหว่างการทำ Regression QA ใน Phase 14 ทีมพัฒนาตรวจพบบั๊กและได้ดำเนินการแก้ไขทันที:

| # | ปัญหาที่พบ (Issue) | ผลกระทบ | สาเหตุ (Root Cause) | การแก้ไข (Resolution) |
|---|---|---|---|---|
| 1 | Express Router Middleware Scope ใน [inspectorRoutes.js](file:///d:/Table-Booking-System/backend/src/routes/inspectorRoutes.js) | HTTP 403 เมื่อนักเรียนเข้าถึง `/dashboard/canteen-status` | `router.use(requireRoles('inspector', 'admin'))` ตั้งระดับ Router ทำให้กัก Request ที่ผ่าน `/api/v1` | ย้าย `requireRoles` ไปติดที่ Route Handler เฉพาะของ Inspector แบบเจาะจง |
| 2 | Timezone Drift การเช็ค Grace Period ใน [bookingService.js](file:///d:/Table-Booking-System/backend/src/services/bookingService.js) | เช็คอินไม่ผ่าน (`GRACE_PERIOD_EXPIRED`) | เปรียบเทียบ `new Date()` ของ Node.js กับ Timestamp ใน MySQL ต่าง Timezone | ใช้คำสั่ง SQL `(b.grace_expired_at < NOW())` คำนวณฝั่ง MySQL โดยตรง |

---

## 4. คำสั่งสำหรับการทดสอบซ้ำ (Verification Commands)

```bash
# รัน Integration Test ทั้งหมด 38 ชุด
docker exec booking_backend_container npm run test:all

# รันแยกรายโมดูล
docker exec booking_backend_container npm run test:auth
docker exec booking_backend_container npm run test:booking
docker exec booking_backend_container npm run test:complaint
docker exec booking_backend_container npm run test:report
docker exec booking_backend_container npm run test:tables
```

---

## 5. สรุปความพร้อมสำหรับขึ้นระบบจริง (Phase Acceptance)

* **บั๊กความรุนแรงระดับ High/Blocker ทั้งหมดได้รับการแก้ไขแล้ว** (`[x] PASS`)
* **ทุก Endpoint API สามารถรันสำเร็จและคืนสถานะตาม API Contract** (`[x] PASS`)
