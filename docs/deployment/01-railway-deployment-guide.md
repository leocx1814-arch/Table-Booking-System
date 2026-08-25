# คู่มือการนำระบบขึ้นใช้งานจริงบน Railway และ On-Premise (Production Deployment Guide)

> **เอกสารนี้เป็นผลลัพธ์การดำเนินงานสำหรับ Phase 15: Production Deployment Guide**  
> จัดทำโดย: Senior Software Architect & DevOps Specialist  
> วันที่ปรับปรุง: 11 สิงหาคม 2026

---

## 1. ภาพรวมสถาปัตยกรรมระดับ Production (Production Single-Container Architecture)

ในโหมด **Production** ระบบจองโต๊ะโรงอาหารในสถานศึกษาปรับใช้สถาปัตยกรรม **Single-Container Multi-Stage Build**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Railway / Cloud Container Host                     │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Single Docker Container (Node.js 20 Express)                       │  │
│  │ Port: $PORT (e.g. 5001)                                           │  │
│  │                                                                   │  │
│  │  ┌───────────────────────────┐     ┌───────────────────────────┐  │  │
│  │  │  Frontend Static SPA      │     │  Express REST & SSE API   │  │  │
│  │  │  (React 18 / Vite 5)      │     │  (Node.js / Express 4)    │  │  │
│  │  │  Served from /app/public  │     │  Mounted under /api/*     │  │  │
│  │  └───────────────────────────┘     └─────────────┬─────────────┘  │  │
│  └──────────────────────────────────────────────────┼────────────────┘  │
│                                                     │                   │
│                                                     ▼                   │
│                                       ┌───────────────────────────┐     │
│                                       │   Managed MySQL 8 Database│     │
│                                       │   (Railway MySQL Plugin / │     │
│                                       │    AWS RDS / Cloud DB)    │     │
│                                       └───────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. การสร้าง Multi-Stage Dockerfile ในการทำงานจริง

การสร้าง Multi-Stage Dockerfile มีขั้นตอนการทำงานในไฟล์ `Dockerfile` สองขั้นตอน:

1. **Stage 1 (frontend-builder):** คอมไพล์ React 18 + Vite 5 ได้ไฟล์ภาพนิ่งเว็บ (Static Bundle) ไว้ที่ `/app/frontend/dist`
2. **Stage 2 (production):** ติดตั้ง NPM Dependencies สำหรับสภาวะใช้จริงของ Backend และคัดลอก Static Bundle จาก Stage 1 มาไว้ที่โฟลเดอร์ `/app/public` ของ Express

---

## 3. ตัวแปรสภาพแวดล้อมระบบ Production (Production Environment Variables)

เมื่อนำขึ้นใช้งานบน Railway หรือ Cloud Provider จะต้องตั้งค่า Config Variables ใน Dashboard ดังนี้:

| ชื่อตัวแปร (Variable Name) | ตัวอย่างค่า Production | คำอธิบาย |
|---|---|---|
| `NODE_ENV` | `production` | กำหนดโหมดการทำงานเป็น Production |
| `PORT` | `5001` (หรือตามที่ Cloud กำหนด) | Port ที่เซิร์ฟเวอร์เปิดรับการเชื่อมต่อ |
| `MYSQL_HOST` | `containers-us-west-xxx.railway.app` | Hostname ของฐานข้อมูล MySQL |
| `MYSQL_PORT` | `3306` (หรือ Port ภายนอก) | Port ของบริการ MySQL |
| `MYSQL_DATABASE` | `railway` | ชื่อฐานข้อมูล Production |
| `MYSQL_USER` | `root` | ชื่อผู้ใช้งานฐานข้อมูล |
| `MYSQL_PASSWORD` | `<SECURE_DB_PASSWORD>` | รหัสผ่านฐานข้อมูล Production |
| `JWT_SECRET` | `<LONG_RANDOM_BASE64_SECRET>` | คีย์ลับสำหรับเซ็น JWT Token (สร้างด้วย `openssl rand -base64 48`) |
| `JWT_EXPIRES_IN` | `8h` | อายุใช้งานของ JWT Token |

---

## 4. ขั้นตอนการ Deploy บน Railway (Railway Deployment Steps)

### ขั้นตอนที่ 1: การเตรียมบริการ MySQL บน Railway
1. เข้าสู่ระบบ [Railway.app](https://railway.app)
2. สร้าง Project ใหม่ (`New Project`)
3. เลือก **Provision MySQL** เพื่อเปิดบริการฐานข้อมูล MySQL 8.0
4. เข้าไปที่แถบ **Data** ใน MySQL แล้ว Import ไฟล์สคริปต์ตั้งต้น [01-init.sql](file:///d:/Table-Booking-System/db/init/01-init.sql)

### ขั้นตอนที่ 2: การเชื่อมต่อ Repository และ Deploy
1. ใน Project เดียวกัน กดเลือก **New** → **GitHub Repo**
2. เลือก Repository `Table-Booking-System`
3. Railway จะตรวจพบไฟล์ [railway.toml](file:///d:/Table-Booking-System/railway.toml) และ [Dockerfile](file:///d:/Table-Booking-System/Dockerfile) โดยอัตโนมัติ
4. ไปที่แถบ **Variables** แล้วกรอกค่า Environment Variables ตามตารางในข้อ 3
5. กด **Deploy** แล้วรอจนกระทั่ง Health Check ผ่านที่พอร์ต `/api/status`

---

## 5. คู่มือการนำขึ้นระบบ On-Premise ด้วย Docker (On-Premise Deployment Guide)

กรณีต้องการ Deploy บน Linux Server (Ubuntu Server / Debian) ภายในสถานศึกษา:

### 1. Build Production Image
```bash
docker build -t canteen-booking-system:latest -f Dockerfile .
```

### 2. Run Single-Container พร้อมต่อ Database ภายนอก
```bash
docker run -d \
  --name canteen_booking_prod \
  -p 5001:5001 \
  -e NODE_ENV=production \
  -e PORT=5001 \
  -e MYSQL_HOST=192.168.1.100 \
  -e MYSQL_PORT=3306 \
  -e MYSQL_DATABASE=canteen_db \
  -e MYSQL_USER=canteen_app \
  -e MYSQL_PASSWORD=SecurePassword123! \
  -e JWT_SECRET=ProductionSecretKeyForCanteenTableBook2026 \
  --restart always \
  canteen-booking-system:latest
```

---

## 6. การตรวจสอบผลและการบำรุงรักษา (Verification & Maintenance)

1. **ตรวจสอบความสมบูรณ์ของระบบ:** เข้าถึง URL ของโปรเจกต์ (เช่น `https://canteen-system.up.railway.app/api/status`) ต้องตอบกลับสถานะ `{ "success": true, "data": { "status": "healthy", "database": "connected" } }`
2. **การเข้าใช้งาน Web UI:** เปิด URL ในบราวเซอร์ จะต้องเข้าสู่หน้าเว็บหลักของระบบ (React SPA) และสามารถทำงานสตรีมเรียลไทม์ผ่าน SSE สื่อสารกับหลังบ้านได้จาก URL เดียวกัน
