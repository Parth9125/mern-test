import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Dashboard from './components/Auth/Dashboard';
import AgentList from './components/Agents/AgentList';
import AddAgent from './components/Agents/AddAgent';
import DistributedLists from './components/Lists/DistributedLists';
import UploadCSV from './components/Lists/UploadCSV';
import LoadingSpinner from './components/Common/LoadingSpinner';
import { ROUTES } from './utils/constants';

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}

      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route 
            path={ROUTES.LOGIN} 
            element={
              isAuthenticated ? (
                <Navigate to={ROUTES.DASHBOARD} replace />
              ) : (
                <Login />
              )
            } 
          />

          {/* Protected Routes */}
          {isAuthenticated ? (
            <>
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.AGENTS} element={<AgentList />} />
              <Route path={ROUTES.AGENTS_ADD} element={<AddAgent />} />
              <Route path={ROUTES.LISTS} element={<DistributedLists />} />
              <Route path={ROUTES.LISTS_UPLOAD} element={<UploadCSV />} />
              <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;