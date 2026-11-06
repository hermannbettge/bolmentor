import { usePullToRefresh } from '../hooks/usePullToRefresh.js'

export default function PullToRefresh({ children, onRefresh }) {
  const { pulling, pullDistance, refreshing } = usePullToRefresh({ onRefresh })

  const indicatorVisible = pulling || refreshing
  const progress = Math.min(pullDistance / 72, 1)

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Pull indicator */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: `${Math.max(pullDistance, refreshing ? 48 : 0)}px`,
        transition: refreshing ? 'height 0.2s ease' : 'none',
        pointerEvents: 'none',
        backgroundColor: 'var(--color-bg-deep)',
        borderBottom: indicatorVisible ? '1px solid var(--border)' : 'none',
        overflow: 'hidden',
      }}>
        {indicatorVisible && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            opacity: Math.min(progress * 1.5, 1),
            transform: `scale(${0.6 + progress * 0.4})`,
            transition: refreshing ? 'transform 0.2s ease' : 'none',
          }}>
            {refreshing ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid var(--color-gold)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'ptr-spin 0.7s linear infinite',
              }} />
            ) : (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid var(--color-gold)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                transform: `rotate(${progress * 240}deg)`,
                opacity: progress,
              }} />
            )}
            <span style={{
              fontSize: '0.65rem',
              color: 'var(--color-gold)',
              letterSpacing: '0.08em',
              fontWeight: 500,
            }}>
              {refreshing ? 'Wird aktualisiert…' : progress >= 1 ? 'Loslassen' : 'Ziehen zum Aktualisieren'}
            </span>
          </div>
        )}
      </div>

      {/* Page content pushed down while pulling */}
      <div style={{
        transform: `translateY(${refreshing ? 48 : pullDistance}px)`,
        transition: refreshing || !pulling ? 'transform 0.25s ease' : 'none',
      }}>
        {children}
      </div>

      <style>{`
        @keyframes ptr-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
