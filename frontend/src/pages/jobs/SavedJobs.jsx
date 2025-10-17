import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaMapMarkerAlt, FaBriefcase, FaClock, FaBookmark, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SavedJobs = () => {
  const navigate = useNavigate();
  const { api, isAuthenticated, user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingJob, setRemovingJob] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'job_seeker') {
      navigate('/dashboard');
      return;
    }

    fetchSavedJobs();
  }, [isAuthenticated, user]);

  const fetchSavedJobs = async () => {
    try {
      console.log('Fetching saved jobs...');
      const response = await api.get('/jobs/saved');
      console.log('Saved jobs response:', response.data);
      setSavedJobs(response.data.data.savedJobs);
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = async (jobId) => {
    setRemovingJob(jobId);
    try {
      await api.post(`/jobs/${jobId}/save`);
      setSavedJobs(savedJobs.filter(job => job._id !== jobId));
    } catch (error) {
      console.error('Failed to remove saved job:', error);
      alert('Failed to remove job from saved list');
    } finally {
      setRemovingJob(null);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || !salary.min || !salary.max) return 'Salary not specified';
    return `₹${salary.min.toLocaleString()} - ₹${salary.max.toLocaleString()} per ${salary.period || 'year'}`;
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return 'Open';
    
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Today';
    return `${daysLeft} days left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
          <p className="text-gray-600 mt-2">
            {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaBookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring jobs and save the ones you're interested in to build your list.
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 
                        className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        {job.title}
                      </h3>
                      <button
                        onClick={() => removeSavedJob(job._id)}
                        disabled={removingJob === job._id}
                        className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Remove from saved jobs"
                      >
                        {removingJob === job._id ? (
                          <div className="w-5 h-5 animate-spin border-2 border-gray-300 border-t-red-600 rounded-full"></div>
                        ) : (
                          <FaTrash className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    <p className="text-lg text-gray-600 mb-3">{job.company}</p>
                    
                    <div className="flex flex-wrap items-center text-gray-500 text-sm space-x-4 mb-3">
                      <span className="flex items-center">
                        <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <FaClock className="w-4 h-4 mr-1" />
                        Saved {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <FaBriefcase className="w-4 h-4 mr-1" />
                        {getDaysLeft(job.applicationDeadline)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-green-600">
                        {formatSalary(job.salary)}
                      </div>
                      <button
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;