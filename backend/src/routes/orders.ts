import { Router } from 'express'
import prisma from '../lib/prisma'
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth'

const router = Router()

// 客户创建订单
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { serviceId, date, time, address, notes, couponCode, paymentMethod } = req.body
  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service) return res.status(404).json({ error: '服务不存在' })

  let discount = 0
  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({ where: { code: couponCode, active: true } })
    if (coupon) {
      discount = coupon.discountType === 'fixed' ? coupon.value : service.price * (coupon.value / 100)
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } })
    }
  }
  const tax = Math.round((service.price - discount) * 0.0875 * 100) / 100
  const total = service.price - discount + tax

  const order = await prisma.order.create({
    data: {
      userId: req.userId!,
      serviceId,
      date,
      time,
      address,
      notes,
      price: service.price,
      discount,
      tax,
      total,
      couponCode,
      paymentMethod
    },
    include: { service: { include: { category: true } }, user: { select: { name: true, email: true, phone: true } } }
  })
  res.json(order)
})

// 管理员手动创建订单（代录入）
router.post('/admin', requireAdmin, async (req, res) => {
  const { userId, serviceId, techId, date, time, address, notes, status, discount = 0, customPrice, source } = req.body
  if (!userId || !serviceId || !date || !time || !address)
    return res.status(400).json({ error: '请填写客户、服务、日期、时间和地址' })
  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service) return res.status(404).json({ error: '服务不存在' })
  const basePrice = customPrice != null ? Number(customPrice) : service.price
  const tax = Math.round((basePrice - Number(discount)) * 0.0875 * 100) / 100
  const total = basePrice - Number(discount) + tax
  const order = await prisma.order.create({
    data: {
      userId, serviceId, techId: techId || null,
      date, time, address, notes: notes || null,
      price: basePrice, discount: Number(discount), tax, total,
      status: status || 'PENDING', paymentMethod: 'manual',
      source: source || null
    },
    include: {
      service: { include: { category: true } },
      user: { select: { name: true, email: true, phone: true } },
      technician: true
    }
  })
  if (techId) {
    await prisma.technician.update({ where: { id: techId }, data: { jobCount: { increment: 1 } } })
  }
  res.json(order)
})

// 客户查看自己的订单
router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: { service: { include: { category: true } }, technician: true, review: true },
    orderBy: { createdAt: 'desc' }
  })
  res.json(orders)
})

// 管理员获取所有订单
router.get('/', requireAdmin, async (req, res) => {
  const { status, page = '1', limit = '20' } = req.query
  const where = status ? { status: status as any } : {}
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        service: { include: { category: true } },
        user: { select: { name: true, email: true, phone: true } },
        technician: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    }),
    prisma.order.count({ where })
  ])
  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
})

// 管理员更新订单（状态 / 外派技师 / 编辑字段）
router.put('/:id', requireAdmin, async (req, res) => {
  const { status, techId, date, time, address, notes, source } = req.body
  const data: any = {}
  if (status) data.status = status
  if (techId !== undefined) data.techId = techId || null
  if (date) data.date = date
  if (time) data.time = time
  if (address) data.address = address
  if (notes !== undefined) data.notes = notes || null
  if (source !== undefined) data.source = source || null
  const order = await prisma.order.update({
    where: { id: String(req.params.id) },
    data,
    include: {
      service: { include: { category: true } },
      user: { select: { name: true, email: true, phone: true } },
      technician: true
    }
  })
  if (techId) {
    await prisma.technician.update({ where: { id: techId }, data: { jobCount: { increment: 1 } } }).catch(() => {})
  }
  res.json(order)
})

// 导出订单 CSV（管理员）
router.get('/export/csv', requireAdmin, async (req, res) => {
  const { status } = req.query
  const where = status ? { status: status as any } : {}
  const orders = await prisma.order.findMany({
    where,
    include: {
      service: { include: { category: true } },
      user: { select: { name: true, phone: true, email: true, wechat: true } },
      technician: true
    },
    orderBy: { createdAt: 'desc' }
  })
  const STATUS_LABEL: Record<string, string> = {
    PENDING: '待确认', CONFIRMED: '已确认', IN_PROGRESS: '服务中', COMPLETED: '已完成', CANCELLED: '已取消'
  }
  const headers = ['订单号','服务类别','服务项目','客户','手机','微信','技师','预约日期','时间段','地址','服务价','税','总额','状态','来源','备注','创建时间']
  const rows = orders.map(o => [
    o.id.slice(-8).toUpperCase(),
    o.service?.category?.name || '',
    o.service?.name || '',
    o.user?.name || '',
    o.user?.phone || '',
    o.user?.wechat || '',
    o.technician?.name || '',
    o.date,
    o.time,
    o.address,
    o.price,
    o.tax,
    o.total,
    STATUS_LABEL[o.status] || o.status,
    o.source || '',
    o.notes || '',
    new Date(o.createdAt).toLocaleDateString('zh-CN')
  ])
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`)
  res.send('\uFEFF' + csv)
})

// 管理员仪表盘统计
router.get('/stats/dashboard', requireAdmin, async (_req, res) => {
  const [totalOrders, totalRevenue, totalCustomers, totalTechnicians, recentOrders, ordersByStatus] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.technician.count({ where: { active: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { service: true, user: { select: { name: true } } }
    }),
    prisma.order.groupBy({ by: ['status'], _count: true })
  ])
  res.json({ totalOrders, totalRevenue: totalRevenue._sum.total || 0, totalCustomers, totalTechnicians, recentOrders, ordersByStatus })
})

export default router
