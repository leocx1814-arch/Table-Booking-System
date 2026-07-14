# AI Working Rules: ข้อตกลงการทำงานร่วมกับ AI สำหรับระบบจองโต๊ะโรงอาหาร

เอกสารฉบับนี้กำหนดกฎระเบียบ ขั้นตอนการทำงาน และข้อห้ามสำคัญสำหรับการทำงานร่วมกันระหว่างผู้พัฒนา (USER) และ AI ในโครงการพัฒนา **ระบบจองโต๊ะโรงอาหารในสถานศึกษา** เพื่อความเป็นระเบียบ ความถูกต้องของสถาปัตยกรรม และความปลอดภัยของข้อมูล

---

## 1. General AI Rules
* **Role & Mindset:** AI ต้องทำหน้าที่เสมือนเป็น Senior Software Engineer และ Technical Lead ที่เน้นความเรียบร้อย ปลอดภัย รัดกุม และปฏิบัติตามกฎอย่างเคร่งครัด
* **Standard Enforcement:** AI ต้องปฏิบัติตามมาตรฐานโครงสร้างระบบที่ระบุไว้ในเอกสารนี้ และเอกสาร `docs/planning/00-tech-stack-decision.md` อย่างเคร่งครัด
* **No Unilateral Changes:** ห้ามเปลี่ยน Tech Stack หรือโครงสร้างพื้นฐานเดิมที่กำหนดไว้โดยไม่ได้รับการอนุญาตจาก USER ก่อน

## 2. Planning Rules
* **No Code Before Planning:** ห้ามเริ่มต้นเขียนโค้ด สร้างไฟล์โค้ด หรือแก้ไขไฟล์ระบบใด ๆ จนกว่าจะผ่านขั้นตอนการวางแผน (Planning) และได้รับการอนุมัติอย่างเป็นลายลักษณ์อักษรจาก USER
* **Detailed Planning:** การวางแผนต้องระบุเป้าหมาย (Goal) แผนภาพการทำงาน ข้อมูลนำเข้า/นำออก ผลกระทบต่อไฟล์อื่น ๆ วิธีการทดสอบ และแนวทางการกู้คืนกรณีที่เกิดปัญหา
* **Plan Modification:** หากพบปัญหาทางเทคนิคระหว่างการพัฒนาที่จำเป็นต้องเปลี่ยนแผนหรือข้ามสเต็ป AI ต้องแจ้งเหตุผลให้ทราบและเสนอแผนใหม่เพื่อรอการอนุมัติก่อนลงมือทำ

## 3. Implementation Rules
* **Focus on current task:** ทำงานตรงตามขอบเขตของขั้นตอนย่อยปัจจุบันเท่านั้น ห้ามทำเกินแผนหรือแอบทำ Feature อื่นที่ไม่ได้อยู่ในความต้องการ
* **Incremental Steps:** ดำเนินการแก้ไขโค้ดและสร้างระบบเป็นขั้นเป็นตอนทีละไฟล์หรือทีละส่วน เพื่อให้สามารถหาสาเหตุของข้อผิดพลาดได้ง่ายเมื่อพบบั๊ก
* **System Integrity:** รักษาความคิดเห็น (Comments) และรูปแบบเดิมของโค้ดที่มีอยู่แล้วในไฟล์ระบบ ยกเว้นในจุดที่เกิดการอัปเดตหรือปรับโครงสร้างตามแผนโดยตรง

## 4. Phase Control Rules
* **No Overlapping Phases:** ห้ามทำงานล้ำ Phase ปัจจุบัน เช่น ห้ามเขียน UI หน้าบ้านในขณะที่กำลังออกแบบ API ของหลังบ้าน
* **Phase Entry & Exit Criteria:** ทุก Phase ต้องมีการระบุกเกณฑ์การเริ่มต้นทำงาน และเกณฑ์การส่งมอบงาน (Acceptance Criteria) ที่ชัดเจน
* **Run & Test Instructions:** ทุก Phase ต้องมีวิธีการรันระบบและขั้นตอนการทดสอบ (Verification Steps) ทั้งระบบแมนนวลและแบบอัตโนมัติ เพื่อให้ USER ตรวจสอบได้
* **Phase Completion Report:** เมื่อเสร็จสิ้นในแต่ละ Phase ทาง AI ต้องส่งรายงานสรุปการทำงาน (Completion Report) ประกอบด้วย:
  - รายการสิ่งที่เปลี่ยนแปลง (ไฟล์ที่สร้าง/แก้ไข/ลบ)
  - ผลลัพธ์จากการทดสอบ (พร้อมภาพหรือข้อความ Log)
  - ปัญหาที่พบและการแก้ไข
  - คำแนะนำในการเริ่มต้นสเต็ปถัดไป

