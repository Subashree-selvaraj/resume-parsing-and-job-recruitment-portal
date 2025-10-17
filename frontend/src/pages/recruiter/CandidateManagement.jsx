import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaUsers, FaSearch, FaFilter, FaEye, FaCheck, FaTimes, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CandidateManagement = () => {
  const { api } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchApplications();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, jobFilter]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (jobFilter !== 'all') params.append('jobId', jobFilter);
      
      const response = await api.get(`/applications/manage?${params.toString()}`);
      setApplications(response.data.data.applications || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/my');
      setJobs(response.data.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      setApplications(prev =>
        prev.map(app =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800';
      case 'Shortlisted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Interview':
        return 'bg-purple-100 text-purple-800';
      case 'Hired':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ApplicationCard = ({ application }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold text-lg">
              {application.candidateName?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {application.candidateName || 'Anonymous Candidate'}
            </h3>
            <p className="text-gray-600">{application.jobTitle}</p>
            <div className="flex items-center text-sm text-gray-500 space-x-4 mt-1">
              <span className="flex items-center">
                <FaEnvelope className="w-3 h-3 mr-1" />
                {application.candidateEmail}
              </span>
              <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
            {application.status}
          </span>
        </div>
      </div>

      {application.coverLetter && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Cover Letter</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md line-clamp-3">
            {application.coverLetter}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {application.resumeUrl && (
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 text-sm hover:text-indigo-800"
            >
              View Resume
            </a>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {application.status === 'Applied' && (
            <>
              <button
                onClick={() => updateApplicationStatus(application._id, 'Shortlisted')}
                className="p-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                title="Shortlist"
              >
                <FaCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateApplicationStatus(application._id, 'Rejected')}
                className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                title="Reject"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </>
          )}
          
          {application.status === 'Shortlisted' && (
            <>
              <button
                onClick={() => updateApplicationStatus(application._id, 'Interview')}
                className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-md hover:bg-purple-200 transition-colors"
              >
                Schedule Interview
              </button>
              <button
                onClick={() => updateApplicationStatus(application._id, 'Rejected')}
                className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                title="Reject"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </>
          )}
          
          {application.status === 'Interview' && (
            <>
              <button
                onClick={() => updateApplicationStatus(application._id, 'Hired')}
                className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-md hover:bg-green-200 transition-colors"
              >
                Hire
              </button>
              <button
                onClick={() => updateApplicationStatus(application._id, 'Rejected')}
                className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                title="Reject"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </>
          )}
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Candidate Management</h1>
          <p className="text-gray-600">Review and manage job applications</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>
            
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Jobs</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
            
            <div className="flex items-center text-sm text-gray-600">
              <FaUsers className="w-4 h-4 mr-2" />
              {applications.length} candidates
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FaUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-500">
                {jobs.length === 0 
                  ? "Post some jobs to start receiving applications."
                  : "Applications matching your filters will appear here."
                }
              </p>
            </div>
          ) : (
            applications.map((application) => (
              <ApplicationCard key={application._id} application={application} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateManagement;