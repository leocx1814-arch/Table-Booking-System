# โครงสร้างโครงการและสถาปัตยกรรมคอนเทนเนอร์ (Project Structure & Docker Architecture)

เอกสารฉบับนี้จัดทำขึ้นโดย Senior Software Architect และ DevOps Engineer เพื่อกำหนดโครงสร้างการจัดเก็บไฟล์ของโครงการ (Directory Structure) และสถาปัตยกรรมการรันคอนเทนเนอร์ (Docker Compose Configuration) ของ **ระบบจองโต๊ะโรงอาหารในสถานศึกษา (Canteen Table Booking System)** 

โครงสร้างนี้รองรับทั้งระบบงานสำหรับการพัฒนาโปรแกรมภายในเครื่อง (Local Development) และการนำขึ้นระบบจริงแบบคลาวด์ (Production Cloud Deployment) โดยสอดคล้องตามข้อตกลงและเงื่อนไขเทคโนโลยีที่ระบุไว้ใน [00-tech-stack-decision.md](file:///d:/Table-Booking-System/docs/planning/00-tech-stack-decision.md) และความต้องการอื่น ๆ ของการเชื่อมโยงระบบในเอกสารการวางแผนก่อนหน้านี้

---

## 1. โครงสร้างการจัดเก็บโฟลเดอร์ของโครงการ (Project Directory Structure)

โครงสร้างโฟลเดอร์สำหรับพัฒนาและจัดเก็บไฟล์ (Monorepo Strategy) ได้รับการออกแบบดังนี้:

```text
Table-Booking-System/
├── .env                          # ตัวแปรสภาพแวดล้อมเฉพาะบุคคล (ห้าม commit เข้าระบบ)
├── .env.example                  # ไฟล์ต้นแบบแสดงโครงสร้างตัวแปรสภาพแวดล้อม
├── .gitignore                    # ไฟล์สกัดกั้นการบันทึกไฟล์ชั่วคราวและ Secrets เข้า Git
├── docker-compose.yml            # ไฟล์ควบคุมการรันคอนเทนเนอร์สำหรับขั้นตอน Dev
├── docker-compose.prod.yml       # ไฟล์ควบคุมการรันคอนเทนเนอร์สำหรับขั้นตอน On-Premise Prod
├── Dockerfile                    # Multi-stage Dockerfile สำหรับรันแบบ Single Container (Railway / Prod)
├── railway.toml                  # ไฟล์ตั้งค่าสำหรับตัวช่วย Deployment บนแพลตฟอร์ม Railway
├── db/                           # บริการเกี่ยวกับฐานข้อมูล
│   └── init/
│       └── 01-init.sql           # SQL สคริปต์เริ่มฐานข้อมูลและตารางเริ่มต้น (charset utf8mb4)
├── nginx/                        # สำหรับ Target On-Premise Production เท่านั้น
│   └── default.conf              # ไฟล์ตั้งค่า Nginx Reverse Proxy
├── backend/                      # ฝั่ง REST API Server
│   ├── src/                      # Source Code หลังบ้าน
│   │   ├── config/               # การเชื่อมต่อ MySQL Connection Pool
│   │   ├── controllers/          # ชั้นควบคุม Request และ Response
│   │   ├── services/             # ชั้นควบคุม Business Logic และ Cron-release
│   │   ├── repositories/         # ชั้นจัดการเขียน/ดึงข้อมูลฐานข้อมูล (SQL queries)
│   │   ├── middlewares/          # ชั้นตรวจสอบสิทธิ์ JWT, GPS location, File filter
│   │   └── server.js             # Entry Point ตัวสตาร์ทระบบ Express.js
│   ├── Dockerfile.dev            # Dockerfile สำหรับรันหลังบ้านขั้นตอน Dev
│   ├── package.json              # รายการ dependencies ของหลังบ้าน
│   └── package-lock.json
├── frontend/                     # ฝั่ง Client-side Interface
│   ├── src/                      # Source Code หน้าบ้าน
│   │   ├── assets/               # รูปภาพ, โลโก้ และไอคอน
│   │   ├── components/           # ส่วนควบคุมแสดงผลย่อย (Reusable components)
│   │   ├── pages/                # หน้าหลักแยกตามบทบาทสิทธิ์ (Student, Cleaner, Inspector, Admin)
│   │   ├── routes/               # ตัวชี้ทิศทางหน้าจอและสิทธิ (React Router setup)
│   │   ├── theme/                # ตัวแปรตกแต่ง MUI ThemeProvider
│   │   └── main.jsx              # จุดเริ่มต้นการเรนเดอร์ React App
│   ├── index.html                # Entry Point HTML
│   ├── Dockerfile.dev            # Dockerfile สำหรับรันหน้าบ้านขั้นตอน Dev
│   ├── vite.config.js            # ไฟล์ตั้งค่า Vite
│   ├── package.json              # รายการ dependencies ของหน้าบ้าน
│   └── package-lock.json
└── docs/                         # เอกสารประกอบโครงการ
    └── planning/
        ├── 01-system-overview.md
        ├── 02-requirements.md
        ├── 05-database-design.md
        └── 09-project-docker-architecture.md   # เอกสารฉบับนี้
```

### คำอธิบายความรับผิดชอบของแต่ละโฟลเดอร์หลัก
* **`db/init/`:** เก็บสคริปต์เตรียมโครงสร้างและข้อมูล Master Data ตั้งต้นของ MySQL โดยสคริปต์จะถูกรันเฉพาะในการสร้าง Container รอบแรกเท่านั้น
* **`backend/src/`:** พัฒนาตามแนวคิด **Layered Architecture** เพื่อแยกส่วนควบคุม (Controllers), กฎเกณฑ์ระบบ (Services) และตัวเชื่อมฐานข้อมูล (Repositories/Models) ออกจากกันอย่างชัดเจนตามมาตรฐาน Clean Code
* **`frontend/src/`:** เก็บแอปพลิเคชัน React 18 แยกการจัดเส้นทางเมนู ป้องกันปุ่มจองเมื่อสิทธิไม่ตรงกัน และใช้ MUI 5 ตกแต่งหน้าจอให้เป็น Mobile-First
* **`nginx/`:** ใช้สำหรับติดตั้งบริการ Nginx กรณีรัน Production แบบแยกคอนเทนเนอร์บนเซิร์ฟเวอร์ส่วนตัว (On-Premise)

---

## 2. สถาปัตยกรรมบริการคอนเทนเนอร์ (Docker Containers Services Overview)

การทำงานของแต่ละบริการภายในระบบเมื่อจำลองในขั้นตอน Local Development:

### 2.1 รายการบริการ (Docker Services)

1. **`db` (MySQL 8.0 Database):**
   * **Host Port:** `3307` mapped to **Container Port:** `3306` (หลีกเลี่ยงการชนกับพอร์ต MySQL 3306 ของเครื่องหลัก)
   * **Volume:** ผูก Named Volume `db_data` ไปที่ `/var/lib/mysql` เพื่อบันทึกข้อมูลอย่างถาวร (Data Persistence)
   * **Initialization Mount:** ผูกไฟล์ `./db/init/` ไปยัง `/docker-entrypoint-initdb.d` เพื่อสร้างตารางตั้งต้นในการสั่งรันรอบแรก
   * **Health Check:** ตั้งระบบทดสอบสถานะ DB ปลายทางด้วย `mysqladmin ping` เพื่อยืนยันว่า MySQL พร้อมรับทราฟฟิกก่อนเริ่มสตาร์ทบริการอื่น
2. **`phpmyadmin` (Database Web UI):**
   * **Host Port:** `8081` mapped to **Container Port:** `80`
   * **Platform Check:** บังคับกำหนดเป็น `platform: linux/amd64` เพื่อป้องกันแอปพลิเคชันล่ม/ไม่พร้อมรันบน Apple Silicon (M1/M2/M3/M4)
   * **Depends On:** ตั้งค่ารอสถานะ db ให้เป็น `service_healthy`
3. **`backend` (Express.js REST API Server):**
   * **Host Port:** `5001` mapped to **Container Port:** `5001` (หลีกเลี่ยงพอร์ต 5000 เนื่องจาก macOS Monterrey นำไปใช้สิทธิ์ AirPlay)
   * **Development Volumes:**
     * **Bind Mount:** `./backend:/app` ซิงก์โค้ดสำหรับรีสตาร์ทตัวเองแบบเรียลไทม์ด้วย nodemon
     * **Anonymous Volume:** `/app/node_modules` ป้องกันการดึง dependencies บน OS ของ Host เข้าไปเขียนทับ dependencies ใน Linux Container
   * **Depends On:** รอจน db พร้อมใช้งานแบบ `service_healthy`
4. **`frontend` (Vite 5 React Client App):**
   * **Host Port:** `5173` mapped to **Container Port:** `5173`
   * **Development Volumes:**
     * **Bind Mount:** `./frontend:/app` ซิงก์โค้ดการแก้ไขหน้าเว็บเพื่อใช้ความสามารถ Hot Module Replacement (HMR) ของ Vite
     * **Anonymous Volume:** `/app/node_modules` ป้องกัน Host OS ทับ dependencies
   * **Depends On:** สตาร์ททำงานต่อจาก db และ backend

### 2.2 โครงข่ายเครือข่ายและการสื่อสาร (Docker Network)
* ทุกบริการเชื่อมต่อผ่านโครงข่ายสะพานเสมือนร่วมกันชื่อ **`booking_network` (driver: bridge)**
* การอ้างอิงและประสานงานข้อมูลระหว่างกันภายในวง Network คอนเทนเนอร์ จะใช้ชื่อของ Service Name แทนพอร์ตภายนอก เช่น:
  * Backend ต่อ DB ผ่านโฮสต์ปลายทางชื่อ `db` พอร์ต `3306` (ห้ามต่อผ่าน localhost หรือ 127.0.0.1 ภายใน container)
  * phpMyAdmin ต่อ DB ผ่านโฮสต์ปลายทางชื่อ `db` พอร์ต `3306`

---

## 3. ตัวแปรสภาพแวดล้อมที่จำเป็น (Environment Variables)

ระบบควบคุมการตั้งค่าผ่านไฟล์ตัวแปรสภาพแวดล้อม `.env` โดยมีรายการค่าที่ต้องควบคุมดังนี้:

```text
# สภาพแวดล้อมรันระบบ
NODE_ENV=development
PORT=5001
VITE_PORT=5173

# ข้อมูลสำหรับฐานข้อมูล MySQL 8
MYSQL_ROOT_PASSWORD=your_secure_root_password_here
MYSQL_DATABASE=canteen_booking
MYSQL_USER=booking_app_user
MYSQL_PASSWORD=user_secure_password_here
MYSQL_LOCAL_PORT=3307

# การเชื่อมต่อฐานข้อมูลสำหรับฝั่ง Backend (ในเครื่อง Dev ชี้ไปที่ db)
MYSQL_HOST=db
MYSQL_PORT=3306

# URL ของ API ฝั่งหลังบ้านเพื่อให้หน้าบ้านสามารถเรียกส่ง REST API ได้
VITE_API_URL=http://localhost:5001
```

---

## 4. แผนการใช้งานบนสภาพแวดล้อมนำขึ้นบริการจริง (Production Architecture Deployment Targets)

สถาปัตยกรรมระบบได้รับการออกแบบมาให้มีความยืดหยุ่นรองรับการนำขึ้นใช้จริง (Deployment) 2 รูปแบบ:

### 4.1 Target A: แพลตฟอร์ม Railway Cloud (Single-Container Multi-Stage Deployment)
* **รูปแบบหลัก:** รันบริการในลักษณะ **Single Container App** โดยใช้ Multi-stage Dockerfile เพื่อลดภาระค่าใช้จ่ายและประหยัด Resource ของเครื่องเซิร์ฟเวอร์บน Railway
* **กลไกการทำงาน:**
  1. **Stage 1 (Vite Build):** ใช้ Node image ดำเนินการติดตั้ง dependencies และรันคำสั่ง `npm run build` ฝั่งหน้าบ้าน (Vite) เพื่อส่งออก Static Assets ที่ผ่านการย่อขนาดเรียบร้อยแล้วไปไว้ที่โฟลเดอร์ `/dist`
  2. **Stage 2 (Express Server Setup):** ใช้ Node image ดำเนินการดึงซอร์สโค้ดฝั่งหลังบ้าน (Express) และนำ Static Assets จาก Stage 1 คัดลอกไปเก็บไว้ที่โฟลเดอร์ `/public`
  3. **Stage 3 (Execution):** สตาร์ทรันตัวหลังบ้าน Express บนพอร์ตแบบ dynamic ที่ Railway กำหนดให้ (`PORT` config var) โดย Express จะทำหน้าที่ 2 บทบาท:
     * เสิร์ฟ REST API ที่พิกัด `/api/v1/*`
     * เสิร์ฟหน้าเว็บ Static HTML/JS ที่พิกัดอื่น ๆ (เช่น `/login`, `/history`) จากโฟลเดอร์ `./public/index.html` ด้วยการดัก Request แบบ Wildcard
  4. **Config vars:** บน Railway Dashboard จะตั้งค่าตัวแปรเชื่อมต่อ DB ของจริงของระบบ และไม่ต้องตั้งค่า Nginx คอนเทนเนอร์แยกออกมารับหน้า โดย Railway จะทำการออกใบรับรอง SSL และพอร์ต HTTPS ให้หน้าหน้าโฮสต์หลักโดยอัตโนมัติ (ผ่านไฟล์ `railway.toml`)

### 4.2 Target B: แพลตฟอร์มเซิร์ฟเวอร์ส่วนตัว (On-Premise Linux / Ubuntu Server Deployment)
* **รูปแบบหลัก:** การรันแอปพลิเคชันแบบดั้งเดิมผ่าน `docker-compose.prod.yml`
* **กลไกการทำงาน:**
  * รันคอนเทนเนอร์ฐานข้อมูล MySQL 8 แยกต่างหาก
  * รันตัวแอปพลิเคชันหลัก และติดตั้งคอนเทนเนอร์ **Nginx** เป็นด่านหน้าคอยทำหน้าที่ **Reverse Proxy** และรับใบรับรอง SSL (Let's Encrypt)
  * การตั้งค่า Nginx ในไฟล์ `nginx/default.conf` จะแบ่งเส้นทางส่งทราฟฟิกดังนี้:
    ```nginx
    server {
        listen 80;
        server_name canteen.yourschool.ac.th;

        # ส่งคำร้องขอ API ไปให้หลังบ้าน Express
        location /api/ {
            proxy_pass http://backend:5001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # ส่งคำร้องขอเปิดหน้าเว็บปกติไปให้หน้าบ้าน Vite static assets
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }
    }
    ```

---

## 5. ข้อควรระวังและแนวทางแก้ไขในระดับโครงสร้าง (System Caveats & Guidelines)

> [!CAUTION]
> **1. ปัญหาการเชื่อมต่อระหว่างโดเมนต่างกัน (Cross-Origin Resource Sharing - CORS):**
> * **ในขั้นตอน Dev:** หน้าบ้านรันพอร์ต `5173` หลังบ้านรันพอร์ต `5001` ซึ่งมี Port ต่างกัน โดเมนจึงมองว่าเป็น Cross-origin
> * *แนวทางแก้ไข:* หลังบ้าน Express ต้องติดตั้งไลบรารี `cors` และเขียนคำสั่งให้ดึงค่า Origin จากตัวแปรสภาพแวดล้อม และเปิดสิทธิ์เฉพาะ CORS URL หน้าบ้านที่ระบุเท่านั้น
> * **ในขั้นตอน Prod (Railway):** เนื่องจากรันแบบ Single Container หน้าบ้านและหลังบ้านใช้ Host และ Port เดียวกันหมด จึงไม่มีปัญหานี้
> 
> **2. การรอความพร้อมของระบบฐานข้อมูลเมื่อเริ่มเปิดคอนเทนเนอร์ (Database Connection Retry):**
> * **ปัญหา:** คอนเทนเนอร์หลังบ้านเริ่มทำงานอย่างรวดเร็วและพยายามเชื่อมต่อฐานข้อมูลทันที ในขณะที่ MySQL 8 Container ต้องใช้เวลา 10-15 วินาทีในการเตรียมสิทธิ์และรันข้อมูลสคริปต์ ทำให้หลังบ้านเกิดข้อผิดพลาดในการต่อฐานข้อมูลล้มเหลวและแครชปิดตัวเอง
> * *แนวทางแก้ไข:* นอกจากการตั้ง `depends_on` แบบ `service_healthy` ใน Docker Compose แล้ว โค้ด Backend ในไฟล์ `server.js` จะต้องมีกลไกตรวจสอบข้อผิดพลาดในการต่อฐานข้อมูล และทำการ **Retry Connection** หน่วงเวลารอ 5 วินาทีก่อนลองเชื่อมต่อใหม่ วนซ้ำ 5-10 รอบก่อนยอมจำนนหยุดการทำงาน เพื่อเพิ่มความน่าเชื่อถือ
> 
> **3. การจัดการรูปภาพร้องเรียนแบบชั่วคราว (Ephemeral Storage vs Object Storage):**
> * **ปัญหา:** Railway container ลบไฟล์ทุกอย่างที่อัปโหลดเมื่อ Re-deploy ทำให้ภาพหลักฐานเรื่องร้องเรียนสูญหาย
> * *แนวทางแก้ไข:* ในขั้นตอนพัฒนาอนุญาตให้ใช้การแปลงรูปภาพเป็น **Base64 String** ขนาดเล็กลงฐานข้อมูลชั่วคราว หรือทำ bind mount โฟลเดอร์อัปโหลดใน Local แต่เมื่อนำขึ้นระบบจริงจะต้องดึงไลบรารีของคลาวด์จัดเก็บ (เช่น AWS S3 / Cloudflare R2 SDK) มารองรับและเก็บเฉพาะ URL ใน MySQL เท่านั้น

---
*เอกสารนี้จัดทำตามข้อบังคับความปลอดภัยการพัฒนาโครงการและสัญญาระบบ Docker*
*สเต็ปถัดไปในการสร้างเอกสารวิเคราะห์ระบบคือเอกสารสรุปแผนงานพัฒนาโครงการใน [10-implementation-plan.md](file:///d:/Table-Booking-System/docs/planning/10-implementation-plan.md)*