## 5. Code Generation Rules
* **Use Strict Type/Linting:** เขียนโค้ดที่สะอาดตามหลัก Clean Code และรูปแบบภาษา (เช่น ES6+, CSS variable ในสไตล์ Vanilla CSS)
* **Error Handling:** โค้ดทุกจุดต้องมี Exception/Error Handling ที่รัดกุม (เช่น `try-catch`, การรีเทิร์น HTTP Status Code ที่เหมาะสม, การล็อกข้อผิดพลาด)
* **Placeholder Prohibited:** ห้ามสร้าง placeholder, คอมเมนต์ TODO ทิ้งไว้ในโค้ดสำหรับการทำงานหลัก หรือตัดโค้ดบางส่วนออกด้วยข้อความ `// ...` โดยเด็ดขาด ต้องให้ไฟล์โค้ดที่พร้อมทำงานจริงอย่างสมบูรณ์
* **Responsive Layout:** โค้ดฝั่ง Frontend ต้องรองรับหน้าจอหลายขนาด (Desktop / Tablet / Mobile) เสมอ

## 6. Debugging Rules
* **Log Analysis First:** วิเคราะห์ปัญหาจาก log หรือหน้าจอ Error message ก่อนทำการเดาสาเหตุและแก้ไขโค้ดส่งเดช
* **Isolate Problems:** แยกประเด็นปัญหาให้ชัดเจนว่าเกิดจากฝั่ง Frontend, Backend หรือ Database
* **Log Cleanliness:** ห้ามใส่คำสั่งล็อกขยะ (เช่น `console.log("here")` หรือการล็อกรหัสผ่าน) ลงไปในโค้ดที่จะทำการ Commit ลง Production

## 7. Documentation Rules
* **Up-to-date Docs:** เอกสารประกอบโครงการ เช่น Database Schema, API Contract หรือคู่มือการติดตั้ง ต้องได้รับการปรับปรุงให้ตรงกับโค้ดล่าสุดเมื่อมีการเปลี่ยนแปลง
* **Clickable File Links:** ในรายงานหรือการสนทนา AI ต้องเขียนลิงก์ไฟล์เป็นรูป Markdown Link ที่กดได้ตามฟอร์แมต `[file basename](file:///path/to/file)`
* **Thai Language Standard:** การสื่อสารและคำอธิบายในเอกสารวางแผน/เอกสารระบบให้เน้นใช้ภาษาไทยเป็นหลัก ยกเว้นคำทับศัพท์เทคนิคสากล

## 8. Testing Rules
* **Unit/Integration Testing:** หากมีชุดทดสอบ (Test Suites) หรือ endpoint สำหรับทดสอบ ต้องระบุคำสั่งการรันที่ถูกต้องและต้องผ่านการรันสำเร็จก่อนการส่งมอบงาน
* **DB State Verification:** ตรวจสอบข้อมูลใน MySQL ฐานข้อมูลผ่านคำสั่ง SQL หรือการดึงข้อมูลเพื่อยืนยันว่า Transactions ทำงานได้อย่างสมบูรณ์

## 9. Git Commit Rules
* **Conventional Commits:** แนะนำ Commit Message ตามหลักสากลเสมอ โดยระบุคำนำหน้าให้ชัดเจน เช่น:
  - `feat:` เมื่อเพิ่ม Feature ใหม่
  - `fix:` เมื่อแก้ไขบั๊ก
  - `docs:` เมื่อแก้ไขเอกสาร
  - `refactor:` เมื่อปรับแต่งโครงสร้างโค้ดแต่พฤติกรรมคงเดิม
  - `chore:` เมื่ออัปเดต config หรือ package dependencies
* **Phase Commits:** นำเสนอ Commit Message สำหรับจุดสิ้นสุดของการทำงานย่อยในแต่ละ Phase เสมอ

## 10. Forbidden Actions
* ❌ ห้ามลบหรือเขียนทับไฟล์ข้อมูลใดๆ โดยไม่มีคำอธิบายและเหตุผล
* ❌ ห้ามแทรก Secrets, API Keys, Passwords หรือ Tokens ลงใน Source Code โดยตรง
* ❌ ห้ามเปลี่ยนสัญญาระบบ (API Contract) หรือฐานข้อมูล (Database Schema) กะทันหันโดยไม่ได้แจ้งล่วงหน้าและขออนุมัติจาก USER
* ❌ ห้ามดาวน์โหลดไฟล์ที่ไม่สามารถยืนยันความปลอดภัยได้ หรือรันคำสั่ง Shell ที่เสี่ยงต่อการแฮก/ระบบขัดข้อง

