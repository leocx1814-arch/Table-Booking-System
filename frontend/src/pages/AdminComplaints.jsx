import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

export default function AdminComplaints() {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        จัดการเรื่องร้องเรียน (Admin Complaints)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        ตรวจสอบรายละเอียดข้อร้องเรียนการจองโต๊ะและการแก้ไขปัญหาของเจ้าหน้าที่
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
        <Typography variant="body1">ตารางข้อมูลเรื่องร้องเรียนทั้งหมดจะแสดงที่ส่วนนี้ใน Phase 10</Typography>
      </Card>
    </Box>
  );
}
