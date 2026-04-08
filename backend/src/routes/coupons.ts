import { Router } from 'express'
import prisma from '../lib/prisma'
import { requireAdmin } from '../middleware/auth'

const router = Router()

router.get('/', requireAdmin, async (_req, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(coupons)
})

router.post('/', requireAdmin, async (req, res) => {
  const { code, type, discountType, value, usageLimit, minAmount, expiresAt } = req.body
  const coupon = await prisma.coupon.create({ data: { code: code.toUpperCase(), type, discountType, value, usageLimit, minAmount, expiresAt: expiresAt ? new Date(expiresAt) : null } })
  res.json(coupon)
})

router.put('/:id', requireAdmin, async (req, res) => {
  const { active, value, usageLimit, expiresAt } = req.body
  const coupon = await prisma.coupon.update({ where: { id: String(req.params.id) }, data: { active, value, usageLimit, expiresAt: expiresAt ? new Date(expiresAt) : undefined } })
  res.json(coupon)
})

// 客户端验证优惠码
router.post('/validate', async (req, res) => {
  const { code, amount } = req.body
  const coupon = await prisma.coupon.findFirst({ where: { code: code.toUpperCase(), active: true } })
  if (!coupon) return res.status(404).json({ error: '无效的优惠码' })
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ error: '优惠码已过期' })
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return res.status(400).json({ error: '优惠码已达使用上限' })
  if (amount < coupon.minAmount) return res.status(400).json({ error: `最低消费 $${coupon.minAmount} 可使用` })
  const discount = coupon.discountType === 'fixed' ? coupon.value : Math.round(amount * (coupon.value / 100) * 100) / 100
  res.json({ valid: true, discount, coupon: { code: coupon.code, discountType: coupon.discountType, value: coupon.value } })
})

export default router
