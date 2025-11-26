import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import UserProfile from './pages/UserProfile';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import Crops from './pages/farmer/Crops';
import DiseaseReports from './pages/farmer/DiseaseReports';
import Weather from './pages/farmer/Weather';
import Advisories from './pages/farmer/Advisories';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Farmers from './pages/admin/Farmers';
import Agronomists from './pages/admin/Agronomists';
import Locations from './pages/admin/Locations';

// Agronomist Pages
import AgronomistDashboard from './pages/agronomist/AgronomistDashboard';
import AgronomistProfile from './pages/agronomist/AgronomistProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes - Profile (all roles) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Farmer Routes */}
            <Route
              path="/farmer"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/crops"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <Crops />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/disease-reports"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <DiseaseReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/weather"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <Weather />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/advisories"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <Advisories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/profile"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/farmers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Farmers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/agronomists"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Agronomists />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/locations"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Locations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Agronomist Routes */}
            <Route
              path="/agronomist"
              element={
                <ProtectedRoute allowedRoles={['agronomist']}>
                  <AgronomistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agronomist/profile"
              element={
                <ProtectedRoute allowedRoles={['agronomist']}>
                  <AgronomistProfile />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;






