import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const JobManagement = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/my');
      setJobs(response.data.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await api.delete(`/jobs/${jobId}`);
        setJobs(jobs.filter(job => job._id !== jobId));
      } catch (error) {
        console.error('Failed to delete job:', error);
      }
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      let newStatus;
      if (currentStatus === 'draft') {
        newStatus = 'active';
      } else if (currentStatus === 'active') {
        newStatus = 'closed';
      } else {
        newStatus = 'active';
      }
      
      await api.patch(`/jobs/${jobId}/status`, { status: newStatus });
      setJobs(jobs.map(job => 
        job._id === jobId ? { ...job, status: newStatus } : job
      ));
    } catch (error) {
      console.error('Failed to update job status:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to update job status: ${error.response?.data?.message || error.message}`);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
            <p className="text-gray-600">Manage your job postings and track applications</p>
          </div>
          <Link
            to="/recruiter/jobs/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Post New Job
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
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
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
            
            <div className="flex items-center text-sm text-gray-600">
              <FaFilter className="w-4 h-4 mr-2" />
              {filteredJobs.length} of {jobs.length} jobs
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FaBriefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500 mb-6">
                {jobs.length === 0 ? "You haven't posted any jobs yet." : "No jobs match your current filters."}
              </p>
              <Link
                to="/recruiter/jobs/new"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Post Your First Job
              </Link>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' :
                        job.status === 'closed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {job.type}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <p><span className="font-medium">Location:</span> {job.location}</p>
                      <p><span className="font-medium">Salary:</span> ${job.salaryRange?.min?.toLocaleString()} - ${job.salaryRange?.max?.toLocaleString()}</p>
                      <p><span className="font-medium">Experience:</span> {job.experienceLevel}</p>
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      <span>{job.applicationCount || 0} applications</span>
                      {job.applicationDeadline && (
                        <span>Expires {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      type="button"
                      onClick={() => navigate(`/recruiter/jobs/${job._id}`)}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="View Details"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/recruiter/jobs/${job._id}/edit`)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Job"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleJobStatus(job._id, job.status)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        job.status === 'active' 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {job.status === 'active' ? 'Close' : 
                       job.status === 'draft' ? 'Activate' : 
                       job.status === 'closed' ? 'Reopen' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteJob(job._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Job"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;