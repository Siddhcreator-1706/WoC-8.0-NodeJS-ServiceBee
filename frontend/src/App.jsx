import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
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
import Navbar from './components/Navbar';
import Terms from './pages/Terms';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />


          {/* Main App Routes with Global Navbar & Premium Noise Overlay */}
          <Route element={
            <>
              <Navbar />
              <div className="min-h-screen">
                <Outlet />
              </div>
            </>
          }>
            {/* Admin Dashboard */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Provider Dashboard */}
            <Route path="/provider" element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            } />

            {/* Public/User Protected Routes */}
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/services/:id" element={<ProtectedRoute><ServiceDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          </Route>

          {/* Standalone Pages */}
          <Route path="/terms" element={<Terms />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
