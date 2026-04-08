/**
 * import-excel.ts
 *
 * Seed / import script generated from Excel exports:
 *   - 服务分类&定价明细.xlsx  (sheet: 服务子类总表)
 *   - 客户&历史订单.xlsx      (sheets: 客户表, 师傅-服务商表, 工单-项目历史表)
 *
 * NOTE: All customer passwords are set to a placeholder hash.
 *       Customers MUST reset their password on first login.
 *
 * Run:
 *   npx ts-node prisma/import-excel.ts
 *
 * Prerequisites:
 *   npm install bcryptjs @types/bcryptjs
 */

import { PrismaClient, Role, OrderStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function hashPlaceholder(): Promise<string> {
  return bcrypt.hash('imported2025', 10)
}

function toFloat(val: string | number | null | undefined): number {
  if (val === null || val === undefined) return 0
  if (typeof val === 'number') return val
  const s = String(val).replace(/[$,\s]/g, '')
  const n = parseFloat(s)
  return isNaN(n) ? 0 : n
}

// ---------------------------------------------------------------------------
// Data extracted from 服务子类总表
// (code, name_zh, name_en, pricing_method, base_price, typical_range,
//  callout_fee, per_unit, parts_ref, needs_license, active, notes)
// ---------------------------------------------------------------------------

interface ServiceRow {
  id: string
  name: string
  nameEn: string
  price: number
  duration: string
  desc: string
  popular: boolean
  active: boolean
  categoryId: string
}

const SERVICES: ServiceRow[] = [
  // ── P · 水管 / 管道 ──────────────────────────────────────────────────────
  {
    id: 'p01',
    name: '漏水维修',
    nameEn: 'Leak & pipe repair',
    price: 95,
    duration: '按项目',
    desc: '漏水维修 (Leak & pipe repair). 典型区间: $95 – $280. 实际费用含管件配件，上门后确认',
    popular: true,
    active: true,
    categoryId: 'plumbing',
  },
  {
    id: 'p02',
    name: '下水道堵塞',
    nameEn: 'Drain & clog clearing',
    price: 85,
    duration: '按项目',
    desc: '下水道堵塞 (Drain & clog clearing). 典型区间: $85 – $220. 一般无需配件；主下水道堵塞需加收',
    popular: true,
    active: true,
    categoryId: 'plumbing',
  },
  {
    id: 'p03',
    name: '热水器',
    nameEn: 'Water heater service',
    price: 120,
    duration: '按项目',
    desc: '热水器 (Water heater service). 典型区间: $120 – $500. 新装热水器配件另计，区间较大',
    popular: true,
    active: true,
    categoryId: 'plumbing',
  },
  {
    id: 'p04',
    name: '水龙头 / 花洒',
    nameEn: 'Faucet & shower repair',
    price: 75,
    duration: '按项目',
    desc: '水龙头 / 花洒 (Faucet & shower repair). 典型区间: $75 – $200. 支持客户自购龙头，安装费另计',
    popular: true,
    active: true,
    categoryId: 'plumbing',
  },
  {
    id: 'p05',
    name: '马桶 / 洗手盆',
    nameEn: 'Toilet & sink service',
    price: 90,
    duration: '按项目',
    desc: '马桶 / 洗手盆 (Toilet & sink service). 典型区间: $90 – $280. 更换坐便器需客户自购或另行报价',
    popular: true,
    active: true,
    categoryId: 'plumbing',
  },
  {
    id: 'p06',
    name: '一体智能马桶',
    nameEn: 'Integrated Smart Toilet service',
    price: 150,
    duration: '按项目',
    desc: '一体智能马桶 (Integrated Smart Toilet service). 典型区间: $150 – $400. 更换坐便器需客户自购或另行报价',
    popular: false,
    active: true,
    categoryId: 'plumbing',
  },
  // ── E · 电气 / 灯具 ──────────────────────────────────────────────────────
  {
    id: 'e01',
    name: '灯具安装 / 更换',
    nameEn: 'Light fixture install',
    price: 80,
    duration: '按数量 ($50/件)',
    desc: '灯具安装 / 更换 (Light fixture install). 典型区间: $80 – $200. 客户自购灯具；每增加1盏加$50',
    popular: true,
    active: true,
    categoryId: 'electrical',
  },
  {
    id: 'e02',
    name: '插座 / 开关',
    nameEn: 'Outlet & switch',
    price: 75,
    duration: '按数量 ($45/个)',
    desc: '插座 / 开关 (Outlet & switch). 典型区间: $75 – $200. 面板、插座配件实报',
    popular: true,
    active: true,
    categoryId: 'electrical',
  },
  {
    id: 'e03',
    name: '跳闸 / 断电排查',
    nameEn: 'Breaker & outage',
    price: 95,
    duration: '按小时 ($95/hr)',
    desc: '跳闸 / 断电排查 (Breaker & outage). 典型区间: $95 – $250. 排查时间不定，按小时计，最少1小时',
    popular: true,
    active: true,
    categoryId: 'electrical',
  },
  {
    id: 'e04',
    name: '风扇 / 排气扇',
    nameEn: 'Fan installation',
    price: 85,
    duration: '按数量 ($55/台)',
    desc: '风扇 / 排气扇 (Fan installation). 典型区间: $85 – $200. 支持客户自购风扇',
    popular: true,
    active: true,
    categoryId: 'electrical',
  },
  {
    id: 'e05',
    name: '充电桩安装',
    nameEn: 'EV charger install',
    price: 350,
    duration: '按项目',
    desc: '充电桩安装 (EV charger install). 典型区间: $350 – $850. 需CSLB C-10执照；含线管走线，不含充电桩本身',
    popular: false,
    active: true,
    categoryId: 'electrical',
  },
  {
    id: 'e06',
    name: '电路改造 / 面板升级',
    nameEn: 'Panel & rewiring',
    price: 400,
    duration: '按小时 ($120/hr)',
    desc: '电路改造 / 面板升级 (Panel & rewiring). 典型区间: $400 – $1,200. 需CSLB C-10执照；材料费上门后单独报价',
    popular: false,
    active: true,
    categoryId: 'electrical',
  },
  // ── H · 冷暖空调 / HVAC ───────────────────────────────────────────────────
  {
    id: 'h01',
    name: '空调年度点检',
    nameEn: 'AC Tune-up',
    price: 85,
    duration: '按台 ($60/额外台)',
    desc: '空调年度点检 (AC Tune-up). 典型区间: $85 – $150. 含冷凝盘清洗、压力检测及滤网检查',
    popular: true,
    active: true,
    categoryId: 'hvac',
  },
  {
    id: 'h02',
    name: '冷媒充填 (R410A)',
    nameEn: 'Refrigerant refill',
    price: 120,
    duration: '按磅 ($80 – $120/lb)',
    desc: '冷媒充填 (R410A) (Refrigerant refill). 典型区间: $280 – $650. 价格含基础测漏，如需精确定位另计',
    popular: false,
    active: true,
    categoryId: 'hvac',
  },
  {
    id: 'h03',
    name: '电容更换',
    nameEn: 'Capacitor replacement',
    price: 150,
    duration: '按项目',
    desc: '电容更换 (Capacitor replacement). 典型区间: $180 – $350. 最常见的"不制冷"故障原因',
    popular: true,
    active: true,
    categoryId: 'hvac',
  },
  {
    id: 'h04',
    name: '风扇电机维修',
    nameEn: 'Condenser fan motor',
    price: 180,
    duration: '按项目',
    desc: '风扇电机维修 (Condenser fan motor). 典型区间: $350 – $750. 视电机型号及品牌(OEM/通用)定',
    popular: false,
    active: true,
    categoryId: 'hvac',
  },
  {
    id: 'h05',
    name: '排水管疏通',
    nameEn: 'Drain line cleaning',
    price: 120,
    duration: '按项目',
    desc: '排水管疏通 (Drain line cleaning). 典型区间: $120 – $280. 解决室内机漏水/天花板渗水问题',
    popular: true,
    active: true,
    categoryId: 'hvac',
  },
  {
    id: 'h06',
    name: '恒温器安装/调试',
    nameEn: 'Thermostat install',
    price: 95,
    duration: '按项目',
    desc: '恒温器安装/调试 (Thermostat install). 典型区间: $95 – $450. 常用 Nest / Ecobee 智能系统升级',
    popular: true,
    active: true,
    categoryId: 'hvac',
  },
  {
    id: 'h07',
    name: '全机更换报价',
    nameEn: 'Full system estimate',
    price: 0,
    duration: '免费',
    desc: '全机更换报价 (Full system estimate). 典型区间: $6000 – $15000. 需现场测量，提供多品牌对比方案',
    popular: false,
    active: true,
    categoryId: 'hvac',
  },
  // ── C · 木工 / 装修 ───────────────────────────────────────────────────────
  {
    id: 'c01',
    name: '门窗维修',
    nameEn: 'Door & window repair',
    price: 80,
    duration: '按项目',
    desc: '门窗维修 (Door & window repair). 典型区间: $80 – $220. 锁具、合页配件实报',
    popular: true,
    active: true,
    categoryId: 'carpentry',
  },
  {
    id: 'c02',
    name: '锁具安装',
    nameEn: 'Lock assembly',
    price: 65,
    duration: '按数量 ($45/件)',
    desc: '锁具安装 (Lock assembly). 典型区间: $65 – $180. Smart Lock 安装$100',
    popular: true,
    active: true,
    categoryId: 'carpentry',
  },
  {
    id: 'c03',
    name: '家具组装',
    nameEn: 'Furniture assembly',
    price: 65,
    duration: '按数量 ($45/件)',
    desc: '家具组装 (Furniture assembly). 典型区间: $65 – $180. IKEA等平板家具；每增加1件加$45',
    popular: true,
    active: true,
    categoryId: 'carpentry',
  },
  {
    id: 'c04',
    name: '墙面修补',
    nameEn: 'Drywall & patching',
    price: 90,
    duration: '按面积 ($2/sq ft)',
    desc: '墙面修补 (Drywall & patching). 典型区间: $90 – $300. 10 sq ft以下按项目$90起；超出按面积加收',
    popular: true,
    active: true,
    categoryId: 'carpentry',
  },
  {
    id: 'c05',
    name: '地板',
    nameEn: 'Flooring',
    price: 800,
    duration: '按面积 ($3/sq ft)',
    desc: '地板 (Flooring). 典型区间: $800 – $3500. 300 sq ft以下$800起，按项目客户自购地板',
    popular: false,
    active: true,
    categoryId: 'carpentry',
  },
  {
    id: 'c06',
    name: '橱柜/台面',
    nameEn: 'Cabinet Countertop',
    price: 400,
    duration: '按数量 ($150/件)',
    desc: '橱柜/台面 (Cabinet Countertop). 典型区间: $400 – $5000. 上门测量/设计出图再报价，客户自购或另行采购',
    popular: false,
    active: true,
    categoryId: 'carpentry',
  },
  {
    id: 'c07',
    name: '室内刷漆',
    nameEn: 'Interior painting',
    price: 150,
    duration: '按面积 ($2.5/sq ft)',
    desc: '室内刷漆 (Interior painting). 典型区间: $150 – $6000. 含一遍底漆一遍面漆；油漆材料另计',
    popular: false,
    active: true,
    categoryId: 'carpentry',
  },
  // ── A · 家电维修 ──────────────────────────────────────────────────────────
  {
    id: 'a01',
    name: '洗衣机 / 烘干机',
    nameEn: 'Washer & dryer repair',
    price: 110,
    duration: '按项目',
    desc: '洗衣机 / 烘干机 (Washer & dryer repair). 典型区间: $110 – $320. 配件实报；超$200零件建议客户考虑换新',
    popular: true,
    active: true,
    categoryId: 'appliances',
  },
  {
    id: 'a02',
    name: '冰箱维修',
    nameEn: 'Refrigerator repair',
    price: 120,
    duration: '按项目',
    desc: '冰箱维修 (Refrigerator repair). 典型区间: $120 – $400. 冷媒加注等需另外报价',
    popular: true,
    active: true,
    categoryId: 'appliances',
  },
  {
    id: 'a03',
    name: '烤箱/微波炉',
    nameEn: 'Oven & Microwave',
    price: 120,
    duration: '按项目',
    desc: '烤箱/微波炉 (Oven & Microwave). 典型区间: $100 – $300. 配件实报',
    popular: true,
    active: true,
    categoryId: 'appliances',
  },
  {
    id: 'a04',
    name: '灶具/油烟机',
    nameEn: 'Stove & Range Hood',
    price: 120,
    duration: '按项目',
    desc: '灶具/油烟机 (Stove & Range Hood). 典型区间: $100 – $280. 配件实报',
    popular: true,
    active: true,
    categoryId: 'appliances',
  },
  {
    id: 'a05',
    name: '洗碗机',
    nameEn: 'Dishwasher',
    price: 100,
    duration: '按项目',
    desc: '洗碗机 (Dishwasher). 典型区间: $100 – $260. 配件实报',
    popular: true,
    active: true,
    categoryId: 'appliances',
  },
  {
    id: 'a06',
    name: '电视机',
    nameEn: 'TV',
    price: 100,
    duration: '按项目',
    desc: '电视机 (TV). 典型区间: $100 – $280. 配件实报',
    popular: false,
    active: true,
    categoryId: 'appliances',
  },
  // ── W · 净水与软水 ────────────────────────────────────────────────────────
  {
    id: 'w01',
    name: 'RO逆渗透滤芯更换',
    nameEn: 'RO Filter change',
    price: 95,
    duration: '按项目',
    desc: 'RO逆渗透滤芯更换 (RO Filter change). 典型区间: $150 – $350. 含水质 TDS 测试及压力桶检查',
    popular: true,
    active: true,
    categoryId: 'plumbing',
  },
  {
    id: 'w02',
    name: '软水机安装 (换新)',
    nameEn: 'Softener install',
    price: 350,
    duration: '按项目',
    desc: '软水机安装 (换新) (Softener install). 典型区间: $850 – $2200. 视品牌(Costco/Culligan等)定',
    popular: false,
    active: true,
    categoryId: 'plumbing',
  },
  {
    id: 'w03',
    name: '软水机清洁与加盐',
    nameEn: 'Softener tune-up',
    price: 85,
    duration: '按项目',
    desc: '软水机清洁与加盐 (Softener tune-up). 典型区间: $120 – $180. 含盐箱清洗、控制头手动再生',
    popular: true,
    active: true,
    categoryId: 'plumbing',
  },
  {
    id: 'w04',
    name: '全屋净水系统安装',
    nameEn: 'Whole house carbon',
    price: 450,
    duration: '按项目',
    desc: '全屋净水系统安装 (Whole house carbon). 典型区间: $1200 – $3500. 针对除氯、异味，需现场勘测',
    popular: false,
    active: true,
    categoryId: 'plumbing',
  },
  {
    id: 'w05',
    name: '净水/软水漏水维修',
    nameEn: 'System leak repair',
    price: 120,
    duration: '按项目',
    desc: '净水/软水漏水维修 (System leak repair). 典型区间: $150 – $450. 针对接头、阀门或旁通阀漏水',
    popular: false,
    active: true,
    categoryId: 'plumbing',
  },
  {
    id: 'w06',
    name: '软水机控制头维修',
    nameEn: 'Control valve repair',
    price: 150,
    duration: '按项目',
    desc: '软水机控制头维修 (Control valve repair). 典型区间: $250 – $650. 解决电机不转、不吸盐等故障',
    popular: false,
    active: true,
    categoryId: 'plumbing',
  },
  // ── G · 车库门 ────────────────────────────────────────────────────────────
  {
    id: 'g01',
    name: '弹簧更换',
    nameEn: 'Spring replacement',
    price: 150,
    duration: '按项目',
    desc: '弹簧更换 (Spring replacement). 典型区间: $280 – $550. 含单/双弹簧调试，建议成对更换',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'g02',
    name: '开门机维修/安装',
    nameEn: 'Opener repair & install',
    price: 120,
    duration: '按项目',
    desc: '开门机维修/安装 (Opener repair & install). 典型区间: $120 – $650. 视驱动类型(皮带/链条)，安装费另计',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'g03',
    name: '钢丝绳/滑轮维修',
    nameEn: 'Cable & pulley repair',
    price: 95,
    duration: '按项目',
    desc: '钢丝绳/滑轮维修 (Cable & pulley repair). 典型区间: $150 – $300. 含轨道对齐检查，防止门体倾斜',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'g04',
    name: '传感器/遥控器调试',
    nameEn: 'Sensor & remote sync',
    price: 85,
    duration: '按项目',
    desc: '传感器/遥控器调试 (Sensor & remote sync). 典型区间: $85 – $220. 含安全光电眼对齐，配件视品牌定',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'g05',
    name: '车库门综合保养',
    nameEn: 'Tune-up & lubrication',
    price: 95,
    duration: '按项目',
    desc: '车库门综合保养 (Tune-up & lubrication). 典型区间: $95 – $150. 全门润滑、紧固螺丝、平衡测试',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
  // ── L · 园林与户外 ────────────────────────────────────────────────────────
  {
    id: 'l01',
    name: '灌溉喷头更换',
    nameEn: 'Sprinkler head repair',
    price: 85,
    duration: '按项目 ($25/个)',
    desc: '灌溉喷头更换 (Sprinkler head repair). 典型区间: $120 – $350. 含水压调节与喷洒角度对齐',
    popular: true,
    active: true,
    categoryId: 'landscaping',
  },
  {
    id: 'l02',
    name: '灌溉控制器调试',
    nameEn: 'Irrigation controller',
    price: 95,
    duration: '按项目',
    desc: '灌溉控制器调试 (Irrigation controller). 典型区间: $95 – $450. 推荐升级智能系统 (Rachio等)',
    popular: true,
    active: true,
    categoryId: 'landscaping',
  },
  {
    id: 'l03',
    name: '景观灯光维修',
    nameEn: 'Landscape light repair',
    price: 120,
    duration: '按项目 ($45/灯)',
    desc: '景观灯光维修 (Landscape light repair). 典型区间: $150 – $600. 含低压变压器与线缆排查',
    popular: false,
    active: true,
    categoryId: 'landscaping',
  },
  {
    id: 'l04',
    name: '喷泉泵维护/更换',
    nameEn: 'Fountain pump service',
    price: 150,
    duration: '按项目',
    desc: '喷泉泵维护/更换 (Fountain pump service). 典型区间: $150 – $850. 视泵功率与安装深度而定',
    popular: false,
    active: true,
    categoryId: 'landscaping',
  },
  {
    id: 'l05',
    name: '泳池泵/过滤器维修',
    nameEn: 'Pool pump & filter',
    price: 180,
    duration: '按项目',
    desc: '泳池泵/过滤器维修 (Pool pump & filter). 典型区间: $250 – $1200. 滤芯清洗或变频泵更换升级',
    popular: false,
    active: true,
    categoryId: 'landscaping',
  },
  {
    id: 'l06',
    name: '管道漏水探测',
    nameEn: 'Irrigation leak detect',
    price: 150,
    duration: '按小时',
    desc: '管道漏水探测 (Irrigation leak detect). 典型区间: $150 – $500. 针对后院不明积水点进行探查',
    popular: false,
    active: true,
    categoryId: 'landscaping',
  },
  // ── X · 居家杂活 ──────────────────────────────────────────────────────────
  {
    id: 'x01',
    name: '电视挂架',
    nameEn: 'TV wall mount',
    price: 65,
    duration: '按项目',
    desc: '电视挂架 (TV wall mount). 典型区间: $65 – $150. 含走线隐藏；支架客户自购',
    popular: true,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'x02',
    name: '深度保洁',
    nameEn: 'Deep cleaning',
    price: 120,
    duration: '按面积 ($0.8/sq ft)',
    desc: '深度保洁 (Deep cleaning). 典型区间: $120 – $350. 按房屋面积；清洁用品含在报价内',
    popular: true,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'x03',
    name: '搬家协助',
    nameEn: 'Moving assistance',
    price: 80,
    duration: '按小时 ($80/hr)',
    desc: '搬家协助 (Moving assistance). 典型区间: $80 – $240. 2人团队，最少2小时；不含长途运输',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'x04',
    name: '打孔 / 挂画',
    nameEn: 'Hanging & mounting',
    price: 55,
    duration: '按数量 ($20/处)',
    desc: '打孔 / 挂画 (Hanging & mounting). 典型区间: $55 – $130. 每增加一处挂点加$20；膨胀螺栓等耗材含在内',
    popular: true,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'x05',
    name: '其他杂活',
    nameEn: 'Other handyman',
    price: 60,
    duration: '按小时 ($75/hr)',
    desc: '其他杂活 (Other handyman). 典型区间: $60 – $180. 说不清楚的零散任务；上门后确认范围和报价',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
  // ── EE · 紧急服务 24/7 ───────────────────────────────────────────────────
  {
    id: 'ee01',
    name: '主水管爆裂/断水',
    nameEn: 'Main water line burst',
    price: 250,
    duration: '按项目',
    desc: '主水管爆裂/断水 (Main water line burst). 典型区间: $350 – $1200. 含主阀门紧急关闭及漏点封堵 [24/7 紧急服务]',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'ee02',
    name: '污水倒灌/全屋堵塞',
    nameEn: 'Main sewer backup',
    price: 280,
    duration: '按项目',
    desc: '污水倒灌/全屋堵塞 (Main sewer backup). 典型区间: $280 – $800. 24h 紧急疏通，含内窥镜检查 [24/7 紧急服务]',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'ee03',
    name: '煤气泄露检测',
    nameEn: 'Gas leak detection',
    price: 180,
    duration: '按项目',
    desc: '煤气泄露检测 (Gas leak detection). 典型区间: $180 – $500. 配合 SoCalGas 关阀后的修复 [24/7 紧急服务]',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'ee04',
    name: '暴雨屋顶漏水抢修',
    nameEn: 'Roof emergency tarp',
    price: 300,
    duration: '按项目',
    desc: '暴雨屋顶漏水抢修 (Roof emergency tarp). 典型区间: $450 – $950. 紧急铺设防水布(Tarp)，防止内涝 [24/7 紧急服务]',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'ee05',
    name: '停电/电路火花排查',
    nameEn: 'Electrical sparking',
    price: 200,
    duration: '按项目',
    desc: '停电/电路火花排查 (Electrical sparking). 典型区间: $200 – $600. 针对冒烟、异味等火灾隐患排查 [24/7 紧急服务]',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
  {
    id: 'ee06',
    name: '空调完全停机(极端天气)',
    nameEn: 'AC Total Failure',
    price: 150,
    duration: '按项目',
    desc: '空调完全停机(极端天气) (AC Total Failure). 典型区间: $150 – $550. 仅限室外 85°F+ 时的优先级调度 [24/7 紧急服务]',
    popular: false,
    active: true,
    categoryId: 'handyman',
  },
]

// ---------------------------------------------------------------------------
// Data extracted from 客户表 (Customer_Profile)-1
// Row 0: header, Row 1: description → data starts at Row 2
// Columns: 序号, Customer_ID, Full_Name, Phone_Number, WeChat_ID,
//          Geography, Address_Street, Community_Name, Property_Type,
//          Customer_Tag, Source
// Skipped: C034–C040 (no name/phone/wechat)
// ---------------------------------------------------------------------------

interface CustomerRow {
  customerId: string
  name: string
  email: string
  phone: string | null
  referralCode: string
  address: string | null
}

const CUSTOMERS: CustomerRow[] = [
  {
    customerId: 'C001',
    name: '张先生 / Kevin Zhang',
    email: 'wxid_xxxxxx@wechat.fixnest.com',
    phone: '949-xxx-xxxx',
    referralCode: 'REF-C001',
    address: '123 Magnolia St',
  },
  {
    customerId: 'C002',
    name: 'A^^',
    email: 'WK13304859930@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C002',
    address: null,
  },
  {
    customerId: 'C003',
    name: 'A-',
    email: 'AZ2824@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C003',
    address: null,
  },
  {
    customerId: 'C004',
    name: 'A乐淘淘',
    email: 'JX-five@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C004',
    address: null,
  },
  {
    customerId: 'C005',
    name: 'A.Amy新耀国际集运',
    email: 'baijia819@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C005',
    address: null,
  },
  {
    customerId: 'C006',
    name: 'ABella海燕',
    email: 'preety2008@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C006',
    address: null,
  },
  {
    customerId: 'C007',
    name: 'AChristina文慧|住家|商業',
    email: 'Benchen222@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C007',
    address: null,
  },
  {
    customerId: 'C008',
    name: 'Adaliu',
    email: 'adaliu003@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C008',
    address: null,
  },
  {
    customerId: 'C009',
    name: 'adaison',
    email: 'wxido31dzmn6ty8412@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C009',
    address: null,
  },
  {
    customerId: 'C010',
    name: '阿尔卑斯糖糖',
    email: '01112235@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C010',
    address: null,
  },
  {
    customerId: 'C011',
    name: 'A-(防盗系统公司)赵经理us',
    email: 'ZHAO122938076@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C011',
    address: null,
  },
  {
    customerId: 'C012',
    name: 'AGeorgeZ',
    email: 'wxid_q09ek23hwkqc12@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C012',
    address: null,
  },
  {
    customerId: 'C013',
    name: 'Agnes 丽华',
    email: 'SAEMRAEP@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C013',
    address: null,
  },
  {
    customerId: 'C014',
    name: 'Ai2',
    email: 'wxid_n37ecckjrvk612@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C014',
    address: null,
  },
  {
    customerId: 'C015',
    name: '爱果儿',
    email: 'm13955335277@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C015',
    address: null,
  },
  {
    customerId: 'C016',
    name: 'Aime',
    email: 'A272354@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C016',
    address: null,
  },
  {
    customerId: 'C017',
    name: 'Aimee',
    email: 'AimeeGuo2016@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C017',
    address: null,
  },
  {
    customerId: 'C018',
    name: 'Aioros',
    email: 'aiorosgu1987@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C018',
    address: null,
  },
  {
    customerId: 'C019',
    name: '爱心王',
    email: 'w13923798111@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C019',
    address: null,
  },
  {
    customerId: 'C020',
    name: '阿婧',
    email: 'fm926ajing@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C020',
    address: null,
  },
  {
    customerId: 'C021',
    name: 'Alex',
    email: 'wangjunsheng3664@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C021',
    address: null,
  },
  {
    customerId: 'C022',
    name: 'Alex Deng',
    email: 'dd7235958@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C022',
    address: null,
  },
  {
    customerId: 'C023',
    name: 'Alexia',
    email: 'thankseveryday1@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C023',
    address: null,
  },
  {
    customerId: 'C024',
    name: 'Alex刘玉争',
    email: 'Liu13832380222@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C024',
    address: null,
  },
  {
    customerId: 'C025',
    name: 'Alice Chen',
    email: 'alicechen85@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C025',
    address: null,
  },
  {
    customerId: 'C026',
    name: 'Alice Qing',
    email: 'NY182023@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C026',
    address: null,
  },
  {
    customerId: 'C027',
    name: 'Alina',
    email: 'Lamyy5828@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C027',
    address: null,
  },
  {
    customerId: 'C028',
    name: 'Alinna袁琳玲',
    email: 'Alinna6699@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C028',
    address: null,
  },
  {
    customerId: 'C029',
    name: 'Vivian 地产经纪',
    email: 'qq303417364@wechat.fixnest.com',
    phone: '6265605179',
    referralCode: 'REF-C029',
    address: null,
  },
  {
    customerId: 'C030',
    name: 'Alvin 汪',
    email: 'alwa007@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C030',
    address: null,
  },
  {
    customerId: 'C031',
    name: 'A Bella 海燕',
    // Note: same WeChat as C006 – using customer ID to avoid collision
    email: 'c031@fixnest.com',
    phone: null,
    referralCode: 'REF-C031',
    address: null,
  },
  {
    customerId: 'C032',
    name: '客户 C032',
    email: 'zxz9918999@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C032',
    address: '129 Salt Spg, Irvine, CA 92602',
  },
  {
    customerId: 'C033',
    name: '客户 C033',
    email: 'IceDream37@wechat.fixnest.com',
    phone: null,
    referralCode: 'REF-C033',
    address: '32011 Paseo Deriva, San Juan Capistrano 92675',
  },
]

// ---------------------------------------------------------------------------
// Data extracted from 师傅-服务商表 (Provider_Profile)-2
// Only 1 real data row (P001 王师傅); the rest are header/template rows.
// ---------------------------------------------------------------------------

interface TechnicianRow {
  id: string
  name: string
  email: string
  phone: string
  specialties: string[]
  area: string
  rating: number
  jobCount: number
  active: boolean
}

const TECHNICIANS: TechnicianRow[] = [
  {
    id: 'P001',
    name: '王师傅',
    email: 'wangsifu.p001@provider.fixnest.com',
    phone: '949-xxx-xxxx',
    specialties: ['水管', '电路', '屋顶', '庭院清理'],
    area: 'Irvine / Tustin / Newport',
    rating: 4.8,
    jobCount: 0,
    active: true,
  },
]

// ---------------------------------------------------------------------------
// Data extracted from 工单-项目历史表 (Order_Log)-3
// Only 1 real order row.
// ---------------------------------------------------------------------------

interface OrderRow {
  id: string
  customerId: string
  techId: string | null
  serviceId: string
  status: OrderStatus
  date: Date
  time: string
  address: string
  price: number
  discount: number
  tax: number
  total: number
  paymentMethod: string | null
  issueDescription: string
}

const ORDERS: OrderRow[] = [
  {
    id: 'ORD-20240501-01',
    customerId: 'C001',
    techId: 'P001',
    serviceId: 'p01', // 漏水维修 — matches issue "二楼厕所漏水，需更换零件"
    status: OrderStatus.COMPLETED,
    date: '2024-05-01',
    time: '10:00',
    address: '123 Magnolia St',
    price: 350,
    discount: 0,
    tax: 0,
    total: 350,
    paymentMethod: 'Zelle / Venmo / 现金',
    issueDescription: '二楼厕所漏水，需更换零件',
  },
]

// ---------------------------------------------------------------------------
// Main import function
// ---------------------------------------------------------------------------

async function main() {
  console.log('=================================================')
  console.log('  FixNest Excel Import Script')
  console.log('  Source: 服务分类&定价明细.xlsx + 客户&历史订单.xlsx')
  console.log('=================================================\n')

  let serviceCount = 0
  let customerCount = 0
  let technicianCount = 0
  let orderCount = 0

  // ── 1. Services ───────────────────────────────────────────────────────────
  console.log(`📦 Importing ${SERVICES.length} services…`)
  try {
    for (const svc of SERVICES) {
      await prisma.service.upsert({
        where: { id: svc.id },
        update: {
          name: svc.name,
          price: svc.price,
          duration: svc.duration,
          desc: svc.desc,
          popular: svc.popular,
          active: svc.active,
          categoryId: svc.categoryId,
        },
        create: {
          id: svc.id,
          name: svc.name,
          price: svc.price,
          duration: svc.duration,
          desc: svc.desc,
          popular: svc.popular,
          active: svc.active,
          categoryId: svc.categoryId,
        },
      })
      serviceCount++
      console.log(`  ✔  ${svc.id}  ${svc.name}  →  ${svc.categoryId}  @$${svc.price}`)
    }
    console.log(`\n  Services imported: ${serviceCount}\n`)
  } catch (err) {
    console.error('  ERROR during service import:', err)
  }

  // ── 2. Customers ──────────────────────────────────────────────────────────
  console.log(`👤 Importing ${CUSTOMERS.length} customers…`)
  console.log('  NOTE: All customer passwords are placeholder hashes.')
  console.log('        Customers must reset passwords on first login.\n')

  // Hash once and reuse — avoids hammering bcrypt for every row
  const placeholderHash = await hashPlaceholder()

  // Collect duplicate emails within this batch and de-duplicate before upsert
  const seenEmails = new Set<string>()

  try {
    for (const cust of CUSTOMERS) {
      if (seenEmails.has(cust.email)) {
        console.log(`  SKIP  ${cust.customerId}  (duplicate email ${cust.email})`)
        continue
      }
      seenEmails.add(cust.email)

      await prisma.user.upsert({
        where: { email: cust.email },
        update: {
          name: cust.name,
          phone: cust.phone ?? undefined,
        },
        create: {
          // Let Prisma generate a cuid for `id`
          name: cust.name,
          email: cust.email,
          phone: cust.phone ?? undefined,
          password: placeholderHash,
          role: Role.CUSTOMER,
          referralCode: cust.referralCode,
          credits: 0,
        },
      })
      customerCount++
      console.log(`  ✔  ${cust.customerId}  ${cust.name}  →  ${cust.email}`)
    }
    console.log(`\n  Customers imported: ${customerCount}\n`)
  } catch (err) {
    console.error('  ERROR during customer import:', err)
  }

  // ── 3. Technicians ────────────────────────────────────────────────────────
  console.log(`🔧 Importing ${TECHNICIANS.length} technicians…`)
  try {
    for (const tech of TECHNICIANS) {
      await prisma.technician.upsert({
        where: { id: tech.id },
        update: {
          name: tech.name,
          email: tech.email,
          phone: tech.phone,
          specialties: tech.specialties,
          area: tech.area,
          rating: tech.rating,
          jobCount: tech.jobCount,
          active: tech.active,
        },
        create: {
          id: tech.id,
          name: tech.name,
          email: tech.email,
          phone: tech.phone,
          specialties: tech.specialties,
          area: tech.area,
          rating: tech.rating,
          jobCount: tech.jobCount,
          active: tech.active,
        },
      })
      technicianCount++
      console.log(
        `  ✔  ${tech.id}  ${tech.name}  specialties=[${tech.specialties.join(', ')}]  rating=${tech.rating}`
      )
    }
    console.log(`\n  Technicians imported: ${technicianCount}\n`)
  } catch (err) {
    console.error('  ERROR during technician import:', err)
  }

  // ── 4. Orders ─────────────────────────────────────────────────────────────
  console.log(`📋 Importing ${ORDERS.length} orders…`)
  try {
    for (const ord of ORDERS) {
      // Look up the user's DB id from their customerId (referralCode is unique per customer)
      const user = await prisma.user.findFirst({
        where: { referralCode: `REF-${ord.customerId}` },
        select: { id: true },
      })

      if (!user) {
        console.log(`  SKIP  ${ord.id}  — customer ${ord.customerId} not found in DB`)
        continue
      }

      await prisma.order.upsert({
        where: { id: ord.id },
        update: {
          status: ord.status,
          price: ord.price,
          discount: ord.discount,
          tax: ord.tax,
          total: ord.total,
          paymentMethod: ord.paymentMethod ?? undefined,
        },
        create: {
          id: ord.id,
          userId: user.id,
          serviceId: ord.serviceId,
          techId: ord.techId ?? undefined,
          status: ord.status,
          date: ord.date,
          time: ord.time,
          address: ord.address,
          price: ord.price,
          discount: ord.discount,
          tax: ord.tax,
          total: ord.total,
          paymentMethod: ord.paymentMethod ?? undefined,
        },
      })
      orderCount++
      console.log(
        `  ✔  ${ord.id}  customer=${ord.customerId}  service=${ord.serviceId}  status=${ord.status}  total=$${ord.total}`
      )
    }
    console.log(`\n  Orders imported: ${orderCount}\n`)
  } catch (err) {
    console.error('  ERROR during order import:', err)
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('=================================================')
  console.log('  Import Complete — Summary')
  console.log('=================================================')
  console.log(`  Services imported   : ${serviceCount}`)
  console.log(`  Customers imported  : ${customerCount}`)
  console.log(`  Technicians imported: ${technicianCount}`)
  console.log(`  Orders imported     : ${orderCount}`)
  console.log('=================================================')
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
