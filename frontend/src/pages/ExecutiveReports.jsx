import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

export default function ExecutiveReports() {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        รายงานสถิติผู้บริหาร (Executive Report)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        รายงานวิเคราะห์ความหนาแน่น อัตราความนิยม และดัชนีประสิทธิภาพ SLA
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              background: 'rgba(25, 30, 38, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                อัตราการใช้งานโต๊ะเฉลี่ยวันนี้
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: 'primary.light' }}>
                74.2%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              background: 'rgba(25, 30, 38, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                จำนวนผู้ละเมิดกฎกฎระเบียบ (จองทิ้ง)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: 'error.main' }}>
                12 ครั้ง
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              background: 'rgba(25, 30, 38, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                SLA การทำความสะอาดเฉลี่ย
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: 'success.main' }}>
                4.8 นาที
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
