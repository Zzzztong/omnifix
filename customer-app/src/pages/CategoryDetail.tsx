import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { CatIcon } from './Home'

const BRAND = '#EA580C'

export default function CategoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cat, setCat] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.categories()
      .then((cats: any[]) => {
        const found = cats.find(c => c.id === id)
        setCat(found || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center text-gray-400">加载中...</div>
  if (!cat) return <div className="p-8 text-center text-gray-500">未找到该分类</div>

  const services: any[] = cat.services || []
  const catColor = cat.color || BRAND

  return (
    <div className="pb-24" style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* White header */}
      <div style={{ background: 'white', borderBottom: '1px solid #F1F5F9' }}>
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer active:opacity-60"
              style={{ background: '#F8FAFC', color: '#64748B' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: catColor + '18' }}>
                <CatIcon catId={cat.id} color={catColor} size={22} />
              </div>
              <div>
                <div className="font-bold text-lg" style={{ color: '#0F172A' }}>{cat.name}</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>{services.length} 项服务可选</div>
              </div>
            </div>
          </div>
          {cat.desc && (
            <div className="text-sm px-1" style={{ color: '#64748B' }}>{cat.desc}</div>
          )}
        </div>
      </div>

      {/* Service list */}
      <div className="px-4 pt-4 space-y-3">
        {services.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">该分类暂无服务项目</div>
        )}
        {services.map((s: any) => (
          <div key={s.id} className="rounded-2xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            {s.popular && (
              <div style={{ height: 3, background: `linear-gradient(90deg, ${BRAND}, #FB923C)` }} />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm" style={{ color: '#0F172A' }}>{s.name}</span>
                    {s.popular && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: '#FFF7ED', color: BRAND }}>热门</span>
                    )}
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: '#64748B' }}>{s.desc}</div>
                  {s.duration && s.duration !== '按项目' && (
                    <div className="flex items-center gap-1 mt-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span className="text-xs" style={{ color: '#94A3B8' }}>预计 {s.duration}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
                  <div>
                    <div className="font-black text-xl text-right" style={{ color: '#0F172A' }}>
                      {s.duration === '按项目' ? '报价' : `$${s.price}`}
                    </div>
                    {s.duration === '按项目' && (
                      <div className="text-xs text-right" style={{ color: '#94A3B8' }}>起价 ${s.price}</div>
                    )}
                  </div>
                  <button onClick={() => navigate(`/booking/${cat.id}/${s.id}`)}
                    className="text-white rounded-xl px-5 py-2 text-sm font-semibold border-none cursor-pointer active:opacity-80"
                    style={{ background: `linear-gradient(135deg, ${BRAND}, #F97316)` }}>
                    预约
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust bar */}
      <div className="mx-4 mt-4 rounded-2xl p-4 flex items-center justify-around"
        style={{ background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        {[
          { icon: '🛡', text: '持证技师' },
          { icon: '⭐', text: '4.9 评分' },
          { icon: '✓', text: '满意保障' },
        ].map(item => (
          <div key={item.text} className="flex flex-col items-center gap-1">
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-medium" style={{ color: '#64748B' }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
