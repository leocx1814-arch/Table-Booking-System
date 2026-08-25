import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import MapIcon from '@mui/icons-material/Map';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import HistoryIcon from '@mui/icons-material/History';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

/**
 * BottomNav — Mobile-first bottom navigation bar for User App Shell.
 * 4 tabs matching the spec in 07-frontend-pages.md §1.1:
 *   1. Seat Map (/)
 *   2. File Report (/complaints/new)
 *   3. My Logs (/history)
 *   4. Profile (/profile)
 */

const NAV_ITEMS = [
  { label: 'แผนผัง', icon: <MapIcon />, path: '/' },
  { label: 'ร้องเรียน', icon: <ReportProblemOutlinedIcon />, path: '/complaints/new' },
  { label: 'ประวัติ', icon: <HistoryIcon />, path: '/history' },
  { label: 'โปรไฟล์', icon: <PersonOutlineIcon />, path: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which tab is active based on current URL path
  const currentIndex = NAV_ITEMS.findIndex((item) => location.pathname === item.path);
  const activeTab = currentIndex >= 0 ? currentIndex : 0;

  const handleChange = (_event, newValue) => {
    navigate(NAV_ITEMS[newValue].path);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.appBar,
        // Safe area padding for iOS notch devices
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation
        value={activeTab}
        onChange={handleChange}
        showLabels
        sx={{ height: 64 }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
