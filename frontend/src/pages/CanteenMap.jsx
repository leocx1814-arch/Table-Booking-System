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
import { useAuth } from '../hooks/useAuth';
import { useSSE } from '../hooks/useSSE';

const BOOKING_DURATION_MS = 15 * 60 * 1000;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function formatCountdown(value) {
  const totalSeconds = Math.max(0, Math.floor(value / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function getStatusMeta(status) {
  switch (status) {
    case 'occupied':
      return { label: 'ถูกจอง', color: 'error', bg: 'rgba(248,113,113,0.16)', border: '1px solid rgba(248,113,113,0.24)' };
    case 'pending_checkin':
      return { label: 'รอเช็คอิน', color: 'warning', bg: 'rgba(250,204,21,0.16)', border: '1px solid rgba(250,204,21,0.24)' };
    case 'need_cleaning':
      return { label: 'ต้องทำความสะอาด', color: 'warning', bg: 'rgba(251,191,36,0.16)', border: '1px solid rgba(251,191,36,0.24)' };
    case 'cleaning':
      return { label: 'กำลังทำความสะอาด', color: 'info', bg: 'rgba(96,165,250,0.16)', border: '1px solid rgba(96,165,250,0.24)' };
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
    expiresAt: table.status === 'occupied' || table.status === 'pending_checkin'
      ? Date.now() + BOOKING_DURATION_MS
      : null,
  }));
}

export default function CanteenMap() {
  const { token } = useAuth();
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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
            expiresAt: updatedTable.status === 'occupied' || updatedTable.status === 'pending_checkin'
              ? Date.now() + BOOKING_DURATION_MS
              : null,
            status_changed_at: updatedTable.status_changed_at || new Date().toISOString(),
          };
        })
      );
    },
  });

  useEffect(() => {
    if (sseError) {
      setError(sseError);
    } else {
      setError('');
    }
  }, [sseError]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const selectedTable = useMemo(() => tables.find((table) => table.id === selectedTableId) || null, [tables, selectedTableId]);

  const summary = useMemo(() => {
    return tables.reduce((acc, table) => {
      acc[table.status] = (acc[table.status] || 0) + 1;
      return acc;
    }, {});
  }, [tables]);

  const updateTableStatus = async (tableId, nextStatus) => {
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
        if (table.id !== tableId) {
          return table;
        }

        return {
          ...table,
          status: resData.data.status,
          expiresAt: resData.data.status === 'occupied' || resData.data.status === 'pending_checkin'
            ? Date.now() + BOOKING_DURATION_MS
            : null,
        };
      }));
      setSelectedTableId(tableId);
      setError('');
    } catch (err) {
      setError(err.message || 'ไม่สามารถอัปเดตสถานะโต๊ะได้');
    } finally {
      setUpdatingId(null);
    }
  };

  const countdown = selectedTable?.expiresAt ? Math.max(0, selectedTable.expiresAt - Date.now()) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        ผังโต๊ะโรงอาหาร
      </Typography>
      <Typography variant="body2" color="text.secondary">
        ข้อมูลโต๊ะถูกดึงจากฐานข้อมูลจริงและสามารถอัปเดตสถานะผ่าน API ได้ทันที
      </Typography>

      {error && (
        <Typography variant="body2" color="error.main">
          {error}
        </Typography>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card sx={{ flex: 1, background: 'rgba(25, 30, 38, 0.65)', borderRadius: 4 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              สรุปสถานะโต๊ะ
            </Typography>
            {loading ? (
              <Typography variant="body2" color="text.secondary">กำลังโหลดข้อมูล...</Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`ว่าง ${summary.available || 0}`} color="success" />
                <Chip label={`ถูกจอง ${summary.occupied || 0}`} color="error" />
                <Chip label={`รอเช็คอิน ${summary.pending_checkin || 0}`} color="warning" />
                <Chip label={`ต้องทำความสะอาด ${summary.need_cleaning || 0}`} color="warning" />
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, background: 'rgba(25, 30, 38, 0.65)', borderRadius: 4 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {selectedTable ? `โต๊ะ ${selectedTable.tableNumber}` : 'เลือกโต๊ะ'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedTable ? `${selectedTable.zone} · กำลังรับ ${selectedTable.capacity} คน` : 'คลิกบนแผงโต๊ะเพื่อเลือก'}
            </Typography>
            {selectedTable && (
              <>
                <Chip label={getStatusMeta(selectedTable.status).label} color={getStatusMeta(selectedTable.status).color} sx={{ mb: 1.5 }} />
                {countdown !== null && (
                  <Typography variant="body2" color="text.secondary">
                    เหลือเวลา: {formatCountdown(countdown)}
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button size="small" variant="contained" color="primary" disabled={Boolean(updatingId)} onClick={() => updateTableStatus(selectedTable.id, 'occupied')}>
                    จองโต๊ะ
                  </Button>
                  <Button size="small" variant="outlined" color="warning" disabled={Boolean(updatingId)} onClick={() => updateTableStatus(selectedTable.id, 'need_cleaning')}>
                    ต้องทำความสะอาด
                  </Button>
                  <Button size="small" variant="outlined" color="info" disabled={Boolean(updatingId)} onClick={() => updateTableStatus(selectedTable.id, 'cleaning')}>
                    เริ่มเช็ดโต๊ะ
                  </Button>
                  <Button size="small" variant="text" disabled={Boolean(updatingId)} onClick={() => updateTableStatus(selectedTable.id, 'available')}>
                    คืนสภาพว่าง
                  </Button>
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ background: 'rgba(25, 30, 38, 0.65)', borderRadius: 4 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            แผนผังโต๊ะ
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
            {tables.map((table) => {
              const meta = getStatusMeta(table.status);
              const isSelected = selectedTableId === table.id;
              return (
                <Paper
                  key={table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #42a5f5' : meta.border,
                    bgcolor: meta.bg,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {table.tableNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {table.zone} · {table.capacity} ที่นั่ง
                  </Typography>
                  <Chip label={meta.label} color={meta.color} size="small" />
                  {table.expiresAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      เหลือเวลา {formatCountdown(table.expiresAt - Date.now())}
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
