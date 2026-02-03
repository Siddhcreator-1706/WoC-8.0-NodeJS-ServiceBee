import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Profile from './pages/Profile';
import Complaints from './pages/Complaints';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/admin/Dashboard';
import SuperuserDashboard from './pages/superuser/Dashboard';
import ProviderDashboard from './pages/provider/Dashboard';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AuthPage />} />

          {/* Main App Routes with Navbar */}
          <Route path="*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetail />} />

                {/* Protected User Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
                <Route path="/complaints" element={
                  <ProtectedRoute><Complaints /></ProtectedRoute>
                } />
                <Route path="/favorites" element={
                  <ProtectedRoute><Favorites /></ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute allowedRoles={['admin', 'superuser']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Provider Routes */}
                <Route path="/provider" element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProviderDashboard />
                  </ProtectedRoute>
                } />

                {/* Superuser Routes */}
                <Route path="/superuser/*" element={
                  <ProtectedRoute allowedRoles={['superuser']}>
                    <SuperuserDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
