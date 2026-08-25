import React, { useState } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Topbar from '../components/Layout/Topbar';
import BottomNav from '../components/Layout/BottomNav';
import Sidebar, { DRAWER_WIDTH } from '../components/Layout/Sidebar';
import Box from '@mui/material/Box';
import PrivateRoute from './PrivateRoute';

// Import Pages
import CanteenMap from '../pages/CanteenMap';
import NewComplaint from '../pages/NewComplaint';
import History from '../pages/History';
import Profile from '../pages/Profile';
import Login from '../pages/Login';
import InspectorDashboard from '../pages/InspectorDashboard';
import ExecutiveReports from '../pages/ExecutiveReports';
import CleanerDashboard from '../pages/CleanerDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import AdminComplaints from '../pages/AdminComplaints';
import AdminTables from '../pages/AdminTables';
import AdminUsers from '../pages/AdminUsers';
import AdminSettings from '../pages/AdminSettings';

function UserLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Topbar showMenuButton={false} />
      {/* Top spacing for fixed Topbar, bottom spacing for fixed BottomNav */}
      <Box sx={{ pt: 10, pb: 10, px: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
      <BottomNav />
    </Box>
  );
}

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <Topbar showMenuButton={true} onMenuToggle={handleDrawerToggle} />
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />

      {/* Main content pane with left margin equal to DRAWER_WIDTH on desktop */}
      <Box
        sx={{
          flexGrow: 1,
          pt: 10,
          pb: 4,
          px: { xs: 2, md: 3 },
          ml: { md: `${DRAWER_WIDTH}px` },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public: Login */}
      <Route path="/login" element={<Login />} />

      {/* Protected: User Area — ทุก role ที่ล็อกอินแล้วเข้าได้ */}
      <Route element={<PrivateRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/" element={<CanteenMap />} />
          <Route path="/complaints/new" element={<NewComplaint />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Protected: Inspector Area — เฉพาะ inspector */}
      <Route element={<PrivateRoute allowedRoles={['inspector']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/inspector/dashboard" element={<InspectorDashboard />} />
        </Route>
      </Route>

      {/* Protected: Cleaner Area — เฉพาะ cleaner */}
      <Route element={<PrivateRoute allowedRoles={['cleaner']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/cleaner/dashboard" element={<CleanerDashboard />} />
        </Route>
      </Route>

      {/* Protected: Executive Area — เฉพาะ executive */}
      <Route element={<PrivateRoute allowedRoles={['executive']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/executive/reports" element={<ExecutiveReports />} />
        </Route>
      </Route>

      {/* Protected: Admin Area — เฉพาะ admin */}
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/tables" element={<AdminTables />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Fallback: redirect ทุก URL ที่ไม่รู้จักไปหน้าแรก */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
