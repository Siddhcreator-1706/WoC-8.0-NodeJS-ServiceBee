import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import Services from './pages/user/Services';
import ServiceDetail from './pages/user/ServiceDetail';
import Profile from './pages/user/Profile';
import Bookings from './pages/user/Bookings';
import Complaints from './pages/user/Complaints';
import Favorites from './pages/user/Favorites';
import AdminLayout from './components/layouts/AdminLayout';
import Overview from './pages/admin/Overview';
import ServiceManagement from './pages/admin/ServiceManagement';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import UserManagement from './pages/admin/UserManagement';

import ProviderLayout from './components/layouts/ProviderLayout';
import ProviderProfile from './pages/provider/Profile';
import ProviderServices from './pages/provider/ProviderServices';
import ProviderBookings from './pages/provider/ProviderBookings';
import ProviderComplaints from './pages/provider/ProviderComplaints';

import Layout from './components/layouts/Layout';
import Terms from './pages/Terms';
import CompanyProfile from './pages/user/CompanyProfile';
import SmoothScroll from './components/common/SmoothScroll';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { AnimatePresence } from 'framer-motion';
import './App.css';


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="complaints" element={<ComplaintManagement />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

        <Route path="/provider" element={<ProtectedRoute allowedRoles={['provider']}><ProviderLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProviderProfile />} />
          <Route path="services" element={<ProviderServices />} />
          <Route path="bookings" element={<ProviderBookings />} />
          <Route path="complaints" element={<ProviderComplaints />} />
        </Route>

        {/* User & Public Routes (Main Navbar Layout) */}
        <Route element={<Layout />}>

          <Route path="/user" element={<ProtectedRoute allowedRoles={['user']}><Outlet /></ProtectedRoute>}>
            <Route path="services" element={<Services />} />
            <Route path="services/:id" element={<ServiceDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="company/:id" element={<CompanyProfile />} />
          </Route>

          <Route path="/terms" element={<Terms />} />
        </Route>
      </Routes>
    </AnimatePresence >
  );
}

function App() {
  return (
    <AuthProvider>
      <SmoothScroll>
        <Router>
          <SocketProvider>
            <ErrorBoundary>
              <AnimatedRoutes />
              <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
            </ErrorBoundary>
          </SocketProvider>
        </Router>
      </SmoothScroll>
    </AuthProvider>
  );
}

export default App;
