import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

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

  return (
    <div className="pb-20">
      {/* 渐变头部 */}
      <div className="px-4 pt-12 pb-6"
           style={{ background: `linear-gradient(135deg, ${cat.color || '#E85D04'} 0%, ${cat.color || '#E85D04'}BB 100%)` }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)}
                  className="text-white opacity-80 text-xl bg-transparent border-none cursor-pointer leading-none p-0">←</button>
          <div className="font-bold text-white text-lg">{cat.icon} {cat.name}</div>
        </div>
        <div className="text-white text-sm opacity-90">{cat.desc}</div>
        <div className="text-white text-xs opacity-70 mt-1">{services.length} 项服务可选</div>
      </div>

      {/* 服务列表 */}
      <div className="px-4 py-3">
        {services.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">该分类暂无服务项目</div>
        )}
        {services.map((s: any) => (
          <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm mb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-gray-800">{s.name}</div>
                  {s.popular && (
                    <span className="bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-xs font-medium">热门</span>
                  )}
                </div>
                <div className="text-gray-500 text-xs mt-1 leading-relaxed">{s.desc}</div>
                {s.duration && s.duration !== '按项目' && (
                  <div className="text-xs text-gray-400 mt-2">⏱ 预计 {s.duration}</div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="font-bold text-gray-800 text-xl">
                  {s.duration === '按项目' ? '报价' : `$${s.price}`}
                </div>
                {s.duration === '按项目' && (
                  <div className="text-xs text-gray-400">起价 ${s.price}</div>
                )}
                <button onClick={() => navigate(`/booking/${cat.id}/${s.id}`)}
                        className="text-white rounded-xl px-4 py-2 text-sm font-semibold border-none cursor-pointer"
                        style={{ background: '#E85D04' }}>
                  预约
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
