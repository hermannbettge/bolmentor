import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import Layout from './components/Layout.jsx'
import Salespage from './pages/Salespage.jsx'
import Login from './pages/Login.jsx'
import Registrieren from './pages/Registrieren.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Tagesenergie from './pages/Tagesenergie.jsx'
import Monatsanalyse from './pages/Monatsanalyse.jsx'
import MeineAnalysen from './pages/MeineAnalysen.jsx'
import Profil from './pages/Profil.jsx'
import Impressum from './pages/Impressum.jsx'
import Datenschutz from './pages/Datenschutz.jsx'
import Admin from './pages/Admin.jsx'
import AnalysePage from './pages/AnalysePage.jsx'

function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--color-gold)', fontSize: '0.85rem', letterSpacing: '0.1em' }} className="pulse-gold">
          BEWUSSTSEIN.OHNE.LIMIT
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Allow access even without active membership (for profile management)
  return children
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Salespage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrieren" element={<Registrieren />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tagesenergie" element={<ProtectedRoute><Tagesenergie /></ProtectedRoute>} />
        <Route path="/monatsanalyse" element={<ProtectedRoute><Monatsanalyse /></ProtectedRoute>} />
        <Route path="/analysen" element={<ProtectedRoute><MeineAnalysen /></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/analyse/:type" element={<ProtectedRoute><AnalysePage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
