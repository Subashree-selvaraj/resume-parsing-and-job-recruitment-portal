import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBriefcase, FaUsers, FaChartLine, FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RecruiterDashboard = () => {
  const { user, logout, getUserInitials, api } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh data when returning to dashboard
  useEffect(() => {
    if (location.pathname === '/recruiter/dashboard') {
      fetchDashboardData();
    }
  }, [location.pathname]);

  // Refresh data when page becomes visible (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes, applicationsRes] = await Promise.all([
        api.get('/jobs/stats'),
        api.get('/jobs/my?limit=5'),
        api.get('/applications/recent?limit=5')
      ]);

      console.log('Dashboard API responses:', {
        stats: statsRes.data,
        jobs: jobsRes.data,
        applications: applicationsRes.data
      });

      // Only show jobs posted by this recruiter
      const recruiterId = user?.id || user?._id;
      const myJobs = (jobsRes.data.data.jobs || []).filter(j => j.postedBy === recruiterId || j.postedBy?._id === recruiterId);
      setStats({
        ...statsRes.data.data,
        totalJobs: myJobs.length
      });
      setRecentJobs(myJobs);
      setRecentApplications(applicationsRes.data.data.applications || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Log which specific API failed
      console.error('API Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-lg p-6 shadow-lg cursor-pointer ${color}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-4', 'bg-opacity-20 bg')}`}>
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-indigo-600 font-bold text-xl">JobPortal</Link>
              <span className="ml-4 text-gray-500">|</span>
              <span className="ml-4 text-gray-700">Recruiter Dashboard</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/recruiter/jobs" className="text-gray-700 hover:text-indigo-600 transition-colors">Jobs</Link>
              <Link to="/recruiter/candidates" className="text-gray-700 hover:text-indigo-600 transition-colors">Candidates</Link>
              <Link to="/recruiter/analytics" className="text-gray-700 hover:text-indigo-600 transition-colors">Analytics</Link>
              <Link to="/recruiter/profile" className="text-gray-700 hover:text-indigo-600 transition-colors">Profile</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium text-sm">
                  {getUserInitials()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.companyName}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
            <p className="text-gray-600">Here's what's happening with your recruitment activities.</p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboardData();
            }}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaBriefcase}
            title="Total Jobs"
            value={stats.totalJobs}
            color="border-l-4 border-blue-500"
            onClick={() => navigate('/recruiter/jobs')}
          />
          <StatCard
            icon={FaBriefcase}
            title="Active Jobs"
            value={stats.activeJobs}
            color="border-l-4 border-green-500"
            onClick={() => navigate('/recruiter/jobs?status=active')}
          />
          <StatCard
            icon={FaUsers}
            title="Total Applications"
            value={stats.totalApplications}
            color="border-l-4 border-purple-500"
            onClick={() => navigate('/recruiter/candidates')}
          />
          <StatCard
            icon={FaChartLine}
            title="New Applications"
            value={stats.newApplications}
            color="border-l-4 border-orange-500"
            onClick={() => navigate('/recruiter/candidates?filter=new')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
              <Link
                to="/recruiter/jobs/new"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Post Job
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No jobs posted yet</p>
              ) : (
                recentJobs.map((job) => (
                  <div key={job._id} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.location} • {job.jobType || job.type}</p>
                        <p className="text-xs text-gray-400">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => navigate(`/recruiter/jobs/${job._id}`)}
                            className="p-1 text-gray-400 hover:text-indigo-600"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/recruiter/jobs/${job._id}/edit`)}
                            className="p-1 text-gray-400 hover:text-indigo-600"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {recentJobs.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Link
                  to="/recruiter/jobs"
                  className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
                >
                  View all jobs →
                </Link>
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
              <Link
                to="/recruiter/candidates"
                className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
              >
                View all →
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentApplications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No applications yet</p>
              ) : (
                recentApplications.map((application) => (
                  <div key={application._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-sm">
                        {application.candidateName?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {application.candidateName || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{application.jobTitle}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        application.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'Shortlisted' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'Interview' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/recruiter/jobs/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <FaPlus className="w-8 h-8 text-indigo-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">Post New Job</h3>
                <p className="text-sm text-gray-500">Create a new job posting</p>
              </div>
            </Link>
            
            <Link
              to="/recruiter/candidates"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <FaUsers className="w-8 h-8 text-indigo-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">View Candidates</h3>
                <p className="text-sm text-gray-500">Manage job applications</p>
              </div>
            </Link>
            
            <Link
              to="/recruiter/analytics"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <FaChartLine className="w-8 h-8 text-indigo-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-500">Track hiring performance</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;