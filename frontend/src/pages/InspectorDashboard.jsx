import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useAuth } from '../hooks/useAuth.jsx';
import { useSSE } from '../hooks/useSSE.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function statusLabel(status) {
  switch (status) {
    case 'pending_review':
      return { label: 'รอตรวจสอบ', color: 'warning' };
    case 'investigating':
      return { label: 'กำลังตรวจสอบ', color: 'info' };
    case 'resolved':
      return { label: 'แก้ไขแล้ว', color: 'success' };
    case 'rejected':
      return { label: 'ปฏิเสธ', color: 'default' };
    default:
      return { label: status || 'ระบุสถานะ', color: 'default' };
  }
}

export default function InspectorDashboard() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());

  const fetchComplaints = async (showLoadingIndicator = true) => {
    if (!token) {
      return;
    }

    if (showLoadingIndicator) {
      setLoading(true);
    }
    
    try {
      const response = await fetch(`${API_URL}/api/v1/complaints`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || 'ไม่สามารถโหลดรายการร้องเรียนได้');
      }

      setComplaints(Array.isArray(resData.data) ? resData.data : []);
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message || 'ไม่สามารถโหลดรายการร้องเรียนได้' });
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
    }
  };

  // Connect to SSE stream to auto-refresh complaints list on notifications
  useSSE({
    onNotification: (notif) => {
      console.log('🔔 [Inspector] Received SSE notification, reloading complaints list...');
      fetchComplaints(false); // reload quietly in background
    },
  });

  // Local clock to dynamically compute SLA duration
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [token]);

  const handleAssign = async (complaintId) => {
    setUpdatingId(complaintId);
    try {
      const response = await fetch(`${API_URL}/api/v1/complaints/${complaintId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || 'ไม่สามารถรับเรื่องได้');
      }

      setFeedback({ severity: 'success', message: 'รับเรื่องเรียบร้อยแล้ว' });
      await fetchComplaints();
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message || 'ไม่สามารถรับเรื่องได้' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (complaint, nextStatus) => {
    setUpdatingId(complaint.complaint_id);
    try {
      const response = await fetch(`${API_URL}/api/v1/complaints/${complaint.complaint_id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nextStatus,
          remarks: nextStatus === 'resolved' ? 'ยืนยันคำร้องเรียนและดำเนินการตามกฎระเบียบ' : 'ปฏิเสธคำร้องเรียนและยกเลิกการดำเนินการ',
          verify_violation: nextStatus === 'resolved',
          target_user_id: complaint.reporter_user_id || null,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || 'อัปเดตสถานะไม่สำเร็จ');
      }

      setFeedback({ severity: 'success', message: nextStatus === 'resolved' ? 'ยืนยันคำร้องเรียนเรียบร้อยแล้ว' : 'ปฏิเสธคำร้องเรียนเรียบร้อยแล้ว' });
      await fetchComplaints();
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message || 'อัปเดตสถานะไม่สำเร็จ' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        ศูนย์ตรวจสอบร้องเรียน (Inspector Console)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        สำหรับสารวัตรโรงอาหารเพื่อตรวจสอบข้อร้องเรียนการกั๊กโต๊ะและลงโทษตัดคะแนน
      </Typography>

      {feedback && (
        <Alert severity={feedback.severity} sx={{ mb: 2, borderRadius: 2 }}>
          {feedback.message}
        </Alert>
      )}

      <Card
        sx={{
          background: 'rgba(25, 30, 38, 0.65)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}
      >
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : complaints.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <Typography color="text.secondary">ยังไม่มีคำร้องเรียนในระบบ</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {complaints.map((complaint) => {
              const status = statusLabel(complaint.status);
              const isBusy = updatingId === complaint.complaint_id;

              // SLA Breach detection: status 'pending_review' for more than 5 minutes
              const isSLABreached =
                complaint.status === 'pending_review' &&
                complaint.created_at &&
                (nowTick - new Date(complaint.created_at).getTime() > 5 * 60 * 1000);

              return (
                <ListItem
                  key={complaint.complaint_id}
                  sx={{
                    py: 2.5,
                    px: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    borderLeft: isSLABreached ? '4px solid #ef4444' : 'none',
                    '&:last-child': { borderBottom: 'none' },
                    // Pulse animation for SLA Breach
                    animation: isSLABreached ? 'pulse-danger 1.5s infinite ease-in-out' : 'none',
                    '@keyframes pulse-danger': {
                      '0%': { backgroundColor: 'transparent' },
                      '50%': { backgroundColor: 'rgba(239, 68, 68, 0.12)' },
                      '100%': { backgroundColor: 'transparent' },
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {complaint.type_name || 'ข้อร้องเรียน'}
                      </Typography>
                      <Chip label={isSLABreached ? 'ล่าช้า SLA (ด่วนที่สุด)' : status.label} color={isSLABreached ? 'error' : status.color} size="small" />
                      {isSLABreached && (
                        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 800 }}>
                          🚨 SLA BREACHED (เกิน 5 นาที)
                        </Typography>
                      )}
                    </Box>
                    <ListItemText
                      primary={`โต๊ะ ${complaint.table_number || complaint.table_id} · ${complaint.reporter_name || 'ไม่ระบุผู้แจ้ง'}`}
                      secondary={`${complaint.description || '-'} · ส่งเมื่อ ${formatDate(complaint.created_at)}`}
                    />
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    {complaint.status === 'pending_review' && (
                      <Button variant="outlined" size="small" onClick={() => handleAssign(complaint.complaint_id)} disabled={isBusy}>
                        {isBusy ? <CircularProgress size={16} color="inherit" /> : 'รับเรื่อง'}
                      </Button>
                    )}
                    <Button variant="contained" color="success" size="small" onClick={() => handleStatusChange(complaint, 'resolved')} disabled={isBusy}>
                      {isBusy ? <CircularProgress size={16} color="inherit" /> : 'ยืนยัน'}
                    </Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleStatusChange(complaint, 'rejected')} disabled={isBusy}>
                      {isBusy ? <CircularProgress size={16} color="inherit" /> : 'ปฏิเสธ'}
                    </Button>
                  </Stack>
                </ListItem>
              );
            })}
          </List>
        )}
      </Card>
    </Box>
  );
}
