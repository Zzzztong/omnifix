import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// 注册
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: '请填写完整信息' })
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(400).json({ error: '邮箱已注册' })
  const hashed = await bcrypt.hash(password, 10)
  const referralCode = 'FN-' + Math.random().toString(36).slice(2, 8).toUpperCase()
  const user = await prisma.user.create({
    data: { name, email, phone, password: hashed, referralCode }
  })
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '30d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, referralCode: user.referralCode } })
})

// 登录
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: '邮箱或密码错误' })
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '30d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, referralCode: user.referralCode } })
})

// 获取当前用户信息
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, phone: true, role: true, referralCode: true, credits: true, createdAt: true }
  })
  if (!user) return res.status(404).json({ error: '用户不存在' })
  res.json(user)
})

export default router
