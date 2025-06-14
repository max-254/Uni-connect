import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/security/ProtectedRoute';
import HomePage from './pages/HomePage';
import UniversitiesPage from './pages/UniversitiesPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminApplicationDashboardPage from './pages/AdminApplicationDashboardPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursesPage';
import CourseApplicationPage from './pages/CourseApplicationPage';
import ApplicationSuccessPage from './pages/ApplicationSuccessPage';
import ApplicationDashboardPage from './pages/ApplicationDashboardPage';
import DocumentManagementPage from './pages/DocumentManagementPage';
import PaymentsPage from './pages/PaymentsPage';
import VisaApplicationPage from './pages/VisaApplicationPage';
import TravelDashboardPage from './pages/TravelDashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { encryptionService } from './services/encryptionService';

function App() {
  // Initialize encryption service
  useEffect(() => {
    const initEncryption = async () => {
      try {
        await encryptionService.initialize();
      } catch (error) {
        console.error('Failed to initialize encryption service:', error);
      }
    };

    initEncryption();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/universities" element={<UniversitiesPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/applications" element={
              <ProtectedRoute requiredRoles={['admin', 'super_admin', 'institution_admin']}>
                <AdminApplicationDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId/apply" element={
              <ProtectedRoute>
                <CourseApplicationPage />
              </ProtectedRoute>
            } />
            <Route path="/courses/application-success/:applicationId" element={
              <ProtectedRoute>
                <ApplicationSuccessPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/applications" element={
              <ProtectedRoute>
                <ApplicationDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute>
                <DocumentManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute>
                <PaymentsPage />
              </ProtectedRoute>
            } />
            <Route path="/visa-applications" element={
              <ProtectedRoute>
                <VisaApplicationPage />
              </ProtectedRoute>
            } />
            <Route path="/travel" element={
              <ProtectedRoute>
                <TravelDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;