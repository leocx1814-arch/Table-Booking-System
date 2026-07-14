# บริบทและภาพรวมโครงการ (PROJECT_CONTEXT.md)

เอกสารฉบับนี้เป็น **ไฟล์บริบทกลาง (Central Context File)** ที่ AI Coding Assistant จำเป็นต้องอ่านก่อนเริ่มปฏิบัติงานในทุก Turn ตามข้อกำหนดใน [SKILL.md](file:///d:/Table-Booking-System/.agents/skills/damrongdham-dev/SKILL.md) ข้อ 2

---

## 1. ชื่อและที่มาของโครงการ

**ชื่อโครงการ:** ระบบจองโต๊ะโรงอาหารในสถานศึกษา (Canteen Table Booking System)
**ชื่อย่อ / Code Name:** `TableBook`
**วัตถุประสงค์:** พัฒนาระบบจองที่นั่งโรงอาหารผ่านเว็บแอปพลิเคชันเพื่อลดปัญหาการกั๊กโต๊ะ การนั่งเกินเวลา และการขาดระบบจัดการคิวในโรงเรียน/มหาวิทยาลัย โดยมีระบบหักคะแนนความประพฤติ ระบบรับเรื่องร้องเรียน และแดชบอร์ดสำหรับผู้บริหาร

---

## 2. Tech Stack ที่ใช้งาน

| ชั้น | เทคโนโลยี | เวอร์ชัน | หมายเหตุ |
|:---|:---|:---:|:---|
| Frontend | React | 18.x | Vite 5 เป็น Build Tool |
| Frontend UI | MUI (Material-UI) | 5.x | ใช้ ThemeProvider + `sx` props |
| Frontend Router | React Router DOM | 6.x | |
| Backend | Node.js | 20 LTS | |
| Backend Framework | Express | 4.x | |
| Database | MySQL | 8.x | charset utf8mb4_unicode_ci |
| Containerization | Docker Compose | — | ไม่ใส่ `version:` property |
| DB GUI | phpMyAdmin | latest | |

---

## 3. Port Map (Development)

| Service | Host Port | Container Port | URL |
|:---|:---:|:---:|:---|
| Frontend (Vite) | 5173 | 5173 | http://localhost:5173 |
| Backend (Express) | 5001 | 5001 | http://localhost:5001 |
| MySQL | 3307 | 3306 | — (ต่อผ่าน Docker hostname `db`) |
| phpMyAdmin | 8081 | 80 | http://localhost:8081 |

> **กฎสำคัญ:** Backend/phpMyAdmin ต้องเชื่อมต่อ DB ผ่าน hostname `db` port `3306` เท่านั้น ห้ามใช้ `localhost`

---

## 4. โครงสร้าง Monorepo

```
Table-Booking-System/
├── .agents/
│   └── skills/damrongdham-dev/SKILL.md   ← กฎ AI
├── backend/
│   ├── src/
│   │   ├── server.js                     ← Entry point
│   │   ├── config/database.js            ← DB Pool (Phase 3)
│   │   ├── middlewares/errorHandler.js   ← Error Middleware (Phase 3)
│   │   ├── controllers/                  ← Phase 4+
│   │   ├── services/                     ← Phase 4+
│   │   └── routes/                       ← Phase 4+
│   ├── Dockerfile.dev
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                       ← Prototype (ต้อง Refactor Phase 8+)
│   │   ├── pages/                        ← Phase 8+
│   │   ├── components/                   ← Phase 8+
│   │   ├── hooks/                        ← Phase 9+
│   │   └── routes/                       ← Phase 8+
│   ├── Dockerfile.dev
│   ├── vite.config.js
│   └── package.json
├── db/
│   └── init/01-init.sql                  ← Schema + Seed
├── docs/
│   └── planning/                         ← เอกสาร 00-10
├── docker-compose.yml
├── .env.example
├── .env                                  ← ห้าม commit
└── .gitignore
```

---

## 5. บทบาทผู้ใช้งาน (Roles)

| Role | ID | คำอธิบาย |
|:---|:---:|:---|
| `student` | 1 | จองโต๊ะ, เช็คอิน/เช็คเอาต์, ส่งเรื่องร้องเรียน |
| `staff` | 2 | เหมือน student แต่เข้า Staff Only Zone ได้ |
| `cleaner` | 3 | ดูงานทำความสะอาด, อัปเดตสถานะโต๊ะ |
| `inspector` | 4 | ตรวจสอบเรื่องร้องเรียน, หักคะแนน |
| `admin` | 5 | จัดการผู้ใช้, โซน, โต๊ะ, ตั้งค่าระบบ |
| `executive` | 6 | ดู Dashboard และรายงานสถิติ |

**Test credentials (password: `password123`):**
| Username | Role | หมายเหตุ |
|:---|:---|:---|
| `admin` | admin | System admin |
| `student1` | student | ปกติ (100 คะแนน) |
| `student2` | student | ถูก Blacklist (40 คะแนน) |
| `teacher1` | staff | อาจารย์ |
| `cleaner1` | cleaner | แม่บ้าน |
| `inspector1` | inspector | สารวัตร |
| `executive1` | executive | ผู้บริหาร |

---

## 6. สถานะ Phase การพัฒนา

| Phase | ชื่อ | สถานะ |
|:---:|:---|:---:|
| 0 | Requirement & Architecture | ✅ DONE |
| 1 | Project Workspace Setup | ✅ DONE |
| 2 | Database Schema & Seeds | ✅ DONE |
| 3 | Backend Core Server | ⏳ IN PROGRESS |
| 4–15 | — | ❌ NOT STARTED |

---

## 7. กฎสำคัญสำหรับ AI

1. อ่านไฟล์นี้และ `SKILL.md` ก่อนเริ่มทำงานทุก Turn
2. อ่าน `10-implementation-plan.md` เพื่อตรวจสอบขอบเขต Phase ปัจจุบัน
3. ห้ามข้ามขั้นตอนหรือพัฒนา Feature ของ Phase อื่น
4. ทุก Response ต้องอ้างอิง Clickable Markdown Links สำหรับไฟล์ที่เกี่ยวข้อง

---
*อัปเดตล่าสุด: 2026-07-07 | Phase 2 Complete*
