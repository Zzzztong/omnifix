import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const BRAND = '#E85D04'

const STATUS_MAP: Record<string, { label: string; dot: string; bg: string; color: string }> = {
  PENDING:     { label: '待确认', dot: '#F59E0B', bg: '#FFFBEB', color: '#92400E' },
  CONFIRMED:   { label: '已确认', dot: '#10B981', bg: '#F0FDF4', color: '#065F46' },
  IN_PROGRESS: { label: '进行中', dot: BRAND,     bg: '#FFF7ED', color: '#9A3412' },
  COMPLETED:   { label: '已完成', dot: '#94A3B8', bg: '#F8FAFC', color: '#475569' },
  CANCELLED:   { label: '已取消', dot: '#EF4444', bg: '#FEF2F2', color: '#991B1B' },
}

const TABS = [
  { key: 'active',    label: '进行中' },
  { key: 'COMPLETED', label: '已完成' },
  { key: 'all',       label: '全部' },
]

const Ic = {
  calendar: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  pin: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  tech: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  wrench: (color = BRAND) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
}

export default function Orders() {
  const [tab, setTab] = useState('active')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.myOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    if (tab === 'active') return ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(o.status)
    if (tab === 'all') return true
    return o.status === tab
  })

  return (
    <div className="pb-28" style={{ background: '#F8FAFC' }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10" style={{ background: 'white', borderBottom: '1px solid #F1F5F9' }}>
        <div className="px-4 pt-14 pb-0">
          <div className="font-bold text-gray-900 text-xl pb-1">我的订单</div>
        </div>
        {/* Tabs */}
        <div className="flex px-4">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 pb-3 pt-2 text-sm font-semibold border-none bg-transparent cursor-pointer relative transition-colors"
              style={{ color: tab === t.key ? '#0F172A' : '#9CA3AF' }}>
              {t.label}
              {tab === t.key && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full transition-all"
                  style={{ width: 28, height: 2, background: BRAND }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl h-32 shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center pt-20">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: '#F8FAFC' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div className="font-semibold text-gray-600 text-base">暂无订单</div>
            <div className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
              {tab === 'active' ? '目前没有进行中的服务' : '还没有完成的服务'}
            </div>
            <button onClick={() => navigate('/categories')}
              className="mt-5 px-6 py-2.5 rounded-full text-sm font-semibold border-none cursor-pointer"
              style={{ background: BRAND, color: 'white' }}>
              浏览服务
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => {
              const st = STATUS_MAP[o.status] || STATUS_MAP.PENDING
              return (
                <div key={o.id} className="rounded-2xl overflow-hidden"
                  style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  {/* Color top stripe */}
                  <div style={{ height: 3, background: st.dot }} />
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: st.bg }}>
                        {Ic.wrench(st.dot)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-gray-900 text-sm leading-snug">{o.service?.name}</div>
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                            style={{ background: st.bg, color: st.color }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                            {st.label}
                          </span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{o.service?.category?.name}</div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5">
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#64748B' }}>
                            {Ic.calendar} {o.date}
                          </span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#64748B' }}>
                            {Ic.tech} {o.technician?.name || '待分配'}
                          </span>
                          {o.address && (
                            <span className="flex items-center gap-1 text-xs max-w-[180px] truncate" style={{ color: '#64748B' }}>
                              {Ic.pin} {o.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3.5 pt-3.5"
                      style={{ borderTop: '1px solid #F8FAFC' }}>
                      <span className="text-xs font-mono" style={{ color: '#CBD5E1' }}>
                        #{o.id?.slice(-8).toUpperCase()}
                      </span>
                      <span className="font-bold text-gray-900 text-base">${o.total?.toFixed(0)}</span>
                    </div>
                  </div>

                  {o.status === 'COMPLETED' && (
                    <div className="flex gap-2 px-4 pb-4">
                      <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border"
                        style={{ borderColor: BRAND + '60', color: BRAND, background: 'transparent' }}>
                        评价服务
                      </button>
                      <button onClick={() => navigate('/categories')}
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold border-none cursor-pointer"
                        style={{ background: BRAND, color: 'white' }}>
                        再次预约
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
