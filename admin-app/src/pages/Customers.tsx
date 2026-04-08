import { useEffect, useState } from 'react'
import { api } from '../lib/api'

const SOURCES = ['微信', '电话', '朋友介绍', 'App注册', '老客户', '其他']
const EMPTY_FORM = { name: '', phone: '', wechat: '', email: '', address: '', notes: '' }

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCustomer, setEditCustomer] = useState<any>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = (q = '') => {
    setLoading(true)
    api.getCustomers(q || undefined)
      .then(d => { setCustomers(d.customers); setTotal(d.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const saveCustomer = async () => {
    if (!form.name.trim()) return alert('请填写客户姓名')
    setSaving(true)
    try {
      const c = await api.createCustomer(form)
      setCustomers(prev => [c, ...prev])
      setTotal(t => t + 1)
      setShowModal(false)
      setForm(EMPTY_FORM)
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const updateCustomer = async () => {
    if (!form.name.trim()) return alert('请填写客户姓名')
    setSaving(true)
    try {
      const c = await api.updateCustomer(editCustomer.id, form)
      setCustomers(prev => prev.map(cu => cu.id === c.id ? { ...cu, ...c } : cu))
      setEditCustomer(null)
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const openEdit = (c: any) => {
    setForm({ name: c.name || '', phone: c.phone || '', wechat: c.wechat || '', email: '', address: c.address || '', notes: c.notes || '' })
    setEditCustomer(c)
  }

  const exportCSV = () => {
    const token = localStorage.getItem('admin_token')
    fetch('http://localhost:4000/api/customers/export/csv', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  const F = (label: string, key: string, type = 'text', ph = '') => (
    <div key={key}>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      <input type={type} placeholder={ph}
        value={(form as any)[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
    </div>
  )

  const isEdit = !!editCustomer
  const modalOpen = showModal || isEdit

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm w-72"
          style={{ background: 'white', border: '1px solid #E2E8F0' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); if (!e.target.value) load('') }}
            onKeyDown={e => e.key === 'Enter' && load(search)}
            placeholder="搜索姓名 / 手机 / 邮箱..."
            className="bg-transparent border-none outline-none text-sm flex-1"
            style={{ color: '#334155' }}
          />
          {search && (
            <button onClick={() => { setSearch(''); load('') }}
              className="border-none bg-transparent cursor-pointer text-xs p-0.5 rounded"
              style={{ color: '#94A3B8' }}>✕</button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: '#94A3B8' }}>共 <strong style={{ color: '#0F172A' }}>{total}</strong> 名</span>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all"
            style={{ background: 'white', border: '1px solid #E2E8F0', color: '#64748B' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            导出 CSV
          </button>
          <button onClick={() => { setForm(EMPTY_FORM); setShowModal(true) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all"
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)', color: 'white', boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>
            + 添加客户
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'white', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                {['客户', '手机', '微信', '订单数', '备注', '注册时间', '操作'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: '#94A3B8', background: '#FAFAFA' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    {[180, 100, 80, 30, 120, 70, 50].map((w, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 rounded shimmer" style={{ width: w }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <div className="text-3xl mb-2">👥</div>
                    <div className="text-sm font-medium" style={{ color: '#475569' }}>暂无客户数据</div>
                  </td>
                </tr>
              ) : customers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
                        style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                        {(c.name || '?').slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: '#0F172A' }}>{c.name}</div>
                        {c.address && <div className="text-xs max-w-[180px] truncate mt-0.5" style={{ color: '#94A3B8' }}>{c.address}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#334155' }}>{c.phone || <span style={{ color: '#CBD5E1' }}>—</span>}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#3B82F6' }}>{c.wechat || <span style={{ color: '#CBD5E1' }}>—</span>}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold px-2.5 py-1 rounded-lg" style={{ background: '#F8FAFC', color: '#334155' }}>
                      {c._count?.orders ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs max-w-[150px]" style={{ color: '#94A3B8' }}>
                    <div className="truncate">{c.notes || '—'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: '#94A3B8' }}>
                    {new Date(c.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => openEdit(c)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer border-none transition-all"
                      style={{ background: '#F8FAFC', color: '#64748B' }}>
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 添加/编辑客户 Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl w-full max-w-md modal-content" style={{ background: 'white', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <div className="font-semibold text-base" style={{ color: '#0F172A' }}>{isEdit ? `编辑客户 · ${editCustomer.name}` : '添加客户'}</div>
              <button onClick={() => { setShowModal(false); setEditCustomer(null) }}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-colors text-lg"
                style={{ background: '#F8FAFC', color: '#94A3B8' }}>✕</button>
            </div>

            <div className="px-6 py-4 space-y-3">
              {F('姓名 *', 'name', 'text', '张先生 / Alice Wang')}
              <div className="grid grid-cols-2 gap-3">
                {F('手机号', 'phone', 'tel', '(949) 555-0000')}
                {F('微信号', 'wechat', 'text', '微信ID')}
              </div>
              {!isEdit && F('邮箱', 'email', 'email', '选填，不填则自动生成内部编号')}
              {F('常用地址', 'address', 'text', '例：123 Main St, Irvine CA 92612')}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">备注 / 来源</label>
                <div className="flex gap-1.5 flex-wrap mb-1.5">
                  {SOURCES.map(s => (
                    <button key={s} type="button"
                      onClick={() => setForm(f => ({ ...f, notes: f.notes ? f.notes : s }))}
                      className="px-2.5 py-1 text-xs rounded-full border border-gray-200 text-gray-600 cursor-pointer hover:border-blue-400 hover:text-blue-600 bg-white">
                      {s}
                    </button>
                  ))}
                </div>
                <textarea rows={2} placeholder="来源渠道、特殊需求、内部备注..."
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none outline-none focus:border-blue-500" />
              </div>

              {!isEdit && (
                <div className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                  💡 邮箱不填时系统自动生成内部编号，客户无法直接用此账号登录 App。
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowModal(false); setEditCustomer(null) }}
                className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer">取消</button>
              <button onClick={isEdit ? updateCustomer : saveCustomer} disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-blue-700">
                {saving ? '保存中...' : (isEdit ? '保存修改' : '保存客户')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
