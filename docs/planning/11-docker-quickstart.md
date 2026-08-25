# คู่มือการติดตั้งและรันระบบในโหมด Local Development ด้วย Docker

> **เอกสารนี้เป็นส่วนหนึ่งของ Phase 13: Docker Integration**  
> สำหรับ Production Deployment ให้อ่านไฟล์ `docs/deployment/01-railway-deployment-guide.md` (Phase 15)

---

## ข้อกำหนดเบื้องต้น (Prerequisites)

| เครื่องมือ | เวอร์ชันขั้นต่ำ | ตรวจสอบด้วย |
|---|---|---|
| Docker Desktop | 24.x ขึ้นไป | `docker --version` |
| Docker Compose | v2.x (รวมอยู่ใน Docker Desktop) | `docker compose version` |
| Git | ใดก็ได้ | `git --version` |

> **หมายเหตุ Windows:** ตรวจสอบว่า **WSL 2** ทำงานอยู่ และ Docker Desktop ตั้งค่าใช้ WSL 2 backend  
> ไปที่ Docker Desktop → Settings → General → "Use the WSL 2 based engine" ✅

---

## ขั้นตอนการติดตั้ง (First-time Setup)

### 1. โคลนโปรเจกต์
```bash
git clone <repository-url>
cd Table-Booking-System
```

