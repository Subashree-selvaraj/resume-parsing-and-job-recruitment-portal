import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

const JobApplication = () => {
	const { api, user } = useAuth();
	const { jobId } = useParams();
	const navigate = useNavigate();
	const [resume, setResume] = useState(null);
	const [coverLetter, setCoverLetter] = useState('');
	const [contactInfo, setContactInfo] = useState(user ? user.email : '');
	const [screeningAnswers, setScreeningAnswers] = useState({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState('');

	const handleResumeChange = (e) => {
		setResume(e.target.files[0]);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const formData = new FormData();
			formData.append('resume', resume);
			formData.append('coverLetter', coverLetter);
			formData.append('contactInfo', contactInfo);
			Object.entries(screeningAnswers).forEach(([key, value]) => {
				formData.append(`screening_${key}`, value);
			});
			await api.post(`/applications/${jobId}`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});
			setSuccess(true);
			setTimeout(() => navigate('/jobs'), 2000);
		} catch (err) {
			setError('Failed to submit application.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
			<h2 className="text-xl font-bold mb-4">Apply for Job</h2>
			{success ? (
				<div className="text-green-600 font-semibold">Application submitted! Redirecting...</div>
			) : (
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label className="block font-medium mb-1">Resume (PDF/DOC)</label>
						<input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} required />
					</div>
					<div className="mb-4">
						<label className="block font-medium mb-1">Cover Letter</label>
						<textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} className="w-full border rounded p-2" rows={4} required />
					</div>
					<div className="mb-4">
						<label className="block font-medium mb-1">Contact Email</label>
						<input type="email" value={contactInfo} onChange={e => setContactInfo(e.target.value)} className="w-full border rounded p-2" required />
					</div>
					{/* Example screening question */}
					<div className="mb-4">
						<label className="block font-medium mb-1">Why are you a good fit?</label>
						<input type="text" value={screeningAnswers.fit || ''} onChange={e => setScreeningAnswers(a => ({ ...a, fit: e.target.value }))} className="w-full border rounded p-2" required />
					</div>
					{error && <div className="text-red-600 mb-2">{error}</div>}
					<button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</button>
				</form>
			)}
		</div>
	);
};

export default JobApplication;
