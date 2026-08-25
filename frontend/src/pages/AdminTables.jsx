import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

export default function AdminTables() {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        จัดการผังโต๊ะอาหาร (Admin Tables)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        เพิ่ม ลบ แก้ไขแผนที่ และพิกัดโต๊ะอาหารในโรงอาหาร
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
        <Typography variant="body1">ส่วนตั้งค่าและจัดการตำแหน่งโต๊ะอาหารจะแสดงที่นี่ใน Phase 11</Typography>
      </Card>
    </Box>
  );
}
