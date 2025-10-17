import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    axios.get(`/api/auth/verify-email?token=${token}`)
      .then(res => {
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch(() => setStatus('error'));
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md text-center">
        {status === 'verifying' && <p>Verifying your email...</p>}
        {status === 'success' && <p className="text-green-600">Email verified! Redirecting to login...</p>}
        {status === 'error' && <p className="text-red-600">Verification failed. Please try again or contact support.</p>}
      </div>
    </div>
  );
};

export default VerifyEmail;
