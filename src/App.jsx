// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthCallback from './AuthCallback';
import Header from './Header';
import SuspensionForm from './SuspenionForm';
import SuspensionApprovals from './SuspensionApprovals';
import SuspensionsDashboard from './SuspensionDashboard';
import RequireAuth from './RequireAuth';
import RequireApprovalAuth from './RequireApprovalAuth';
import LoginPage from './LoginPage';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <main className="p-6">
        <Routes>
          {/* Public login page */}
          <Route path='/' element={<LoginPage />} />

          {/* Authenticated-only routes */}
          <Route
            path="/form"
            element={
              <RequireAuth>
                <SuspensionForm />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <SuspensionsDashboard />
              </RequireAuth>
            }
          />

          {/* Approvals: authenticated + allowed email only */}
          <Route
            path="/approvals"
            element={
              <RequireApprovalAuth>
                <SuspensionApprovals />
              </RequireApprovalAuth>
            }
          />

          {/* Supabase OAuth callback */}
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
