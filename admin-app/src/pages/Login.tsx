import { useState } from 'react'
import { api } from '../lib/api'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('admin@fixnest.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!password) return setError('请输入密码')
    setLoading(true)
    setError('')
    try {
      const data = await api.login(email, password)
      if (data.user.role !== 'ADMIN') throw new Error('无管理员权限')
      localStorage.setItem('admin_token', data.token)
      onLogin()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔧</div>
          <div className="font-bold text-gray-800 text-xl">OmniFix 管理后台</div>
          <div className="text-gray-400 text-sm mt-1">周到服务 · 请使用管理员账号登录</div>
        </div>
        <div className="space-y-3">
          <input value={email} onChange={e => setEmail(e.target.value)}
            type="email" placeholder="管理员邮箱"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
          <input value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            type="password" placeholder="密码"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
          {error && <div className="text-red-500 text-sm text-center bg-red-50 rounded-xl py-2">{error}</div>}
          <button onClick={submit} disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm border-none cursor-pointer"
            style={{ background: loading ? '#93C5FD' : '#1D4ED8' }}>
            {loading ? '登录中...' : '登录'}
          </button>
        </div>
      </div>
    </div>
  )
}
