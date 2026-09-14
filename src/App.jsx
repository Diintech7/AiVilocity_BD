import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts & Guards
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Tasks from './pages/Tasks';
import Trainings from './pages/Trainings';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Withdrawals from './pages/Withdrawals';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <BrowserRouter>
        <Routes>
          {/* Public Login & Onboarding Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Shell with Nested Outlet Routing */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="trainings" element={<Trainings />} />
            <Route path="withdrawals" element={<Withdrawals />} />
            <Route path="wallet" element={<Navigate to="/withdrawals" replace />} />
            <Route path="payments" element={<Navigate to="/withdrawals" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Fallback to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
