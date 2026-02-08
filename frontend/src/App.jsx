import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import Complaints from './pages/Complaints';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/admin/Dashboard';
import ProviderDashboard from './pages/provider/Dashboard';
import Layout from './components/Layout';
import Terms from './pages/Terms';
import CompanyProfile from './pages/CompanyProfile';
import SmoothScroll from './components/SmoothScroll';
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

        {/* Global Layout Routes */}
        <Route element={<Layout />}>
          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/provider" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
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
          <AnimatedRoutes />
        </Router>
      </SmoothScroll>
    </AuthProvider>
  );
}

export default App;
