import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

const BRAND = '#F97316'
const BRAND_DARK = '#EA580C'

// Category icon colors for visual richness
const CAT_COLORS: Record<string, { bg: string; icon: string }> = {
  plumbing:    { bg: '#EFF6FF', icon: '#2563EB' },
  electrical:  { bg: '#FFFBEB', icon: '#D97706' },
  hvac:        { bg: '#F0F9FF', icon: '#0284C7' },
  cleaning:    { bg: '#F0FDF4', icon: '#16A34A' },
  carpentry:   { bg: '#FFF7ED', icon: '#C2410C' },
  painting:    { bg: '#FDF4FF', icon: '#9333EA' },
  appliances:  { bg: '#FFF1F2', icon: '#E11D48' },
  locksmith:   { bg: '#F8FAFC', icon: '#475569' },
  moving:      { bg: '#ECFDF5', icon: '#059669' },
  handyman:    { bg: '#FFF7ED', icon: '#C2410C' },
  landscaping: { bg: '#F0FDF4', icon: '#16A34A' },
}
function catColor(id: string) {
  return CAT_COLORS[id] || { bg: '#FFF7ED', icon: BRAND_DARK }
}

// SVG category icons (replaces emojis for a premium look)
const CAT_SVG: Record<string, (color: string, size?: number) => React.ReactElement> = {
  plumbing: (c, s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  electrical: (c, s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={c + '20'} stroke={c}/>
    </svg>
  ),
  hvac: (c, s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
      <circle cx="12" cy="12" r="3" fill={c + '25'}/>
    </svg>
  ),
  cleaning: (c, s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z" fill={c + '20'}/>
      <line x1="19" y1="3" x2="19" y2="5"/><line x1="18" y1="4" x2="20" y2="4"/>
      <line x1="5" y1="19" x2="5" y2="21"/><line x1="4" y1="20" x2="6" y2="20"/>
    </svg>
  ),
  carpentry: (c, s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20l4-4 10-10 4 4-10 10z" fill={c + '20'}/>
      <path d="M16 6l2-2 2 2-2 2z" fill={c + '40'}/>
      <line x1="6" y1="20" x2="2" y2="20"/><line x1="2" y1="20" x2="2" y2="16"/>
    </svg>
  ),
  painting: (c, s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="14" height="8" rx="2" fill={c + '20'}/>
      <path d="M7 10v3"/><path d="M7 13h6v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2z" fill={c + '30'}/>
      <path d="M5 6h10"/><circle cx="19" cy="5" r="2" fill={c + '25'}/>
      <path d="M17 5h-2"/>
    </svg>
  ),
  appliances: (c, s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" fill={c + '12'}/>
      <circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="2" fill={c + '30'}/>
      <line x1="7" y1="6" x2="7.01" y2="6" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="10" y1="6" x2="14" y2="6"/>
    </svg>
  ),
  handyman: (c, s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" fill={c + '12'}/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  ),
  landscaping: (c, s = 28) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12" /><path d="M12 12C12 12 7 10 5 6c3 0 6 1.5 7 6z" fill={c + '30'}/>
      <path d="M12 12C12 12 17 10 19 6c-3 0-6 1.5-7 6z" fill={c + '30'}/>
      <path d="M12 17C12 17 8 15 6 11c3.5 0 5.5 2 6 6z" fill={c + '20'}/>
      <path d="M12 17C12 17 16 15 18 11c-3.5 0-5.5 2-6 6z" fill={c + '20'}/>
    </svg>
  ),
}

export function CatIcon({ catId, color, size = 28 }: { catId: string; color: string; size?: number }) {
  const renderFn = CAT_SVG[catId]
  if (renderFn) return renderFn(color, size)
  // fallback generic icon
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" fill={color + '15'}/>
      <path d="M12 8v4l3 3" strokeWidth="2"/>
    </svg>
  )
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '待确认', CONFIRMED: '已确认', IN_PROGRESS: '进行中',
  COMPLETED: '已完成', CANCELLED: '已取消',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: '#F59E0B', CONFIRMED: '#10B981', IN_PROGRESS: BRAND,
  COMPLETED: '#6B7280', CANCELLED: '#EF4444',
}

