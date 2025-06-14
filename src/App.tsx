import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import UniversitiesPage from './pages/UniversitiesPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursesPage';
import CourseApplicationPage from './pages/CourseApplicationPage';
import ApplicationSuccessPage from './pages/ApplicationSuccessPage';
import ApplicationDashboardPage from './pages/ApplicationDashboardPage';
import DocumentManagementPage from './pages/DocumentManagementPage';
import PaymentsPage from './pages/PaymentsPage';
import VisaApplicationPage from './pages/VisaApplicationPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/universities" element={<UniversitiesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId/apply" element={<CourseApplicationPage />} />
            <Route path="/courses/application-success/:applicationId" element={<ApplicationSuccessPage />} />
            <Route path="/dashboard/applications" element={<ApplicationDashboardPage />} />
            <Route path="/documents" element={<DocumentManagementPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/visa-applications" element={<VisaApplicationPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;