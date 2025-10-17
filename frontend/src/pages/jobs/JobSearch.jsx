import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaFilter, FaBookmark, FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const JobSearch = () => {
  const { api, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [savedJobs, setSavedJobs] = useState(new Set());

  useEffect(() => {
    fetchJobs();
    if (isAuthenticated) {
      fetchSavedJobs();
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, location, jobType, experienceLevel, salaryRange]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (location) params.append('location', location);
      if (jobType) params.append('type', jobType);
      if (experienceLevel) params.append('experienceLevel', experienceLevel);
      if (salaryRange) params.append('salaryRange', salaryRange);
      
  const response = await api.get(`/jobs?${params.toString()}`);
  setJobs(response.data.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await api.get('/jobs/saved');
      const savedJobIds = response.data.data.jobs?.map(job => job._id) || [];
      setSavedJobs(new Set(savedJobIds));
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error);
    }
  };

  const saveJob = async (jobId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (savedJobs.has(jobId)) {
        await api.delete(`/jobs/${jobId}/save`);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await api.post(`/jobs/${jobId}/save`);
        setSavedJobs(prev => new Set([...prev, jobId]));
      }
    } catch (error) {
      console.error('Failed to save/unsave job:', error);
    }
  };

  const JobCard = ({ job }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {job.company?.charAt(0)?.toUpperCase() || 'C'}
              </span>
            </div>
            <div>
              <Link
                to={`/jobs/${job._id}`}
                className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
              >
                {job.title}
              </Link>
              <p className="text-gray-600">{job.company}</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
            <span className="flex items-center">
              <FaMapMarkerAlt className="w-4 h-4 mr-1" />
              {job.location}
            </span>
            <span className="flex items-center">
              <FaBriefcase className="w-4 h-4 mr-1" />
              {job.type}
            </span>
            <span>
              ${job.salaryRange?.min?.toLocaleString()} - ${job.salaryRange?.max?.toLocaleString()}
            </span>
          </div>
          
          <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills?.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
            {job.skills?.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </span>
              <span className="text-xs text-gray-500">
                {job.applicationCount || 0} applicants
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => saveJob(job._id)}
                className={`p-2 rounded-full transition-colors ${
                  savedJobs.has(job._id)
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                }`}
                title={savedJobs.has(job._id) ? 'Remove from saved' : 'Save job'}
              >
                <FaHeart className="w-4 h-4" />
              </button>
              
              <Link
                to={`/jobs/${job._id}`}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Find Your Dream Job</h1>
              <p className="text-gray-600">Discover opportunities that match your skills and interests</p>
            </div>
            {isAuthenticated && (
              <Link
                to="/saved-jobs"
                className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
              >
                <FaBookmark className="w-4 h-4 mr-2" />
                Saved Jobs ({savedJobs.size})
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Job title or keyword"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Job Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
            
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Experience Levels</option>
              <option value="entry-level">Entry Level</option>
              <option value="mid-level">Mid Level</option>
              <option value="senior-level">Senior Level</option>
              <option value="executive">Executive</option>
            </select>
            
            <select
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Any Salary</option>
              <option value="0-50000">$0 - $50,000</option>
              <option value="50000-100000">$50,000 - $100,000</option>
              <option value="100000-150000">$100,000 - $150,000</option>
              <option value="150000+">$150,000+</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {loading ? 'Loading...' : `${jobs.length} Jobs Found`}
            </h2>
            {(searchTerm || location || jobType || experienceLevel || salaryRange) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setLocation('');
                  setJobType('');
                  setExperienceLevel('');
                  setSalaryRange('');
                }}
                className="text-indigo-600 text-sm hover:text-indigo-800"
              >
                Clear filters
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <FaFilter className="w-4 h-4 text-gray-400" />
            <select className="text-sm border-0 focus:ring-0">
              <option>Most Recent</option>
              <option>Most Relevant</option>
              <option>Salary: High to Low</option>
              <option>Salary: Low to High</option>
            </select>
          </div>
        </div>

        {/* Job Cards */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <FaSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or browse all available positions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;