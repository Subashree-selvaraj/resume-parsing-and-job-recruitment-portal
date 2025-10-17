import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Applications = () => {
  const { api } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications/my');
        setApplications(res.data.data.applications || []);
      } catch (err) {
        console.error('Failed to fetch applications', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Applications</h1>
          <div className="flex items-center gap-4">
            <Link to="/jobseeker/dashboard" className="text-indigo-600 hover:underline">Dashboard</Link>
            <Link to="/saved-jobs" className="text-indigo-600 hover:underline">Saved Jobs</Link>
            <Link to="/jobs" className="text-indigo-600 hover:underline">Browse Jobs</Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Application History</h2>
        {loading ? (
          <p>Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-600">You haven't applied to any jobs yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app._id} className="p-4 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{app.jobTitle}</h4>
                    <p className="text-sm text-gray-600">{app.companyName} • {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded text-white ${app.status === 'Applied' ? 'bg-indigo-500' : app.status === 'Shortlisted' ? 'bg-yellow-500' : app.status === 'Interview' ? 'bg-blue-500' : 'bg-green-600'}`}>{app.status}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-700">{app.coverLetter || 'No cover letter provided'}</div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Applications;