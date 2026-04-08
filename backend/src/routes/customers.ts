import { Router } from 'express'
import prisma from '../lib/prisma'
import { requireAdmin } from '../middleware/auth'

const router = Router()

const CUSTOMER_SELECT = {
  id: true, name: true, email: true, phone: true,
  wechat: true, address: true, notes: true,
  referralCode: true, credits: true, createdAt: true,
  _count: { select: { orders: true } }
}

// 管理员手动创建客户
router.post('/', requireAdmin, async (req, res) => {
  const { name, email, phone, wechat, address, notes } = req.body
  if (!name) return res.status(400).json({ error: '请填写客户姓名' })
  const autoEmail = email?.trim() || `cust-${Date.now()}@omnifix.internal`
  if (email?.trim()) {
    const exists = await prisma.user.findUnique({ where: { email: autoEmail } })
    if (exists) return res.status(400).json({ error: '该邮箱已注册' })
  }
  const referralCode = 'REF-' + Math.random().toString(36).slice(2, 7).toUpperCase()
  const user = await prisma.user.create({
    data: {
      name, email: autoEmail,
      phone: phone?.trim() || null,
      wechat: wechat?.trim() || null,
      address: address?.trim() || null,
      notes: notes?.trim() || null,
      password: 'no-login', referralCode, role: 'CUSTOMER'
    },
    select: CUSTOMER_SELECT
  })
  res.json(user)
})

// 管理员编辑客户
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, phone, wechat, address, notes } = req.body
  const data: any = {}
  if (name) data.name = name
  if (phone !== undefined) data.phone = phone?.trim() || null
  if (wechat !== undefined) data.wechat = wechat?.trim() || null
  if (address !== undefined) data.address = address?.trim() || null
  if (notes !== undefined) data.notes = notes?.trim() || null
  const user = await prisma.user.update({
    where: { id: String(req.params.id) },
    data,
    select: CUSTOMER_SELECT
  })
  res.json(user)
})

// 导出客户 CSV
router.get('/export/csv', requireAdmin, async (_req, res) => {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: { ...CUSTOMER_SELECT, orders: { select: { total: true } } },
    orderBy: { createdAt: 'desc' }
  })
  const headers = ['姓名','手机','微信','地址','订单数','累计消费','备注','注册时间']
  const rows = customers.map((c: any) => [
    c.name,
    c.phone || '',
    c.wechat || '',
    c.address || '',
    c._count?.orders ?? 0,
    (c.orders?.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0) || 0).toFixed(2),
    c.notes || '',
    new Date(c.createdAt).toLocaleDateString('zh-CN')
  ])
  const csv = [headers, ...rows]
    .map(r => r.map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`)
  res.send('\uFEFF' + csv)
})

router.get('/', requireAdmin, async (req, res) => {
  const { search, page = '1', limit = '50' } = req.query
  const where = search ? {
    role: 'CUSTOMER' as const,
    OR: [
      { name: { contains: String(search), mode: 'insensitive' as const } },
      { email: { contains: String(search), mode: 'insensitive' as const } },
      { phone: { contains: String(search), mode: 'insensitive' as const } },
    ]
  } : { role: 'CUSTOMER' as const }

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: CUSTOMER_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.user.count({ where })
  ])
  res.json({ customers, total })
})

export default router
