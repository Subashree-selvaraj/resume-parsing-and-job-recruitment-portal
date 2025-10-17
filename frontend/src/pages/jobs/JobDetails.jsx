import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaMapMarkerAlt, FaBriefcase, FaClock, FaDollarSign, FaUsers, FaBookmark, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, isAuthenticated, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null
  });

  useEffect(() => {
    fetchJobDetails();
    if (isAuthenticated && user?.role === 'job_seeker') {
      checkIfJobSaved();
    }
  }, [id, isAuthenticated, user]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.data.job);
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfJobSaved = async () => {
    try {
      const response = await api.get('/jobs/saved');
      const savedJobs = response.data.data.savedJobs;
      const isJobSaved = savedJobs.some(job => job._id === id);
      setIsSaved(isJobSaved);
    } catch (error) {
      console.error('Failed to check if job is saved:', error);
    }
  };

  const toggleSaveJob = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post(`/jobs/${id}/save`);
      setIsSaved(response.data.data.saved);
      alert(response.data.message);
    } catch (error) {
      console.error('Failed to save/unsave job:', error);
      alert(error.response?.data?.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const applyForJob = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!applicationData.resume) {
      alert('Please upload your resume to apply for this job.');
      return;
    }

    setApplying(true);
    try {
      const formData = new FormData();
      formData.append('coverLetter', applicationData.coverLetter);
      formData.append('resume', applicationData.resume);

      await api.post(`/applications/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Application submitted successfully!');
      navigate('/applications');
    } catch (error) {
      console.error('Failed to apply for job:', error);
      alert(error.response?.data?.message || 'Failed to apply for job');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Job Header */}
          <div className="border-b border-gray-200 pb-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {job.company?.charAt(0)?.toUpperCase() || 'C'}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-lg text-gray-600">{job.company}</p>
                  <div className="flex items-center text-gray-500 text-sm mt-2 space-x-4">
                    <span className="flex items-center">
                      <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <FaBriefcase className="w-4 h-4 mr-1" />
                      {job.type}
                    </span>
                    <span className="flex items-center">
                      <FaClock className="w-4 h-4 mr-1" />
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {job.salary?.min && job.salary?.max ? (
                    `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`
                  ) : job.formattedSalary ? (
                    job.formattedSalary.replace(/USD\s*/, '₹').replace(/\$\s*/, '₹')
                  ) : (
                    'Salary not specified'
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {job.salary?.period ? `per ${job.salary.period}` : 'per year'}
                </div>
              </div>
            </div>
          </div>

          {/* Job Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FaUsers className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">{job.applicationCount || 0}</div>
              <div className="text-sm text-gray-500">Applicants</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FaBriefcase className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">
                {typeof job.experienceLevel === 'string' 
                  ? job.experienceLevel 
                  : job.experienceLevel?.level || 'Not specified'
                }
              </div>
              <div className="text-sm text-gray-500">Experience Level</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <FaClock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">
                {(() => {
                  const deadline = job.applicationDeadline || job.deadline;
                  if (!deadline) return 'Open';
                  
                  const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  if (daysLeft < 0) return 'Expired';
                  if (daysLeft === 0) return 'Today';
                  return `${daysLeft} days`;
                })()}
              </div>
              <div className="text-sm text-gray-500">Left to apply</div>
            </div>
          </div>

          {/* Job Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Responsibilities</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
              </div>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="prose prose-gray max-w-none">
                {typeof job.requirements === 'string' ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                ) : (
                  <div className="space-y-4">
                    {job.requirements.education && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Education</h3>
                        <p className="text-gray-700">
                          {typeof job.requirements.education === 'string' 
                            ? job.requirements.education
                            : `${job.requirements.education.level || 'Not specified'} degree${job.requirements.education.field ? ` in ${job.requirements.education.field}` : ''}`
                          }
                        </p>
                      </div>
                    )}
                    {job.requirements.experience && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Experience</h3>
                        <p className="text-gray-700">
                          {typeof job.requirements.experience === 'string' 
                            ? job.requirements.experience
                            : `${job.requirements.experience.min || 0}${job.requirements.experience.max ? `-${job.requirements.experience.max}` : '+'} ${job.requirements.experience.unit || 'years'} of experience`
                          }
                        </p>
                      </div>
                    )}
                    {job.requirements.certifications && job.requirements.certifications.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Certifications</h3>
                        <p className="text-gray-700">
                          {Array.isArray(job.requirements.certifications) 
                            ? job.requirements.certifications.join(', ')
                            : job.requirements.certifications
                          }
                        </p>
                      </div>
                    )}
                    {job.requirements.languages && job.requirements.languages.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Languages</h3>
                        <div className="text-gray-700">
                          {Array.isArray(job.requirements.languages) 
                            ? job.requirements.languages.map((lang, index) => (
                                <span key={index} className="inline-block mr-4 mb-2">
                                  {typeof lang === 'string' 
                                    ? lang 
                                    : `${lang.language} (${lang.proficiency || 'Not specified'})`
                                  }
                                </span>
                              ))
                            : job.requirements.languages
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {((job.skills && job.skills.length > 0) || (job.requiredSkills && job.requiredSkills.length > 0)) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {/* Handle simple skills array */}
                {job.skills && job.skills.map((skill, index) => (
                  <span
                    key={`skill-${index}`}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                  >
                    {typeof skill === 'string' ? skill : skill.skill || skill}
                  </span>
                ))}
                {/* Handle structured requiredSkills array */}
                {job.requiredSkills && job.requiredSkills.map((skillObj, index) => (
                  <span
                    key={`req-skill-${index}`}
                    className={`px-3 py-1 text-sm rounded-full ${
                      skillObj.mandatory ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {typeof skillObj === 'string' ? skillObj : `${skillObj.skill} (${skillObj.level || 'intermediate'})`}
                  </span>
                ))}
              </div>
              
              {/* Preferred Skills */}
              {job.preferredSkills && job.preferredSkills.length > 0 && (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Preferred Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredSkills.map((skillObj, index) => (
                      <span
                        key={`pref-skill-${index}`}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {typeof skillObj === 'string' ? skillObj : `${skillObj.skill} (${skillObj.level || 'intermediate'})`}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (job.benefits.length > 0 || typeof job.benefits === 'string') && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits & Perks</h2>
              <div className="prose prose-gray max-w-none">
                {Array.isArray(job.benefits) ? (
                  <ul className="list-disc list-inside space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="text-gray-700">{benefit}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.benefits}</p>
                )}
              </div>
            </div>
          )}

          {/* Application Section */}
          {isAuthenticated && user?.role === 'job_seeker' && (
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply for this position</h2>
              
              {/* Resume Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setApplicationData({ ...applicationData, resume: e.target.files[0] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-sm text-gray-500 mt-1">Upload your resume in PDF, DOC, or DOCX format</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tell the employer why you're perfect for this role..."
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={applyForJob}
                  disabled={applying}
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>
                
                <button 
                  onClick={toggleSaveJob}
                  disabled={saving}
                  className={`px-6 py-3 border font-medium rounded-md transition-colors ${
                    isSaved 
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FaBookmark className={`w-4 h-4 inline mr-2 ${isSaved ? 'text-indigo-600' : ''}`} />
                  {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save Job'}
                </button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="border-t border-gray-200 pt-8 text-center">
              <p className="text-gray-600 mb-4">Sign in to apply for this position</p>
              <div className="space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register?role=job_seeker')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;