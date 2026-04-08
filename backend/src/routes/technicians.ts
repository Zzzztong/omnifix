import { Router } from 'express'
import prisma from '../lib/prisma'
import { requireAdmin } from '../middleware/auth'

const router = Router()

router.get('/', requireAdmin, async (_req, res) => {
  const techs = await prisma.technician.findMany({ orderBy: { rating: 'desc' } })
  res.json(techs)
})

router.post('/', requireAdmin, async (req, res) => {
  const { name, email, phone, specialties, area } = req.body
  const tech = await prisma.technician.create({ data: { name, email, phone, specialties, area } })
  res.json(tech)
})

router.put('/:id', requireAdmin, async (req, res) => {
  const { name, phone, specialties, area, active } = req.body
  const tech = await prisma.technician.update({
    where: { id: String(req.params.id) },
    data: { name, phone, specialties, area, active }
  })
  res.json(tech)
})

router.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.technician.update({ where: { id: String(req.params.id) }, data: { active: false } })
  res.json({ success: true })
})

export default router
