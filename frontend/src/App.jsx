// Verified clean
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import Complaints from './pages/Complaints';
import Favorites from './pages/Favorites';
import AdminLayout from './components/layouts/AdminLayout';
import Overview from './pages/admin/Overview';
import ServiceManagement from './pages/admin/ServiceManagement';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import UserManagement from './pages/admin/UserManagement';
// import CompanyManagement from './pages/admin/CompanyManagement';

// Provider Components
import ProviderLayout from './components/layouts/ProviderLayout';
import ProviderProfile from './pages/provider/Profile';
import ProviderServices from './pages/provider/ProviderServices';
import ProviderBookings from './pages/provider/ProviderBookings';
import ProviderComplaints from './pages/provider/ProviderComplaints';

import Layout from './components/layouts/Layout';
import Terms from './pages/Terms';
import CompanyProfile from './pages/CompanyProfile';
import SmoothScroll from './components/SmoothScroll';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { AnimatePresence } from 'framer-motion';
import './App.css';


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes - No Layout */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />

        {/* Admin Routes - Independent Layout */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="complaints" element={<ComplaintManagement />} />
          <Route path="users" element={<UserManagement />} />
          {/* <Route path="companies" element={<CompanyManagement />} /> */}
        </Route>

        {/* Global Layout Routes */}
        <Route element={<Layout />}>

          {/* Provider Routes (Nested under global layout) */}
          <Route path="/provider" element={<ProtectedRoute allowedRoles={['provider']}><ProviderLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProviderProfile />} />
            <Route path="services" element={<ProviderServices />} />
            <Route path="bookings" element={<ProviderBookings />} />
            <Route path="complaints" element={<ProviderComplaints />} />
          </Route>

          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/services/:id" element={<ProtectedRoute><ServiceDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />

          {/* Public Company Profile */}
          <Route path="/company/:id" element={<CompanyProfile />} />
          <Route path="/terms" element={<Terms />} />
        </Route>
      </Routes>
    </AnimatePresence>
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
