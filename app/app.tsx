import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/components/AuthContext';
import { Login } from '@/components/Login';
import { AppShell } from '@/components/AppShell';
import { Dashboard } from '@/pages/Dashboard';
import { Releases } from '@/pages/Releases';
import { Pipelines } from '@/pages/Pipelines';
import { Validations } from '@/pages/Validations';
import { Incidents } from '@/pages/Incidents';
import { Metrics } from '@/pages/Metrics';
import { Settings } from '@/pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="releases" element={<Releases />} />
        <Route path="pipelines" element={<Pipelines />} />
        <Route path="validations" element={<Validations />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="metrics" element={<Metrics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
