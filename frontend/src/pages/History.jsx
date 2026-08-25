import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

export default function History() {
  return (
    <Box sx={{ p: 1, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        ประวัติการใช้งานและคะแนนความประพฤติ
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        ตรวจสอบคะแนนประพฤติสะสมและประวัติการจองโต๊ะของท่าน
      </Typography>

      <Card
        sx={{
          background: 'rgba(25, 30, 38, 0.65)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              คะแนนความประพฤติสะสม
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main' }}>
              100 / 100
            </Typography>
          </Box>
          <Chip label="สถานะปกติ" color="success" variant="outlined" />
        </CardContent>
      </Card>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        ประวัติการจองล่าสุด
      </Typography>

      <Card
        sx={{
          background: 'rgba(25, 30, 38, 0.65)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}
      >
        <List disablePadding>
          <ListItem sx={{ py: 2 }}>
            <ListItemText
              primary="โต๊ะ T-01 (Zone A - ทั่วไป)"
              secondary="วันที่ 4 ส.ค. 2026 เวลา 12:00 - 12:30 น."
            />
            <Chip label="สำเร็จ" color="success" size="small" />
          </ListItem>
          <Divider sx={{ borderColor: 'divider' }} />
          <ListItem sx={{ py: 2 }}>
            <ListItemText
              primary="โต๊ะ T-02 (Zone A - ทั่วไป)"
              secondary="วันที่ 4 ส.ค. 2026 เวลา 11:30 - 11:40 น."
            />
            <Chip label="หมดเวลาเช็คอิน" color="error" size="small" />
          </ListItem>
        </List>
      </Card>
    </Box>
  );
}
