import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReportIcon from '@mui/icons-material/Report';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GavelIcon from '@mui/icons-material/Gavel';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

import packageJson from '../../../package.json';

/**
 * Sidebar — Persistent/Responsive drawer for Admin Console Layout.
 * Matches 07-frontend-pages.md §1.2 sidebar navigation specification.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the drawer is open (mobile: temporary, desktop: persistent)
 * @param {Function} props.onClose - Callback to close the drawer (mobile only)
 */

const DRAWER_WIDTH = 260;

const ADMIN_MENU = [
  { label: 'แดชบอร์ด', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { label: 'จัดการเรื่องร้องเรียน', icon: <ReportIcon />, path: '/admin/complaints' },
  { label: 'จัดการผังโต๊ะ', icon: <TableRestaurantIcon />, path: '/admin/tables' },
  { label: 'จัดการผู้ใช้ / Blacklist', icon: <PeopleIcon />, path: '/admin/users' },
  { label: 'ตั้งค่ากฎระเบียบ', icon: <SettingsIcon />, path: '/admin/settings' },
];

const INSPECTOR_MENU = [
  { label: 'ศูนย์ตรวจสอบร้องเรียน', icon: <GavelIcon />, path: '/inspector/dashboard' },
];

const CLEANER_MENU = [
  { label: 'แผงงานแม่บ้าน', icon: <CleaningServicesIcon />, path: '/cleaner/dashboard' },
];

const EXECUTIVE_MENU = [
  { label: 'รายงานผู้บริหาร', icon: <AssessmentIcon />, path: '/executive/reports' },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    // Close drawer on mobile after navigation
    if (onClose) onClose();
  };

  const renderMenuSection = (title, items) => (
    <Box key={title}>
      <Typography
        variant="overline"
        sx={{
          px: 2,
          pt: 2,
          pb: 0.5,
          display: 'block',
          color: 'text.secondary',
          fontSize: '0.65rem',
          letterSpacing: '1.5px',
        }}
      >
        {title}
      </Typography>
      <List disablePadding>
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={isActive}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.18)',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'primary.light' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'primary.light' : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Drawer Header (hidden — Topbar already shows branding) */}
      <Box sx={{ height: 64 }} />

      {renderMenuSection('ผู้ดูแลระบบ', ADMIN_MENU)}
      <Divider sx={{ my: 1, borderColor: 'divider' }} />
      {renderMenuSection('สารวัตรโรงอาหาร', INSPECTOR_MENU)}
      <Divider sx={{ my: 1, borderColor: 'divider' }} />
      {renderMenuSection('แม่บ้าน', CLEANER_MENU)}
      <Divider sx={{ my: 1, borderColor: 'divider' }} />
      {renderMenuSection('ผู้บริหาร', EXECUTIVE_MENU)}

      {/* Bottom spacer */}
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ borderColor: 'divider' }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          TableBook v{packageJson.version}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile: Temporary drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop: Persistent drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            backgroundColor: 'background.paper',
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