## 11. Required Output Format
* AI ต้องตอบข้อซักถามอย่างสั้นกระชับ (Concise)
* แสดงผลลัพธ์ด้วยรูปแบบ Markdown ที่อ่านง่ายและแบ่งหัวข้อชัดเจน
* หากเสนอแผนงานให้ใช้ Artifact: `implementation_plan.md` และหากรวบรวม Task งานให้ใช้ `task.md`

## 12. How AI Should Ask Questions
* ถามคำถามทีละประเด็นและมีความเฉพาะเจาะจง เลี่ยงคำถามกว้างๆ
* การถามเพื่อความกระจ่างในรายละเอียด ควรเสนอทางเลือก (เช่น ทางเลือก A, ทางเลือก B) พร้อมเปรียบเทียบข้อดี-ข้อเสีย เพื่อให้ USER ตัดสินใจได้ง่าย

## 13. How AI Should Handle Unclear Requirements
* หาก USER ป้อนคำสั่งหรือความต้องการที่คลุมเครือ AI ต้องไม่คาดเดาไปเองโดยพลการ แต่ต้องลิสต์ข้อสงสัยและสอบถามเพื่อยืนยันจุดประสงค์ที่แท้จริงเสียก่อน

## 14. How AI Should Report Changes
* ทุกครั้งที่มีการแก้ไข/สร้าง/ลบไฟล์ AI ต้องแจ้งผลสรุปเป็นรายการชัดเจนว่ามีผลกระทบอะไรต่อระบบส่วนอื่นบ้าง พร้อมทั้งส่งลิงก์ไฟล์ที่เกี่ยวข้องประกอบด้วย

## 15. Docker Development Rules
* **Development Environment:** จำลองระบบบน Local ผ่านเครื่องมือ Docker Compose (`docker-compose.yml`)
* **No Version Attribute:** ห้ามระบุ `version: "3.8"` หรือเวอร์ชันอื่น ๆ ที่ส่วนหัวของไฟล์ `docker-compose.yml` ตามมาตรฐาน Docker Compose ยุคปัจจุบัน
* **Dev Ports Configuration:**
  - Frontend: `5173`
  - Backend: `5001` (ห้ามใช้ `5000` เพื่อหลีกเลี่ยง macOS AirPlay Receiver)
  - MySQL Host Port: `3307` mapped to Container port `3306`
  - phpMyAdmin Host Port: `8081` mapped to Container port `80`
* **Apple Silicon Platform Support:** บริการใดที่รันยากหรือแครชบนสถาปัตยกรรม ARM64 (เช่น phpMyAdmin) ให้กำหนด `platform: linux/amd64` ใน Compose file
* **Volumes & Bind Mounts:**
  - ใช้ Bind Mount เพื่อซิงก์ Source Code ใน โฟลเดอร์ `frontend/` และ `backend/` สำหรับ Hot Reload
  - กำหนด Anonymous volume ที่ `/app/node_modules` เสมอ เพื่อลดปัญหาสถาปัตยกรรม Node Module ของ Host OS ปะปนกับ Container
* **Internal Network Name Resolution:**
  - การเชื่อมต่อภายในคอนเทนเนอร์ (เช่น Backend หรือ phpMyAdmin คุยกับฐานข้อมูล) ต้องระบุ hostname ปลายทางเป็น `db` และใช้ port `3306`
  - ห้ามใช้ `localhost` หรือ `127.0.0.1` ภายใน container ในการสื่อสารระหว่างกัน
* **Database Readiness Guard:**
  - บริการ MySQL (`db`) ต้องมี config การทำ `healthcheck`
  - บริการอื่น ๆ ที่ต้องรอความพร้อมของ DB (เช่น Backend หรือ phpMyAdmin) ต้องระบุ `depends_on` ด้วยรูปแบบ `condition: service_healthy`
* **Dependency Updates:** หากมีการลง package เสริมใหม่ใน `package.json` ต้องแนะนำให้ทำการ Rebuild Docker image ใหม่เสมอ ไม่ใช่รันเพียงการ restart คอนเทนเนอร์

## 16. Git / GitHub Workflow Rules
* **Pre-commit Checks:**
  - ก่อนทำการ git add / commit ให้รันคำสั่งเช็คสถานะและตรวจสอบว่าไม่มีไฟล์ความลับ (เช่น `.env`) หลุดรอดเข้าไปใน staging area
