import { useLocation, useNavigate } from 'react-router-dom'

// Clean SVG icons
const Icon = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  orders: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  customers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  services: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  technicians: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
      <path d="M16 3.5A2.5 2.5 0 0118.5 6"/>
    </svg>
  ),
  coupons: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  reviews: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  search: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
}

const NAV = [
  { path: '/dashboard',   icon: Icon.dashboard,    label: '仪表盘' },
  { path: '/orders',      icon: Icon.orders,       label: '订单管理' },
  { path: '/customers',   icon: Icon.customers,    label: '客户管理' },
  { path: '/services',    icon: Icon.services,     label: '服务管理' },
  { path: '/technicians', icon: Icon.technicians,  label: '技师管理' },
  { path: '/coupons',     icon: Icon.coupons,      label: '优惠券' },
  { path: '/reviews',     icon: Icon.reviews,      label: '评价管理' },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '仪表盘', '/services': '服务管理', '/orders': '订单管理',
  '/customers': '客户管理', '/technicians': '技师管理', '/coupons': '优惠券', '/reviews': '评价管理',
}

export default function Layout({ children, onLogout }: { children: React.ReactNode; onLogout?: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen" style={{ background: '#F1F5F9' }}>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-56 flex flex-col" style={{ background: '#0F172A' }}>
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)' }}>
            O
          </div>
          <div>
            <div className="text-white font-semibold text-sm tracking-wide">OmniFix</div>
            <div className="text-xs" style={{ color: '#475569' }}>管理后台</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = location.pathname === item.path
            return (
              <button key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
                  color: active ? '#F97316' : '#94A3B8',
                  borderLeft: active ? '2px solid #F97316' : '2px solid transparent',
                  borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-r-xl text-sm font-medium w-full text-left cursor-pointer hover:bg-white/5 hover:text-slate-200 transition-all duration-150 -ml-0.5">
                <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)' }}>
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium">管理员</div>
              <div className="text-xs truncate" style={{ color: '#475569' }}>admin@omnifix.com</div>
            </div>
            {onLogout && (
              <button onClick={onLogout} title="退出登录"
                className="cursor-pointer border-none p-1.5 rounded-lg transition-colors duration-150"
                style={{ background: 'transparent', color: '#475569' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                {Icon.logout}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-56 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 px-6 flex items-center justify-between"
          style={{ background: 'rgba(241,245,249,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0', height: 60 }}>
          <h1 className="font-semibold text-base" style={{ color: '#0F172A' }}>
            {PAGE_TITLES[location.pathname] || '管理系统'}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
              style={{ background: 'white', border: '1px solid #E2E8F0', color: '#94A3B8' }}>
              {Icon.search}
              <input placeholder="快速搜索..."
                className="bg-transparent border-none outline-none text-sm w-32"
                style={{ color: '#334155' }} />
            </div>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none transition-colors"
              style={{ background: 'white', border: '1px solid #E2E8F0', color: '#64748B' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
              {Icon.bell}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
