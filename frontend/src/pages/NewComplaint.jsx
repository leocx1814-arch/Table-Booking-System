import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../hooks/useAuth.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const TABLE_OPTIONS = [
  { id: 1, label: 'T-01' },
  { id: 2, label: 'T-02' },
  { id: 3, label: 'T-03' },
  { id: 4, label: 'T-04' },
  { id: 5, label: 'T-05' },
  { id: 6, label: 'T-06' },
  { id: 7, label: 'T-07' },
  { id: 8, label: 'T-08' },
];

const DEFAULT_COMPLAINT_TYPES = [
  { id: 1, type_name: 'ถูกแย่งนั่ง / นั่งกั๊กโต๊ะ (เช่น มีคนนั่งอยู่แล้วทั้งที่จองไว้ หรือเอาของมาวางกั๊กทิ้งไว้)', default_penalty_points: 20 },
  { id: 2, type_name: 'ระบบมีปัญหา / สแกนไม่ได้ (เช่น สแกน QR Code ไม่ผ่าน, แอปเด้ง, ระบบไม่อัปเดตสถานะ)', default_penalty_points: 0 },
  { id: 3, type_name: 'อุปกรณ์ชำรุด / ไม่ปลอดภัย (เช่น โต๊ะเก้าอี้โยกเยก ชำรุด หรือมีขอบแหลมคม)', default_penalty_points: 0 },
  { id: 4, type_name: 'โต๊ะไม่สะอาด / มีขยะ (เช่น เศษอาหาร คราบน้ำ ขยะที่ผู้ใช้ก่อนหน้าทิ้งไว้)', default_penalty_points: 15 },
  { id: 5, type_name: 'อื่นๆ / ข้อเสนอแนะ (ช่องทางสำหรับพิมพ์รายละเอียดเพิ่มเติม หรือแจ้งเรื่องทั่วไป)', default_penalty_points: 0 },
];

/**
 * แมปชื่อสั้น (label) และคำอธิบาย (hint) สำหรับแสดงผลใน dropdown
 * โดยใช้ complaint_type id เป็น key เพื่อแยก UI label ออกจาก type_name ในฐานข้อมูล
 */
const COMPLAINT_TYPE_DISPLAY = {
  1: { label: 'ถูกแย่งนั่ง / นั่งกั๊กโต๊ะ',               hint: 'มีคนนั่งอยู่แล้วทั้งที่จองไว้ หรือเอาของมาวางกั๊กทิ้งไว้' },
  2: { label: 'ระบบมีปัญหา / สแกนไม่ได้',                 hint: 'สแกน QR Code ไม่ผ่าน, แอปเด้ง, ระบบไม่อัปเดตสถานะ' },
  3: { label: 'อุปกรณ์ชำรุด / ไม่ปลอดภัย',               hint: 'โต๊ะเก้าอี้โยกเยก ชำรุด หรือมีขอบแหลมคม' },
  4: { label: 'โต๊ะไม่สะอาด / มีขยะ',                    hint: 'เศษอาหาร คราบน้ำ หรือขยะที่ผู้ใช้ก่อนหน้าทิ้งไว้' },
  5: { label: 'อื่นๆ / ข้อเสนอแนะ',                       hint: 'พิมพ์รายละเอียดเพิ่มเติม หรือแจ้งเรื่องทั่วไป' },
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
    reader.readAsDataURL(file);
  });
}

async function compressImage(file) {
  const dataUrl = await readFileAsDataUrl(file);
  const image = new Image();
  image.src = dataUrl;
  await image.decode();

  const maxWidth = 1200;
  const scale = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(image.width * scale));
  canvas.height = Math.max(1, Math.floor(image.height * scale));

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 0.82);
}

