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
import AnalyseEvent from './pages/AnalyseEvent.jsx'
import PartnerschaftsanalysePage from './pages/PartnerschaftsanalysePage.jsx'
import Kalender from './pages/Kalender.jsx'
import MayaInfo from './pages/MayaInfo.jsx'
import Checkout from './pages/Checkout.jsx'
import ZusatzanalysenPage from './pages/ZusatzanalysenPage.jsx'
import MayaKI from './pages/MayaKI.jsx'

function ProtectedRoute({ children, requireMembership = false }) {
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

  if (requireMembership && profile && !profile.membership_active && !profile.is_admin) {
    return <Navigate to={`/checkout?product=membershipMonthly`} replace />
  }

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
        <Route path="/zusatzanalysen" element={<ZusatzanalysenPage />} />

        <Route path="/dashboard" element={<ProtectedRoute requireMembership><Dashboard /></ProtectedRoute>} />
        <Route path="/tagesenergie" element={<ProtectedRoute requireMembership><Tagesenergie /></ProtectedRoute>} />
        <Route path="/kalender" element={<ProtectedRoute requireMembership><Kalender /></ProtectedRoute>} />
        <Route path="/monatsanalyse" element={<ProtectedRoute requireMembership><Monatsanalyse /></ProtectedRoute>} />
        <Route path="/analysen" element={<ProtectedRoute requireMembership><MeineAnalysen /></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireMembership><Admin /></ProtectedRoute>} />
        <Route path="/analyse/event/:eventId" element={<ProtectedRoute requireMembership><AnalyseEvent /></ProtectedRoute>} />
        <Route path="/analyse/partnerschaft" element={<ProtectedRoute requireMembership><PartnerschaftsanalysePage /></ProtectedRoute>} />
        <Route path="/analyse/:type" element={<ProtectedRoute requireMembership><AnalysePage /></ProtectedRoute>} />
        <Route path="/maya-kalender" element={<ProtectedRoute requireMembership><MayaInfo /></ProtectedRoute>} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/maya-ki" element={<ProtectedRoute requireMembership><MayaKI /></ProtectedRoute>} />

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
