// import React from 'react';
// import { useAuth } from '../context/AuthContext';
// import DonorDashboard from '../components/DonorDashboard';
// import PatientDashboard from '../components/PatientDashboard';
// import HospitalDashboard from '../components/HospitalDashboard';

// const Dashboard = () => {
//   const { user, logout } = useAuth();

//   if (!user) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Render dashboard based on user role
//   const renderDashboard = () => {
//     switch (user.role) {
//       case 'donor':
//         return <DonorDashboard />;
//       case 'patient':
//         return <PatientDashboard />;
//       case 'hospital':
//         return <HospitalDashboard />;
//       default:
//         return <PatientDashboard />;
//     }
//   };

//   return <div>{renderDashboard()}</div>;
// };

// export default Dashboard;

// import React, { useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import DonorDashboard from '../components/DonorDashboard';
// import PatientDashboard from '../components/PatientDashboard';
// import HospitalDashboard from '../components/HospitalDashboard';

// const Dashboard = () => {
//   const { user, loadUserFromToken } = useAuth();

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const token = params.get('token');

//     if (token) {
//       localStorage.setItem('token', token);
//       loadUserFromToken();
//       window.history.replaceState({}, document.title, '/dashboard');
//     }
//   }, []);

//   if (!user) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   const renderDashboard = () => {
//     switch (user.role) {
//       case 'donor':
//         return <DonorDashboard />;
//       case 'patient':
//         return <PatientDashboard />;
//       case 'hospital':
//         return <HospitalDashboard />;
//       default:
//         return <PatientDashboard />;
//     }
//   };

//   return <div>{renderDashboard()}</div>;
// };

// export default Dashboard;

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DonorDashboard from '../components/DonorDashboard';
import PatientDashboard from '../components/PatientDashboard';
import HospitalDashboard from '../components/HospitalDashboard';

const Dashboard = () => {
  const { user, loading, loadUserFromToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      loadUserFromToken();
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  switch (user.role) {
    case 'donor':
      return <DonorDashboard />;
    case 'patient':
      return <PatientDashboard />;
    case 'hospital':
      return <HospitalDashboard />;
    default:
      return <PatientDashboard />;
  }
};

export default Dashboard;
