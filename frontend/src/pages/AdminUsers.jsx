import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

export default function AdminUsers() {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        จัดการผู้ใช้ / Blacklist (Admin Users)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        จัดการรายชื่อผู้ใช้ สิทธิ์ และปลดบล็อก/แบนผู้ใช้งานที่ทำผิดกฎระเบียบ
      </Typography>

      <Card
        sx={{
          background: 'rgba(25, 30, 38, 0.65)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          p: 3,
        }}
      >
        <Typography variant="body1">รายชื่อผู้ใช้งานและการจัดการ Blacklist จะแสดงที่นี่ใน Phase 10</Typography>
      </Card>
    </Box>
  );
}
