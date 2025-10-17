import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaClock, FaBookmark } from 'react-icons/fa';

const JobSeekerDashboard = () => {
  const { user, logout, getUserInitials, api } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobsLoading, setSavedJobsLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs?limit=6');
      setJobs(response.data.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      console.log('Dashboard: Fetching saved jobs...');
      const response = await api.get('/jobs/saved');
      console.log('Dashboard: Saved jobs response:', response.data);
      setSavedJobs(response.data.data.savedJobs || []);
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error);
    } finally {
      setSavedJobsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">{getUserInitials()}</div>
            <div>
              <h2 className="text-xl font-semibold">Welcome back, {user?.firstName || 'User'}</h2>
              <p className="text-sm text-gray-600">Job Seeker Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-indigo-600 hover:underline">Profile</Link>
            <Link to="/applications" className="text-indigo-600 hover:underline">Applications</Link>
            <Link to="/saved-jobs" className="text-indigo-600 hover:underline">Saved Jobs</Link>
            <button onClick={logout} className="bg-red-500 text-white px-3 py-2 rounded-md">Logout</button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Latest Jobs</h3>
              <Link to="/jobs" className="text-indigo-600 hover:underline text-sm">View All</Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No jobs available at the moment.</p>
                <Link to="/jobs" className="text-indigo-600 hover:underline">Browse all jobs</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {job.company?.charAt(0)?.toUpperCase() || 'C'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 hover:text-indigo-600 cursor-pointer" 
                                onClick={() => navigate(`/jobs/${job._id}`)}>
                              {job.title}
                            </h4>
                            <p className="text-sm text-gray-600">{job.company}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                          <span className="flex items-center">
                            <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <FaBriefcase className="w-3 h-3 mr-1" />
                            {job.jobType || job.type}
                          </span>
                          {job.salary?.min && job.salary?.max && (
                            <span className="flex items-center">
                              <FaDollarSign className="w-3 h-3 mr-1" />
                              {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-700 line-clamp-2 mb-3">{job.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {job.requiredSkills?.slice(0, 3).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                                {typeof skill === 'string' ? skill : skill.skill}
                              </span>
                            ))}
                            {job.requiredSkills?.length > 3 && (
                              <span className="text-xs text-gray-500">+{job.requiredSkills.length - 3} more</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center text-xs text-gray-500">
                              <FaClock className="w-3 h-3 mr-1" />
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                            <button 
                              onClick={() => navigate(`/jobs/${job._id}`)}
                              className="bg-indigo-600 text-white px-3 py-1 rounded-md text-xs hover:bg-indigo-700 transition-colors"
                            >
                              View Job
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {/* Saved Jobs Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center">
                  <FaBookmark className="w-4 h-4 mr-2 text-indigo-600" />
                  Saved Jobs
                </h4>
                <Link to="/saved-jobs" className="text-indigo-600 hover:underline text-sm">View All</Link>
              </div>
              
              {savedJobsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : savedJobs.length === 0 ? (
                <div className="text-center py-4">
                  <FaBookmark className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">No saved jobs yet</p>
                  <Link to="/jobs" className="text-indigo-600 hover:underline text-xs">Browse jobs to save</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedJobs.slice(0, 3).map((job) => (
                    <div key={job._id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <h5 className="font-medium text-sm text-gray-900 mb-1 cursor-pointer hover:text-indigo-600"
                          onClick={() => navigate(`/jobs/${job._id}`)}>
                        {job.title}
                      </h5>
                      <p className="text-xs text-gray-600 mb-2">{job.company}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center">
                          <FaMapMarkerAlt className="w-3 h-3 mr-1" />
                          {job.location}
                        </span>
                        <button 
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                  {savedJobs.length > 3 && (
                    <div className="text-center pt-2">
                      <Link to="/saved-jobs" className="text-xs text-indigo-600 hover:underline">
                        +{savedJobs.length - 3} more saved jobs
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Activity Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold">Activity</h4>
              <ul className="mt-3 text-sm text-gray-600 space-y-2">
                <li>Applications submitted: 3</li>
                <li>Interviews scheduled: 1</li>
                <li>Profile completeness: 80%</li>
              </ul>
              <div className="mt-4">
                <Link to="/profile" className="text-indigo-600 hover:underline">Complete your profile</Link>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;