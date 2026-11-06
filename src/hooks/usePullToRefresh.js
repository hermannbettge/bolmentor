import { useEffect, useRef, useState } from 'react'

export function usePullToRefresh({ onRefresh, threshold = 72 }) {
  const [pulling, setPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current || document.documentElement

    function onTouchStart(e) {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      if (scrollTop > 0) return
      startY.current = e.touches[0].clientY
    }

    function onTouchMove(e) {
      if (startY.current === null) return
      const dy = e.touches[0].clientY - startY.current
      if (dy <= 0) { setPullDistance(0); setPulling(false); return }
      // resist: slow down pull beyond threshold
      const dist = Math.min(dy * 0.45, threshold * 1.6)
      setPullDistance(dist)
      setPulling(dist > 10)
      if (dist > 10) e.preventDefault()
    }

    function onTouchEnd() {
      if (pullDistance >= threshold && !refreshing) {
        setRefreshing(true)
        setPullDistance(threshold)
        Promise.resolve(onRefresh()).finally(() => {
          setRefreshing(false)
          setPullDistance(0)
          setPulling(false)
          startY.current = null
        })
      } else {
        setPullDistance(0)
        setPulling(false)
        startY.current = null
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [pullDistance, refreshing, onRefresh, threshold])

  return { pulling, pullDistance, refreshing, containerRef }
}
