import { useState, useEffect, useMemo } from 'react'
import { api } from '../lib/api'

const STATUS_OPT = [
  { key: 'all', label: '全部' },
  { key: 'PENDING', label: '待确认' },
  { key: 'CONFIRMED', label: '已确认' },
  { key: 'IN_PROGRESS', label: '服务中' },
  { key: 'COMPLETED', label: '已完成' },
  { key: 'CANCELLED', label: '已取消' },
]
const STATUS_BADGE: Record<string, { dot: string; bg: string; text: string }> = {
  PENDING:     { dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
  CONFIRMED:   { dot: '#10B981', bg: '#F0FDF4', text: '#065F46' },
  IN_PROGRESS: { dot: '#3B82F6', bg: '#EFF6FF', text: '#1E40AF' },
  COMPLETED:   { dot: '#94A3B8', bg: '#F8FAFC', text: '#475569' },
  CANCELLED:   { dot: '#EF4444', bg: '#FEF2F2', text: '#991B1B' },
}
const STATUS_LABEL: Record<string, string> = {
  PENDING: '待确认', CONFIRMED: '已确认', IN_PROGRESS: '服务中', COMPLETED: '已完成', CANCELLED: '已取消',
}
const TIMES = [
  '上午 8:00–10:00', '上午 10:00–12:00',
  '下午 12:00–2:00', '下午 2:00–4:00', '下午 4:00–6:00',
  '上午 8:00–12:00（半天）', '下午 12:00–6:00（半天）', '时间待定',
]
const SOURCES = ['微信', '电话', '短信', 'App下单', '朋友介绍', '其他']

const EMPTY_FORM = {
  userId: '', serviceId: '', catId: '',
  techId: '', date: '', time: TIMES[0],
  address: '', notes: '', status: 'PENDING',
  source: '微信', customPrice: '', discount: '0',
}

function today() { return new Date().toISOString().split('T')[0] }
function tomorrow() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] }

