import { Router } from 'express'
import prisma from '../lib/prisma'
import { requireAdmin } from '../middleware/auth'

const router = Router()

// 获取所有分类（含服务项目）
router.get('/categories', async (_req, res) => {
  const cats = await prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
    include: { services: { where: { active: true }, orderBy: { id: 'asc' } } }
  })
  res.json(cats)
})

// 获取单个分类
router.get('/categories/:id', async (req, res) => {
  const cat = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { services: { where: { active: true } } }
  })
  if (!cat) return res.status(404).json({ error: '分类不存在' })
  res.json(cat)
})

// 获取所有服务项目（管理员）
router.get('/', requireAdmin, async (_req, res) => {
  const services = await prisma.service.findMany({
    include: { category: true },
    orderBy: { categoryId: 'asc' }
  })
  res.json(services)
})

// 新增服务项目（管理员）
router.post('/', requireAdmin, async (req, res) => {
  const { id, name, price, duration, desc, popular, categoryId } = req.body
  const service = await prisma.service.create({ data: { id, name, price, duration, desc, popular, categoryId } })
  res.json(service)
})

// 修改服务项目（管理员）
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, price, duration, desc, popular, active } = req.body
  const service = await prisma.service.update({
    where: { id: String(req.params.id) },
    data: { name, price, duration, desc, popular, active }
  })
  res.json(service)
})

// 删除服务项目（管理员）
router.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.service.update({ where: { id: String(req.params.id) }, data: { active: false } })
  res.json({ success: true })
})

// 新增分类（管理员）
router.post('/categories', requireAdmin, async (req, res) => {
  const { id, name, icon, color, desc, group, sortOrder } = req.body
  const cat = await prisma.category.create({ data: { id, name, icon, color, desc, group, sortOrder } })
  res.json(cat)
})

// 修改分类（管理员）
router.put('/categories/:id', requireAdmin, async (req, res) => {
  const { name, icon, color, desc, active, sortOrder } = req.body
  const cat = await prisma.category.update({
    where: { id: String(req.params.id) },
    data: { name, icon, color, desc, active, sortOrder }
  })
  res.json(cat)
})

export default router
