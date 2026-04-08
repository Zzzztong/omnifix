import { useState } from 'react'

const COUPONS = [
  { id: '1', code: 'NEW30', type: '新用户', discountType: 'fixed', value: 30, used: 234, limit: null, expires: '2025-12-31', active: true },
  { id: '2', code: 'SAVE20', type: '通用', discountType: 'fixed', value: 20, used: 88, limit: 200, expires: '2025-06-30', active: true },
  { id: '3', code: 'FIXNEST10', type: '通用', discountType: 'fixed', value: 10, used: 12, limit: 100, expires: '2025-04-30', active: true },
  { id: '4', code: 'SPRING25', type: '季节', discountType: 'percent', value: 25, used: 45, limit: 50, expires: '2025-03-31', active: false },
]

export default function Coupons() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[['有效优惠券', '8', ''],['总使用次数', '342', ''],['累计优惠金额', '$6,840', 'text-red-500']].map(([l, v, c]) => (
          <div key={l} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-gray-500 text-sm mb-1">{l}</div>
            <div className={`font-bold text-2xl ${c || 'text-gray-800'}`}>{v}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-blue-700">
          + 创建优惠券
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['优惠码', '类型', '折扣', '使用量', '有效期', '状态', '操作'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COUPONS.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/40">
                <td className="px-4 py-4 font-mono font-bold text-blue-600">{c.code}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{c.type}</td>
                <td className="px-4 py-4 font-semibold text-green-600">
                  {c.discountType === 'fixed' ? `-$${c.value}` : `-${c.value}%`}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{c.used} / {c.limit ?? '不限'}</td>
                <td className="px-4 py-4 text-sm text-gray-500">{c.expires}</td>
                <td className="px-4 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.active ? '有效' : '失效'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-1.5">
                    <button className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-xs border-none cursor-pointer hover:bg-gray-100">编辑</button>
                    {c.active
                      ? <button className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs border-none cursor-pointer hover:bg-red-100">停用</button>
                      : <button className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs border-none cursor-pointer hover:bg-green-100">启用</button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="font-bold text-gray-800 text-lg">创建优惠券</div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 bg-transparent border-none cursor-pointer text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">优惠码 *</label>
                <input placeholder="例：SUMMER30" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 uppercase" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">类型</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500">
                  <option>新用户专属</option><option>通用</option><option>邀请奖励</option><option>季节活动</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">折扣类型</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option>固定金额 ($)</option><option>百分比 (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">折扣值 *</label>
                  <input type="number" placeholder="30" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">使用上限</label>
                  <input type="number" placeholder="空=不限" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">到期日</label>
                  <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">最低消费 ($)</label>
                <input type="number" placeholder="0 = 无门槛" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer">取消</button>
              <button onClick={() => { alert('✅ 优惠券已创建！'); setShowModal(false) }} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-blue-700">创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