export default function NewComplaint() {
  const { token } = useAuth();
  const [complaintTypes, setComplaintTypes] = useState(DEFAULT_COMPLAINT_TYPES);
  const [tableId, setTableId] = useState('');
  const [complaintTypeId, setComplaintTypeId] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadComplaintTypes = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch(`${API_URL}/api/v1/complaint-categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('ไม่สามารถโหลดประเภทข้อร้องเรียนได้');
        }

        const resData = await response.json();
        if (resData.success && Array.isArray(resData.data)) {
          setComplaintTypes(resData.data);
        }
      } catch (err) {
        setFeedback({ severity: 'error', message: err.message || 'ไม่สามารถโหลดประเภทข้อร้องเรียนได้' });
      } finally {
        setLoadingCategories(false);
      }
    };

    loadComplaintTypes();
  }, [token]);

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const compressedImage = await compressImage(file);
      setImagePreview(compressedImage);
      setFeedback({ severity: 'success', message: 'รูปภาพถูกประมวลผลและพร้อมส่งแล้ว' });
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message || 'ไม่สามารถประมวลผลรูปภาพได้' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!tableId || !complaintTypeId || !description.trim()) {
      setFeedback({ severity: 'error', message: 'กรุณากรอกข้อมูลให้ครบถ้วนก่อนส่งคำร้องเรียน' });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/v1/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          table_id: Number(tableId),
          complaint_type_id: Number(complaintTypeId),
          description: description.trim(),
          evidence_image_path: imagePreview || null,
          is_anonymous: false,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || 'ส่งข้อร้องเรียนไม่สำเร็จ');
      }

      setFeedback({ severity: 'success', message: 'ส่งข้อร้องเรียนเรียบร้อยแล้ว' });
      setTableId('');
      setComplaintTypeId('');
      setDescription('');
      setImagePreview('');
      event.target.reset();
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message || 'ส่งข้อร้องเรียนไม่สำเร็จ' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 1, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        แจ้งเรื่องร้องเรียน / รายงานปัญหา
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        รายงานปัญหาโต๊ะสกปรก โต๊ะชำรุด หรือการนั่งกั๊กที่นั่งเกินเวลา
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
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {feedback && (
            <Alert severity={feedback.severity} sx={{ borderRadius: 2 }}>
              {feedback.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="ประเภทข้อร้องเรียน"
              value={complaintTypeId}
              onChange={(event) => setComplaintTypeId(event.target.value)}
              fullWidth
              disabled={loadingCategories}
              SelectProps={{
                renderValue: (selected) => {
                  if (!selected) return '';
                  const display = COMPLAINT_TYPE_DISPLAY[selected];
                  if (display) return display.label;
                  const found = complaintTypes.find((t) => t.id === selected);
                  return found ? (found.type_name || found.label) : '';
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.02)',
                },
              }}
            >
              {complaintTypes.map((option) => {
                const display = COMPLAINT_TYPE_DISPLAY[option.id];
                return (
                  <MenuItem key={option.id} value={option.id} sx={{ py: 1.5, alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={display ? display.label : (option.type_name || option.label)}
                      secondary={display ? display.hint : null}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'normal' }}
                    />
                  </MenuItem>
                );
              })}
            </TextField>

            <TextField
              select
              label="เลือกหมายเลขโต๊ะ"
              value={tableId}
              onChange={(event) => setTableId(event.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.02)',
                },
              }}
            >
              {TABLE_OPTIONS.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="รายละเอียดเพิ่มเติม"
              variant="outlined"
              multiline
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.02)',
                },
              }}
            />

            <Button variant="outlined" color="secondary" component="label" fullWidth sx={{ borderStyle: 'dashed', py: 1.5 }}>
              📷 อัปโหลดรูปภาพหลักฐาน
              <input hidden accept="image/*" type="file" onChange={handleImageChange} />
            </Button>

            {imagePreview && (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={imagePreview} alt="preview" style={{ width: '100%', display: 'block' }} />
              </Box>
            )}

            <Button variant="contained" color="primary" size="large" fullWidth type="submit" disabled={submitting}>
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'ส่งข้อร้องเรียน'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
