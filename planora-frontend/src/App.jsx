import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Import Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TripGenerator from './pages/TripGenerator';
import TripResult from './pages/TripResult';
import TripEditor from './pages/TripEditor';
import SharePage from './pages/SharePage';
import NotFound from './pages/NotFound';

// Import Components
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/share/:id" element={<SharePage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate"
            element={
              <ProtectedRoute>
                <TripGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/:id"
            element={
              <ProtectedRoute>
                <TripResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/:id/edit"
            element={
              <ProtectedRoute>
                <TripEditor />
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#131A2E',
              color: '#F8FAFC',
              border: '1px solid #232B42',
              fontFamily: 'var(--font)'
            }
          }} 
        />
      </Router>
    </AuthProvider>
  );
}
