import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const TestLogin = () => {
  const [result, setResult] = useState('');

  const testLogin = async () => {
    try {
      console.log('Testing login API...');
      
      const credentials = {
        email: 'test@test.com',
        password: 'password123'
      };
      
      console.log('Credentials object:', credentials);
      console.log('JSON stringified:', JSON.stringify(credentials));
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Response:', response.data);
      setResult('SUCCESS: ' + JSON.stringify(response.data));
    } catch (error) {
      console.log('Error:', error);
      console.log('Error response:', error.response?.data);
      setResult('ERROR: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>API Test</h2>
      <button onClick={testLogin}>Test Login API</button>
      <pre style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        {result}
      </pre>
    </div>
  );
};

export default TestLogin;