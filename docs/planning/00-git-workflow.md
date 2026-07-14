# Git Workflow: ข้อกำหนดการจัดการ Git และกฎการทำ Commit

เอกสารฉบับนี้กำหนดกฎระเบียบและมาตรฐานการใช้งาน Git ในโครงการพัฒนา **ระบบจองโต๊ะโรงอาหารในสถานศึกษา** เพื่อช่วยให้มีจุดบันทึก (Restore Points) ที่ชัดเจนสำหรับการทำงานร่วมกับ AI และป้องกันไม่ให้เกิดความสับสนเมื่อต้องตรวจสอบย้อนหลังหรือทำการย้อนคืนระบบ (Rollback)

---

## 1. Branch Strategy
เพื่อความเสถียรและความเป็นระเบียบของระบบ จะใช้โมเดลการจัดการ Branch แบบง่ายแต่มีประสิทธิภาพ ดังนี้:
* **`main`:** เก็บ Source Code หลักที่เสถียรและผ่านการทดสอบสมบูรณ์แล้วเท่านั้น (Production Ready)
* **`develop`:** Branch หลักสำหรับการรวบรวมฟังก์ชันใหม่ ๆ จากฝั่งพัฒนา
* **`feature/[feature-name]`:** Branch ย่อยสำหรับสร้าง Feature ต่าง ๆ (เช่น `feature/table-reservation`, `feature/user-auth`) แยกย่อยออกไปจาก `develop`
* **`fix/[issue-name]`:** Branch สำหรับการแก้ปัญหาหรือแก้ไขบั๊ก (เช่น `fix/db-connection-retry`)

## 2. Commit Convention
โครงการพัฒนาด้วย AI นี้จะยึดถือมาตรฐาน **Conventional Commits** เพื่อแบ่งประเภทงานและสร้าง Git Log ที่เข้าใจง่าย โดยให้ใช้รูปแบบดังนี้:
* `feat`: เพิ่ม Feature ใหม่ให้กับระบบ (เช่น โค้ดปุ่มจองโต๊ะ, หน้าลงทะเบียน)
* `fix`: แก้ไขข้อผิดพลาดหรือข้อบกพร่อง (Bug Fix)
* `docs`: ปรับแต่งหรือเพิ่มเอกสารต่าง ๆ (เช่น Markdown, README)
* `style`: การแก้ไขเกี่ยวกับความสวยงาม เช่น การจัดฟอร์แมตโค้ด, การเว้นวรรค (ไม่มีผลกระทบต่อ Logic)
* `refactor`: การปรับปรุงสถาปัตยกรรมหรือตัวแปรให้สะอาดขึ้นโดยที่ระบบยังทำงานได้ตามเดิม
* `perf`: การปรับแต่งโค้ดเพื่อเพิ่มประสิทธิภาพการทำงาน
* `test`: การแก้ไขหรือเขียน Unit Test / Integration Test เพิ่มเติม
* `chore`: งานทั่วไปที่ไม่ได้แก้ไข source code หลัก เช่น การจัดพอร์ตใน docker-compose, การติดตั้ง package ใหม่

## 3. Commit Message Format
รูปแบบของ Commit Message ต้องมีโครงสร้างที่สม่ำเสมอ:
```text
<type>(<scope>): <subject>

[optional body]
```
* **Type:** ชนิดงานตามข้อตกลง (Conventional Commit type)
* **Scope:** พื้นที่หรือโมดูลที่ได้รับผลกระทบ (เช่น `frontend`, `backend`, `db`, `docker`, `planning`)
* **Subject:** คำอธิบายแบบสั้นในลักษณะปฏิเสธประธาน (Imperative present tense) และเริ่มต้นด้วยตัวพิมพ์เล็ก

## 4. When to Commit
ต้องทำการ Commit ในจังหวะที่งานย่อยมีสถานะเสถียรและทำงานได้ เพื่อสร้างประวัติตะกอนของการเปลี่ยนแปลงเป็นระยะ โดยกำหนดจังหวะ Commit หลัก ๆ ดังนี้:
* หลังจบแต่ละ **Planning Step** (เมื่อวิเคราะห์หรือจัดทำเอกสารสำคัญเสร็จสิ้น)
* หลังจบแต่ละ **Implementation Phase** (เมื่อพัฒนา component ย่อยเสร็จตามเช็คลิสต์และผลการทดสอบผ่าน)
* หลังทำการ **Bug Fix** เรียบร้อยแล้ว (ช่วยลดโอกาสทำบั๊กซ้ำซ้อน)

## 5. Commit per Planning Step
เมื่อจัดทำเอกสารความร่วมมือและการวิเคราะห์ตามระบบใน Phase 0 และ Phase 1 ให้ทำ commit ทันทีที่ USER เซ็นรับแผนงานนั้น ๆ:
* **Commit เมื่อทำ 00-tech-stack-decision.md:** `docs(planning): add tech stack decision`
* **Commit เมื่อทำ 00-ai-working-rules.md:** `docs(planning): add AI working rules`
* **Commit เมื่อทำ 01-system-overview.md:** `docs(planning): add system overview`
* **Commit เมื่อทำ PROJECT_CONTEXT.md:** `docs(planning): add project context`