// SVG icons
const Ic = {
  location: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  chevronRight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  shield: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  star: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  gift: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
    </svg>
  ),
  wrench: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
}

// Trust badges
const TRUST = [
  { icon: Ic.shield, label: '持证技师' },
  { icon: Ic.star, label: '4.9 评分' },
  { icon: Ic.clock, label: '准时上门' },
  { icon: Ic.wrench, label: '满意保障' },
]

const QUICK_CATS = ['plumbing', 'electrical', 'hvac', 'cleaning']

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState<any[]>([])
  const [recentOrder, setRecentOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.categories()
      .then(c => { setCategories(c); setLoading(false) })
      .catch(() => setLoading(false))
    if (user) {
      api.myOrders().then((orders: any[]) => {
        const active = orders.find(o => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(o.status))
        setRecentOrder(active || null)
      }).catch(() => {})
    }
  }, [user])

  const quickCats = categories
    .filter(c => QUICK_CATS.includes(c.id))
    .sort((a, b) => QUICK_CATS.indexOf(a.id) - QUICK_CATS.indexOf(b.id))

  const allCats = categories.filter(c => !QUICK_CATS.includes(c.id))

  return (
    <div className="pb-28" style={{ background: '#F8FAFC', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ background: 'white', paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-5 pt-12 pb-4">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: '#F1F5F9' }}>
              <span style={{ color: BRAND_DARK }}>{Ic.location}</span>
              <span className="text-xs font-medium" style={{ color: '#475569' }}>尔湾，CA</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F8FAFC', color: '#64748B' }}>{Ic.bell}</button>
              {user ? (
                <button onClick={() => navigate('/profile')}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})` }}>
                  {user.name?.slice(0, 1).toUpperCase()}
                </button>
              ) : (
                <button onClick={() => navigate('/login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border-none cursor-pointer"
                  style={{ background: BRAND, color: 'white' }}>登录</button>
              )}
            </div>
          </div>

          {/* Greeting */}
          <div className="mb-4">
            <div className="text-2xl font-bold tracking-tight" style={{ color: '#0F172A' }}>
              {user ? `你好，${user.name?.split(' ')[0]} 👋` : '专业上门服务'}
            </div>
            <div className="text-sm mt-0.5" style={{ color: '#94A3B8' }}>
              {user ? '今天需要什么服务？' : '尔湾华人首选 · 持证技师上门'}
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: '#F1F5F9' }}>
            <span style={{ color: '#94A3B8' }}>{Ic.search}</span>
            <input
              type="text"
              placeholder="搜索服务，例如：水管漏水..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
              style={{ color: '#0F172A', caretColor: BRAND }}
              onKeyDown={e => { if (e.key === 'Enter') navigate('/categories') }}
            />
          </div>
        </div>

        {/* Trust strip */}
        <div className="flex items-center gap-0 overflow-x-auto px-5 pb-4 scrollbar-none"
          style={{ borderTop: '1px solid #F1F5F9' }}>
          {TRUST.map((t, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-shrink-0 pr-4 mr-4"
              style={{ borderRight: i < TRUST.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
              <span style={{ color: BRAND }}>{t.icon}</span>
              <span className="text-xs font-medium" style={{ color: '#475569' }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6">

        {/* ── Active order ── */}
        {user && recentOrder && (
          <div onClick={() => navigate('/orders')}
            className="rounded-2xl overflow-hidden cursor-pointer"
            style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${BRAND_DARK}, ${BRAND})` }} />
            <div className="px-4 py-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#FFF7ED' }}>
                <span style={{ color: BRAND }}>{Ic.wrench}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: STATUS_COLOR[recentOrder.status] + '18', color: STATUS_COLOR[recentOrder.status] }}>
                    ● {STATUS_LABEL[recentOrder.status]}
                  </span>
                </div>
                <div className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>
                  {recentOrder.service?.name}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                  {recentOrder.date} · {recentOrder.technician?.name || '技师待分配'}
                </div>
              </div>
              <span style={{ color: '#CBD5E1' }}>{Ic.chevronRight}</span>
            </div>
          </div>
        )}

        {/* ── New user promo ── */}
        {!user && (
          <div className="rounded-2xl overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, ${BRAND_DARK} 0%, #FB923C 100%)` }}>
            <div className="absolute right-0 top-0 bottom-0 w-24 opacity-10"
              style={{ background: 'radial-gradient(circle at 80% 50%, white 0%, transparent 70%)' }} />
            <div className="px-5 py-4 relative">
              <div className="text-white/80 text-xs font-medium mb-1">新用户专享</div>
              <div className="text-white font-black text-3xl leading-none mb-1">$30 <span className="text-lg font-semibold">首单立减</span></div>
              <div className="text-white/70 text-xs mb-3">使用优惠码 NEW30</div>
              <button onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer"
                style={{ background: 'white', color: BRAND_DARK }}>
                立即领取 →
              </button>
            </div>
          </div>
        )}

        {/* ── Quick access ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-base" style={{ color: '#0F172A' }}>热门服务</span>
            <button onClick={() => navigate('/categories')}
              className="flex items-center gap-0.5 text-sm font-medium border-none bg-transparent cursor-pointer p-0"
              style={{ color: BRAND }}>
              查看全部 {Ic.chevronRight}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl shimmer" />
                  <div className="h-2.5 w-12 rounded shimmer" />
                </div>
              ))
              : quickCats.map(cat => {
                const { bg, icon } = catColor(cat.id)
                return (
                  <button key={cat.id} onClick={() => navigate(`/category/${cat.id}`)}
                    className="flex flex-col items-center gap-2 border-none bg-transparent cursor-pointer p-0 active:scale-95 transition-transform duration-150">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: bg }}>
                      <CatIcon catId={cat.id} color={icon} size={28} />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight" style={{ color: '#475569' }}>
                      {cat.name}
                    </span>
                  </button>
                )
              })
            }
          </div>
        </div>

        {/* ── All services (2-col cards) ── */}
        {!loading && allCats.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-base" style={{ color: '#0F172A' }}>全部服务</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {allCats.map(cat => {
                const { bg, icon } = catColor(cat.id)
                const prices = (cat.services || []).map((s: any) => s.price).filter(Boolean)
                const minPrice = prices.length ? Math.min(...prices) : null
                const count = (cat.services || []).length
                return (
                  <button key={cat.id} onClick={() => navigate(`/category/${cat.id}`)}
                    className="text-left p-4 rounded-2xl border-none cursor-pointer active:scale-98 transition-all duration-150"
                    style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: bg }}>
                      <CatIcon catId={cat.id} color={icon} size={24} />
                    </div>
                    <div className="font-semibold text-sm mb-0.5" style={{ color: '#0F172A' }}>{cat.name}</div>
                    <div className="text-xs" style={{ color: '#94A3B8' }}>
                      {count} 项服务{minPrice ? ` · 从 $${minPrice}` : ''}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Promise ── */}
        <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          <div className="text-sm font-bold mb-4" style={{ color: '#0F172A' }}>为什么选择 OmniFix</div>
          <div className="space-y-3">
            {[
              { icon: Ic.shield, title: '持证技师', desc: '全部通过背景调查，持证上岗' },
              { icon: Ic.clock, title: '准时保障', desc: '迟到超 15 分钟给予补偿' },
              { icon: Ic.star, title: '满意保障', desc: '不满意免费返工，直至满意' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#FFF7ED', color: BRAND }}>
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>{item.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Referral ── */}
        <div className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: '#FFF7ED', border: `1.5px dashed ${BRAND}50` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: BRAND + '18', color: BRAND }}>
            {Ic.gift}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm" style={{ color: '#0F172A' }}>推荐好友各得 $20</div>
            <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>好友首单完成后奖励立即到账</div>
          </div>
          <button onClick={() => navigate('/profile')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border-none cursor-pointer flex-shrink-0"
            style={{ background: BRAND, color: 'white' }}>
            去分享
          </button>
        </div>

      </div>
    </div>
  )
}