// ── 客户搜索+快速新建 ──────────────────────────────────────────────────
function CustomerPicker({ customers, value, onSelect }: {
  customers: any[], value: string, onSelect: (id: string, label: string) => void
}) {
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ name: '', phone: '', wechat: '' })
  const [saving, setSaving] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState('')

  const filtered = useMemo(() =>
    search.trim()
      ? customers.filter(c =>
          c.name?.includes(search) || c.phone?.includes(search) ||
          c.wechat?.includes(search) || c.email?.includes(search))
      : [],
    [search, customers])

  const handleSelect = (c: any) => {
    const label = `${c.name}${c.phone ? ' · ' + c.phone : ''}${c.wechat ? ' · 微信:' + c.wechat : ''}`
    setSelectedLabel(label)
    setSearch('')
    onSelect(c.id, label)
  }

  const createAndSelect = async () => {
    if (!newForm.name.trim()) return alert('请填写客户姓名')
    setSaving(true)
    try {
      const c = await api.createCustomer(newForm)
      handleSelect(c)
      setShowNew(false)
      setNewForm({ name: '', phone: '', wechat: '' })
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">选择客户 *</label>
      {value && !search ? (
        <div className="flex items-center gap-2 border border-green-200 bg-green-50 rounded-xl px-3 py-2.5">
          <span className="text-green-700 text-sm flex-1">{selectedLabel}</span>
          <button onClick={() => { onSelect('', ''); setSelectedLabel('') }}
            className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-sm">✕ 更换</button>
        </div>
      ) : (
        <>
          <input placeholder="搜索姓名 / 手机 / 微信..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
          {search && (
            <div className="border border-gray-100 rounded-xl mt-1 shadow-sm overflow-hidden">
              {filtered.slice(0, 6).map(c => (
                <div key={c.id} onClick={() => handleSelect(c)}
                  className="px-3 py-2.5 text-sm cursor-pointer hover:bg-blue-50 border-b border-gray-50 last:border-b-0 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800">{c.name}</span>
                    {c.phone && <span className="text-gray-400 ml-2 text-xs">{c.phone}</span>}
                    {c.wechat && <span className="text-blue-400 ml-2 text-xs">微信:{c.wechat}</span>}
                  </div>
                  <span className="text-xs text-gray-400">{c._count?.orders ?? 0}单</span>
                </div>
              ))}
              <div onClick={() => setShowNew(true)}
                className="px-3 py-2.5 text-sm cursor-pointer hover:bg-orange-50 text-orange-600 font-medium flex items-center gap-1.5 border-t border-gray-100">
                + 新建客户「{search}」
              </div>
            </div>
          )}
        </>
      )}
      {showNew && (
        <div className="border border-orange-200 bg-orange-50 rounded-xl p-3 mt-2 space-y-2">
          <div className="text-sm font-semibold text-orange-800 mb-1">快速创建新客户</div>
          {[['姓名 *', 'name', '张先生 / Alice'], ['手机', 'phone', '(949) 555-0000'], ['微信号', 'wechat', '微信ID']].map(([_lbl, key, ph]) => (
            <input key={key} placeholder={ph}
              value={(newForm as any)[key]}
              onChange={e => setNewForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full border border-orange-200 bg-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
          ))}
          <div className="flex gap-2">
            <button onClick={() => setShowNew(false)}
              className="flex-1 bg-white text-gray-600 py-1.5 rounded-lg text-xs border border-gray-200 cursor-pointer">取消</button>
            <button onClick={createAndSelect} disabled={saving}
              className="flex-1 bg-orange-500 text-white py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer hover:bg-orange-600">
              {saving ? '保存中...' : '创建并选择'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 服务两级选择器 ────────────────────────────────────────────────────
function ServicePicker({ categories, catId, serviceId, onChange }: {
  categories: any[], catId: string, serviceId: string,
  onChange: (catId: string, serviceId: string, price: number) => void
}) {
  const selectedCat = categories.find(c => c.id === catId)
  const servicesInCat: any[] = selectedCat?.services || []
  const selectedSvc = servicesInCat.find((s: any) => s.id === serviceId)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 block">服务项目 *</label>
      <div className="grid grid-cols-3 gap-1.5">
        {categories.map(c => (
          <button key={c.id} type="button"
            onClick={() => onChange(c.id, '', 0)}
            className={`px-2 py-2 rounded-xl text-xs font-medium border cursor-pointer text-center transition-colors
              ${catId === c.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>
      {catId && (
        <select value={serviceId} onChange={e => {
          const svc = servicesInCat.find((s: any) => s.id === e.target.value)
          onChange(catId, e.target.value, svc?.price || 0)
        }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500">
          <option value="">-- 选择{selectedCat?.name}服务 --</option>
          {servicesInCat.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name}　${s.price}</option>
          ))}
        </select>
      )}
      {selectedSvc && (
        <div className="bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700">
          <span className="font-semibold">{selectedSvc.name}</span>
          <span className="ml-2">参考价：${selectedSvc.price}</span>
          {selectedSvc.duration && <span className="ml-2 text-blue-500">· {selectedSvc.duration}</span>}
        </div>
      )}
    </div>
  )
}

// ── 编辑订单 Modal ────────────────────────────────────────────────────
function EditOrderModal({ order, techs, onSave, onClose }: {
  order: any, techs: any[], onSave: (updated: any) => void, onClose: () => void
}) {
  const [form, setForm] = useState({
    status: order.status || 'PENDING',
    techId: order.techId || order.technician?.id || '',
    date: order.date || '',
    time: order.time || TIMES[0],
    address: order.address || '',
    notes: order.notes || '',
    source: order.source || '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const updated = await api.updateOrder(order.id, form)
      onSave(updated)
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const F = (label: string, key: string, type = 'text', ph = '') => (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      <input type={type} placeholder={ph}
        value={(form as any)[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col modal-content" style={{ background: 'white', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div className="font-bold text-gray-800">编辑订单</div>
            <div className="text-xs text-gray-400 mt-0.5">{order.id.slice(-8).toUpperCase()} · {order.service?.name}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 bg-transparent border-none cursor-pointer text-xl">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* 状态 */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">订单状态</label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPT.filter(s => s.key !== 'all').map(s => (
                <button key={s.key} type="button"
                  onClick={() => setForm(f => ({ ...f, status: s.key }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors
                    ${form.status === s.key
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 外派技师 */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">外派技师</label>
            <select value={form.techId} onChange={e => setForm(f => ({ ...f, techId: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500">
              <option value="">-- 暂不分配 --</option>
              {techs.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}{t.specialties ? ' · ' + t.specialties : ''}</option>
              ))}
            </select>
          </div>

          {/* 日期 + 时段 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">预约日期</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">时间段</label>
              <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {F('服务地址', 'address', 'text', '')}

          {/* 来源 */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">订单来源</label>
            <div className="flex gap-1.5 flex-wrap">
              {SOURCES.map(s => (
                <button key={s} type="button"
                  onClick={() => setForm(f => ({ ...f, source: s }))}
                  className={`px-2.5 py-1 text-xs rounded-full border cursor-pointer transition-colors
                    ${form.source === s ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 备注 */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">备注</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer">取消</button>
          <button onClick={save} disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-blue-700">
            {saving ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editOrder, setEditOrder] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [techs, setTechs] = useState<any[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = (status = filter) => {
    setLoading(true)
    api.getOrders(status !== 'all' ? `status=${status}` : '')
      .then(d => { setOrders(d.orders); setTotal(d.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const loadFormData = () =>
    Promise.all([api.getCustomers(), api.getCategories(), api.getTechnicians()])
      .then(([cd, cats, td]) => {
        setCustomers(cd.customers || [])
        setCategories(cats as any[])
        setTechs(td || [])
      })

  const openModal = () => { loadFormData(); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (o: any) => { loadFormData(); setEditOrder(o) }

  // price preview
  const selectedCat = categories.find(c => c.id === form.catId)
  const selectedSvc = (selectedCat?.services || []).find((s: any) => s.id === form.serviceId)
  const basePrice = form.customPrice !== '' ? Number(form.customPrice) : (selectedSvc?.price || 0)
  const discount = Number(form.discount) || 0
  const tax = Math.round((basePrice - discount) * 0.0875 * 100) / 100
  const totalPrice = basePrice - discount + tax

  const saveOrder = async () => {
    if (!form.userId || !form.serviceId || !form.date || !form.address) return alert('请填写客户、服务、日期和地址')
    setSaving(true)
    try {
      const payload: any = { ...form, techId: form.techId || undefined, notes: form.notes || undefined }
      if (form.customPrice !== '') payload.customPrice = Number(form.customPrice)
      if (discount > 0) payload.discount = discount
      const order = await api.createOrderAdmin(payload)
      setOrders(prev => [order, ...prev])
      setTotal(t => t + 1)
      setShowModal(false)
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  const changeStatus = async (id: string, status: string) => {
    try {
      const updated = await api.updateOrder(id, { status })
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o))
    } catch (e: any) { alert(e.message) }
  }

  const exportCSV = () => {
    const token = localStorage.getItem('admin_token')
    const url = `http://localhost:4000/api/orders/export/csv${filter !== 'all' ? '?status=' + filter : ''}`
    const a = document.createElement('a')
    a.href = url
    // pass token via fetch and create blob
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob)
        a.href = blobUrl
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(blobUrl)
      })
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Tab filters */}
        <div className="flex items-center rounded-xl p-1 gap-0.5" style={{ background: 'white', border: '1px solid #E2E8F0' }}>
          {STATUS_OPT.map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer border-none transition-all duration-150"
              style={{
                background: filter === s.key ? '#0F172A' : 'transparent',
                color: filter === s.key ? 'white' : '#64748B',
              }}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-150"
            style={{ background: 'white', border: '1px solid #E2E8F0', color: '#64748B' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            导出 CSV
          </button>
          <button onClick={openModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)', color: 'white', boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>
            + 新建订单
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'white', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                {['订单号', '服务项目', '客户', '技师', '预约时间', '来源', '金额', '状态', '操作'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: '#94A3B8', background: '#FAFAFA' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    {[60, 100, 80, 60, 70, 40, 40, 60, 80].map((w, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 rounded shimmer" style={{ width: w }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center">
                    <div className="text-3xl mb-2">📋</div>
                    <div className="text-sm font-medium" style={{ color: '#475569' }}>暂无订单</div>
                    <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>点击右上角「新建订单」录入第一笔</div>
                  </td>
                </tr>
              ) : orders.map(o => {
                const badge = STATUS_BADGE[o.status] || { dot: '#94A3B8', bg: '#F8FAFC', text: '#475569' }
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-5 py-4 font-mono text-xs font-semibold" style={{ color: '#F97316', whiteSpace: 'nowrap' }}>
                      {o.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium" style={{ color: '#0F172A' }}>{o.service?.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{o.service?.category?.name}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm" style={{ color: '#334155' }}>{o.user?.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{o.user?.phone || '—'}</div>
                    </td>
                    <td className="px-5 py-4">
                      {o.technician ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                            style={{ background: '#64748B' }}>
                            {(o.technician.name || '?').slice(0, 1)}
                          </div>
                          <span className="text-sm" style={{ color: '#334155' }}>{o.technician.name}</span>
                        </div>
                      ) : (
                        <button onClick={() => openEdit(o)}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg cursor-pointer border-none transition-all"
                          style={{ background: '#FFF7ED', color: '#EA580C', border: '1px dashed #FED7AA' }}>
                          + 外派
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: '#334155' }}>{o.date}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{o.time}</div>
                    </td>
                    <td className="px-5 py-4">
                      {o.source ? (
                        <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                          style={{ background: '#F1F5F9', color: '#64748B' }}>{o.source}</span>
                      ) : <span style={{ color: '#CBD5E1' }}>—</span>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>${o.total?.toFixed(0)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: badge.bg, color: badge.text }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: badge.dot }} />
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 items-center flex-wrap">
                        {o.status === 'PENDING' && (<>
                          <button onClick={() => changeStatus(o.id, 'CONFIRMED')}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg cursor-pointer border-none transition-all"
                            style={{ background: '#F0FDF4', color: '#15803D' }}>确认</button>
                          <button onClick={() => changeStatus(o.id, 'CANCELLED')}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg cursor-pointer border-none transition-all"
                            style={{ background: '#FEF2F2', color: '#DC2626' }}>取消</button>
                        </>)}
                        {o.status === 'CONFIRMED' && (
                          <button onClick={() => changeStatus(o.id, 'IN_PROGRESS')}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg cursor-pointer border-none transition-all"
                            style={{ background: '#EFF6FF', color: '#2563EB' }}>开始服务</button>
                        )}
                        {o.status === 'IN_PROGRESS' && (
                          <button onClick={() => changeStatus(o.id, 'COMPLETED')}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg cursor-pointer border-none transition-all"
                            style={{ background: '#F8FAFC', color: '#475569' }}>✓ 完成</button>
                        )}
                        <button onClick={() => openEdit(o)}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg cursor-pointer border-none transition-all"
                          style={{ background: '#F8FAFC', color: '#64748B' }}>编辑</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-5 py-3 text-xs" style={{ borderTop: '1px solid #F8FAFC', color: '#94A3B8' }}>
            共 {total} 条订单
          </div>
        )}
      </div>

      {/* 编辑订单 Modal */}
      {editOrder && (
        <EditOrderModal
          order={editOrder}
          techs={techs}
          onClose={() => setEditOrder(null)}
          onSave={updated => {
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
            setEditOrder(null)
          }}
        />
      )}

      {/* 新建订单 Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col modal-content" style={{ background: 'white', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <div className="font-semibold text-base" style={{ color: '#0F172A' }}>新建订单</div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-colors text-lg"
                style={{ background: '#F8FAFC', color: '#94A3B8' }}>✕</button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
              <CustomerPicker customers={customers} value={form.userId}
                onSelect={(id) => setForm(f => ({ ...f, userId: id }))} />

              <ServicePicker categories={categories} catId={form.catId} serviceId={form.serviceId}
                onChange={(catId, serviceId) => setForm(f => ({ ...f, catId, serviceId, customPrice: '' }))} />

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">预约日期 *</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setForm(f => ({ ...f, date: today() }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${form.date === today() ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                    今天
                  </button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, date: tomorrow() }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${form.date === tomorrow() ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                    明天
                  </button>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">服务地址 *</label>
                <input type="text" placeholder="例：100 Spectrum Center Dr, Irvine CA 92618"
                  value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">分配技师</label>
                  <select value={form.techId} onChange={e => setForm(f => ({ ...f, techId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option value="">-- 暂不分配 --</option>
                    {techs.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">订单来源</label>
                  <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">金额调整（可选）</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">自定义价格</div>
                    <input type="number" placeholder={selectedSvc ? `参考价 $${selectedSvc.price}` : '自动按服务定价'}
                      value={form.customPrice} onChange={e => setForm(f => ({ ...f, customPrice: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">优惠折扣 ($)</div>
                    <input type="number" placeholder="0"
                      value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
                {selectedSvc && (
                  <div className="bg-gray-50 rounded-xl p-3 mt-2 text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between"><span>服务价格</span><span>${basePrice.toFixed(2)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-red-500"><span>优惠</span><span>-${discount.toFixed(2)}</span></div>}
                    <div className="flex justify-between"><span>税 (8.75%)</span><span>${tax.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-1"><span>合计</span><span>${totalPrice.toFixed(2)}</span></div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">订单状态</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option value="PENDING">待确认</option>
                    <option value="CONFIRMED">已确认（已预约）</option>
                    <option value="COMPLETED">已完成（历史订单）</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">付款方式</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option>现金</option><option>Zelle</option><option>支票</option>
                    <option>信用卡</option><option>待付款</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">备注</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer">取消</button>
              <button onClick={saveOrder} disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-blue-700">
                {saving ? '保存中...' : `创建订单${selectedSvc ? ' · $' + totalPrice.toFixed(0) : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
