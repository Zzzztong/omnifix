import { useState, useEffect } from 'react'
import { api } from '../lib/api'

const EMPTY_FORM = { name: '', catId: '', price: '', duration: '', desc: '', popular: false }

async function toggleActive(type: 'service' | 'category', id: string, current: boolean, update: (id: string, active: boolean) => void) {
  try {
    if (type === 'service') {
      await import('../lib/api').then(m => m.api.updateService(id, { active: !current }))
    } else {
      await import('../lib/api').then(m => m.api.updateCategory(id, { active: !current }))
    }
    update(id, !current)
  } catch (e: any) { alert(e.message) }
}

export default function Services() {
  const [tab, setTab] = useState<'cats' | 'items'>('cats')
  const [categories, setCategories] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [catFilter, setCatFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.getCategories()
      .then((cats: any[]) => {
        setCategories(cats)
        const svcs = cats.flatMap((c: any) => (c.services || []).map((s: any) => ({ ...s, catName: c.name })))
        setServices(svcs)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredServices = catFilter === 'all' ? services : services.filter(s => s.categoryId === catFilter)

  const saveService = async () => {
    if (!form.name || !form.catId || !form.price) return alert('请填写服务名称、所属分类和价格')
    setSaving(true)
    try {
      const s = await api.createService({
        name: form.name,
        categoryId: form.catId,
        price: Number(form.price),
        duration: form.duration || '1-2小时',
        desc: form.desc || '',
        popular: form.popular,
      })
      const cat = categories.find(c => c.id === form.catId)
      setServices(prev => [...prev, { ...s, catName: cat?.name }])
      setCategories(prev => prev.map(c => c.id === form.catId ? { ...c, services: [...(c.services || []), s] } : c))
      setShowModal(false)
      setForm(EMPTY_FORM)
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">加载中...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <button onClick={() => setTab('cats')}
            className={`px-4 py-2 rounded-xl text-sm font-medium border-none cursor-pointer
              ${tab === 'cats' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            服务分类
          </button>
          <button onClick={() => setTab('items')}
            className={`px-4 py-2 rounded-xl text-sm font-medium border-none cursor-pointer
              ${tab === 'items' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            服务项目 ({services.length})
          </button>
        </div>
        {tab === 'items' && (
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-blue-700">
            + 新增项目
          </button>
        )}
      </div>

      {/* 分类列表 */}
      {tab === 'cats' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['分类名称', '图标', '分组', '项目数', '状态'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(c => {
                const groupLabel = c.group === 'urgent' ? '水电暖气' : c.group === 'repair' ? '居家修缮' : '美化保养'
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/40">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-800">{c.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{c.desc}</div>
                    </td>
                    <td className="px-4 py-4 text-2xl">{c.icon}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{groupLabel}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 font-semibold">
                      {(c.services || []).length} 项
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleActive('category', c.id, c.active, (id, val) =>
                          setCategories(prev => prev.map(x => x.id === id ? { ...x, active: val } : x))
                        )}
                        className="text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer border-none transition-all"
                        style={c.active
                          ? { background: '#DCFCE7', color: '#15803D' }
                          : { background: '#F1F5F9', color: '#64748B' }}>
                        {c.active ? '✓ 上线' : '○ 下线'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 服务项目列表 */}
      {tab === 'items' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500">
              <option value="all">所有分类 ({services.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({(c.services || []).length})</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['服务名称', '所属分类', '价格', '工时', '热门', '状态'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredServices.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 text-sm">{s.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{s.desc}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{s.catName}</td>
                    <td className="px-4 py-3 font-bold text-gray-800">${s.price}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{s.duration}</td>
                    <td className="px-4 py-3">
                      {s.popular ? <span className="text-yellow-500 text-sm">⭐ 热门</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive('service', s.id, s.active, (id, val) =>
                          setServices(prev => prev.map(x => x.id === id ? { ...x, active: val } : x))
                        )}
                        className="text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer border-none transition-all"
                        style={s.active
                          ? { background: '#DCFCE7', color: '#15803D' }
                          : { background: '#F1F5F9', color: '#64748B' }}>
                        {s.active ? '✓ 上线' : '○ 下线'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredServices.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">暂无服务项目</div>
          )}
        </div>
      )}

      {/* 新增项目弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="font-bold text-gray-800 text-lg">新增服务项目</div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 bg-transparent border-none cursor-pointer text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">服务名称 *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="例：热水器维修"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">所属分类 *</label>
                <select value={form.catId} onChange={e => setForm({ ...form, catId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500">
                  <option value="">选择分类...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">价格 ($) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="195"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">工时</label>
                  <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                    placeholder="1-2小时"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">服务说明</label>
                <textarea rows={3} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })}
                  placeholder="描述服务内容..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none outline-none focus:border-blue-500" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.popular} onChange={e => setForm({ ...form, popular: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm text-gray-700">标记为热门</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer">取消</button>
              <button onClick={saveService} disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-blue-700">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
