import { useLocation } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import Footer from './Footer.jsx'
import BottomNav from './BottomNav.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useState, useEffect } from 'react'

const PROTECTED_ROUTES = ['/dashboard', '/tagesenergie', '/monatsanalyse', '/analysen', '/profil']

export default function Layout({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isProtected = PROTECTED_ROUTES.some(r => location.pathname.startsWith(r))
  const showSidebar = user && isProtected && !isMobile

  if (showSidebar) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ marginLeft: '220px', flex: 1, minHeight: '100vh', backgroundColor: 'var(--bg-deep)', transition: 'background-color 0.25s ease' }}>
          {children}
        </main>
      </div>
    )
  }

  if (user && isProtected && isMobile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)', paddingBottom: '70px' }}>
        {children}
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-deep)' }}>
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}
