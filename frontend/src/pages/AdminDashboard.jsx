import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import ReportIcon from '@mui/icons-material/Report';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import { useAuth } from '../hooks/useAuth.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canteenStatus, setCanteenStatus] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [statusRes, complaintsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/dashboard/canteen-status`, { headers }),
        fetch(`${API_URL}/api/v1/complaints`, { headers }),
        fetch(`${API_URL}/api/v1/admin/users`, { headers }),
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        setCanteenStatus(data.data);
      }
      if (complaintsRes.ok) {
        const data = await complaintsRes.json();
        setComplaints(data.data || []);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อข้อมูลแดชบอร์ดได้: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const totalTables = canteenStatus?.total_tables || 0;
  const occupiedTables = canteenStatus?.occupied_tables || 0;
  const availableTables = canteenStatus?.available_tables || 0;
  const cleaningTables = canteenStatus?.cleaning_tables || 0;
  const occupancyRate = canteenStatus?.occupancy_rate || 0;

  const pendingComplaints = complaints.filter(
    (c) => c.status === 'pending_review' || c.status === 'investigating'
  ).length;

  const blacklistedUsers = users.filter((u) => u.is_blacklisted === 1).length;

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            ระบบจัดการผู้ดูแลระบบ (Admin Dashboard)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ศูนย์กลางควบคุม บริหารจัดการโซนโรงอาหาร โต๊ะ ผู้ใช้งาน และสถิติแบบเรียลไทม์
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          รีเฟรชข้อมูล
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Key Metric KPI Cards */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'rgba(25, 30, 38, 0.65)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="caption" color="text.secondary">
                    อัตราการใช้งานโต๊ะ
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.light' }}>
                    {occupancyRate}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, occupancyRate)}
                    sx={{ mt: 1.5, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    กำลังนั่ง {occupiedTables} จากทั้งหมด {totalTables} โต๊ะ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'rgba(25, 30, 38, 0.65)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="caption" color="text.secondary">
                    โต๊ะว่างพร้อมนั่ง
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                    {availableTables}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="text.secondary">
                      รอทำความสะอาด: {cleaningTables} โต๊ะ
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'rgba(25, 30, 38, 0.65)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="caption" color="text.secondary">
                    เรื่องร้องเรียนรอจัดการ
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      mt: 0.5,
                      color: pendingComplaints > 0 ? 'warning.main' : 'text.primary',
                    }}
                  >
                    {pendingComplaints}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    จากทั้งหมด {complaints.length} เรื่องร้องเรียน
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'rgba(25, 30, 38, 0.65)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="caption" color="text.secondary">
                    ผู้ใช้ทั้งหมด / ติด Blacklist
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'info.main' }}>
                    {users.length} <Typography component="span" variant="h6" color="error.light">({blacklistedUsers} แบน)</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    บัญชีในระบบที่ลงทะเบียน
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Module Navigation */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            เมนูการจัดการหลัก (Quick Actions)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                onClick={() => navigate('/admin/complaints')}
                sx={{
                  cursor: 'pointer',
                  p: 2.5,
                  borderRadius: 3,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: 'primary.main',
                    background: 'rgba(30, 41, 59, 0.8)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ReportIcon sx={{ fontSize: 36, color: 'warning.light' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      จัดการเรื่องร้องเรียน
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ตรวจสอบ ตรวจหลักฐาน และตัดสิน
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                onClick={() => navigate('/admin/tables')}
                sx={{
                  cursor: 'pointer',
                  p: 2.5,
                  borderRadius: 3,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: 'primary.main',
                    background: 'rgba(30, 41, 59, 0.8)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TableRestaurantIcon sx={{ fontSize: 36, color: 'success.light' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      จัดการผังโต๊ะอาหาร
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ตั้งค่าสถานะ เปิด/ปิด ซ่อมบำรุง
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                onClick={() => navigate('/admin/users')}
                sx={{
                  cursor: 'pointer',
                  p: 2.5,
                  borderRadius: 3,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: 'primary.main',
                    background: 'rgba(30, 41, 59, 0.8)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PeopleIcon sx={{ fontSize: 36, color: 'info.light' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      จัดการผู้ใช้ & Blacklist
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ปลดแบน และตรวจสอบคะแนน
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                onClick={() => navigate('/admin/settings')}
                sx={{
                  cursor: 'pointer',
                  p: 2.5,
                  borderRadius: 3,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: 'primary.main',
                    background: 'rgba(30, 41, 59, 0.8)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SettingsIcon sx={{ fontSize: 36, color: 'secondary.light' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ตั้งค่ากฎระเบียบ
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Grace period, รัศมี GPS, นโยบาย
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Zones Summary Breakdown */}
          {canteenStatus?.zones && (
            <Card
              sx={{
                background: 'rgba(25, 30, 38, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 3,
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                สถานะความหนาแน่นแยกรายโซน (Zone Breakdown)
              </Typography>
              <Grid container spacing={2}>
                {canteenStatus.zones.map((zone) => (
                  <Grid item xs={12} sm={4} key={zone.zone_id}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {zone.zone_name}
                        </Typography>
                        <Chip
                          label={`${zone.occupancy_rate}%`}
                          size="small"
                          color={zone.occupancy_rate > 70 ? 'error' : zone.occupancy_rate > 40 ? 'warning' : 'success'}
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        ใช้งาน: {zone.occupied} / {zone.total} โต๊ะ (ว่าง {zone.available})
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, zone.occupancy_rate)}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}
