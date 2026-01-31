import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Heart, LogOut, User, Search, Droplet, MapPin, Phone, 
  Mail, Calendar, Plus, AlertCircle, CheckCircle, Clock,
  XCircle, FileText, Filter
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('search'); // search, create, requests
  const [donors, setDonors] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search Form
  const [searchForm, setSearchForm] = useState({
    bloodType: '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    pincode: ''
  });

  // Request Form
  const [requestForm, setRequestForm] = useState({
    bloodType: '',
    unitsNeeded: 1,
    urgency: 'urgent',
    patientName: '',
    contactNumber: user?.phone || '',
    hospitalName: '',
    address: user?.location?.address || '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    pincode: user?.location?.pincode || '',
    reason: '',
    notes: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Fetch my requests on load
  useEffect(() => {
    if (activeTab === 'requests') {
      fetchMyRequests();
    }
  }, [activeTab]);

  // Search Donors
  const handleSearchDonors = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchForm.bloodType) params.append('bloodType', searchForm.bloodType);
      if (searchForm.city) params.append('city', searchForm.city);
      if (searchForm.state) params.append('state', searchForm.state);
      if (searchForm.pincode) params.append('pincode', searchForm.pincode);

      const response = await axios.get(`/api/donors/search?${params.toString()}`);
      
      setDonors(response.data.donors);
      setSuccess(`Found ${response.data.count} donors`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching donors');
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  // Create Blood Request
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
        hospitalName: '',
        address: user?.location?.address || '',
        city: user?.location?.city || '',
        state: user?.location?.state || '',
        pincode: user?.location?.pincode || '',
        reason: '',
        notes: ''
      });
      
      // Switch to requests tab
      setTimeout(() => {
        setActiveTab('requests');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating request');
    } finally {
      setLoading(false);
    }
  };

  // Fetch My Requests
  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/requests/my-requests');
      setMyRequests(response.data.requests);
    } catch (err) {
      setError('Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  // Update Request Status
  const handleUpdateStatus = async (requestId, status) => {
    try {
      await axios.put(`/api/requests/${requestId}/status`, { status });
      setSuccess(`Request ${status}`);
      fetchMyRequests();
    } catch (err) {
      setError('Error updating request');
    }
  };

  // Delete Request
  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    
    try {
      await axios.delete(`/api/requests/${requestId}`);
      setSuccess('Request deleted');
      fetchMyRequests();
    } catch (err) {
      setError('Error deleting request');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-50">
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
                <p className="text-sm text-gray-600">Patient Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
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
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Search Donors</span>
          </button>
          
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-red-600 text-white shadow-md'
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
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>My Requests</span>
          </button>
        </div>

        {/* Search Donors Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Search className="w-6 h-6 text-red-600" />
                Search Blood Donors
              </h2>

              <form onSubmit={handleSearchDonors} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Type *
                    </label>
                    <select
                      value={searchForm.bloodType}
                      onChange={(e) => setSearchForm({ ...searchForm, bloodType: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select Blood Type</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={searchForm.city}
                      onChange={(e) => setSearchForm({ ...searchForm, city: e.target.value })}
                      placeholder="Enter city"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                      placeholder="Enter state"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={searchForm.pincode}
                      onChange={(e) => setSearchForm({ ...searchForm, pincode: e.target.value })}
                      placeholder="6-digit pincode"
                      pattern="\d{6}"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Found {donors.length} Donor{donors.length !== 1 ? 's' : ''}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {donors.map((donor) => (
                    <div
                      key={donor.id}
                      className="border-2 border-gray-200 rounded-xl p-6 hover:border-red-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <Droplet className="w-6 h-6 text-red-600 fill-red-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{donor.name}</h4>
                            <p className="text-2xl font-bold text-red-600">{donor.bloodType}</p>
                          </div>
                        </div>
                        
                        {donor.available && donor.canDonate ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Available
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                            Not Available
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{donor.location.city}, {donor.location.state}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${donor.phone}`} className="text-red-600 hover:underline">
                            {donor.phone}
                          </a>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${donor.email}`} className="text-red-600 hover:underline">
                            {donor.email}
                          </a>
                        </div>

                        {donor.lastDonationDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Last donated: {new Date(donor.lastDonationDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          {donor.canDonate 
                            ? '✅ Can donate now (90+ days since last donation)'
                            : '⏳ Cannot donate yet (within 90 days)'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Request Tab */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6 text-red-600" />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                    max="10"
                    value={requestForm.unitsNeeded}
                    onChange={(e) => setRequestForm({ ...requestForm, unitsNeeded: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                          ? 'bg-red-600 text-white'
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Hospital Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Name (Optional)
                </label>
                <input
                  type="text"
                  value={requestForm.hospitalName}
                  onChange={(e) => setRequestForm({ ...requestForm, hospitalName: e.target.value })}
                  placeholder="Hospital name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={requestForm.address}
                  onChange={(e) => setRequestForm({ ...requestForm, address: e.target.value })}
                  placeholder="Street address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={requestForm.city}
                    onChange={(e) => setRequestForm({ ...requestForm, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={requestForm.state}
                    onChange={(e) => setRequestForm({ ...requestForm, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={requestForm.pincode}
                    onChange={(e) => setRequestForm({ ...requestForm, pincode: e.target.value })}
                    placeholder="6-digit"
                    pattern="\d{6}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
              <FileText className="w-6 h-6 text-red-600" />
              My Blood Requests
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading requests...</p>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No blood requests yet</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
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
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-red-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <Droplet className="w-6 h-6 text-red-600 fill-red-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{request.patientName}</h3>
                            <p className="text-2xl font-bold text-red-600">{request.bloodType}</p>
                          </div>
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

                        {request.hospitalName && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building2 className="w-4 h-4" />
                            <span>{request.hospitalName}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{request.location.city}, {request.location.state}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>

                        {request.reason && (
                          <div className="flex items-start gap-2 text-gray-600">
                            <FileText className="w-4 h-4 mt-0.5" />
                            <span>{request.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {request.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700"><strong>Notes:</strong> {request.notes}</p>
                      </div>
                    )}

                    {/* Responses */}
                    {request.responses && request.responses.length > 0 && (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-semibold text-green-800 mb-2">
                          Responses from Donors: {request.responses.length}
                        </p>
                        <div className="space-y-2">
                          {request.responses.map((response, idx) => (
                            <div key={idx} className="text-sm text-green-700">
                              • {response.donor?.name} - {response.status}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
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
                        <button
                          onClick={() => handleDeleteRequest(request._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                        >
                          Delete
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

export default PatientDashboard;