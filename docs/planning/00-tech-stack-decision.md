# Tech Stack Decision: ระบบจองโต๊ะโรงอาหารในสถานศึกษา

เอกสารนี้ระบุการตัดสินใจและขอบเขตทางเทคโนโลยีเบื้องต้นสำหรับโครงการระบบจองโต๊ะโรงอาหารในสถานศึกษา ก่อนเริ่มการวิเคราะห์ความต้องการและการออกแบบระบบในขั้นตอนถัดไป

---

## 1. Project Name
* **ภาษาไทย:** ระบบจองโต๊ะโรงอาหารในสถานศึกษา
* **ภาษาอังกฤษ:** Canteen Table Booking System

## 2. Purpose of the System
ระบบเว็บแอปพลิเคชันสำหรับนักเรียน นักศึกษา และบุคลากร เพื่ออำนวยความสะดวกในการค้นหาและจองโต๊ะโรงอาหารล่วงหน้า ตลอดจนการตรวจสอบสถานะการใช้งานของโต๊ะแบบ Real-time เพื่อลดปัญหาความแออัดในช่วงเวลาพักกลางวัน และยกระดับการจัดการสุขอนามัยในสถานศึกษา

## 3. Selected Tech Stack
* **Frontend:** React 18 + Vite 5 + MUI 5 (Material-UI)
* **Backend:** Node.js 20 LTS + Express 4
* **Database:** MySQL 8
* **Development Tools:** Docker Compose, phpMyAdmin
* **Deployment Target:** Railway (Single-container app จาก Multi-stage Dockerfile)

## 4. Reason for Each Technology
* **React 18:** รองรับการสร้าง Dynamic UI ได้อย่างรวดเร็ว มี Virtual DOM ที่มีประสิทธิภาพในการจัดการ UI อัปเดต และมี Component Lifecycle ที่สมบูรณ์
* **Vite 5:** ให้ความเร็วในการทำ Development Server และ Hot Module Replacement (HMR) สูงกว่า Webpack อย่างเห็นได้ชัด ช่วยลดระยะเวลาในการทดสอบโค้ด
* **MUI 5 (Material-UI):** มี Component สำเร็จรูปที่ได้รับการออกแบบตามแนวทาง Material Design ช่วยประหยัดเวลาการแต่งหน้า UI และรองรับการทำ Responsive Design ได้ง่าย
* **Node.js 20 LTS:** Runtime สิ่งแวดล้อมที่เสถียร ใช้ JavaScript เป็นหลัก ช่วยให้เขียนโค้ดได้รวดเร็วแบบ Full-stack JavaScript และทำงานแบบ asynchronous ได้ดี
* **Express 4:** Framework สำหรับทำ REST API ที่มีขนาดเล็ก ยืดหยุ่นสูง และเป็นมาตรฐานหลักของ Node.js ecosystem
* **MySQL 8:** Relational Database ที่มีความเสถียร รองรับการจัดการ Transactions และความสัมพันธ์ของข้อมูลที่ชัดเจน (เช่น ผู้จอง โต๊ะ ช่วงเวลา)
* **Docker Compose:** ช่วยจัดการการทำงานและ Environment ของบริการต่าง ๆ ในฝั่ง Development ให้เป็นมาตรฐานเดียวกัน ลดผลกระทบจากความแตกต่างของระบบปฏิบัติการของผู้พัฒนา
* **phpMyAdmin:** เครื่องมือช่วยบริหารจัดการ MySQL ฐานข้อมูลผ่าน Web UI ทำให้ตรวจสอบและจัดการข้อมูลทดสอบได้ง่ายขึ้น
* **Railway:** แพลตฟอร์ม Cloud PaaS ที่รองรับการ Deploy จาก GitHub ได้ทันทีผ่าน Multi-stage Dockerfile สะดวก รวดเร็ว มีการจัดการ SSL และโดเมนให้อัตโนมัติโดยไม่ต้องตั้งค่า Nginx เพิ่มเติม

## 5. Development Environment
* **Frontend (Vite):** 
  - รันบน Port `5173` รองรับ Hot Module Replacement (HMR) สำหรับการแก้ไขโค้ดแบบ Real-time
  - ติดตั้งผ่าน Docker Compose โดยใช้ **Bind Mount** ของ Source Code และใช้ **Anonymous Volume** สำหรับ `node_modules` เพื่อป้องกัน Host ทับข้อมูล และปัญหา Architecture ไม่ตรงกัน
