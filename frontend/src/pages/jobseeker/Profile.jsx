import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    headline: user?.headline || '',
    location: user?.location || '',
    skills: user?.skills?.join(', ') || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      headline: user?.headline || '',
      location: user?.location || '',
      skills: user?.skills?.join(', ') || '',
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const updates = {
      firstName: form.firstName,
      lastName: form.lastName,
      headline: form.headline,
      location: form.location,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
    };

    const res = await updateUser(updates);
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="firstName" value={form.firstName} onChange={handleChange} className="p-3 border rounded" />
            <input name="lastName" value={form.lastName} onChange={handleChange} className="p-3 border rounded" />
          </div>
          <input name="headline" value={form.headline} onChange={handleChange} className="p-3 border rounded w-full" placeholder="Professional headline" />
          <input name="location" value={form.location} onChange={handleChange} className="p-3 border rounded w-full" placeholder="Location" />
          <textarea name="skills" value={form.skills} onChange={handleChange} className="p-3 border rounded w-full" placeholder="Comma-separated skills (e.g. React, Node.js)"></textarea>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">{isSaving ? 'Saving...' : 'Save Profile'}</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;