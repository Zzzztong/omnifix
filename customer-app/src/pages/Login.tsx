import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const submit = async () => {
    setError('')
    if (!email || !password) return setError('请填写邮箱和密码')
    if (tab === 'register' && !name) return setError('请填写姓名')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password, phone || undefined)
      }
      navigate('/')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const BRAND = '#E85D04'
  const BRAND_DARK = '#C2410C'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${BRAND_DARK} 0%, ${BRAND} 45%, #FFF7ED 45%)` }}>
      <div className="px-6 pt-14 pb-6 text-white relative">
        <button onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-9 h-9 flex items-center justify-center rounded-full border-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.2)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="text-3xl font-bold mb-1 tracking-tight">OmniFix</div>
        <div className="text-orange-100 text-sm font-medium">周到服务 · 尔湾专业上门维修</div>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-10">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {(['login', 'register'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all
                ${tab === t ? 'bg-white shadow-sm' : 'bg-transparent text-gray-500'}`}
              style={tab === t ? { color: BRAND } : {}}>
              {t === 'login' ? '登录' : '注册新账号'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {tab === 'register' && (
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="您的姓名" type="text"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none"
              style={{ boxSizing: 'border-box' }} />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="邮箱地址" type="email"
            className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none"
            style={{ boxSizing: 'border-box' }} />
          {tab === 'register' && (
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="手机号码（选填）" type="tel"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none"
              style={{ boxSizing: 'border-box' }} />
          )}
          <input value={password} onChange={e => setPassword(e.target.value)}
            placeholder="密码" type="password"
            className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none"
            style={{ boxSizing: 'border-box' }} />

          {error && <div className="text-red-500 text-sm text-center bg-red-50 rounded-xl py-2">{error}</div>}

          <button onClick={submit} disabled={loading}
            className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm border-none cursor-pointer mt-1"
            style={{ background: loading ? '#FDBA74' : `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})` }}>
            {loading ? '请稍候...' : tab === 'login' ? '登录' : '注册'}
          </button>
        </div>

        {tab === 'register' && (
          <div className="mt-4 rounded-2xl p-3 text-xs text-center" style={{ background: '#FFF7ED', color: BRAND }}>
            🎁 新用户注册立享首单 <strong>$30</strong> 优惠！使用优惠码 <strong>NEW30</strong>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          继续即表示同意 OmniFix 服务条款与隐私政策
        </div>
      </div>
    </div>
  )
}
