import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AuthCallBack from './AuthCallback'
import Header from './Header'
import SuspensionForm from './SuspenionForm'
import SuspensionApprovals from './SuspensionApprovals'
import './App.css'
import SuspensionsDashboard from './SuspensionDashboard'
import RequireAuth from './RequireAuth'
import RequireApprovalAuth from './RequireApprovalAuth'

function App() {

  return (
    <Router>
      <Header />
      <main className="p-6">
        <Routes>
          <Route path="/form" element={
            <RequireAuth>
              <SuspensionForm />
              </RequireAuth>} />
          <Route path="/approvals" element={
            <RequireApprovalAuth>
              <SuspensionApprovals />
            </RequireApprovalAuth>
            } />
          <Route path="/dashboard" element={<RequireAuth>
            <SuspensionsDashboard />
            </RequireAuth>} />
          <Route path='/auth/callback' element={<AuthCallBack />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App
