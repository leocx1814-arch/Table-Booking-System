import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

export default function AdminSettings() {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        ตั้งค่ากฎระเบียบและระบบ (Admin Settings)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        กำหนดเวลา Grace Period, ระยะ GPS รัศมีโรงอาหาร และการตั้งค่าระบบอื่นๆ
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
        <Typography variant="body1">ตารางปรับแต่งค่าระดับระบบ (System Settings) จะแสดงที่นี่ใน Phase 9/10</Typography>
      </Card>
    </Box>
  );
}
