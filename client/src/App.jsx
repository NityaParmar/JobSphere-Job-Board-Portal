import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import JobFeedPage from './pages/JobFeedPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard from './pages/EmployerDashboard';

// 404 Component
const NotFoundPage = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 space-y-3">
    <span className="text-2xs font-mono text-zinc-400 uppercase tracking-widest">404 Error</span>
    <h2 className="text-base font-semibold text-zinc-900">Page Not Found</h2>
    <p className="text-xs text-zinc-500 max-w-sm">
      The requested route does not exist or you do not have permission to view it.
    </p>
    <Link
      to="/jobs"
      className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
    >
      Return to Jobs
    </Link>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Job Feed (Two-Pane Split Layout) */}
              <Route path="/" element={<JobFeedPage />} />
              <Route path="/jobs" element={<JobFeedPage />} />
              <Route path="/jobs/:id" element={<JobFeedPage />} />

              {/* Auth Pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Candidate Routes */}
              <Route
                path="/candidate/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CANDIDATE']}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Employer Routes */}
              <Route
                path="/employer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
