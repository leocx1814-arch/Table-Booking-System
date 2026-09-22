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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import TuneIcon from '@mui/icons-material/Tune';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../hooks/useAuth.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function roleBadgeColor(role) {
  switch (role) {
    case 'admin':
      return 'primary';
    case 'inspector':
      return 'secondary';
    case 'cleaner':
      return 'warning';
    case 'executive':
      return 'info';
    case 'staff':
      return 'success';
    default:
      return 'default';
  }
}

export default function AdminUsers() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [selectedUser, setSelectedUser] = useState(null);
  const [pointsInput, setPointsInput] = useState(100);
  const [adjustReason, setAdjustReason] = useState('');
  const [dialogMode, setDialogMode] = useState(null); // 'unban' | 'points'
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'ดึงรายชื่อผู้ใช้ไม่สำเร็จ');
      }
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleUnban = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${selectedUser.id}/unban`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: adjustReason || 'Admin manual unban' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'ปลดแบนไม่สำเร็จ');
      }
      setSuccessMsg(`ปลดแบนและคืนคะแนนให้ ${selectedUser.username} เรียบร้อยแล้ว`);
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustPoints = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${selectedUser.id}/points`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points: pointsInput,
          reason: adjustReason || 'Admin adjustment',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'ปรับปรุงคะแนนไม่สำเร็จ');
      }
      setSuccessMsg(`ปรับปรุงคะแนนของ ${selectedUser.username} เป็น ${pointsInput} คะแนนเรียบร้อยแล้ว`);
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDialog = (u, mode) => {
    setSelectedUser(u);
    setDialogMode(mode);
    setPointsInput(u.penalty_points);
    setAdjustReason('');
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setDialogMode(null);
    setAdjustReason('');
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.first_name && u.first_name.toLowerCase().includes(q)) ||
      (u.last_name && u.last_name.toLowerCase().includes(q)) ||
      (u.student_id && u.student_id.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const blacklistedCount = users.filter((u) => u.is_blacklisted === 1).length;
  const normalCount = users.length - blacklistedCount;

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            จัดการผู้ใช้ / Blacklist (Admin Users)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            รายชื่อผู้ใช้งานทั้งหมด จัดการคะแนนความประพฤติ และปลดแบนผู้ใช้งานที่ติดระงับสิทธิ์
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchUsers}
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

      {/* Summary KPI */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2, background: 'rgba(25, 30, 38, 0.65)', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">
              ผู้ใช้ทั้งหมดในระบบ
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
              {users.length} บัญชี
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2, background: 'rgba(25, 30, 38, 0.65)', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">
              สถานะปกติ (จองได้)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
              {normalCount} บัญชี
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2, background: 'rgba(25, 30, 38, 0.65)', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">
              ติด Blacklist (ระงับสิทธิ์)
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
              {blacklistedCount} บัญชี
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* User Table Card */}
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
            รายชื่อผู้ใช้งานระบบ
          </Typography>
          <TextField
            size="small"
            placeholder="ค้นหาชื่อ, username, รหัสนักศึกษา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 280 }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ไม่พบผู้ใช้ที่ค้นหา
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ผู้ใช้งาน</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ชื่อ - นามสกุล</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>บทบาท (Role)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>รหัสนักศึกษา</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>คะแนนพฤติกรรม</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>สถานะการจอง</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>การจัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((u) => {
                  const isBanned = u.is_blacklisted === 1;
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {u.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {u.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {u.first_name} {u.last_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.role}
                          size="small"
                          color={roleBadgeColor(u.role)}
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {u.student_id || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${u.penalty_points} แต้ม`}
                          size="small"
                          color={u.penalty_points < 50 ? 'error' : u.penalty_points < 80 ? 'warning' : 'success'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        {isBanned ? (
                          <Chip
                            icon={<BlockIcon fontSize="small" />}
                            label="Blacklisted"
                            size="small"
                            color="error"
                            sx={{ fontWeight: 700 }}
                          />
                        ) : (
                          <Chip
                            icon={<CheckCircleOutlineIcon fontSize="small" />}
                            label="ปกติ"
                            size="small"
                            color="success"
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {isBanned && (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              startIcon={<LockOpenIcon />}
                              onClick={() => handleOpenDialog(u, 'unban')}
                              sx={{ borderRadius: 2 }}
                            >
                              ปลดแบน
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<TuneIcon />}
                            onClick={() => handleOpenDialog(u, 'points')}
                            sx={{ borderRadius: 2 }}
                          >
                            ปรับแต้ม
                          </Button>
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

      {/* Dialog for Unban or Adjust Points */}
      <Dialog open={Boolean(selectedUser)} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        {selectedUser && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>
              {dialogMode === 'unban'
                ? `ปลดแบนผู้ใช้งาน: ${selectedUser.username}`
                : `ปรับคะแนนพฤติกรรม: ${selectedUser.username}`}
            </DialogTitle>
            <DialogContent dividers>
              {dialogMode === 'unban' ? (
                <>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    การปลดแบนจะทำการคืนสิทธิ์การจองโต๊ะ และปรับคะแนนพฤติกรรมกลับเป็น <strong>100 แต้มเต็ม</strong>
                  </Typography>
                  <TextField
                    fullWidth
                    label="เหตุผลการปลดแบน"
                    placeholder="เช่น นักเรียนพ้นระยะเวลาลงโทษ, ได้รับการอุทธรณ์..."
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    คะแนนปัจจุบัน: <strong>{selectedUser.penalty_points} แต้ม</strong>
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    label="คะแนนใหม่ (0 - 100)"
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value)}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="เหตุผลในการปรับคะแนน"
                    placeholder="เช่น ให้แต้มจิตอาสา, หักคะแนนกรณีพิเศษ..."
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                  />
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDialog} disabled={actionLoading}>
                ยกเลิก
              </Button>
              {dialogMode === 'unban' ? (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleUnban}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'กำลังปลดแบน...' : 'ยืนยันปลดแบน'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAdjustPoints}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'กำลังบันทึก...' : 'บันทึกคะแนน'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
