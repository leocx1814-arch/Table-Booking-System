import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GavelIcon from '@mui/icons-material/Gavel';
import { useAuth } from '../hooks/useAuth.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminSettings() {
  const { token } = useAuth();

  const [settings, setSettings] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'ดึงค่าตั้งค่าระบบไม่สำเร็จ');
      }

      setSettings(data.data || []);
      const initialMap = {};
      (data.data || []).forEach((s) => {
        initialMap[s.key] = s.value;
      });
      setFormData(initialMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const handleChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveSetting = async (key) => {
    setSavingKey(key);
    setError(null);
    try {
      const val = formData[key];
      const res = await fetch(`${API_URL}/api/v1/settings/${key}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: val }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || 'บันทึกค่าไม่สำเร็จ');
      }

      setSuccessMsg(`บันทึกการตั้งค่า "${data.data?.key || key}" เป็น "${val}" เรียบร้อยแล้ว`);
      fetchSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingKey(null);
    }
  };

  // Group settings by category
  const timeSettings = settings.filter(
    (s) =>
      s.key.includes('minute') ||
      s.key.includes('grace') ||
      s.key.includes('duration') ||
      s.key.includes('limit') ||
      s.key.includes('bookings_per_day')
  );

  const ruleSettings = settings.filter(
    (s) => s.key.includes('points') || s.key.includes('blacklist') || s.key.includes('ban')
  );

  const gpsSettings = settings.filter(
    (s) => s.key.includes('gps') || s.key.includes('lat') || s.key.includes('lng')
  );

  const otherSettings = settings.filter(
    (s) =>
      !timeSettings.includes(s) &&
      !ruleSettings.includes(s) &&
      !gpsSettings.includes(s)
  );

  const renderSettingItem = (item) => {
    const isModified = String(formData[item.key]) !== String(item.value);
    const isSaving = savingKey === item.key;

    return (
      <Grid item xs={12} md={6} key={item.key}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            background: 'rgba(15, 23, 42, 0.6)',
            border: isModified ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'all 0.2s',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {item.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            {item.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              size="small"
              fullWidth
              value={formData[item.key] ?? ''}
              onChange={(e) => handleChange(item.key, e.target.value)}
              InputProps={{
                endAdornment: item.unit ? (
                  <InputAdornment position="end">{item.unit}</InputAdornment>
                ) : null,
              }}
            />
            <Button
              variant={isModified ? 'contained' : 'outlined'}
              color="primary"
              size="small"
              startIcon={<SaveIcon />}
              onClick={() => handleSaveSetting(item.key)}
              disabled={isSaving || !isModified}
              sx={{ minWidth: 100, borderRadius: 2 }}
            >
              {isSaving ? 'กำลังเซฟ...' : 'บันทึก'}
            </Button>
          </Box>
        </Box>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            ตั้งค่ากฎระเบียบและระบบ (Admin Settings)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            กำหนดระยะเวลารอเช็คอิน, เวลาจองสูงสุด, รัศมี GPS และคะแนนบทลงโทษระบบ
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchSettings}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          รีโหลดค่าเดิม
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* Time & Booking Section */}
          <Card
            sx={{
              background: 'rgba(25, 30, 38, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 3,
              p: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <AccessTimeIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                การกำหนดเวลาและสิทธิ์การจอง (Time & Booking Policy)
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />
            <Grid container spacing={2.5}>
              {timeSettings.map(renderSettingItem)}
            </Grid>
          </Card>

          {/* GPS Section */}
          <Card
            sx={{
              background: 'rgba(25, 30, 38, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 3,
              p: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <GpsFixedIcon color="info" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                พิกัดและขอบเขตโรงอาหาร (GPS Location Check-in)
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />
            <Grid container spacing={2.5}>
              {gpsSettings.map(renderSettingItem)}
            </Grid>
          </Card>

          {/* Penalty & Blacklist Rules */}
          <Card
            sx={{
              background: 'rgba(25, 30, 38, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 3,
              p: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <GavelIcon color="warning" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                คะแนนพฤติกรรมและการระงับสิทธิ์ (Discipline & Blacklist Policy)
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />
            <Grid container spacing={2.5}>
              {ruleSettings.map(renderSettingItem)}
            </Grid>
          </Card>

          {otherSettings.length > 0 && (
            <Card
              sx={{
                background: 'rgba(25, 30, 38, 0.65)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 3,
                p: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <SettingsIcon color="secondary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  การตั้งค่าทั่วไปอื่นๆ
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />
              <Grid container spacing={2.5}>
                {otherSettings.map(renderSettingItem)}
              </Grid>
            </Card>
          )}
        </Stack>
      )}
    </Box>
  );
}
