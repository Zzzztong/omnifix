import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

const BRAND = '#E85D04'

const QUICK_CATS = ['plumbing', 'electrical', 'hvac', 'cleaning']
const GROUP_META: Record<string, { label: string; sub: string; color: string }> = {
  urgent:  { label: '水电暖气', sub: '安全优先，尽快处理', color: '#DC2626' },
  repair:  { label: '居家修缮', sub: '设备维修与室内修复', color: '#2563EB' },
  enhance: { label: '美化保养', sub: '提升居家品质', color: '#16A34A' },
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '待确认', CONFIRMED: '已确认', IN_PROGRESS: '进行中',
  COMPLETED: '已完成', CANCELLED: '已取消',
}
const STATUS_DOT: Record<string, string> = {
  PENDING: '#F59E0B', CONFIRMED: '#10B981', IN_PROGRESS: BRAND,
  COMPLETED: '#6B7280', CANCELLED: '#DC2626',
}

// SVG icon set
const Ic = {
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  location: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>,
  chevronRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  clock: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  pin: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  tech: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  clock2: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  gift: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState<any[]>([])
  const [recentOrder, setRecentOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.categories().then(c => { setCategories(c); setLoading(false) }).catch(() => setLoading(false))
    if (user) {
      api.myOrders().then((orders: any[]) => {
        const active = orders.find(o => ['PENDING','CONFIRMED','IN_PROGRESS'].includes(o.status))
        setRecentOrder(active || null)
      }).catch(() => {})
    }
  }, [user])

  const quickCats = categories
    .filter(c => QUICK_CATS.includes(c.id))
    .sort((a, b) => QUICK_CATS.indexOf(a.id) - QUICK_CATS.indexOf(b.id))

  return (
    <div className="pb-28" style={{ background: '#F5F5F7' }}>

      {/* ── Header ── */}
      <div style={{ background: '#0A0A0A' }} className="px-4 pt-14 pb-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            {user ? (
              <>
                <div className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>欢迎回来</div>
                <div className="text-white font-bold text-2xl leading-tight">{user.name}</div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 mb-1">
                  {Ic.location}
                  <span className="text-xs" style={{ color: '#6B7280' }}>尔湾（Irvine, CA）</span>
                </div>
                <div className="text-white font-bold text-2xl leading-tight">专业上门服务</div>
                <div className="text-sm mt-0.5" style={{ color: '#6B7280' }}>OmniFix · 周到可信赖</div>
              </>
            )}
          </div>
          {/* Brand mark */}
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ background: BRAND }}>
            O
          </div>
        </div>

        {/* Search */}
        <button onClick={() => navigate('/categories')}
          className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer border-none text-left"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {Ic.search}
          <span className="text-sm" style={{ color: '#6B7280' }}>搜索服务，例如：水管漏水、空调维修</span>
        </button>
      </div>

      <div className="px-4 pt-4 space-y-5">

        {/* ── Active order card ── */}
        {user && recentOrder && (
          <div onClick={() => navigate('/orders')}
            className="rounded-2xl overflow-hidden cursor-pointer active:opacity-90 transition-opacity"
            style={{ background: '#111111' }}>
            <div className="px-4 py-3.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>当前服务</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)', color: STATUS_DOT[recentOrder.status] }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_DOT[recentOrder.status] }} />
                  {STATUS_LABEL[recentOrder.status]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: BRAND + '20', border: `1px solid ${BRAND}30` }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm">{recentOrder.service?.name}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
                      {Ic.clock} {recentOrder.date}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
                      {Ic.tech} {recentOrder.technician?.name || '待分配'}
                    </span>
                  </div>
                </div>
                <div className="font-bold text-white">${recentOrder.total?.toFixed(0)}</div>
              </div>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-xs" style={{ color: '#4B5563' }}>查看订单详情</span>
              <span style={{ color: '#4B5563' }}>{Ic.chevronRight}</span>
            </div>
          </div>
        )}

        {/* ── New user banner ── */}
        {!user && (
          <div className="rounded-2xl p-4 flex items-center justify-between overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)' }}>
            <div className="absolute right-0 top-0 w-32 h-32 rounded-full opacity-10" style={{ background: BRAND, transform: 'translate(30%, -30%)' }} />
            <div className="relative">
              <div className="text-white font-bold text-sm leading-tight">新用户专享 · 首单立减</div>
              <div className="font-black text-2xl mt-0.5" style={{ color: '#FB923C' }}>$30</div>
              <button onClick={() => navigate('/login')}
                className="mt-2 px-4 py-1.5 rounded-full text-xs font-bold border-none cursor-pointer"
                style={{ background: BRAND, color: 'white' }}>
                立即注册
              </button>
            </div>
            <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          </div>
        )}

        {/* ── Quick access ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900 text-base">热门服务</span>
            <button onClick={() => navigate('/categories')}
              className="flex items-center gap-1 text-sm font-medium border-none bg-transparent cursor-pointer p-0"
              style={{ color: BRAND }}>
              全部 {Ic.arrow}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl aspect-square shimmer" />
              ))
              : quickCats.map(cat => (
                <button key={cat.id} onClick={() => navigate(`/category/${cat.id}`)}
                  className="bg-white rounded-2xl py-4 flex flex-col items-center gap-2 cursor-pointer border-none active:scale-95 transition-transform"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <span className="text-2xl leading-none">{cat.icon}</span>
                  <span className="text-gray-600 text-xs font-medium text-center leading-tight px-1">{cat.name}</span>
                </button>
              ))
            }
          </div>
        </div>

        {/* ── Service groups ── */}
        {['urgent', 'repair', 'enhance'].map(groupKey => {
          const meta = GROUP_META[groupKey]
          const cats = categories.filter(c => c.group === groupKey)
          if (!cats.length && !loading) return null
          return (
            <div key={groupKey}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                <span className="text-sm font-bold" style={{ color: meta.color }}>{meta.label}</span>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>{meta.sub}</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-2xl h-24 shimmer" />
                  ))
                  : cats.map(cat => {
                    const prices = (cat.services || []).map((s: any) => s.price).filter(Boolean)
                    const minPrice = prices.length ? Math.min(...prices) : null
                    return (
                      <button key={cat.id} onClick={() => navigate(`/category/${cat.id}`)}
                        className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 cursor-pointer border-none active:scale-95 transition-transform"
                        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                          style={{ background: (cat.color || BRAND) + '12' }}>
                          {cat.icon}
                        </div>
                        <span className="text-gray-700 text-xs font-semibold text-center leading-tight">{cat.name}</span>
                        {minPrice && (
                          <span className="text-xs font-bold" style={{ color: BRAND }}>从 ${minPrice}</span>
                        )}
                      </button>
                    )
                  })
                }
              </div>
            </div>
          )
        })}

        {/* ── Promises ── */}
        <div className="rounded-2xl p-4" style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="font-semibold text-gray-800 text-sm mb-4">OmniFix 服务承诺</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Ic.shield, label: '持证技师' },
              { icon: Ic.clock2, label: '准时上门' },
              { icon: Ic.star, label: '满意保障' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: '#FFF7ED' }}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Referral ── */}
        <div className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: '#FFF7ED', border: `1.5px dashed ${BRAND}50` }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: BRAND + '15' }}>
            {Ic.gift}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800 text-sm">推荐好友，双方各得 $20</div>
            <div className="text-gray-500 text-xs mt-0.5">好友首单完成后奖励立即到账</div>
          </div>
          <button onClick={() => navigate('/profile')}
            className="px-3 py-1.5 rounded-full text-xs font-bold border-none cursor-pointer flex-shrink-0"
            style={{ background: BRAND, color: 'white' }}>
            去分享
          </button>
        </div>

      </div>
    </div>
  )
}
