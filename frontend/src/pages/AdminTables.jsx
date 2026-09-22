import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import { useAuth } from '../hooks/useAuth.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function tableStatusBadge(status) {
  switch (status) {
    case 'available':
      return { label: 'ว่าง (Available)', color: 'success' };
    case 'pending_checkin':
      return { label: 'รอเช็คอิน (Pending)', color: 'warning' };
    case 'occupied':
      return { label: 'กำลังใช้งาน (Occupied)', color: 'error' };
    case 'need_cleaning':
      return { label: 'รอทำความสะอาด (Need Clean)', color: 'warning' };
    case 'cleaning':
      return { label: 'กำลังทำความสะอาด (Cleaning)', color: 'info' };
    case 'maintenance':
      return { label: 'ปิดซ่อมบำรุง (Maintenance)', color: 'default' };
    default:
      return { label: status, color: 'default' };
  }
}

export default function AdminTables() {
  const { token } = useAuth();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'ดึงข้อมูลโต๊ะอาหารไม่สำเร็จ');
      }
      setTables(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [token]);

  const handleUpdateStatus = async (tableId, newStatus) => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/v1/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'อัปเดตสถานะโต๊ะไม่สำเร็จ');
      }
      setSuccessMsg(`อัปเดตสถานะโต๊ะเรียบร้อยแล้วเป็น "${newStatus}"`);
      fetchTables();
    } catch (err) {
      setError(err.message);
    }
  };

  // Group zones
  const zones = Array.from(new Set(tables.map((t) => t.zone_name).filter(Boolean)));

  const filteredTables = tables.filter((t) => {
    if (selectedZone === 'all') return true;
    return t.zone_name === selectedZone;
  });

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            จัดการผังโต๊ะอาหาร (Admin Tables)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            บริหารจัดการสถานะโต๊ะอาหาร ควบคุมการเปิดใช้งาน ปิดซ่อมบำรุง หรือแจ้งทำความสะอาด
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchTables}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          รีเฟรช
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ p: 2, background: 'rgba(25, 30, 38, 0.65)', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">
              โต๊ะทั้งหมด
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
              {tables.length} โต๊ะ
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ p: 2, background: 'rgba(25, 30, 38, 0.65)', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">
              พร้อมใช้งาน (Available)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
              {tables.filter((t) => t.status === 'available').length} โต๊ะ
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ p: 2, background: 'rgba(25, 30, 38, 0.65)', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">
              กำลังใช้งาน (Occupied)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
              {tables.filter((t) => t.status === 'occupied' || t.status === 'pending_checkin').length} โต๊ะ
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ p: 2, background: 'rgba(25, 30, 38, 0.65)', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">
              ปิดซ่อมบำรุง (Maintenance)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'warning.main' }}>
              {tables.filter((t) => t.status === 'maintenance').length} โต๊ะ
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Card
        sx={{
          background: 'rgba(25, 30, 38, 0.65)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 3,
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            รายการโต๊ะอาหารทั้งหมด
          </Typography>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>เลือกโซน</InputLabel>
            <Select
              value={selectedZone}
              label="เลือกโซน"
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              <MenuItem value="all">ทุกโซน ({tables.length})</MenuItem>
              {zones.map((z) => (
                <MenuItem key={z} value={z}>
                  {z} ({tables.filter((t) => t.zone_name === z).length})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>หมายเลขโต๊ะ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>โซน</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>พิกัดผัง (X, Y)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>รหัส QR Hash</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>สถานะปัจจุบัน</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>ปรับสถานะด่วน</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTables.map((tbl) => {
                  const badge = tableStatusBadge(tbl.status);
                  return (
                    <TableRow key={tbl.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TableRestaurantIcon sx={{ color: 'primary.light' }} />
                          <Typography variant="body1" sx={{ fontWeight: 800 }}>
                            {tbl.table_number}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tbl.zone_name || '-'}
                          size="small"
                          variant="outlined"
                          color={tbl.is_staff_only ? 'secondary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          Col: {tbl.layout_x}, Row: {tbl.layout_y}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                          {tbl.qr_code_hash ? `${tbl.qr_code_hash.substring(0, 10)}...` : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={badge.label} color={badge.color} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {tbl.status !== 'available' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleUpdateStatus(tbl.id, 'available')}
                              sx={{ borderRadius: 2 }}
                            >
                              เปิดใช้งาน
                            </Button>
                          )}
                          {tbl.status !== 'maintenance' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              startIcon={<BuildIcon />}
                              onClick={() => handleUpdateStatus(tbl.id, 'maintenance')}
                              sx={{ borderRadius: 2 }}
                            >
                              ปิดซ่อม
                            </Button>
                          )}
                          {tbl.status !== 'need_cleaning' && tbl.status !== 'cleaning' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="info"
                              startIcon={<CleaningServicesIcon />}
                              onClick={() => handleUpdateStatus(tbl.id, 'need_cleaning')}
                              sx={{ borderRadius: 2 }}
                            >
                              แจ้งแม่บ้าน
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
