import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { CatIcon } from './Home'

const GROUP_META: Record<string, { label: string; sub: string; color: string; bg: string }> = {
  urgent:  { label: '水电暖气', sub: '安全优先', color: '#DC2626', bg: '#FEF2F2' },
  repair:  { label: '居家修缮', sub: '设备维修与室内修复', color: '#2563EB', bg: '#EFF6FF' },
  enhance: { label: '美化保养', sub: '提升居家品质', color: '#16A34A', bg: '#F0FDF4' },
}

const BRAND = '#E85D04'

export default function Categories() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="pb-28" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-14 pb-3"
        style={{ background: 'white', borderBottom: '1px solid #F1F5F9' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer active:opacity-60 transition-opacity"
            style={{ background: '#F8FAFC', color: '#64748B' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <div className="font-bold text-gray-900 text-lg">全部服务</div>
            {!loading && (
              <div className="text-xs" style={{ color: '#9CA3AF' }}>
                {categories.length} 大类 · 尔湾（Irvine, CA）
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {['urgent', 'repair', 'enhance'].map(groupKey => {
          const meta = GROUP_META[groupKey]
          const cats = categories.filter(c => c.group === groupKey)
          if (!cats.length && !loading) return null

          return (
            <div key={groupKey} className="mb-6">
              {/* Group header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-1.5 h-5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                <span className="font-bold text-sm" style={{ color: meta.color }}>{meta.label}</span>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>{meta.sub}</span>
              </div>

              <div className="space-y-2.5">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-2xl h-20 shimmer" />
                  ))
                  : cats.map(cat => {
                    const prices = (cat.services || []).map((s: any) => s.price).filter(Boolean)
                    const minPrice = prices.length ? Math.min(...prices) : null
                    const count = (cat.services || []).length

                    return (
                      <div key={cat.id} onClick={() => navigate(`/category/${cat.id}`)}
                        className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer active:opacity-80 transition-opacity"
                        style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        {/* Icon */}
                        <div className="rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: (cat.color || BRAND) + '14', width: 52, height: 52 }}>
                          <CatIcon catId={cat.id} color={cat.color || BRAND} size={26} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
                            {groupKey === 'urgent' && (
                              <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                                style={{ background: '#FEF2F2', color: '#DC2626' }}>紧急优先</span>
                            )}
                          </div>
                          {cat.desc && (
                            <div className="text-xs truncate" style={{ color: '#9CA3AF' }}>{cat.desc}</div>
                          )}
                          <div className="text-xs mt-1 font-medium" style={{ color: cat.color || BRAND }}>
                            {count} 项服务{minPrice ? ` · 从 $${minPrice}` : ''}
                          </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
