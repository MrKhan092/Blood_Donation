import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Heart, LogOut, Droplet, Activity, Calendar,
  CheckCircle, XCircle, Clock, AlertCircle, Bell,
  Phone, MapPin, Award
} from 'lucide-react';

const DonorDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [relevantRequests, setRelevantRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const daysSinceLastDonation = stats?.daysSinceLastDonation ?? null;
  const progress = daysSinceLastDonation != null
    ? Math.min((daysSinceLastDonation / 90) * 100, 100)
    : 0;

  useEffect(() => {
    fetchDonorStats();
    if (activeTab === 'requests') fetchRelevantRequests();
  }, [activeTab]);

  const fetchDonorStats = async () => {
    try {
      const res = await axios.get('/api/donors/my-donations');
      setStats(res.data.stats || null);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRelevantRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/donors/relevant-requests');
      setRelevantRequests(res.data.requests || []);
    } catch {
      setError('Error fetching blood requests');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    setLoading(true);
    try {
      const res = await axios.put('/api/donors/availability', {
        available: !user.available,
      });
      setSuccess(res.data.message);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating availability');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordDonation = async () => {
    if (!window.confirm('Did you donate blood today?')) return;
    setLoading(true);
    try {
      await axios.put('/api/donors/donation', { donationDate: new Date() });
      setSuccess('Donation recorded successfully!');
      fetchDonorStats();
    } catch {
      setError('Error recording donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-50">
      {/* HEADER */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-600 fill-red-600" />
            <h1 className="text-2xl font-bold">
              Blood<span className="text-red-600">Connect</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-gray-600">
                {user?.bloodType} •{' '}
                <span className={user?.available ? 'text-green-600' : 'text-gray-500'}>
                  {user?.available ? 'Available' : 'Unavailable'}
                </span>
              </p>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
            <AlertCircle /> {error}
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
            <CheckCircle /> {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow">
          {['overview', 'requests'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                activeTab === tab ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'overview' ? <Activity className="inline mr-2" /> : <Bell className="inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Donation Status */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-bold mb-3">Donation Eligibility</h3>

              {stats?.canDonate ? (
                <p className="text-green-600 font-bold flex items-center gap-2">
                  <CheckCircle /> You can donate now
                </p>
              ) : (
                <>
                  <p className="text-orange-600 font-bold flex items-center gap-2 mb-2">
                    <Clock /> Waiting period
                  </p>
                  <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {daysSinceLastDonation != null
                      ? `${90 - daysSinceLastDonation} days remaining`
                      : '—'}
                  </p>
                </>
              )}
            </div>

            {/* Last Donation */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-bold mb-3">Last Donation</h3>
              {user?.lastDonationDate ? (
                <>
                  <p className="text-xl font-bold">
                    {new Date(user.lastDonationDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {daysSinceLastDonation != null
                      ? `${daysSinceLastDonation} days ago`
                      : '—'}
                  </p>
                </>
              ) : (
                <p className="text-gray-400">No donation recorded</p>
              )}
            </div>

            {/* Impact */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-bold mb-3">Your Impact</h3>
              <p className="text-3xl font-bold text-purple-600">
                {stats?.totalDonations ?? 0}
              </p>
              <p className="text-sm text-gray-600">Lives potentially saved</p>
            </div>

            {/* Actions */}
            <div className="md:col-span-3 bg-white p-6 rounded-xl shadow flex flex-col md:flex-row gap-4">
              <button
                onClick={handleRecordDonation}
                disabled={!stats?.canDonate || loading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg disabled:opacity-50 hover:bg-red-700"
              >
                Record Donation
              </button>

              <button
                onClick={handleToggleAvailability}
                disabled={loading}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
              >
                Toggle Availability
              </button>
            </div>
          </div>
        )}

        {/* REQUESTS */}
        {activeTab === 'requests' && (
          <div className="bg-white p-6 rounded-xl shadow">
            {loading ? (
              <p className="text-center text-gray-500">Loading requests...</p>
            ) : relevantRequests.length === 0 ? (
              <p className="text-center text-gray-500">
                No blood requests near you right now.
              </p>
            ) : (
              relevantRequests.map(req => (
                <div
                  key={req._id}
                  className="border rounded-xl p-4 mb-4 hover:shadow transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-red-600 text-lg">
                      {req.bloodType}
                    </p>
                    <span className="text-sm text-gray-500">
                      {req.location.city}, {req.location.state}
                    </span>
                  </div>

                  <p className="font-semibold">{req.patientName}</p>

                  <a
                    href={`tel:${req.contactNumber}`}
                    className="inline-flex items-center gap-2 mt-3 text-green-600 font-semibold"
                  >
                    <Phone className="w-4 h-4" /> Call Now
                  </a>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
