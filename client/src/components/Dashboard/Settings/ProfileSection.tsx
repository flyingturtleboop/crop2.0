// src/components/Dashboard/Settings/ProfileSection.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useToken from '../../useToken';
import { useNotification } from '../../../NotificationContext';
import { HiUser, HiMail, HiLockClosed, HiTrash } from 'react-icons/hi';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  occupation: string;
}

export default function ProfileSection() {
  const { token } = useToken();
  const { notify } = useNotification();

  const [profile, setProfile] = useState<ProfileData>({
    id: 0,
    name: '',
    email: '',
    occupation: ''
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    if (!savedEmail) return;
    axios.get(`http://localhost:5000/profile/${savedEmail}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setProfile(res.data))
    .catch(() => notify('Failed to load profile', 'error'));
  }, [token, notify]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/profile/${profile.email}`,
        { name: profile.name, email: profile.email, password: password.trim() || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      notify('Profile updated!', 'success');
      setPassword('');
      localStorage.setItem('email', profile.email);
    } catch (e: any) {
      notify(e.response?.data?.error || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    notify('Account deletion not implemented', 'error');
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      {/* Personal Information */}
      <div className="bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-6">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <div className="relative">
              <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Your Name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Occupation</label>
            <input
              type="text"
              value={profile.occupation}
              onChange={e => setProfile({ ...profile, occupation: e.target.value })}
              className="w-full py-2 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Your Occupation"
            />
          </div>
        </div>
      </div>
      {/* Security */}
      <div className="bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-6">Security</h2>
        <label className="block text-sm font-medium mb-1">New Password</label>
        <div className="relative max-w-md">
          <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="••••••••"
          />
        </div>
      </div>
      {/* Delete Account */}
      <div className="bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-black flex items-center space-x-2">
          <HiTrash />
          <span>Delete Account</span>
        </h2>
        <p className="mb-6 text-gray-600">
          Deleting your account is irreversible. All your data will be permanently removed.
        </p>
        <button
          className="w-full py-2 bg-red-600 text-red-600 rounded-xl hover:bg-red-700"
          onClick={handleDeleteAccount}
        >
          Delete
        </button>
      </div>
      {/* Save Button */}
      <div className="text-right">
        <button
          disabled={loading}
          onClick={handleSave}
          className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed text-black'
              : 'bg-gradient-to-r from-green-300 to-green-500 hover:from-green-300 hover:to-green-600 text-white'
          }`}
        >
          <span>{loading ? 'Saving…' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}
