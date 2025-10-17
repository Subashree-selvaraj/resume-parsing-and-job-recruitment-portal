import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmail from './pages/VerifyEmail';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRedirect from './components/DashboardRedirect';

// Job Seeker Pages
import JobSeekerDashboard from './pages/jobseeker/Dashboard';
import Profile from './pages/jobseeker/Profile';
import Applications from './pages/jobseeker/Applications';
import ResumeUpload from './pages/jobseeker/ResumeUpload';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import JobManagement from './pages/recruiter/JobManagement';
import PostJob from './pages/recruiter/PostJob';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

// Job Pages
import JobSearch from './pages/jobs/JobSearch';
import JobDetails from './pages/jobs/JobDetails';
import SavedJobs from './pages/jobs/SavedJobs';
import CandidateManagement from './pages/recruiter/CandidateManagement';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="App">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/jobs" element={<JobSearch />} />
              <Route path="/jobs/:id" element={<JobDetails />} />

              {/* Role-based dashboard redirect */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } />

              {/* Job seeker routes */}
              <Route path="/jobseeker/dashboard" element={
                <ProtectedRoute roles={["job_seeker"]}>
                  <JobSeekerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute roles={["job_seeker"]}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/applications" element={
                <ProtectedRoute roles={["job_seeker"]}>
                  <Applications />
                </ProtectedRoute>
              } />
              <Route path="/saved-jobs" element={
                <ProtectedRoute roles={["job_seeker"]}>
                  <SavedJobs />
                </ProtectedRoute>
              } />
              <Route path="/resume-upload" element={
                <ProtectedRoute roles={["job_seeker"]}>
                  <ResumeUpload />
                </ProtectedRoute>
              } />

              {/* Recruiter routes */}
              <Route path="/recruiter/dashboard" element={
                <ProtectedRoute roles={["recruiter"]}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              } />
              <Route path="/recruiter/jobs" element={
                <ProtectedRoute roles={["recruiter"]}>
                  <JobManagement />
                </ProtectedRoute>
              } />
              <Route path="/recruiter/jobs/new" element={
                <ProtectedRoute roles={["recruiter"]}>
                  <PostJob />
                </ProtectedRoute>
              } />
              <Route path="/recruiter/candidates" element={
                <ProtectedRoute roles={["recruiter"]}>
                  <CandidateManagement />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="*" element={<LandingPage />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;