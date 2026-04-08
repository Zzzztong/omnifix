import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() + i + 1); return d
})
const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const TIMES = ['上午 8:00–10:00', '上午 10:00–12:00', '下午 12:00–2:00', '下午 2:00–4:00', '下午 4:00–6:00']

export default function Booking() {
  const { catId, serviceId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [cat, setCat] = useState<any>(null)
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState(DATES[0])
  const [selectedTime, setSelectedTime] = useState(TIMES[0])
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('Irvine')
  const [zip, setZip] = useState('')
  const [notes, setNotes] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.categories().then((cats: any[]) => {
      const found = cats.find(c => c.id === catId)
      setCat(found || null)
      setService(found?.services?.find((s: any) => s.id === serviceId) || null)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [catId, serviceId])

  // Pre-fill address from user profile
  useEffect(() => {
    if (user && (user as any).address) {
      const addr = (user as any).address
      setStreet(addr)
    }
  }, [user])

  if (loading) return <div className="p-8 text-center text-gray-400">加载中...</div>
  if (!cat || !service) return <div className="p-8 text-center text-gray-500">服务未找到</div>

  const tax = Math.round((service.price - discount) * 0.0875 * 100) / 100
  const total = (service.price - discount + tax).toFixed(2)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const res = await api.validateCoupon(couponCode.trim().toUpperCase(), service.price)
      setDiscount(res.discount)
      setCouponMsg({ text: `✅ 优惠码已应用，节省 $${res.discount}`, ok: true })
    } catch {
      setCouponMsg({ text: '❌ 无效的优惠码', ok: false })
    }
  }

  const handleConfirm = async () => {
    if (!street.trim()) return alert('请填写服务地址')
    setSubmitting(true)
    try {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`
      const address = `${street}, ${city}, CA ${zip}`.trim().replace(/,\s*,/g, ',')
      await api.createOrder({
        serviceId: service.id,
        date: dateStr,
        time: selectedTime,
        address,
        notes: notes || undefined,
        couponCode: couponCode.trim().toUpperCase() || undefined,
      })
      navigate('/order-success', {
        state: {
          service: service.name, cat: cat.name, price: service.price,
          date: `${selectedDate.getMonth()+1}月${selectedDate.getDate()}日`,
          time: selectedTime
        }
      })
    } catch (e: any) {
      alert(e.message || '预约失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const StepIndicator = ({ n, label }: { n: number; label: string }) => (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
        ${step === n ? 'text-white' : step > n ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
        style={step === n ? { background: '#E85D04' } : {}}>
        {step > n ? '✓' : n}
      </div>
      <span className={`text-xs font-medium ${step > n ? 'text-green-700' : 'text-gray-400'}`}
            style={step === n ? { color: '#E85D04' } : {}}>
        {label}
      </span>
    </div>
  )

  return (
    <div className="pb-6">
      {/* 头部 */}
      <div className="bg-white px-4 pt-12 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
                  className="text-gray-600 text-xl bg-transparent border-none cursor-pointer p-0 leading-none">←</button>
          <div className="font-bold text-gray-800 text-lg">预约服务</div>
        </div>
        <div className="flex items-center gap-2">
          <StepIndicator n={1} label="选时间" />
          <div className="flex-1 h-px bg-gray-200" />
          <StepIndicator n={2} label="填地址" />
          <div className="flex-1 h-px bg-gray-200" />
          <StepIndicator n={3} label="确认下单" />
        </div>
      </div>

      {/* 服务摘要 */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
               style={{ background: (cat.color || '#E85D04') + '18' }}>{cat.icon}</div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800 text-sm">{service.name}</div>
            <div className="text-gray-500 text-xs">{cat.name}{service.duration && service.duration !== '按项目' ? ` · ⏱ ${service.duration}` : ''}</div>
          </div>
          <div className="font-bold text-gray-800">${service.price}</div>
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* 步骤 1：选择日期时间 */}
        {step === 1 && (
          <div>
            <div className="font-semibold text-gray-800 mb-3">选择日期</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {DATES.map((d, i) => (
                <button key={i} onClick={() => setSelectedDate(d)}
                        className={`flex flex-col items-center p-3 rounded-2xl border-2 flex-shrink-0 cursor-pointer min-w-[64px] transition-colors
                          ${selectedDate.toDateString() === d.toDateString()
                            ? 'text-white border-transparent'
                            : 'border-gray-100 bg-white text-gray-700'}`}
                        style={selectedDate.toDateString() === d.toDateString() ? { background: '#E85D04', borderColor: '#E85D04' } : {}}>
                  <span className="text-xs font-medium">{DAY_NAMES[d.getDay()]}</span>
                  <span className="text-lg font-bold">{d.getDate()}</span>
                  <span className="text-xs">{MONTH_NAMES[d.getMonth()]}</span>
                </button>
              ))}
            </div>
            <div className="font-semibold text-gray-800 mt-4 mb-3">选择时段</div>
            <div className="grid grid-cols-2 gap-2">
              {TIMES.map(t => (
                <button key={t} onClick={() => setSelectedTime(t)}
                        className={`p-3 text-center rounded-xl border-2 text-sm font-medium cursor-pointer transition-colors
                          ${selectedTime === t ? 'text-white border-transparent' : 'border-gray-100 bg-white text-gray-700'}`}
                        style={selectedTime === t ? { background: '#E85D04', borderColor: '#E85D04' } : {}}>
                  {t}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)}
                    className="w-full text-white rounded-xl py-3.5 font-semibold text-base mt-6 border-none cursor-pointer"
                    style={{ background: '#E85D04' }}>
              下一步 →
            </button>
          </div>
        )}

        {/* 步骤 2：填写地址 */}
        {step === 2 && (
          <div>
            <div className="font-semibold text-gray-800 mb-3">服务地址</div>
            <div className="flex flex-col gap-3">
              <input value={street} onChange={e => setStreet(e.target.value)}
                     placeholder="街道地址，例：100 Spectrum Center Dr"
                     className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400" />
              <div className="flex gap-2">
                <input value={city} onChange={e => setCity(e.target.value)}
                       placeholder="城市"
                       className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400" />
                <input value={zip} onChange={e => setZip(e.target.value)}
                       placeholder="邮编" className="w-24 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400" />
              </div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="特殊说明（可选）：如停车位置、进门方式等" rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-orange-400" />
            </div>
            <button onClick={() => { if (!street.trim()) return alert('请填写街道地址'); setStep(3) }}
                    className="w-full text-white rounded-xl py-3.5 font-semibold text-base mt-6 border-none cursor-pointer"
                    style={{ background: '#E85D04' }}>
              下一步 →
            </button>
          </div>
        )}

        {/* 步骤 3：确认下单 */}
        {step === 3 && (
          <div>
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="font-semibold text-gray-800 mb-3">订单摘要</div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">服务项目</span><span className="font-medium">{service.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">预约日期</span><span className="font-medium">{selectedDate.getMonth()+1}月{selectedDate.getDate()}日</span></div>
                <div className="flex justify-between"><span className="text-gray-500">预约时段</span><span className="font-medium">{selectedTime}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">服务地址</span><span className="font-medium text-right max-w-[200px]">{street}, {city}, CA {zip}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="font-semibold text-gray-800 mb-2">优惠码</div>
              <div className="flex gap-2">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value)}
                       placeholder="输入优惠码（如 NEW30）"
                       className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-orange-400" />
                <button onClick={applyCoupon}
                        className="text-white rounded-xl px-4 py-2 text-sm font-medium border-none cursor-pointer"
                        style={{ background: '#E85D04' }}>
                  使用
                </button>
              </div>
              {couponMsg && (
                <div className={`text-sm mt-2 ${couponMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
                  {couponMsg.text}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">服务费用</span><span>${service.price}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>优惠券折扣</span><span>-${discount}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">税费 (8.75%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
                  <span>合计</span><span className="text-lg">${total}</span>
                </div>
              </div>
            </div>

            <button onClick={handleConfirm} disabled={submitting}
                    className="w-full text-white rounded-xl py-3.5 font-bold text-base border-none cursor-pointer"
                    style={{ background: '#E85D04', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? '提交中...' : '✅ 确认预约'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
