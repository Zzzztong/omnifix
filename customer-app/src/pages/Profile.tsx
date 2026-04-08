import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const BRAND = '#E85D04'

const Ic = {
  orders: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  star: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  doc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  info: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  chevron: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  gift: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BRAND} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
  wallet: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>,
}

const BG: Record<string, string> = {
  orders: '#EFF6FF', star: '#FFFBEB', user: '#F0FDF4', bell: '#F5F3FF',
  chat: '#FFF7ED', doc: '#F8FAFC', info: '#F8FAFC',
}
const FG: Record<string, string> = {
  orders: '#3B82F6', star: '#F59E0B', user: '#22C55E', bell: '#8B5CF6',
  chat: BRAND, doc: '#94A3B8', info: '#94A3B8',
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => { logout(); navigate('/login') }
  const copyCode = () => {
    navigator.clipboard?.writeText(user?.referralCode || '')
  }

  const initial = (user?.name || '?').slice(0, 1).toUpperCase()
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
    : ''

  const sections = [
    {
      title: '我的服务',
      items: [
        { key: 'orders', icon: Ic.orders, label: '我的订单', sub: '查看预约记录', action: () => navigate('/orders') },
        { key: 'star', icon: Ic.star, label: '评价记录', sub: '查看历史评价', action: () => {} },
      ]
    },
    {
      title: '账户',
      items: [
        { key: 'user', icon: Ic.user, label: '账户信息', sub: '更新个人资料', action: () => {} },
        { key: 'bell', icon: Ic.bell, label: '通知设置', sub: '管理消息推送', action: () => {} },
      ]
    },
    {
      title: '帮助',
      items: [
        { key: 'chat', icon: Ic.chat, label: '联系客服', sub: '随时为您服务', action: () => {} },
        { key: 'doc', icon: Ic.doc, label: '使用条款', sub: '隐私政策与服务条款', action: () => {} },
        { key: 'info', icon: Ic.info, label: '关于 OmniFix', sub: 'v1.0 · 周到可信赖', action: () => {} },
      ]
    },
  ]

  return (
    <div className="pb-28" style={{ background: '#F5F5F7' }}>
      {/* Header */}
      <div style={{ background: '#0A0A0A' }} className="px-4 pt-14 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #C2410C 100%)` }}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-xl leading-tight">{user?.name?.split(' ')[0] || '用户'}</div>
            <div className="text-sm mt-0.5 truncate" style={{ color: '#6B7280' }}>
              {user?.phone || (user?.email?.includes('@omnifix.internal') ? '' : user?.email)}
            </div>
            {memberSince && (
              <div className="text-xs mt-0.5" style={{ color: '#4B5563' }}>会员自 {memberSince}</div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Referral card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#111111' }}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              {Ic.gift}
              <span className="text-white font-semibold text-sm">邀请好友，各得 $20</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="font-mono font-bold text-xl flex-1" style={{ color: '#FB923C', letterSpacing: 2 }}>
                {user?.referralCode || '—'}
              </span>
              <button onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer"
                style={{ background: BRAND, color: 'white' }}>
                {Ic.copy} 复制
              </button>
            </div>
            <div className="text-xs mt-2" style={{ color: '#4B5563' }}>好友首单完成后奖励立即到账</div>
          </div>
        </div>

        {/* Balance */}
        <div className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div>
            <div className="text-xs font-medium" style={{ color: '#94A3B8' }}>可用余额</div>
            <div className="font-black text-2xl mt-0.5" style={{ color: '#0F172A', letterSpacing: '-0.5px' }}>
              ${user?.credits?.toFixed(0) ?? '0'}
            </div>
          </div>
          {Ic.wallet}
        </div>

        {/* Menu sections */}
        {sections.map(section => (
          <div key={section.title}>
            <div className="text-xs font-semibold uppercase tracking-wider px-1 mb-1.5" style={{ color: '#9CA3AF' }}>
              {section.title}
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {section.items.map((item, i) => (
                <button key={item.label} onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer border-none bg-transparent text-left active:opacity-70 transition-opacity"
                  style={{ borderTop: i > 0 ? '1px solid #F3F4F6' : 'none' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: BG[item.key], color: FG[item.key] }}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800">{item.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{item.sub}</div>
                  </div>
                  {Ic.chevron}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <button onClick={handleLogout}
            className="w-full px-4 py-4 text-sm font-semibold bg-transparent border-none cursor-pointer"
            style={{ color: '#EF4444' }}>
            退出登录
          </button>
        </div>

        <div className="text-center text-xs pb-2" style={{ color: '#CBD5E1' }}>OmniFix v1.0 · 专业上门维修</div>
      </div>
    </div>
  )
}
