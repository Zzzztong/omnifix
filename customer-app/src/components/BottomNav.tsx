import { useLocation, useNavigate } from 'react-router-dom'

const BRAND = '#E85D04'

const Icons = {
  home: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? BRAND : 'none'} stroke={active ? BRAND : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  browse: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? BRAND : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  orders: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? BRAND : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  profile: (active: boolean) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? BRAND : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  wrench: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
}

const LEFT_TABS = [
  { path: '/', label: '首页', icon: Icons.home },
  { path: '/categories', label: '服务', icon: Icons.browse },
]
const RIGHT_TABS = [
  { path: '/orders', label: '订单', icon: Icons.orders },
  { path: '/profile', label: '我的', icon: Icons.profile },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const active = location.pathname

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div className="relative" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Nav bar */}
        <div className="flex items-center"
          style={{
            background: 'white',
            borderTop: '1px solid rgba(0,0,0,0.08)',
            height: 60,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
          }}>
          {/* Left tabs */}
          {LEFT_TABS.map(t => {
            const isActive = active === t.path
            return (
              <button key={t.path} onClick={() => navigate(t.path)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full border-none bg-transparent cursor-pointer transition-opacity active:opacity-60"
                style={{ paddingBottom: 2 }}>
                {t.icon(isActive)}
                <span className="text-[10px] font-medium mt-0.5"
                  style={{ color: isActive ? BRAND : '#9CA3AF' }}>{t.label}</span>
              </button>
            )
          })}

          {/* Center button space */}
          <div className="flex-shrink-0" style={{ width: 72 }} />

          {/* Right tabs */}
          {RIGHT_TABS.map(t => {
            const isActive = active === t.path
            return (
              <button key={t.path} onClick={() => navigate(t.path)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full border-none bg-transparent cursor-pointer transition-opacity active:opacity-60"
                style={{ paddingBottom: 2 }}>
                {t.icon(isActive)}
                <span className="text-[10px] font-medium mt-0.5"
                  style={{ color: isActive ? BRAND : '#9CA3AF' }}>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Center elevated button */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: -22 }}>
          <button onClick={() => navigate('/')}
            className="w-14 h-14 rounded-full flex items-center justify-center border-none cursor-pointer active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(145deg, #F97316 0%, #EA580C 100%)',
              boxShadow: '0 4px 20px rgba(234,88,12,0.45), 0 0 0 4px white',
            }}>
            {Icons.wrench()}
          </button>
        </div>
      </div>
    </div>
  )
}
