import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const categories = [
  { id: 'plumbing', name: '水管维修', icon: '🔧', color: '#2563EB', group: 'urgent', desc: '漏水、管道疏通、热水器、马桶等', sortOrder: 1 },
  { id: 'electrical', name: '电气维修', icon: '⚡', color: '#D97706', group: 'urgent', desc: '插座、线路、灯具、电箱、充电桩等', sortOrder: 2 },
  { id: 'hvac', name: '暖通空调', icon: '❄️', color: '#0891B2', group: 'urgent', desc: '空调、暖气、通风、地暖等维修保养', sortOrder: 3 },
  { id: 'appliances', name: '家电维修', icon: '🏠', color: '#059669', group: 'repair', desc: '洗衣机、洗碗机、冰箱、烤箱等', sortOrder: 4 },
  { id: 'carpentry', name: '木工地板', icon: '🪵', color: '#92400E', group: 'repair', desc: '门窗、地板、石膏板、橱柜等', sortOrder: 5 },
  { id: 'handyman', name: '杂工服务', icon: '🔨', color: '#4F46E5', group: 'repair', desc: '家具组装、电视挂载、零散维修等', sortOrder: 6 },
  { id: 'painting', name: '油漆粉刷', icon: '🎨', color: '#DB2777', group: 'enhance', desc: '室内外粉刷、橱柜上色等', sortOrder: 7 },
  { id: 'landscaping', name: '庭院绿化', icon: '🌿', color: '#16A34A', group: 'enhance', desc: '割草、修剪、灌溉、施肥等', sortOrder: 8 },
  { id: 'cleaning', name: '清洁服务', icon: '🧹', color: '#0284C7', group: 'enhance', desc: '深度清洁、搬入/搬出清洁、高压冲洗等', sortOrder: 9 },
]

