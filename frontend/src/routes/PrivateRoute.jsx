import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useAuth } from '../hooks/useAuth.jsx';

/**
 * PrivateRoute — Route Guard สำหรับกั้นการเข้าถึงหน้าที่ต้องผ่านการล็อกอิน
 *
 * Props:
 * - allowedRoles: string[] — บทบาทที่ได้รับอนุญาต ถ้าไม่ระบุ = ทุก role ที่ล็อกอินแล้วเข้าได้
 *
 * พฤติกรรม:
 * 1. loading=true  → แสดง Spinner รอตรวจสอบสิทธิ์จาก /auth/me
 * 2. ไม่มี user   → Redirect ไปหน้า /login
 * 3. มี user แต่ role ไม่ตรง → Redirect กลับหน้าแรก /
 * 4. มี user และ role ตรง → เรนเดอร์ <Outlet /> ตามปกติ
 */
export default function PrivateRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  // กำลังตรวจสอบสิทธิ์ครั้งแรก (เช่น หลัง refresh หน้าเว็บ)
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">
          กำลังตรวจสอบสิทธิ์การเข้าถึง...
        </Typography>
      </Box>
    );
  }

  // ยังไม่ได้ล็อกอิน → ส่งไปหน้า Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // มี role จำกัด และ user ไม่มีสิทธิ์ → ส่งกลับหน้าแรก
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // ผ่านทุกเงื่อนไข → เรนเดอร์ children route
  return <Outlet />;
}
