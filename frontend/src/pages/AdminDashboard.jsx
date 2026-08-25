import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function AdminDashboard() {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        ระบบจัดการผู้ดูแลระบบ (Admin Dashboard)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        เมนูกลางสำหรับบริหารจัดการโซนโรงอาหาร โต๊ะ ผู้ใช้งานระบบ และสถิติต่างๆ
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
        <Typography variant="body1">ยินดีต้อนรับสู่ระบบควบคุมและดูแลความสงบเรียบร้อย Canteen Table Booking System</Typography>
      </Card>
    </Box>
  );
}