const services = [
  // 水管维修
  { id: 'p1', name: '水龙头漏水维修', price: 195, duration: '1-2小时', desc: '修复厨房或浴室滴水龙头，含零件和人工费。', popular: true, categoryId: 'plumbing' },
  { id: 'p2', name: '下水道疏通', price: 225, duration: '1-3小时', desc: '使用专业设备疏通洗手台、淋浴或浴缸堵塞管道。', categoryId: 'plumbing' },
  { id: 'p3', name: '马桶维修', price: 250, duration: '1-2小时', desc: '修复马桶持续流水、冲水无力或底部漏水问题。', popular: true, categoryId: 'plumbing' },
  { id: 'p4', name: '热水器维修', price: 450, duration: '2-4小时', desc: '诊断并修复热水器不加热、漏水或异响问题。', categoryId: 'plumbing' },
  { id: 'p5', name: '水管漏水修复', price: 400, duration: '2-5小时', desc: '定位并修复漏水管道，必要时包含小面积墙体修补。', categoryId: 'plumbing' },
  { id: 'p6', name: '垃圾处理器安装', price: 295, duration: '1-2小时', desc: '安装厨余垃圾处理器，设备可自备或由我们提供。', categoryId: 'plumbing' },
  // 电气维修
  { id: 'e1', name: '插座/开关维修', price: 150, duration: '1小时', desc: '维修或更换故障插座、开关或调光器，符合电气规范。', categoryId: 'electrical' },
  { id: 'e2', name: '灯具安装', price: 225, duration: '1-3小时', desc: '安装吸顶灯、吊灯或壁灯，包含接线。', popular: true, categoryId: 'electrical' },
  { id: 'e3', name: '吊扇安装', price: 275, duration: '2-4小时', desc: '安装吊扇，含或不含原有线路均可。', categoryId: 'electrical' },
  { id: 'e4', name: '断路器维修', price: 325, duration: '2-4小时', desc: '重置跳闸断路器、更换故障断路器或诊断线路问题。', categoryId: 'electrical' },
  { id: 'e5', name: '电动车充电桩安装', price: 1200, duration: '3-6小时', desc: '在车库安装二级电动车充电站，含申请许可证及验收。', popular: true, categoryId: 'electrical' },
  { id: 'e6', name: '电箱升级', price: 3200, duration: '6-10小时', desc: '将电箱从100A升级至200A，含全程许可及验收服务。', categoryId: 'electrical' },
  // 暖通空调
  { id: 'h1', name: '空调年度保养', price: 149, duration: '1-2小时', desc: '年度空调维护：更换滤网、清洗盘管、检查制冷剂。', popular: true, categoryId: 'hvac' },
  { id: 'h2', name: '空调故障维修', price: 495, duration: '2-4小时', desc: '诊断并修复空调不制冷、异响或漏水等问题。', categoryId: 'hvac' },
  { id: 'h3', name: '暖气炉维修', price: 375, duration: '2-3小时', desc: '修复暖气炉不加热、异味或点火问题。', categoryId: 'hvac' },
  { id: 'h4', name: '风管清洁', price: 499, duration: '3-5小时', desc: '清洁所有通风管道，改善室内空气质量和系统效率。', categoryId: 'hvac' },
  { id: 'h5', name: '智能温控器安装', price: 225, duration: '1-2小时', desc: '安装并配置智能温控器（Nest、Ecobee等）。', categoryId: 'hvac' },
  { id: 'h6', name: '壁挂式空调安装', price: 2200, duration: '4-8小时', desc: '安装无管道壁挂式冷暖空调系统，设备价格另计。', categoryId: 'hvac' },
  // 家电维修
  { id: 'a1', name: '洗衣机/烘干机维修', price: 249, duration: '1-3小时', desc: '修复不转动、不排水、噪音大或不加热等故障。', popular: true, categoryId: 'appliances' },
  { id: 'a2', name: '洗碗机维修', price: 225, duration: '1-2小时', desc: '修复不排水、清洗效果差、漏水或门锁问题。', categoryId: 'appliances' },
  { id: 'a3', name: '冰箱维修', price: 349, duration: '2-4小时', desc: '修复不制冷、制冰机故障、漏水或压缩机问题。', categoryId: 'appliances' },
  { id: 'a4', name: '烤箱/炉灶维修', price: 249, duration: '1-3小时', desc: '修复炉头、点火器、烤箱不加热或控制面板故障。', categoryId: 'appliances' },
  { id: 'a5', name: '微波炉维修', price: 175, duration: '1-2小时', desc: '修复不加热、打火花、转盘或控制面板问题。', categoryId: 'appliances' },
  // 木工地板
  { id: 'c1', name: '门修复/安装', price: 295, duration: '1-3小时', desc: '修复卡门、破损铰链或安装新室内门。', popular: true, categoryId: 'carpentry' },
  { id: 'c2', name: '石膏板修补', price: 325, duration: '2-4小时', desc: '修补墙面破洞、裂缝或水损区域，含纹理匹配。', categoryId: 'carpentry' },
  { id: 'c3', name: '地板修复', price: 400, duration: '2-5小时', desc: '修复吱呀地板、更换破损木板或修补瓷砖缝。', categoryId: 'carpentry' },
  { id: 'c4', name: '橱柜维修', price: 250, duration: '1-3小时', desc: '修复破损橱柜铰链、抽屉滑轨或柜门，含对齐调整。', categoryId: 'carpentry' },
  { id: 'c5', name: '木制平台维修', price: 450, duration: '3-6小时', desc: '更换腐烂木板、修复松动护栏或为现有平台上漆。', categoryId: 'carpentry' },
  // 杂工服务
  { id: 'm1', name: '电视挂壁安装', price: 149, duration: '1-2小时', desc: '挂载最大85英寸平板电视，含墙体锚固和线缆整理。', popular: true, categoryId: 'handyman' },
  { id: 'm2', name: '家具组装', price: 100, duration: '1-3小时', desc: '组装宜家或平板包装家具，按小时计费，最低1小时。', categoryId: 'handyman' },
  { id: 'm3', name: '搁板/镜子安装', price: 149, duration: '1小时', desc: '安装悬浮搁板、镜子或照片框，含石膏板锚固。', categoryId: 'handyman' },
  { id: 'm4', name: '门锁/智能锁安装', price: 185, duration: '1-2小时', desc: '安装或更换死锁、智能锁或门把手。', categoryId: 'handyman' },
  { id: 'm5', name: '填缝密封', price: 185, duration: '1-2小时', desc: '重新填缝浴缸、淋浴、窗户或门，使用防霉填缝剂。', categoryId: 'handyman' },
  { id: 'm6', name: '综合维修（按小时）', price: 125, duration: '每小时', desc: '各类零散维修，最低2小时，告诉我们您的需求！', categoryId: 'handyman' },
  // 油漆粉刷
  { id: 'pt1', name: '单间粉刷', price: 599, duration: '4-8小时', desc: '粉刷一个房间（最多200平方英尺），含底漆、两遍面漆及踢脚线。', popular: true, categoryId: 'painting' },
  { id: 'pt2', name: '外墙局部补漆', price: 450, duration: '3-5小时', desc: '修复脱落或褪色的外墙区域，提供颜色匹配服务。', categoryId: 'painting' },
  { id: 'pt3', name: '橱柜翻新上色', price: 1299, duration: '2天', desc: '重新粉刷厨房橱柜，焕然一新，含打磨和底漆。', categoryId: 'painting' },
  { id: 'pt4', name: '围栏刷漆/染色', price: 375, duration: '3-6小时', desc: '清洁、处理并为木制围栏刷漆或染色，最多50线性英尺。', categoryId: 'painting' },
  // 庭院绿化
  { id: 'l1', name: '草坪修剪', price: 90, duration: '1-2小时', desc: '修剪草坪、修整边界并吹走碎草，最大5000平方英尺。', popular: true, categoryId: 'landscaping' },
  { id: 'l2', name: '树木/灌木修剪', price: 249, duration: '2-4小时', desc: '修剪15英尺以内的树木和灌木，含清运碎枝。', categoryId: 'landscaping' },
  { id: 'l3', name: '灌溉系统维修', price: 249, duration: '1-3小时', desc: '修复破损喷头、阀门或控制器编程问题。', categoryId: 'landscaping' },
  { id: 'l4', name: '覆盖物铺设', price: 295, duration: '3-5小时', desc: '在花圃铺设2-3英寸覆盖物，最大200平方英尺。', categoryId: 'landscaping' },
  { id: 'l5', name: '杂草控制', price: 149, duration: '1-3小时', desc: '手动拔除杂草并对花圃施用芽前除草剂。', categoryId: 'landscaping' },
  // 清洁服务
  { id: 'cl1', name: '标准家居清洁', price: 225, duration: '3-4小时', desc: '全屋清洁：厨房、浴室、卧室、客厅，最大2000平方英尺。', popular: true, categoryId: 'cleaning' },
  { id: 'cl2', name: '深度清洁', price: 399, duration: '5-8小时', desc: '彻底深度清洁，含电器内部、踢脚线和窗户。', categoryId: 'cleaning' },
  { id: 'cl3', name: '搬入/搬出清洁', price: 450, duration: '6-10小时', desc: '空房全面清洁，适合需要取回押金的租客。', categoryId: 'cleaning' },
  { id: 'cl4', name: '高压水枪清洗', price: 299, duration: '2-4小时', desc: '高压冲洗车道、院子、木台或外墙，最大500平方英尺。', categoryId: 'cleaning' },
  { id: 'cl5', name: '窗户清洁', price: 249, duration: '2-4小时', desc: '清洁室内外窗户，最多15扇，无水迹光亮如新。', categoryId: 'cleaning' },
]

