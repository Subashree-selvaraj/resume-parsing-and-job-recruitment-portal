import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ResumeUpload = () => {
  const { api } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) return setMessage('Please choose a resume file');
    setUploading(true);
    const form = new FormData();
    form.append('resume', file);

    try {
      const res = await api.post('/resume/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Resume uploaded and parsed successfully');
    } catch (err) {
      console.error(err);
      setMessage('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        <div className="mt-4">
          <button onClick={handleUpload} disabled={uploading} className="px-4 py-2 bg-indigo-600 text-white rounded">
            {uploading ? 'Uploading...' : 'Upload & Parse'}
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
};

export default ResumeUpload;