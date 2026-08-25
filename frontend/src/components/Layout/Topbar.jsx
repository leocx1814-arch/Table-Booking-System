import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import MenuIcon from '@mui/icons-material/Menu';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import NotificationBell from '../NotificationBell';
import packageJson from '../../../package.json';

/**
 * Topbar — Glassmorphism-style top navigation bar.
 * Shows app branding, notification bell, and optional hamburger menu toggle.
 *
 * @param {Object} props
 * @param {Function} [props.onMenuToggle] - Callback to open/close sidebar (Admin layouts)
 * @param {boolean} [props.showMenuButton] - Whether to show the hamburger icon
 */
export default function Topbar({ onMenuToggle, showMenuButton = false }) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(18, 22, 28, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Left: Menu toggle + Branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {showMenuButton && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={onMenuToggle}
              aria-label="เปิดเมนู"
              sx={{ mr: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <RestaurantIcon sx={{ color: 'primary.light', fontSize: 28 }} />

          <Box>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontSize: { xs: '1rem', sm: '1.15rem' },
                fontWeight: 800,
                letterSpacing: '1px',
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
              }}
            >
              TABLEBOOK
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.65rem', display: { xs: 'none', sm: 'block' } }}
            >
              ระบบจองโต๊ะโรงอาหาร v{packageJson.version}
            </Typography>
          </Box>
        </Box>

        {/* Right: Notification bell (Phase 12 SSE) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationBell />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
