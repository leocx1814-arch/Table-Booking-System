import React, { useEffect, useState } from 'react';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useAuth } from '../hooks/useAuth.jsx';
import { useSSE } from '../hooks/useSSE.js';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  // Load initial notifications from localStorage to persist them across refreshes
  useEffect(() => {
    if (!user) return;
    const key = `notifications_${user.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notifications from localStorage:', e);
      }
    }
  }, [user]);

  // Save notifications to localStorage when state changes
  const saveNotifications = (nextList) => {
    setNotifications(nextList);
    if (user) {
      const key = `notifications_${user.id}`;
      localStorage.setItem(key, JSON.stringify(nextList));
    }
  };

  // Connect to SSE stream
  useSSE({
    onNotification: (notif) => {
      if (!user) return;

      // Filter: Only accept notification meant for this user OR role
      const isTargetUser = notif.userId && parseInt(notif.userId, 10) === parseInt(user.id, 10);
      const isTargetRole = notif.role && notif.role === user.role;
      const isPublic = !notif.userId && !notif.role;

      if (isTargetUser || isTargetRole || isPublic) {
        const newNotif = {
          id: notif.id || Date.now(),
          message: notif.message,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        // Prepend to list
        saveNotifications([newNotif, ...notifications]);
      }
    },
  });

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    saveNotifications(updated);
  };

  const handleClearAll = () => {
    saveNotifications([]);
    handleCloseMenu();
  };

  const handleItemClick = (id) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    saveNotifications(updated);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Box>
      <IconButton color="inherit" aria-label="การแจ้งเตือน" onClick={handleOpenMenu}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            bgcolor: 'rgba(25, 30, 38, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'text.primary',
            borderRadius: 3,
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            แจ้งเตือนเตือนสด
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem', py: 0 }}>
              อ่านทั้งหมด
            </Button>
          )}
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ไม่มีการแจ้งเตือนเตือนใหม่ในขณะนี้
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowY: 'auto', maxHeight: 280 }}>
            {notifications.map((n) => (
              <MenuItem
                key={n.id}
                onClick={() => handleItemClick(n.id)}
                sx={{
                  py: 1.5,
                  px: 2,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  whiteSpace: 'normal',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  '&:last-child': { borderBottom: 'none' },
                  bgcolor: n.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                }}
              >
                {!n.isRead && (
                  <FiberManualRecordIcon
                    sx={{ color: 'primary.light', fontSize: 10, mt: 0.6, flexShrink: 0 }}
                  />
                )}
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: n.isRead ? 400 : 700, fontSize: '0.85rem' }}>
                      {n.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {new Date(n.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  }
                />
              </MenuItem>
            ))}
          </Box>
        )}

        {notifications.length > 0 && (
          <>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button fullWidth size="small" color="error" onClick={handleClearAll} sx={{ fontSize: '0.75rem' }}>
                ล้างแจ้งเตือนเตือนทั้งหมด
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </Box>
  );
}