* **Backend (Express):** 
  - รันบน Port `5001` (หลีกเลี่ยง Port `5000` เนื่องจาก macOS ใช้กับ AirPlay Receiver)
  - ใช้ `nodemon` ในการตรวจสอบการเปลี่ยนแปลงไฟล์และทำ Auto Restart
  - ติดตั้งผ่าน Docker Compose โดยใช้ **Bind Mount** และ **Anonymous Volume** สำหรับ `node_modules`
* **MySQL 8:**
  - รัน Container ภายใน Network ที่พอร์ต `3306` แต่ Map ออกมาพอร์ตของ Host เป็น `3307` เพื่อไม่ให้ชนกับ MySQL ในเครื่องจริง
  - ตั้งค่า MySQL `healthcheck` เพื่อทดสอบสถานะ DB ให้พร้อมใช้งานก่อนเริ่มการทำ Service Startup
  - ใช้ named volume `db_data` เพื่อเก็บรักษาข้อมูลของฐานข้อมูลไว้อย่างยั่งยืน
  - วาง SQL initialization script ไว้ที่ `db/init/01-init.sql` โดยใช้ charset `utf8mb4` และ collation `utf8mb4_unicode_ci` เพื่อรองรับข้อมูลภาษาไทยอย่างสมบูรณ์
* **phpMyAdmin:**
  - รันบน Host Port `8081` (Container Port `80`)
  - เชื่อมต่อกับ MySQL ผ่าน network service name `db` (ไม่ใช่ `localhost` หรือ `127.0.0.1` ภายใน container)
  - กำหนด `platform: linux/amd64` ใน Compose file เพื่อรองรับการพัฒนาบน Apple Silicon (M1/M2/M3/M4) ได้อย่างราบรื่น

## 6. Production Environment
* **Railway Cloud Deployment:**
  - Deployment Target หลักที่จะทำหน้าที่เสิร์ฟแบบ Single-container app
  - ใช้ **Multi-stage Dockerfile** รวบรวม Frontend ที่ build แล้ว (Static assets) มาอยู่ใน Image เดียวกันกับ Backend (Express) ทำให้ Railway สามารถรันแอปพลิเคชันหลักด้วยจุดเชื่อมต่อเดียว
  - Railway จัดการเรื่อง Domain mapping และ SSL (HTTPS) ให้ฟรีโดยไม่ต้องมี Nginx แยกออกมาอีกหนึ่ง Container
* **Environment Configuration:**
  - ข้อมูล Secrets เช่น Database Credentials หรือ API Configuration อื่น ๆ ทั้งหมดใน Production จะทำผ่าน Environment Variables บน Railway Dashboard โดยตรง ห้ามใส่ข้อมูลลับเหล่านี้ไว้ใน source code เป็นอันขาด
* **Alternative Deploy Target (On-Premise / Ubuntu Server):**
  - ออกแบบโครงสร้างให้เป็นอิสระต่อ Infrastructure (Cloud-agnostic) หากเปลี่ยนไปใช้ Ubuntu Server จะต้องสามารถนำ Image เดียวกันรันร่วมกับ Nginx reverse proxy และ MySQL ภายนอกได้โดยไม่ต้องแก้โค้ดภายใน
* **Ephemeral Filesystem Constraint:**
  - Filesystem ของ Railway มีลักษณะเป็น Ephemeral (ข้อมูลจะสูญหายหากมีการปิด/เปิด หรือ Deploy ใหม่) หากในอนาคตจำเป็นต้องทำระบบอัปโหลดไฟล์ (เช่น รูปภาพโปรไฟล์, รูปภาพอาหาร) จะต้องจัดเก็บผ่าน Cloud Object Storage (เช่น AWS S3/Cloudflare R2) หรือยึดกับ Railway Volumes แทนการบันทึกลงดิสก์ของ container โดยตรง

## 7. Tools Required
1. **Docker Desktop** (รองรับ Docker Compose v2)
2. **VS Code** (หรือ IDE ที่ทีมงานถนัด)
3. **Web Browser** (Chrome / Safari / Firefox)
4. **Git Client** (สำหรับ Source Control)
5. **Node.js (v20 LTS)** (ติดตั้งแบบ local สำหรับการรัน lint หรือเครื่องมือเสริม)

