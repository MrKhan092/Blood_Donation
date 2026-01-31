import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Heart, LogOut, Building2, Search, Plus, FileText, 
  TrendingUp, Users, Droplet, Activity, AlertCircle,
  CheckCircle, XCircle, Phone, Mail, MapPin, Clock,
  BarChart3, Filter, Download
} from 'lucide-react';

const HospitalDashboard = () => {
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [bloodStats, setBloodStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bulk Search Form
  const [searchForm, setSearchForm] = useState({
    bloodTypes: [],
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    availableOnly: true
  });

  // Single Request Form
  const [requestForm, setRequestForm] = useState({
    bloodType: '',
    unitsNeeded: 1,
    urgency: 'urgent',
    patientName: '',
    contactNumber: user?.phone || '',
    reason: '',
    notes: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Fetch data on tab change
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardStats();
      fetchBloodStats();
    } else if (activeTab === 'requests') {
      fetchMyRequests();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/hospitals/dashboard');
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchBloodStats = async () => {
    try {
      const response = await axios.get('/api/hospitals/blood-stats');
      setBloodStats(response.data);
    } catch (err) {
      console.error('Error fetching blood stats:', err);
    }
  };

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/hospitals/my-requests');
      setMyRequests(response.data.requests);
    } catch (err) {
      setError('Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('/api/hospitals/bulk-search', searchForm);
      setDonors(response.data.donors);
      setSuccess(`Found ${response.data.count} donors`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching donors');
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBloodType = (type) => {
    setSearchForm(prev => ({
      ...prev,
      bloodTypes: prev.bloodTypes.includes(type)
        ? prev.bloodTypes.filter(t => t !== type)
        : [...prev.bloodTypes, type]
    }));
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('/api/requests', requestForm);
      setSuccess('Blood request created successfully!');
      setRequestForm({
        bloodType: '',
        unitsNeeded: 1,
        urgency: 'urgent',
        patientName: '',
        contactNumber: user?.phone || '',
        reason: '',
        notes: ''
      });
      
      // Refresh requests
      setTimeout(() => {
        setActiveTab('requests');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating request');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await axios.put(`/api/requests/${requestId}/status`, { status });
      setSuccess(`Request ${status}`);
      fetchMyRequests();
    } catch (err) {
      setError('Error updating request');
    }
  };

  const exportDonorList = () => {
    if (donors.length === 0) return;

    const csvContent = [
      ['Name', 'Blood Type', 'Phone', 'Email', 'City', 'State', 'Available', 'Can Donate'],
      ...donors.map(d => [
        d.name || 'N/A',
        d.bloodType || 'N/A',
        d.phone || 'N/A',
        d.email || 'N/A',
        d.location?.city || 'N/A',
        d.location?.state || 'N/A',
        d.available ? 'Yes' : 'No',
        d.canDonate ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-600 fill-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Blood<span className="text-red-600">Connect</span>
                </h1>
                <p className="text-sm text-gray-600">Hospital Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{user?.hospitalName}</p>
                <p className="text-xs text-gray-600">Admin: {user?.name}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Overview</span>
          </button>
          
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Bulk Search</span>
          </button>
          
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>Create Request</span>
          </button>
          
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>My Requests</span>
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            
            {/* Hospital Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{user?.hospitalName}</h2>
                  <p className="text-gray-600">Registration: {user?.registrationNumber}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {user?.location?.city}, {user?.location?.state}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              {/* Total Requests */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Total Requests</h3>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.requests.total}</p>
              </div>

              {/* Active Requests */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Active</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.requests.active}</p>
              </div>

              {/* Fulfilled Requests */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Fulfilled</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.requests.fulfilled}</p>
              </div>

              {/* Available Donors */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700">Available Donors</h3>
                </div>
                <p className="text-3xl font-bold text-red-600">{stats.donors.available}</p>
                <p className="text-sm text-gray-600 mt-1">of {stats.donors.total} total</p>
              </div>
            </div>

            {/* Blood Type Distribution */}
            {bloodStats && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Blood Type Distribution in {bloodStats.city}
                </h3>

                <div className="grid grid-cols-4 gap-4">
                  {bloodTypes.map(type => {
                    const donorStat = bloodStats.donorStats.find(s => s._id === type);
                    const requestStat = bloodStats.requestStats.find(s => s._id === type);
                    
                    return (
                      <div key={type} className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all">
                        <div className="text-center mb-3">
                          <div className="text-3xl font-bold text-red-600">{type}</div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-semibold">{donorStat?.total || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Available:</span>
                            <span className="font-semibold text-green-600">{donorStat?.available || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Requests:</span>
                            <span className="font-semibold text-orange-600">{requestStat?.totalRequests || 0}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bulk Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Search className="w-6 h-6 text-blue-600" />
                Bulk Donor Search
              </h2>

              <form onSubmit={handleBulkSearch} className="space-y-6">
                {/* Blood Types Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Blood Types (Multiple) *
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {bloodTypes.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleToggleBloodType(type)}
                        className={`py-3 px-4 border-2 rounded-lg font-semibold transition-all ${
                          searchForm.bloodTypes.includes(type)
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={searchForm.city}
                      onChange={(e) => setSearchForm({ ...searchForm, city: e.target.value })}
                      placeholder="City name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={searchForm.state}
                      onChange={(e) => setSearchForm({ ...searchForm, state: e.target.value })}
                      placeholder="State name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="availableOnly"
                    checked={searchForm.availableOnly}
                    onChange={(e) => setSearchForm({ ...searchForm, availableOnly: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="availableOnly" className="text-sm font-medium text-gray-700">
                    Show only available donors
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || searchForm.bloodTypes.length === 0}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Search Donors</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Search Results */}
            {donors.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800">
                    Found {donors.length} Donor{donors.length !== 1 ? 's' : ''}
                  </h3>
                  <button
                    onClick={exportDonorList}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Blood Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {donors.map((donor) => (
                        <tr key={donor.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <p className="font-medium text-gray-800">{donor.name || 'N/A'}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                              <Droplet className="w-4 h-4" />
                              {donor.bloodType || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {donor.phone ? (
                              <a href={`tel:${donor.phone}`} className="text-blue-600 hover:underline">
                                {donor.phone}
                              </a>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {donor.email ? (
                              <a href={`mailto:${donor.email}`} className="text-blue-600 hover:underline text-sm">
                                {donor.email}
                              </a>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {donor.location?.city || 'N/A'}, {donor.location?.state || 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            {donor.available && donor.canDonate ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                Available
                              </span>
                            ) : donor.available ? (
                              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                Wait Period
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                Not Available
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Request Tab */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6 text-blue-600" />
              Create Blood Request
            </h2>

            <form onSubmit={handleCreateRequest} className="space-y-6">
              {/* Blood Type & Units */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Type Required *
                  </label>
                  <select
                    value={requestForm.bloodType}
                    onChange={(e) => setRequestForm({ ...requestForm, bloodType: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Blood Type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Units Needed *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={requestForm.unitsNeeded}
                    onChange={(e) => setRequestForm({ ...requestForm, unitsNeeded: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['critical', 'urgent', 'normal'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setRequestForm({ ...requestForm, urgency: level })}
                      className={`py-3 px-4 rounded-lg font-semibold capitalize transition-all ${
                        requestForm.urgency === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    value={requestForm.patientName}
                    onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                    placeholder="Full name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={requestForm.contactNumber}
                    onChange={(e) => setRequestForm({ ...requestForm, contactNumber: e.target.value })}
                    placeholder="10-digit number"
                    pattern="[6-9][0-9]{9}"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Reason & Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Blood Request
                </label>
                <input
                  type="text"
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  placeholder="e.g., Surgery, Accident, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                  placeholder="Any additional information..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Request...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Create Blood Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Hospital Blood Requests
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading requests...</p>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No blood requests yet</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create First Request</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <div
                    key={request._id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                          <Droplet className="w-7 h-7 text-red-600 fill-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{request.patientName}</h3>
                          <p className="text-2xl font-bold text-red-600">{request.bloodType}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'active' ? 'bg-green-100 text-green-700' :
                          request.status === 'fulfilled' ? 'bg-blue-100 text-blue-700' :
                          request.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {request.status}
                        </span>

                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          request.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                          request.urgency === 'urgent' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {request.urgency}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Droplet className="w-4 h-4" />
                          <span>Units: {request.unitsNeeded}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{request.contactNumber}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{request.location?.city || 'N/A'}, {request.location?.state || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700"><strong>Reason:</strong> {request.reason}</p>
                      </div>
                    )}

                    {request.responses && request.responses.length > 0 && (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-semibold text-green-800 mb-2">
                          Donor Responses: {request.responses.length}
                        </p>
                        <div className="space-y-2">
                          {request.responses.map((response, idx) => (
                            <div key={idx} className="text-sm text-green-700">
                              • {response.donor?.name} ({response.donor?.bloodType}) - {response.status}
                              {response.donor?.phone && ` - ${response.donor.phone}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {request.status === 'active' && (
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleUpdateStatus(request._id, 'fulfilled')}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-semibold"
                        >
                          Mark as Fulfilled
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(request._id, 'cancelled')}
                          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm font-semibold"
                        >
                          Cancel Request
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;