import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import serviceRoutes from './routes/services'
import orderRoutes from './routes/orders'
import techRoutes from './routes/technicians'
import couponRoutes from './routes/coupons'
import chatRoutes from './routes/chat'
import customerRoutes from './routes/customers'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from localhost on any port (for dev), and no-origin (curl/Postman)
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())

// 健康检查
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/technicians', techRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/customers', customerRoutes)

app.listen(PORT, () => {
  console.log(`\n🚀 FixNest API 已启动`)
  console.log(`📡 地址: http://localhost:${PORT}`)
  console.log(`📋 接口列表:`)
  console.log(`   POST /api/auth/register     注册`)
  console.log(`   POST /api/auth/login        登录`)
  console.log(`   GET  /api/services/categories  获取所有分类`)
  console.log(`   GET  /api/orders/my         我的订单`)
  console.log(`   POST /api/orders            创建订单`)
  console.log(`   GET  /api/orders            所有订单(管理员)`)
  console.log(`   GET  /api/orders/stats/dashboard  仪表盘统计`)
})