## 8. Folder Strategy เบื้องต้น
โครงสร้างโฟลเดอร์สำหรับพัฒนา (Monorepo Strategy):
```text
Table-Booking-System/
├── .env.example             # ตัวอย่างการตั้งค่าตัวแปรสภาพแวดล้อม
├── .env                     # ไฟล์เก็บตัวแปรสภาพแวดล้อมเฉพาะบุคคล (ไม่นำเข้า Git)
├── docker-compose.yml       # ไฟล์ควบคุม Docker compose ในขั้นตอนการพัฒนา
├── backend/                 # ฝั่ง API & Server (Node.js + Express)
│   ├── src/                 # ไฟล์ Source Code ของ Backend
│   │   └── server.js        # Entry point ของ API Server
│   ├── Dockerfile.dev       # Docker configuration สำหรับ Development
│   ├── Dockerfile           # Docker configuration สำหรับ Production (Multi-stage)
│   └── package.json         # รายการ libraries และ dependencies
├── frontend/                # ฝั่ง User Interface (React + Vite + MUI)
│   ├── src/                 # ไฟล์ Source Code ของ Frontend
│   ├── Dockerfile.dev       # Docker configuration สำหรับ Development
│   └── package.json         # รายการ libraries และ dependencies
├── db/                      # ไฟล์และสคริปต์เกี่ยวกับฐานข้อมูล
│   └── init/
│       └── 01-init.sql      # สคริปต์ตั้งค่า Table & Data เริ่มต้น (utf8mb4)
└── docs/                    # เอกสารเกี่ยวกับระบบ
    └── planning/
        └── 00-tech-stack-decision.md # เอกสารนี้
```

## 9. Constraints
1. **No direct file saving on Server:** Railway คอนเทนเนอร์ไม่เก็บรักษาไฟล์รูปภาพหรือเอกสารแบบถาวร
2. **macOS Port 5000 Limit:** ไม่สามารถใช้พอร์ต 5000 สำหรับ Backend ได้เนื่องจากชนกับระบบปฏิบัติการ macOS Monterey ขึ้นไป
3. **CPU Architecture mismatch:** เครื่อง Mac M1/M2/M3/M4 มีสถาปัตยกรรมแบบ ARM64 ในขณะที่บาง images ใน Docker registry เช่น phpMyAdmin มักพัฒนาสำหรับ AMD64 เป็นหลัก จึงต้องระบุ platform แยกต่างหาก

## 10. Assumptions
1. ผู้ใช้งานทั่วไปจะเข้าใช้ระบบนี้เป็น Web Application ผ่านสมาร์ตโฟน แท็บเล็ต หรือแล็ปท็อป
2. ทุกฝ่ายที่พัฒนาระบบจะมี Docker ติดตั้งบนเครื่องและมีระบบที่สามารถรัน Docker Compose ได้
3. ฐานข้อมูลเริ่มต้นจะถูกรันอยู่ใน Docker Compose ในขณะพัฒนา แต่บน Production จะเชื่อมต่อผ่าน Managed DB หรือ Database addon ของ Cloud Provider

## 11. Open Questions (ประเด็นรอการตอบ/ตัดสินใจเพิ่มเติม)
* *Database Architecture ใน Production:* ในฝั่ง Production เราจะใช้ Addon Database ของ Railway หรือใช้บริการ Cloud DB ภายนอกอื่นๆ?
* *Authentication Provider:* สถานศึกษามีระบบ Authentication กลาง (OAuth/SSO) ที่ต้องการให้เชื่อมต่อหรือไม่ หรือพัฒนาตัวลงทะเบียน/เข้าสู่ระบบเองตั้งแต่เริ่มต้น?
* *Time-slot Lock details:* การจองโต๊ะจะมีช่วงเวลาจองเป็นชั่วโมง เป็นช่วงเวลาคาบเรียน หรือเป็นแบบจองตลอดทั้งวัน?

## 12. Key Decisions
* **เลือกใช้ Port 5001 สำหรับ Express backend:** ป้องกันการชนกับฟังก์ชัน AirPlay Reciever บน macOS
* **การใช้ Docker Custom Network:** ทุก containers สื่อสารกันผ่าน custom bridge network `booking_network` เพื่อความปลอดภัยและความรวดเร็วในการเรียกหากันผ่าน service names
* **ใช้ Single-Container Multi-Stage Build:** เพื่อประหยัดทรัพยากรบน Railway ในขั้นตอนการ Deploy โดยการแพ็กหน้าบ้านและหลังบ้านไว้บน container เดียวกัน
* **Anonymous Volume สำหรับ `node_modules`:** ป้องกันไม่ให้ dependencies บนเครื่อง host ย้อนกลับไปเขียนทับ dependencies ภายใน container

