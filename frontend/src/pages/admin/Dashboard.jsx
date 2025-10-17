import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaUsers, FaBriefcase, FaBuilding, FaChartLine, FaUserCheck, FaUserTimes, FaEye, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout, getUserInitials, api } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobSeekers: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    activeJobs: 0,
    pendingRecruiters: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, recruitersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users/recent?limit=5'),
        api.get('/admin/recruiters/pending?limit=5')
      ]);

      setStats(statsRes.data.data || {});
      setRecentUsers(usersRes.data.data.users || []);
      setPendingRecruiters(recruitersRes.data.data.recruiters || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyRecruiter = async (recruiterId) => {
    try {
      await api.patch(`/admin/recruiters/${recruiterId}/verify`);
      setPendingRecruiters(prev => prev.filter(r => r._id !== recruiterId));
      setStats(prev => ({ ...prev, pendingRecruiters: prev.pendingRecruiters - 1 }));
    } catch (error) {
      console.error('Failed to verify recruiter:', error);
    }
  };

  const rejectRecruiter = async (recruiterId) => {
    try {
      await api.patch(`/admin/recruiters/${recruiterId}/reject`);
      setPendingRecruiters(prev => prev.filter(r => r._id !== recruiterId));
      setStats(prev => ({ ...prev, pendingRecruiters: prev.pendingRecruiters - 1 }));
    } catch (error) {
      console.error('Failed to reject recruiter:', error);
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
              <span className="ml-4 text-gray-700">Admin Dashboard</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/admin/users" className="text-gray-700 hover:text-indigo-600 transition-colors">Users</Link>
              <Link to="/admin/jobs" className="text-gray-700 hover:text-indigo-600 transition-colors">Jobs</Link>
              <Link to="/admin/recruiters" className="text-gray-700 hover:text-indigo-600 transition-colors">Recruiters</Link>
              <Link to="/admin/analytics" className="text-gray-700 hover:text-indigo-600 transition-colors">Analytics</Link>
              <Link to="/admin/reports" className="text-gray-700 hover:text-indigo-600 transition-colors">Reports</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-medium text-sm">
                  {getUserInitials()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600">Manage users, jobs, and system settings from your admin panel.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaUsers}
            title="Total Users"
            value={stats.totalUsers}
            color="border-l-4 border-blue-500"
          />
          <StatCard
            icon={FaUsers}
            title="Job Seekers"
            value={stats.totalJobSeekers}
            color="border-l-4 border-green-500"
          />
          <StatCard
            icon={FaBuilding}
            title="Recruiters"
            value={stats.totalRecruiters}
            color="border-l-4 border-purple-500"
          />
          <StatCard
            icon={FaBriefcase}
            title="Total Jobs"
            value={stats.totalJobs}
            color="border-l-4 border-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <Link
                to="/admin/users"
                className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
              >
                View all →
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent users</p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-sm">
                        {user.firstName?.charAt(0)?.toUpperCase()}{user.lastName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        {user.role} • Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Recruiters */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Pending Recruiter Verifications</h2>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {stats.pendingRecruiters} pending
              </span>
            </div>
            
            <div className="space-y-4">
              {pendingRecruiters.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending verifications</p>
              ) : (
                pendingRecruiters.map((recruiter) => (
                  <div key={recruiter._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {recruiter.firstName} {recruiter.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{recruiter.email}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Company:</span> {recruiter.companyName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Industry:</span> {recruiter.industry}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Applied {new Date(recruiter.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => verifyRecruiter(recruiter._id)}
                          className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                          title="Approve"
                        >
                          <FaUserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectRecruiter(recruiter._id)}
                          className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          title="Reject"
                        >
                          <FaUserTimes className="w-4 h-4" />
                        </button>
                      </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <FaUsers className="w-8 h-8 text-indigo-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-500">View and manage all users</p>
              </div>
            </Link>
            
            <Link
              to="/admin/jobs"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <FaBriefcase className="w-8 h-8 text-indigo-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">Monitor Jobs</h3>
                <p className="text-sm text-gray-500">Moderate job postings</p>
              </div>
            </Link>
            
            <Link
              to="/admin/recruiters"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <FaBuilding className="w-8 h-8 text-indigo-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">Verify Recruiters</h3>
                <p className="text-sm text-gray-500">Approve recruiter accounts</p>
              </div>
            </Link>
            
            <Link
              to="/admin/analytics"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <FaChartLine className="w-8 h-8 text-indigo-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-500">Platform insights</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;