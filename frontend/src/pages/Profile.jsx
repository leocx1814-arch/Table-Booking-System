import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../hooks/useAuth.jsx';

/** แปลงชื่อ role เป็นภาษาไทยสำหรับแสดงผล */
const ROLE_LABELS = {
  student: 'นักเรียน',
  inspector: 'สารวัตรโรงอาหาร',
  executive: 'ผู้บริหาร',
  admin: 'ผู้ดูแลระบบ',
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // แสดงอักษรแรกของชื่อผู้ใช้เป็น Avatar fallback
  const avatarLetter = user?.first_name?.charAt(0)?.toUpperCase()
    || user?.username?.charAt(0)?.toUpperCase()
    || '?';

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    : '';

  return (
    <Box sx={{ p: 1, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        โปรไฟล์ผู้ใช้งาน
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        ข้อมูลส่วนตัวและบทบาทสิทธิ์ของคุณในระบบ
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
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
            {avatarLetter}
          </Avatar>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || ''}
            </Typography>
            {user?.role && (
              <Chip
                label={ROLE_LABELS[user.role] || user.role}
                color="primary"
                size="small"
                sx={{ mt: 1, fontWeight: 600 }}
              />
            )}
          </Box>

          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                pb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                ชื่อผู้ใช้งาน
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.username || '-'}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                pb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                บทบาทสิทธิ์
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {ROLE_LABELS[user?.role] || user?.role || '-'}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                pb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                คะแนนโทษสะสม
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: (user?.penalty_points || 0) > 0 ? 'warning.main' : 'success.main',
                }}
              >
                {user?.penalty_points ?? 0} คะแนน
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                สถานะบัญชี
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: user?.is_blacklisted ? 'error.main' : 'success.main',
                }}
              >
                {user?.is_blacklisted ? 'ถูกระงับการใช้งาน' : 'ใช้งานปกติ'}
              </Typography>
            </Box>
          </Box>

          <Button
            id="logout-btn"
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            fullWidth
            onClick={handleLogout}
            sx={{ mt: 2, fontWeight: 700 }}
          >
            ออกจากระบบ
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
