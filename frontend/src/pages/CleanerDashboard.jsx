import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useAuth } from '../hooks/useAuth';
import { useSSE } from '../hooks/useSSE';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function getStatusMeta(status) {
  switch (status) {
    case 'need_cleaning':
      return { label: 'ต้องทำความสะอาด', color: 'warning', bg: 'rgba(250,204,21,0.16)', border: '1px solid rgba(250,204,21,0.24)' };
    case 'cleaning':
      return { label: 'กำลังทำความสะอาด', color: 'info', bg: 'rgba(96,165,250,0.16)', border: '1px solid rgba(96,165,250,0.24)' };
    case 'occupied':
      return { label: 'ถูกจอง', color: 'error', bg: 'rgba(248,113,113,0.16)', border: '1px solid rgba(248,113,113,0.24)' };
    default:
      return { label: 'ว่าง', color: 'success', bg: 'rgba(74,222,128,0.16)', border: '1px solid rgba(74,222,128,0.24)' };
  }
}

function normalizeTables(rows) {
  return rows.map((table) => ({
    ...table,
    tableNumber: table.table_number,
    zone: table.zone,
    capacity: table.capacity ?? (table.is_staff_only ? 6 : 4),
  }));
}

export default function CleanerDashboard() {
  const { token } = useAuth();
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());

  // Subscribe to real-time events via Server-Sent Events (SSE)
  const { connected, error: sseError } = useSSE({
    onInitialTables: (initialTables) => {
      const nextTables = normalizeTables(initialTables);
      setTables(nextTables);
      setLoading(false);
      setError('');
      if (!selectedTableId && nextTables.length > 0) {
        setSelectedTableId(nextTables[0].id);
      }
    },
    onTableUpdated: (updatedTable) => {
      setTables((prev) =>
        prev.map((t) => {
          if (t.id !== updatedTable.id) return t;
          return {
            ...t,
            status: updatedTable.status,
            status_changed_at: updatedTable.status_changed_at || new Date().toISOString(),
          };
        })
      );
    },
  });

  // Local clock tick to trigger UI updates for SLA countdowns
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (sseError) {
      setError(sseError);
    } else {
      setError('');
    }
  }, [sseError]);

  const selectedTable = useMemo(() => tables.find((table) => table.id === selectedTableId) || null, [tables, selectedTableId]);

  const taskSummary = useMemo(() => {
    return tables.reduce((acc, table) => {
      if (table.status === 'need_cleaning') acc.urgent += 1;
      if (table.status === 'cleaning') acc.inProgress += 1;
      if (table.status === 'available') acc.ready += 1;
      return acc;
    }, { urgent: 0, inProgress: 0, ready: 0 });
  }, [tables]);

  const updateStatus = async (tableId, nextStatus) => {
    try {
      setUpdatingId(tableId);
      const response = await fetch(`${API_URL}/api/v1/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || 'ไม่สามารถอัปเดตสถานะโต๊ะได้');
      }

      setTables((prev) => prev.map((table) => {
        if (table.id !== tableId) return table;
        return { ...table, status: resData.data.status };
      }));
      setSelectedTableId(tableId);
      setError('');
    } catch (err) {
      setError(err.message || 'ไม่สามารถอัปเดตสถานะโต๊ะได้');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        แผงงานแม่บ้าน
      </Typography>
      <Typography variant="body2" color="text.secondary">
        ข้อมูลสถานะโต๊ะถูกดึงจากฐานข้อมูลจริงและอัปเดตผ่าน API ทันที
      </Typography>

      {error && (
        <Typography variant="body2" color="error.main">
          {error}
        </Typography>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card sx={{ flex: 1, borderRadius: 4, background: 'rgba(25, 30, 38, 0.65)' }}>
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <CleaningServicesIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                สรุปงานวันนี้
              </Typography>
            </Stack>
            {loading ? (
              <Typography variant="body2" color="text.secondary">กำลังโหลดข้อมูล...</Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`ต้องทำ ${taskSummary.urgent}`} color="warning" />
                <Chip label={`กำลังทำ ${taskSummary.inProgress}`} color="info" />
                <Chip label={`พร้อมใช้ ${taskSummary.ready}`} color="success" />
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 4, background: 'rgba(25, 30, 38, 0.65)' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              {selectedTable ? `โต๊ะ ${selectedTable.tableNumber}` : 'เลือกโต๊ะที่ต้องดูแล'}
            </Typography>
            {selectedTable ? (
              <>
                <Chip label={getStatusMeta(selectedTable.status).label} color={getStatusMeta(selectedTable.status).color} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedTable.zone} · {selectedTable.capacity} ที่นั่ง
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={1}>
                  <Button fullWidth variant="contained" color="warning" size="large" startIcon={<WarningAmberRoundedIcon />} disabled={Boolean(updatingId)} onClick={() => updateStatus(selectedTable.id, 'need_cleaning')}>
                    แจ้งต้องทำความสะอาด
                  </Button>
                  <Button fullWidth variant="contained" color="info" size="large" startIcon={<CleaningServicesIcon />} disabled={Boolean(updatingId)} onClick={() => updateStatus(selectedTable.id, 'cleaning')}>
                    เริ่มทำความสะอาด
                  </Button>
                  <Button fullWidth variant="contained" color="success" size="large" startIcon={<CheckCircleOutlineIcon />} disabled={Boolean(updatingId)} onClick={() => updateStatus(selectedTable.id, 'available')}>
                    เสร็จสิ้นงาน
                  </Button>
                </Stack>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                แตะโต๊ะจากรายการด้านล่างเพื่อเลือกและเริ่มงาน
              </Typography>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ borderRadius: 4, background: 'rgba(25, 30, 38, 0.65)' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            รายการโต๊ะที่ต้องดูแล
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
            {tables.map((table) => {
              const meta = getStatusMeta(table.status);
              const isSelected = selectedTableId === table.id;
              
              // SLA Breach detection: status 'need_cleaning' for more than 10 minutes
              const isSLABreached =
                table.status === 'need_cleaning' &&
                table.status_changed_at &&
                (nowTick - new Date(table.status_changed_at).getTime() > 10 * 60 * 1000);

              return (
                <Paper
                  key={table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: isSelected
                      ? '2px solid #42a5f5'
                      : isSLABreached
                      ? '2px dashed #f59e0b'
                      : meta.border,
                    bgcolor: meta.bg,
                    minHeight: 132,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    // Pulsing animation for SLA Breach
                    animation: isSLABreached ? 'pulse-warning 1.5s infinite ease-in-out' : 'none',
                    '@keyframes pulse-warning': {
                      '0%': { opacity: 1, backgroundColor: meta.bg },
                      '50%': { opacity: 0.6, backgroundColor: 'rgba(251, 191, 36, 0.3)' },
                      '100%': { opacity: 1, backgroundColor: meta.bg },
                    },
                  }}
                >
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {table.tableNumber}
                      </Typography>
                      {isSLABreached && (
                        <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 800 }}>
                          ⚠️ SLA LATE
                        </Typography>
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {table.zone} · {table.capacity} ที่นั่ง
                    </Typography>
                  </Box>
                  <Chip label={isSLABreached ? 'เตือน SLA ล่าช้า' : meta.label} color={isSLABreached ? 'warning' : meta.color} size="small" />
                </Paper>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
