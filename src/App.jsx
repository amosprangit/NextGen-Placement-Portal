import { Routes, Route } from 'react-router-dom'

import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterStudentPage from './pages/RegisterStudentPage.jsx'
import RegisterRecruiterPage from './pages/RegisterRecruiterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'

import ProtectedRoute from './components/ProtectedRoute.jsx'
import DashboardLayout from './components/layout/DashboardLayout.jsx'

import StudentOverview from './pages/student/StudentOverview.jsx'
import StudentDrives from './pages/student/StudentDrives.jsx'
import StudentDriveDetail from './pages/student/StudentDriveDetail.jsx'
import StudentApplications from './pages/student/StudentApplications.jsx'
import StudentProfile from './pages/student/StudentProfile.jsx'
import StudentProfileEdit from './pages/student/StudentProfileEdit.jsx'

import RecruiterOverview from './pages/recruiter/RecruiterOverview.jsx'
import RecruiterDrives from './pages/recruiter/RecruiterDrives.jsx'
import RecruiterDriveForm from './pages/recruiter/RecruiterDriveForm.jsx'
import RecruiterDriveManage from './pages/recruiter/RecruiterDriveManage.jsx'
import RecruiterProfile from './pages/recruiter/RecruiterProfile.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminStudents from './pages/admin/AdminStudents.jsx'
import AdminStudentDetail from './pages/admin/AdminStudentDetail.jsx'
import AdminRecruiters from './pages/admin/AdminRecruiters.jsx'
import AdminDrives from './pages/admin/AdminDrives.jsx'
import AdminDriveDetail from './pages/admin/AdminDriveDetail.jsx'
import AdminProfile from './pages/admin/AdminProfile.jsx'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/student" element={<RegisterStudentPage />} />
      <Route path="/register/recruiter" element={<RegisterRecruiterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Student dashboard */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <DashboardLayout role="student" />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentOverview />} />
        <Route path="drives" element={<StudentDrives />} />
        <Route path="drives/:id" element={<StudentDriveDetail />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="profile/edit" element={<StudentProfileEdit />} />
      </Route>

      {/* Recruiter dashboard */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute role="recruiter">
            <DashboardLayout role="recruiter" />
          </ProtectedRoute>
        }
      >
        <Route index element={<RecruiterOverview />} />
        <Route path="drives" element={<RecruiterDrives />} />
        <Route path="drives/new" element={<RecruiterDriveForm />} />
        <Route path="drives/:id" element={<RecruiterDriveManage />} />
        <Route path="profile" element={<RecruiterProfile />} />
      </Route>

      {/* Admin (placement cell) dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="students/:id" element={<AdminStudentDetail />} />
        <Route path="recruiters" element={<AdminRecruiters />} />
        <Route path="drives" element={<AdminDrives />} />
        <Route path="drives/:id" element={<AdminDriveDetail />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  )
}