## 13. Docker Service Map & Port Mapping

| Service Name | Image | Host Port | Container Port | Purpose | Variable Reference |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **frontend** | Vite (Custom build) | `5173` | `5173` | UI / Client Side | `${VITE_PORT:-5173}` |
| **backend** | Express (Custom build) | `5001` | `5001` | REST API | `${PORT:-5001}` |
| **db** | MySQL 8.0 | `3307` | `3306` | Relational Database | `${MYSQL_LOCAL_PORT:-3307}` |
| **phpmyadmin**| phpmyadmin:latest | `8081` | `80` | Database management tool | - |

## 14. Docker Network Rules
* คอนเทนเนอร์ทั้งหมดเชื่อมต่อผ่าน Custom Bridge Network ชื่อ `booking_network`
* **Backend** และ **phpMyAdmin** จะระบุปลายทางการเชื่อมต่อไปยัง MySQL โดยใช้ hostname คือ `db` และ Port `3306`
* ห้ามเชื่อมต่อไปยังฐานข้อมูลด้วยการใช้ `localhost` หรือ IP `127.0.0.1` ภายใน Backend เนื่องจากจะมองเห็นเฉพาะตัวคอนเทนเนอร์ตัวเอง

## 15. Environment Variable Strategy
* ใช้ไฟล์ `.env` ที่ root directory ในการตั้งค่าการทำงานทั้งหมดสำหรับ Local development
* การดึงค่าใน `docker-compose.yml` จะเขียนในรูปแบบ `${VARIABLE:-default_value}` เพื่อป้องกันระบบพังหากผู้พัฒนาไม่ได้ระบุค่าตัวแปรเหล่านั้นไว้
* บน Production (เช่น Railway) จะใส่ผ่าน System environment variables บน Control panel เพื่อความปลอดภัยและเป็นความลับตามหลักการ 12-Factor App

## 16. Known Setup Risks / Lessons Learned
* **AirPlay Port Collision:** หลีกเลี่ยงพอร์ต 5000 โดยเปลี่ยนพอร์ต Backend ไปที่ 5001 เพื่อไม่ให้ชนกับระบบ AirPlay บนเครื่อง macOS
* **Apple Silicon Warning for phpMyAdmin:** ใน Apple Silicon (M1/M2/M3/M4) คอนเทนเนอร์ของ phpMyAdmin อาจค้างหรือไม่สามารถสตาร์ทได้ แก้ไขโดยการใส่บรรทัด `platform: linux/amd64` ใน `docker-compose.yml`
* **Docker Compose File Version Warning:** ไม่ระบุ `version: "3.8"` (หรืออื่นๆ) ที่ด้านบนสุดของไฟล์ `docker-compose.yml` เนื่องจากเป็นรูปแบบล้าสมัยสำหรับ Docker Compose รุ่นใหม่ และช่วยหลีกเลี่ยงคำเตือนการแสดงสเตตัส Deprecated
* **Anonymous Node Modules Volume:** ป้องกัน Host OS ทับ dependencies ใน Docker Container โดยกำหนด Anonymous volume ครอบ `/app/node_modules` เอาไว้ อย่างไรก็ตาม หากผู้พัฒนามีการอัปเดต package ใหม่ในไฟล์ `package.json` จะต้องใช้คำสั่งรันสร้าง container ใหม่อีกรอบ (Rebuild container) เพื่อดึง package ใหม่มาติดตั้งลงไป
* **Database Startup Dependency:** หาก Express backend พยายามเชื่อมต่อไปยัง MySQL ก่อนที่ DB จะพร้อมสตาร์ททำงาน (มักใช้เวลา 10-15 วินาทีในการ Initialize สิทธิ์และข้อมูลแรกเริ่ม) จะส่งผลให้แอปหลังบ้านแครชและปิดตัวลง จึงต้องตั้งค่า `healthcheck` ที่ service `db` และระบุ `depends_on` แบบ `condition: service_healthy` ที่ตัว backend/frontend