* **Exclusion via .gitignore:**
  - ตรวจสอบให้มั่นใจว่าไฟล์ `.gitignore` ครอบคลุม `.env`, `node_modules/`, โฟลเดอร์ build/dist (เช่น `dist/`), logs และไฟล์ config ท้องถิ่นเฉพาะเครื่อง
* **Documentation Maintenance:**
  - ไฟล์ `README.md` ต้องอัปเดตทันทีหากมีการปรับปรุงคำสั่งรันระบบ, Port, API Endpoint หลัก หรือโครงสร้างโฟลเดอร์โครงการ
* **GitHub CLI Usage:** สามารถใช้คำสั่งผ่าน `gh` CLI ได้ในบางกรณีที่ต้องการจัดการ PR/Issues แต่ห้ามกดทำกระบวนการยืนยันตัวตน (Login/Authorization) เองโดยไม่ได้ขออนุญาตผู้ใช้ก่อน
* **Sensitive Data Guard:** ห้ามนำข้อมูลสัญญาระบบจริง (Production credentials), token และข้อมูลส่วนบุคคลของจริง (PII) ขึ้น Git Repository โดยเด็ดขาด
* **README Structure:** กรณีที่ Repository ยังไม่มี `README.md` ที่สมบูรณ์ ให้เสนอโครงสร้าง README ซึ่งประกอบด้วย: Project name, Description, Tech Stack, installation/run instructions, port mapping, Docker commands, folder structure, และ license/owner

## 17. Skill / Project Instruction Rules
* **Rule & Context Loading:** AI ต้องเรียนรู้บริบทและข้อจำกัดของโปรเจกต์ผ่าน Project instruction และ Skills ที่เก็บไว้ในระบบก่อนทำงาน
* **Custom Skills Preference:** หากพบโฟลเดอร์ `.agents/skills/[skill-name]/SKILL.md` ให้ยึดเป็นแนวทางการปฏิบัติตามกฎและแนวทางเฉพาะของระบบนั้น ๆ ควบคู่ไปกับแผนการพัฒนา
* **Skill File Conventions:**
  - โฟลเดอร์ชื่อ skill ต้องเป็นภาษาอังกฤษอักษรเล็ก คั่นด้วยเครื่องหมายขีดกลาง (`-`) เสมอ (เช่น `canteen-booking-dev`)
  - ไฟล์ `SKILL.md` ต้องมีส่วนหัวเป็น YAML frontmatter ที่ประกอบด้วย `name` และ `description` ที่กระชับและตรงประเด็น
  - ภายในไฟล์ skill ควรประกอบไปด้วย: When to Use, When NOT to Use, Project Architecture, Service Map & Ports, Network Rules, Environment Variables, Commands, Coding Guidelines, Output Format และตัวอย่างประกอบ (Examples)
  - ข้อมูลขนาดใหญ่อื่น ๆ เช่น เอกสาร API spec หรือรายละเอียด DB schema ให้เขียนอ้างอิงและเชื่อมโยงผ่านลิงก์ไปยังไฟล์ใน `docs/planning/` แทนการฝังข้อมูลดิบทั้งหมดลงในไฟล์ Skill เพื่อป้องกันการบวมของไฟล์
  - เมื่อมีโครงสร้างหรือข้อกำหนดระบบเปลี่ยนไป AI ต้องเสนอการแก้ไขให้ไฟล์เอกสารวางแผนและไฟล์ Skill อัปเดตสอดคล้องกัน

## 18. Environment & Secret Handling Rules
* **Local Variables (.env):** ใช้ไฟล์ `.env` ใน Root ของโปรเจกต์ในการรันสำหรับพัฒนาในเครื่อง และมีไฟล์ `.env.example` เป็นตัวอย่างโครงสร้างตัวแปรเพื่อใช้แชร์ให้ทีมพัฒนาทราบ
* **No Secrets in Repo:** ห้ามเขียนค่า API Key หรือรหัสผ่านจริงไว้ในโค้ดต้นฉบับ เอกสาร หรือสคริปต์ที่อัปโหลดขึ้น git repository
* **Production Variables:** การจัดการ config/secrets บน Production (เช่น Railway) ต้องทำผ่าน UI Dashboard หรือ CLI ของ platform นั้น ๆ ในรูปแบบของ Environment variables เท่านั้น
* **Placeholder Usage:** ทุกครั้งที่แสดงตัวอย่าง Configuration, URL หรือ JSON response ในเอกสารและแชท ต้องใช้ค่าสมมุติ (Placeholder) เสมอ เช่น `YOUR_DATABASE_PASSWORD`, `https://api.yourdomain.com`
