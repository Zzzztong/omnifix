import { useLocation, useNavigate } from 'react-router-dom'

export default function OrderSuccess() {
  const { state } = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center pb-10">
      <div className="text-8xl mb-6 animate-bounce">✅</div>
      <div className="font-bold text-gray-800 text-2xl mb-2">预约成功！</div>
      <div className="text-gray-500 text-sm mb-6 leading-relaxed">
        技师将准时上门服务。<br />我们已发送确认信息至您的手机。
      </div>
      {state && (
        <div className="bg-white rounded-2xl p-4 w-full shadow-sm mb-6">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between font-bold text-gray-800 mb-1">
              <span>{state.service}</span><span>${state.price}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>订单编号</span><span className="font-mono">#ORD-{Date.now().toString().slice(-5)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>预约日期</span><span>{state.date}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>预约时段</span><span>{state.time}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>状态</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">待确认</span>
            </div>
          </div>
        </div>
      )}
      <button onClick={() => navigate('/orders')}
              className="w-full text-white rounded-xl py-3.5 font-semibold border-none cursor-pointer mb-3"
              style={{ background: '#E85D04' }}>
        查看我的订单
      </button>
      <button onClick={() => navigate('/')}
              className="font-medium text-sm bg-transparent border-none cursor-pointer"
              style={{ color: '#E85D04' }}>
        返回首页
      </button>
    </div>
  )
}