### 2. สร้างไฟล์ `.env` จาก Template
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Mac / Linux
cp .env.example .env
```

> **สำคัญ:** ค่าใน `.env.example` เป็นค่าสำหรับ Development ใช้งานได้ทันทีโดยไม่ต้องแก้ไข  
> สำหรับ Production ให้เปลี่ยน `JWT_SECRET` เป็น Secret จริงที่แข็งแกร่งก่อน Deploy

### 3. เริ่มต้นรันระบบด้วยคำสั่งเดียว
```bash
docker compose up --build
```

รอจนเห็น Log ประมาณนี้ (ใช้เวลาประมาณ 2-5 นาทีในการ Build ครั้งแรก):
```
booking_db_container        | /usr/sbin/mysqld: ready for connections.
booking_backend_container   | 🚀 Server running on port 5001
booking_frontend_container  | ➜  Local:   http://localhost:5173/
```

---

## พอร์ตที่ใช้งาน (Service Ports)

| บริการ | URL | คำอธิบาย |
|---|---|---|
| **Frontend (React)** | http://localhost:5173 | หน้าแอปพลิเคชันหลัก |
| **Backend (API)** | http://localhost:5001 | REST API + SSE Stream |
| **phpMyAdmin** | http://localhost:8081 | จัดการฐานข้อมูลผ่าน Web UI |
| **MySQL** | localhost:3307 | เชื่อมต่อโดยตรงจาก Host (เช่น TablePlus, DBeaver) |

---

## บัญชีผู้ใช้เริ่มต้น (Default Users)

รหัสผ่านทุกบัญชี: **`password123`**

| ชื่อผู้ใช้ | อีเมล | บทบาท |
|---|---|---|
| Admin | admin@school.ac.th | admin |
| Inspector | inspector@school.ac.th | inspector |
| Staff | staff@school.ac.th | staff |
| Cleaner | cleaner@school.ac.th | cleaner |
| Student 1 | student1@school.ac.th | student |
| Student 2 | student2@school.ac.th | student |
| Student 3 | student3@school.ac.th | student |

---

## Hot-reload (การเปลี่ยนโค้ดเห็นผลทันที)

เมื่อระบบรันอยู่ใน Docker แล้ว การแก้ไขโค้ดบน Host machine จะสะท้อนเข้า Container ทันที:

- **Frontend** (`frontend/src/**`): Vite HMR อัปเดตหน้าเว็บทันทีโดยไม่ต้อง reload
- **Backend** (`backend/src/**`): Nodemon รีสตาร์ท Node.js server อัตโนมัติ

> **หลักการ:** `docker-compose.yml` ใช้ **bind mount** (`./backend:/app` และ `./frontend:/app`) เพื่อซิงก์โค้ดจาก Host เข้า Container โดยตรง  
> `CHOKIDAR_USEPOLLING=true` ถูกตั้งค่าเพื่อให้ File watcher ทำงานได้บน Windows/WSL2

---

## คำสั่งที่ใช้บ่อย (Common Commands)

```bash
# รันระบบ (รัน background)
docker compose up -d --build

# รันระบบ (รันหน้าจอเห็น Log)
docker compose up --build

# หยุดระบบ (คงข้อมูล DB ไว้)
docker compose down

# หยุดระบบ + ลบ Volume (ล้างข้อมูล DB ทิ้งทั้งหมด)
docker compose down -v

# ดู Log ของ service ที่ต้องการ
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# ดูสถานะ Container ทั้งหมด
docker compose ps

# รันเฉพาะบาง service
docker compose up db phpmyadmin backend

# Rebuild Image ใหม่โดยไม่ใช้ Cache
docker compose build --no-cache
```

---

## การรันคำสั่งภายใน Container

```bash
# รัน Unit Test ของ Backend
docker exec booking_backend_container npm run test:tables

# เปิด Shell ภายใน Backend Container
docker exec -it booking_backend_container sh

# เปิด Shell ภายใน MySQL Container
docker exec -it booking_db_container mysql -u booking_user -p booking_db
```

---

## การแก้ปัญหาที่พบบ่อย (Troubleshooting)

### ปัญหา: Backend ไม่สามารถเชื่อมต่อ MySQL ได้ (ECONNREFUSED)
**สาเหตุ:** Backend เริ่มก่อน DB พร้อม  
**วิธีแก้:** รอสักครู่แล้ว Backend จะพยายาม Reconnect อัตโนมัติ หรือ Restart เฉพาะ backend:
```bash
docker compose restart backend
```

### ปัญหา: Port 5173 หรือ 5001 ถูกใช้อยู่แล้ว
**วิธีแก้:** แก้ค่า Port ใน `.env`:
```
VITE_PORT=3000
PORT=4000
```
แล้วรัน `docker compose up --build` ใหม่

### ปัญหา: Hot-reload ไม่ทำงาน (Windows)
**วิธีแก้:** ตรวจสอบว่าไฟล์โปรเจกต์อยู่ใน WSL filesystem (เช่น `/home/user/...`) ไม่ใช่ Windows filesystem (`/mnt/c/...`)

### ปัญหา: ต้องการล้างข้อมูลฐานข้อมูลและเริ่มใหม่
```bash
docker compose down -v
docker compose up --build
```

---

## โครงสร้างบริการ (Service Architecture)

```
┌─────────────────── Docker Network: booking_network ───────────────────┐
│                                                                        │
│  ┌──────────────┐   depends_on   ┌──────────────────┐                │
│  │   Frontend   │─────healthy──▶ │     Backend      │                │
│  │  (React/Vite)│                │  (Node/Express)  │                │
│  │  Port: 5173  │                │   Port: 5001     │                │
│  └──────────────┘                └────────┬─────────┘                │
│                                           │ depends_on               │
│  ┌──────────────┐   depends_on            │ healthy                  │
│  │  phpMyAdmin  │─────healthy──┐          ▼                          │
│  │  Port: 8081  │              │  ┌──────────────────┐               │
│  └──────────────┘              └─▶│    MySQL 8.0     │               │
│                                   │   Port: 3306     │               │
│                                   │  (Host: 3307)    │               │
│                                   └──────────────────┘               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Environment Variables Reference

ทุก Variable ถูกจัดการผ่านไฟล์ `.env` ที่ Root ของโปรเจกต์ (ดูตัวอย่างใน `.env.example`)

| Variable | ค่าเริ่มต้น (Dev) | คำอธิบาย |
|---|---|---|
| `PORT` | `5001` | Port ของ Backend API |
| `NODE_ENV` | `development` | โหมดการทำงาน Node.js |
| `MYSQL_HOST` | `db` | ชื่อ Service ของ MySQL ใน Docker |
| `MYSQL_PORT` | `3306` | Port ภายใน Docker network |
| `MYSQL_LOCAL_PORT` | `3307` | Port ที่เปิดให้ Host machine เชื่อมต่อ |
| `MYSQL_DATABASE` | `booking_db` | ชื่อฐานข้อมูล |
| `MYSQL_USER` | `booking_user` | ชื่อผู้ใช้ MySQL |
| `MYSQL_PASSWORD` | `booking_pass` | รหัสผ่าน MySQL User |
| `MYSQL_ROOT_PASSWORD` | `root_pass` | รหัสผ่าน MySQL Root |
| `JWT_SECRET` | *(ดูใน .env.example)* | Secret Key สำหรับเซ็น JWT Token |
| `JWT_EXPIRES_IN` | `8h` | อายุของ JWT Token |
| `VITE_PORT` | `5173` | Port ของ Vite Dev Server |
| `VITE_API_URL` | `http://localhost:5001` | URL ที่ Browser ใช้เรียก API |
| `CHOKIDAR_USEPOLLING` | `true` | เปิดใช้ Polling File Watcher (จำเป็นบน Windows/WSL2) |
