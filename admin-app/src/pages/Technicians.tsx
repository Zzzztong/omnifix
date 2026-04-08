import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Technicians() {
  const [techs, setTechs] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', area: 'Irvine', specialties: [] as string[] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getTechnicians().then(setTechs).catch(() => {})
  }, [])

  const toggleSpec = (s: string) => {
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(s) ? f.specialties.filter(x => x !== s) : [...f.specialties, s]
    }))
  }

  const save = async () => {
    if (!form.name || !form.email || !form.phone) return alert('请填写姓名、邮箱和手机号')
    setSaving(true)
    try {
      const t = await api.createTechnician(form)
      setTechs(prev => [...prev, t])
      setShowModal(false)
      setForm({ name: '', email: '', phone: '', area: 'Irvine', specialties: [] })
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-blue-700">
          + 添加技师
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {techs.length === 0 && <div className="text-gray-400 text-sm">加载中...</div>}
        {techs.map(t => (
          <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-lg">
                  {(t.name || '?').slice(0, 1)}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{t.name}</div>
                  <div className="text-gray-400 text-xs">{(t.specialties || []).join(' · ')}</div>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {t.active ? '在职' : '休息'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[['总接单', t.jobCount], ['评分', t.rating], ['区域', t.area?.split('/')[0]?.trim() || 'Irvine']].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-2 text-center">
                  <div className="font-bold text-gray-800 text-sm truncate">{v}</div>
                  <div className="text-xs text-gray-400">{k}</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mb-3 space-y-1">
              <div>📞 {t.phone}</div>
              <div>✉️ {t.email}</div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="font-bold text-gray-800 text-lg">添加技师</div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 bg-transparent border-none cursor-pointer text-xl">✕</button>
            </div>
            <div className="space-y-3">
              {[['姓名 *', 'name', 'text', '张师傅'], ['手机号 *', 'phone', 'tel', '(949) 555-0000'], ['邮箱 *', 'email', 'email', 'name@fixnest.com'], ['服务区域', 'area', 'text', 'Irvine']].map(([label, key, type, ph]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
                  <input type={type} placeholder={ph}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">擅长领域</label>
                <div className="grid grid-cols-2 gap-2">
                  {['plumbing','electrical','hvac','carpentry','handyman','appliances','landscaping','cleaning'].map(s => (
                    <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.specialties.includes(s)} onChange={() => toggleSpec(s)} className="w-4 h-4 accent-blue-600" />
                      <span className="text-gray-700">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer">取消</button>
              <button onClick={save} disabled={saving}
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
