import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const STATUS_STYLE: Record<string, { dot: string; bg: string; text: string }> = {
  PENDING:     { dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
  CONFIRMED:   { dot: '#10B981', bg: '#F0FDF4', text: '#065F46' },
  IN_PROGRESS: { dot: '#3B82F6', bg: '#EFF6FF', text: '#1E40AF' },
  COMPLETED:   { dot: '#94A3B8', bg: '#F8FAFC', text: '#475569' },
  CANCELLED:   { dot: '#EF4444', bg: '#FEF2F2', text: '#991B1B' },
}
const STATUS_LABEL: Record<string, string> = {
  PENDING: '待确认', CONFIRMED: '已确认', IN_PROGRESS: '服务中', COMPLETED: '已完成', CANCELLED: '已取消',
}

function StatCard({ label, value, sub, icon, to, color }: {
  label: string, value: any, sub?: string, icon: React.ReactNode, to: string, color: string
}) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(to)}
      className="rounded-2xl p-5 cursor-pointer group"
      style={{
        background: 'white',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm font-medium" style={{ color: '#64748B' }}>{label}</div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: color + '15', color }}>
          {icon}
        </div>
      </div>
      <div className="font-bold text-2xl mb-1" style={{ color: '#0F172A', letterSpacing: '-0.5px' }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: '#94A3B8' }}>{sub}</div>}
    </div>
  )
}

// SVG icons inline
const icons = {
  orders: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  revenue: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  customers: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  tech: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>,
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => { api.dashboard().then(setStats).catch(() => {}) }, [])

  const cards = [
    { label: '订单总数', value: stats?.totalOrders ?? '—', sub: '全部历史订单', icon: icons.orders, to: '/orders', color: '#3B82F6' },
    { label: '总营业额', value: stats ? `$${(stats.totalRevenue || 0).toFixed(0)}` : '—', sub: '税后收入', icon: icons.revenue, to: '/orders', color: '#10B981' },
    { label: '注册客户', value: stats?.totalCustomers ?? '—', sub: '档案已建立', icon: icons.customers, to: '/customers', color: '#8B5CF6' },
    { label: '在职技师', value: stats?.totalTechnicians ?? '—', sub: '当前在岗', icon: icons.tech, to: '/technicians', color: '#F97316' },
  ]

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: 'white', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F8FAFC' }}>
            <div className="font-semibold text-sm" style={{ color: '#0F172A' }}>最新订单</div>
            <button onClick={() => navigate('/orders')}
              className="flex items-center gap-1 text-xs font-medium cursor-pointer border-none px-0 py-0 rounded transition-colors"
              style={{ background: 'transparent', color: '#F97316' }}>
              查看全部 {icons.arrow}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                  {['订单号', '服务', '客户', '时间', '金额', '状态'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: '#94A3B8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!stats ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 rounded shimmer" style={{ width: j === 0 ? 60 : j === 4 ? 40 : 80 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : stats.recentOrders?.length > 0 ? stats.recentOrders.map((o: any) => {
                  const s = STATUS_STYLE[o.status] || { dot: '#94A3B8', bg: '#F8FAFC', text: '#475569' }
                  return (
                    <tr key={o.id} onClick={() => navigate('/orders')}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid #F8FAFC' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-5 py-3.5 text-xs font-mono font-semibold" style={{ color: '#F97316' }}>
                        {o.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: '#334155' }}>{o.service?.name}</td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: '#334155' }}>{o.user?.name}</td>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: '#94A3B8' }}>
                        {o.date} · {o.time}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: '#0F172A' }}>${o.total}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ background: s.bg, color: s.text }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                          {STATUS_LABEL[o.status]}
                        </span>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: '#94A3B8' }}>暂无订单数据</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #F8FAFC' }}>
            <div className="font-semibold text-sm" style={{ color: '#0F172A' }}>订单状态</div>
          </div>
          <div className="p-4 space-y-2">
            {!stats ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="h-3 w-16 rounded shimmer" />
                  <div className="h-3 w-6 rounded shimmer" />
                </div>
              ))
            ) : stats.ordersByStatus?.length > 0 ? stats.ordersByStatus.map((s: any) => {
              const style = STATUS_STYLE[s.status] || { dot: '#94A3B8', bg: '#F8FAFC', text: '#475569' }
              const max = Math.max(...stats.ordersByStatus.map((x: any) => x._count))
              const pct = Math.round((s._count / max) * 100)
              return (
                <div key={s.status} className="py-1.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: style.text }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: style.dot }} />
                      {STATUS_LABEL[s.status]}
                    </span>
                    <span className="font-bold text-sm" style={{ color: '#0F172A' }}>{s._count}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: pct + '%', background: style.dot }} />
                  </div>
                </div>
              )
            }) : (
              <div className="text-center py-8 text-sm" style={{ color: '#94A3B8' }}>暂无数据</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