async function main() {
  console.log('开始写入种子数据...')

  // 管理员账号
  const adminPassword = await bcrypt.hash('admin123456', 10)
  await prisma.user.upsert({
    where: { email: 'admin@fixnest.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@fixnest.com',
      password: adminPassword,
      role: 'ADMIN',
      referralCode: 'ADMIN001',
    },
  })
  console.log('✅ 管理员账号创建完成')

  // 测试客户账号
  const customerPassword = await bcrypt.hash('test123456', 10)
  await prisma.user.upsert({
    where: { email: 'test@fixnest.com' },
    update: {},
    create: {
      name: '测试用户',
      email: 'test@fixnest.com',
      phone: '949-555-0001',
      password: customerPassword,
      role: 'CUSTOMER',
      referralCode: 'TEST001',
    },
  })
  console.log('✅ 测试客户账号创建完成')

  // 服务分类
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    })
  }
  console.log('✅ 9个服务分类写入完成')

  // 服务项目
  for (const svc of services) {
    await prisma.service.upsert({
      where: { id: svc.id },
      update: svc,
      create: svc,
    })
  }
  console.log(`✅ ${services.length}个服务项目写入完成`)

  // 优惠券
  const coupons = [
    { code: 'NEW30', type: 'NEW_USER' as const, discountType: 'fixed', value: 30, usageLimit: 1, minAmount: 100 },
    { code: 'SAVE20', type: 'GENERAL' as const, discountType: 'percentage', value: 20, usageLimit: 100, minAmount: 150 },
    { code: 'FIXNEST10', type: 'GENERAL' as const, discountType: 'percentage', value: 10, usageLimit: 500, minAmount: 0 },
  ]
  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    })
  }
  console.log('✅ 优惠券写入完成')

  // 技工
  const techs = [
    { id: 'tech1', name: '张伟', email: 'zhang@fixnest.com', phone: '949-555-1001', specialties: ['plumbing', 'handyman'], area: 'Irvine', rating: 4.9, jobCount: 127 },
    { id: 'tech2', name: '李明', email: 'li@fixnest.com', phone: '949-555-1002', specialties: ['electrical', 'hvac'], area: 'Irvine', rating: 4.8, jobCount: 98 },
    { id: 'tech3', name: '王芳', email: 'wang@fixnest.com', phone: '949-555-1003', specialties: ['cleaning', 'painting'], area: 'Irvine', rating: 5.0, jobCount: 203 },
  ]
  for (const t of techs) {
    await prisma.technician.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    })
  }
  console.log('✅ 技工数据写入完成')

  console.log('\n🎉 所有种子数据写入完成！')
  console.log('管理员账号: admin@fixnest.com / admin123456')
  console.log('测试客户:   test@fixnest.com / test123456')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
