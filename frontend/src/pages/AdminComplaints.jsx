import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { useAuth } from '../hooks/useAuth.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function statusBadge(status) {
  switch (status) {
    case 'pending_review':
      return { label: 'รอตรวจสอบ', color: 'warning' };
    case 'investigating':
      return { label: 'กำลังตรวจสอบ', color: 'info' };
    case 'resolved':
      return { label: 'แก้ไขแล้ว', color: 'success' };
    case 'rejected':
      return { label: 'ยกเลิก/ปฏิเสธ', color: 'default' };
    default:
      return { label: status || '-', color: 'default' };
  }
}

export default function AdminComplaints() {
  const { token, user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [tabFilter, setTabFilter] = useState('all');

  // Dialog State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionType, setActionType] = useState(null); // 'resolve' | 'reject' | 'view'
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'ดึงข้อมูลเรื่องร้องเรียนไม่สำเร็จ');
      }
      setComplaints(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [token]);

  const handleAssign = async (complaintId) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/complaints/${complaintId}/assign`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'ไม่สามารถรับเรื่องได้');
      }
      setSuccessMsg('รับเรื่องตรวจสอบเรียบร้อยแล้ว');
      fetchComplaints();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusSubmit = async () => {
    if (!selectedComplaint || !actionType) return;
    setSubmitting(true);
    setError(null);

    const targetStatus = actionType === 'resolve' ? 'resolved' : 'rejected';

    try {
      const res = await fetch(`${API_URL}/api/v1/complaints/${selectedComplaint.complaint_id || selectedComplaint.id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: targetStatus,
          remarks: remarks || (targetStatus === 'resolved' ? 'แอดมินตรวจสอบและยืนยันการลงโทษ' : 'แอดมินยกเลิกคำร้องเรียน'),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'ปรับปรุงสถานะไม่สำเร็จ');
      }

      setSuccessMsg(`อัปเดตสถานะเป็น "${targetStatus === 'resolved' ? 'แก้ไขแล้ว' : 'ยกเลิก'}" เรียบร้อยแล้ว`);
      handleCloseDialog();
      fetchComplaints();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDialog = (complaint, type) => {
    setSelectedComplaint(complaint);
    setActionType(type);
    setRemarks('');
  };

  const handleCloseDialog = () => {
    setSelectedComplaint(null);
    setActionType(null);
    setRemarks('');
  };

  const filteredComplaints = complaints.filter((c) => {
    if (tabFilter === 'all') return true;
    return c.status === tabFilter;
  });

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            จัดการเรื่องร้องเรียน (Admin Complaints)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ตรวจสอบข้อร้องเรียนจากทุกช่องทาง ดูหลักฐาน และตัดสินการละเมิดกฎ
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchComplaints}
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

      <Card
        sx={{
          background: 'rgba(25, 30, 38, 0.65)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 3,
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={tabFilter}
            onChange={(e, val) => setTabFilter(val)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label={`ทั้งหมด (${complaints.length})`} value="all" />
            <Tab
              label={`รอตรวจสอบ (${complaints.filter((c) => c.status === 'pending_review').length})`}
              value="pending_review"
            />
            <Tab
              label={`กำลังตรวจสอบ (${complaints.filter((c) => c.status === 'investigating').length})`}
              value="investigating"
            />
            <Tab
              label={`แก้ไขแล้ว (${complaints.filter((c) => c.status === 'resolved').length})`}
              value="resolved"
            />
            <Tab
              label={`ปฏิเสธ (${complaints.filter((c) => c.status === 'rejected').length})`}
              value="rejected"
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : filteredComplaints.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ไม่พบรายการเรื่องร้องเรียนในหมวดนี้
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>โต๊ะ / โซน</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ประเภทข้อร้องเรียน</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ผู้แจ้ง</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>เวลาแจ้ง</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>สถานะ</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>การจัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComplaints.map((item) => {
                  const cid = item.complaint_id || item.id;
                  const badge = statusBadge(item.status);
                  return (
                    <TableRow key={cid} hover>
                      <TableCell sx={{ fontWeight: 600 }}>#{cid}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.light' }}>
                          {item.table_number || `โต๊ะ #${item.table_id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.zone_name || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.complaint_type || item.type_name || 'เรื่องร้องเรียนทั่วไป'}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            maxWidth: 220,
                          }}
                        >
                          {item.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.reporter_name || item.reporter_username || 'นิรนาม'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(item.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={badge.label} color={badge.color} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="ดูรายละเอียด">
                            <IconButton size="small" onClick={() => handleOpenDialog(item, 'view')}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {item.status === 'pending_review' && (
                            <Tooltip title="รับเรื่องตรวจสอบ">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleAssign(cid)}
                              >
                                <AssignmentIndIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {(item.status === 'pending_review' || item.status === 'investigating') && (
                            <>
                              <Tooltip title="ตัดสินลงโทษ / แก้ไขแล้ว">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleOpenDialog(item, 'resolve')}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="ปฏิเสธ / ยกเลิกคำร้อง">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenDialog(item, 'reject')}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Dialog for View or Action */}
      <Dialog open={Boolean(selectedComplaint)} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedComplaint && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>
              {actionType === 'view' && `รายละเอียดเรื่องร้องเรียน #${selectedComplaint.complaint_id || selectedComplaint.id}`}
              {actionType === 'resolve' && 'ยืนยันการตัดสินลงโทษ (หักคะแนน / แก้ไขแล้ว)'}
              {actionType === 'reject' && 'ยืนยันการปฏิเสธ / ยกเลิกคำร้องเรียน'}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle2" color="text.secondary">
                โต๊ะ: <strong>{selectedComplaint.table_number || selectedComplaint.table_id}</strong> | ประเภท:{' '}
                <strong>{selectedComplaint.complaint_type || selectedComplaint.type_name}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5, p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                {selectedComplaint.description}
              </Typography>

              {/* Evidence image preview */}
              {selectedComplaint.evidence_image_path && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    ภาพหลักฐาน:
                  </Typography>
                  <Box
                    component="img"
                    src={selectedComplaint.evidence_image_path.startsWith('data:') ? selectedComplaint.evidence_image_path : `${API_URL}/${selectedComplaint.evidence_image_path}`}
                    alt="หลักฐาน"
                    sx={{
                      maxHeight: 250,
                      width: '100%',
                      objectFit: 'contain',
                      borderRadius: 2,
                      bgcolor: 'black',
                    }}
                  />
                </Box>
              )}

              {(actionType === 'resolve' || actionType === 'reject') && (
                <TextField
                  fullWidth
                  label="บันทึกหมายเหตุการตัดสิน (Remarks)"
                  placeholder="ระบุเหตุผลหรือรายละเอียดการตรวจสอบ..."
                  multiline
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  sx={{ mt: 2.5 }}
                />
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDialog} disabled={submitting}>
                ปิด
              </Button>
              {actionType === 'resolve' && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleStatusSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'กำลังบันทึก...' : 'ยืนยันการลงโทษ'}
                </Button>
              )}
              {actionType === 'reject' && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleStatusSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'กำลังบันทึก...' : 'ยืนยันปฏิเสธ'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