## 6. Commit per Implementation Phase
เมื่อเขียนโค้ดเสร็จสิ้นตามแผนงานย่อยในแต่ละเฟส และระบบรันผ่านเช็คลิสต์ Acceptance Criteria ทั้งหมดเรียบร้อยแล้ว ให้ Commit งานในรูปของ:
* **ตัวอย่าง:** `feat(setup): complete phase 1 project setup`
* **ตัวอย่าง:** `feat(auth): complete phase 2 user authentication`

## 7. Commit after Bug Fix
เมื่อพบบั๊กและทำการแก้ไขโค้ดจนสามารถผ่าน Test Cases เดิมได้เรียบร้อย ให้สร้าง commit ทันทีเพื่อปิดจ็อบการแก้ปัญหา:
* **ตัวอย่าง:** `fix(backend): resolve backend database connection`
* **ตัวอย่าง:** `fix(frontend): resolve button layout crash on mobile`

## 8. Rollback Strategy
หาก AI เขียนโค้ดขัดแย้งหรือเกิดข้อผิดพลาดรุนแรงที่หาข้อสรุปไม่ได้ใน Turn ถัดไป ให้ดำเนินการดึงระบบกลับไปยังจุดที่ปลอดภัยดังนี้:
1. **ตรวจสอบ Log:** ใช้คำสั่ง `git log --oneline` เพื่อหา Commit hash ล่าสุดที่ระบบยังคงทำงานได้ปกติ
2. **Hard Reset (ฝั่งพัฒนา):** ใช้คำสั่ง `git reset --hard <commit-hash>` เพื่อรีเซ็ตโครงสร้าง source code ทั้งหมดกลับไปยังจังหวะนั้นทันที
3. **Re-create Local Containers:** ทำการสั่ง `docker-compose down` และสตาร์ทขึ้นมาใหม่เพื่อล้างข้อมูล memory เก่าที่อาจค้างอยู่ใน container

## 9. Files that Should Be Committed
รายการไฟล์ที่ต้องบันทึกลงในระบบ Git เสมอ:
* ซอร์สโค้ดของแอปพลิเคชันทั้งหมดใน `frontend/src/` และ `backend/src/`
* ไฟล์ตั้งค่า Docker ประกอบด้วย `docker-compose.yml`, `Dockerfile` และ `Dockerfile.dev`
* เอกสารสำหรับรันและประเมินโครงการใน `docs/` ทั้งหมด
* ไฟล์ตั้งค่า package dependencies ได้แก่ `package.json` และ `package-lock.json`
* สคริปต์ Database Schema เริ่มต้น `db/init/01-init.sql`

## 10. Files that Should Not Be Committed
ห้ามนำไฟล์ที่เปิดเผยความลับ ความปลอดภัยของข้อมูล หรือไฟล์ขยะชั่วคราวขึ้น repository โดยเด็ดขาด:
* ไฟล์ตัวแปรสภาพแวดล้อมจริง `.env` (ให้ใช้ `.env.example` แทน)
* โฟลเดอร์ดาวน์โหลด dependencies ท้องถิ่น `node_modules/`
* ไฟล์ Build assets ปลายทาง เช่น `dist/` หรือ `build/`
* ไฟล์ข้อมูลชั่วคราว หรือ log ต่าง ๆ (เช่น `.log`, `yarn-error.log`)
* โฟลเดอร์ตั้งค่าส่วนตัวของ IDE หรือ Editor บางชนิด (เช่น `.vscode/` หรือ `.idea/` ถ้าไม่ได้รับอนุญาต)

## 11. Suggested `.gitignore` Rules
เพื่อควบคุมไม่ให้ไฟล์นอกข้อตกลงหลุดรอดขึ้น Git ให้เขียนโครงสร้างไฟล์ `.gitignore` ที่ครอบคลุมดังนี้:

```text
# Dependency directories
node_modules/
jspm_packages/

# Build outputs
dist/
tmp/
out/
.next/

# Environment configurations
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database files
db_data/
mysql/data/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# OS metadata files
.DS_Store
Thumbs.db
```

## 12. Example Commit Messages
ตารางตัวอย่างการตั้งข้อความ Commit สำหรับนำไปใช้จริงในโครงการ:

| งานที่ดำเนินการสำเร็จ | ตัวอย่าง Commit Message |
| :--- | :--- |
| เขียนสรุปการตัดสินใจเทคโนโลยีเสร็จสิ้น | `docs: add tech stack decision` |
| สร้างกติกาการควบคุม AI ของโครงการ | `docs: add AI working rules` |
| ออกแบบสถาปัตยกรรมภาพรวมระบบเสร็จ | `docs: add system overview` |
| เพิ่มข้อมูลบริบทโครงการ | `docs: add project context` |
| ติดตั้งโครงการและ docker setup เฟส 1 สำเร็จ | `feat: complete phase 1 project setup` |
| แก้ไขปัญหา Backend ต่อ MySQL ไม่ได้ | `fix: resolve backend database connection` |
| อัปเดตพอร์ตการทำ docker compose | `chore: update docker compose configuration` |
