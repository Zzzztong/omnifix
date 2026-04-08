import { Router, Request, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// 模拟服务数据（与 customer-app 的 services.ts 保持一致）
const SERVICES_DATA = [
  { id: 'plumbing', name: '管道维修', category: '水电暖气', startingPrice: 85, description: '水管漏水、马桶堵塞、水龙头更换' },
  { id: 'electrical', name: '电气维修', category: '水电暖气', startingPrice: 95, description: '断路器跳闸、插座故障、照明维修' },
  { id: 'hvac', name: '暖通空调', category: '水电暖气', startingPrice: 120, description: '空调维修、供暖系统、通风管道' },
  { id: 'water-heater', name: '热水器', category: '水电暖气', startingPrice: 110, description: '热水器维修与更换' },
  { id: 'appliance', name: '家电维修', category: '居家修缮', startingPrice: 75, description: '洗碗机、冰箱、洗衣机、烘干机维修' },
  { id: 'carpentry', name: '木工维修', category: '居家修缮', startingPrice: 80, description: '门窗修复、橱柜、木地板维修' },
  { id: 'drywall', name: '石膏板修复', category: '居家修缮', startingPrice: 90, description: '墙面破损修复、涂料修补' },
  { id: 'flooring', name: '地板安装', category: '居家修缮', startingPrice: 95, description: '地板铺设、修复与更换' },
  { id: 'painting', name: '室内粉刷', category: '美化保养', startingPrice: 200, description: '墙面刷漆、颜色咨询' },
  { id: 'cleaning', name: '深度清洁', category: '美化保养', startingPrice: 150, description: '全屋深度清洁、搬家清洁' },
  { id: 'landscaping', name: '园艺美化', category: '美化保养', startingPrice: 100, description: '草坪修剪、树木修剪、绿化设计' },
  { id: 'pest-control', name: '害虫防治', category: '美化保养', startingPrice: 120, description: '白蚁、蟑螂、老鼠等害虫处理' },
]

// 生成可用时间槽（未来 7 天，每天 4 个时段）
function getAvailableSlots(serviceId: string, date?: string) {
  const slots = []
  const today = new Date()
  const startDate = date ? new Date(date) : today

  for (let d = 0; d < 7; d++) {
    const day = new Date(startDate)
    day.setDate(startDate.getDate() + d)

    // 跳过周日
    if (day.getDay() === 0) continue

    const dateStr = day.toISOString().split('T')[0]
    const times = ['09:00', '11:00', '14:00', '16:00']

    // 随机去掉1-2个时段模拟已预约
    const available = times.filter(() => Math.random() > 0.3)
    if (available.length === 0) available.push('09:00')

    slots.push({
      date: dateStr,
      dayOfWeek: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day.getDay()],
      times: available
    })

    if (slots.length >= 5) break
  }
  return slots
}

// AI 工具定义
const tools: Anthropic.Tool[] = [
  {
    name: 'get_services',
    description: '获取可用的维修服务列表，可按分类筛选',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          enum: ['水电暖气', '居家修缮', '美化保养'],
          description: '服务分类（可选）'
        }
      }
    }
  },
  {
    name: 'get_available_slots',
    description: '查询某项服务的可预约时间段',
    input_schema: {
      type: 'object' as const,
      properties: {
        service_id: {
          type: 'string',
          description: '服务ID'
        },
        preferred_date: {
          type: 'string',
          description: '偏好日期，格式 YYYY-MM-DD（可选）'
        }
      },
      required: ['service_id']
    }
  },
  {
    name: 'create_booking',
    description: '为客户创建预约订单',
    input_schema: {
      type: 'object' as const,
      properties: {
        service_id: {
          type: 'string',
          description: '服务ID'
        },
        service_name: {
          type: 'string',
          description: '服务名称'
        },
        date: {
          type: 'string',
          description: '预约日期，格式 YYYY-MM-DD'
        },
        time: {
          type: 'string',
          description: '预约时间，如 09:00'
        },
        address: {
          type: 'string',
          description: '服务地址'
        },
        contact_name: {
          type: 'string',
          description: '联系人姓名'
        },
        contact_phone: {
          type: 'string',
          description: '联系电话'
        },
        notes: {
          type: 'string',
          description: '备注信息（可选）'
        }
      },
      required: ['service_id', 'service_name', 'date', 'time', 'address', 'contact_name', 'contact_phone']
    }
  },
  {
    name: 'check_order_status',
    description: '查询订单状态',
    input_schema: {
      type: 'object' as const,
      properties: {
        order_id: {
          type: 'string',
          description: '订单号'
        }
      },
      required: ['order_id']
    }
  }
]

// 执行工具调用
function executeTool(name: string, input: Record<string, string>): string {
  if (name === 'get_services') {
    const filtered = input.category
      ? SERVICES_DATA.filter(s => s.category === input.category)
      : SERVICES_DATA
    return JSON.stringify(filtered)
  }

  if (name === 'get_available_slots') {
    const slots = getAvailableSlots(input.service_id, input.preferred_date)
    const service = SERVICES_DATA.find(s => s.id === input.service_id)
    return JSON.stringify({
      service: service?.name || input.service_id,
      available_slots: slots
    })
  }

  if (name === 'create_booking') {
    const orderId = 'ORD-' + Date.now().toString().slice(-6)
    return JSON.stringify({
      success: true,
      order_id: orderId,
      message: `预约成功！您的订单号是 ${orderId}`,
      details: {
        service: input.service_name,
        date: input.date,
        time: input.time,
        address: input.address,
        contact: input.contact_name,
        phone: input.contact_phone,
        estimated_price: SERVICES_DATA.find(s => s.id === input.service_id)?.startingPrice || 0
      }
    })
  }

  if (name === 'check_order_status') {
    return JSON.stringify({
      order_id: input.order_id,
      status: '已确认',
      message: '您的订单已确认，技工将在预约时间准时上门'
    })
  }

  return JSON.stringify({ error: '未知工具' })
}

const SYSTEM_PROMPT = `你是 FixNest 家庭维修平台的 AI 助手小智。你服务于加州尔湾地区（Irvine, CA）的华人家庭。

你的职责：
1. 帮助客户了解我们提供的维修服务
2. 查询可用的预约时间槽
3. 引导客户完成预约流程
4. 回答关于服务的常见问题

服务区域：尔湾及周边地区（Irvine, Tustin, Lake Forest, Laguna Hills等）
服务时间：周一至周六 9:00-17:00
紧急服务：水电气暖气问题可联系紧急服务热线

预约流程：
1. 了解客户需要什么服务
2. 查询可用时间
3. 确认地址和联系方式
4. 创建预约

沟通风格：
- 使用简洁友好的中文
- 专业但不生硬
- 如果客户描述问题不清楚，主动询问细节
- 价格是起步价，实际费用由技工上门评估后确认`

// POST /api/chat  接受消息历史，返回 AI 回复（流式）
router.post('/', async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: Anthropic.MessageParam[] }

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: '缺少 messages 参数' })
    return
  }

  // 使用 SSE 流式返回
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    let currentMessages = [...messages]

    // Tool use 循环
    while (true) {
      const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools,
        messages: currentMessages
      })

      if (response.stop_reason === 'end_turn') {
        // 找到文本内容并发送
        for (const block of response.content) {
          if (block.type === 'text') {
            res.write(`data: ${JSON.stringify({ type: 'text', text: block.text })}\n\n`)
          }
        }
        break
      }

      if (response.stop_reason === 'tool_use') {
        // 先把 AI 的思考文本发出去
        for (const block of response.content) {
          if (block.type === 'text' && block.text.trim()) {
            res.write(`data: ${JSON.stringify({ type: 'text', text: block.text })}\n\n`)
          }
        }

        // 执行所有工具调用
        const toolResults: Anthropic.ToolResultBlockParam[] = []
        for (const block of response.content) {
          if (block.type === 'tool_use') {
            res.write(`data: ${JSON.stringify({ type: 'tool_call', tool: block.name })}\n\n`)
            const result = executeTool(block.name, block.input as Record<string, string>)
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: result
            })
          }
        }

        // 追加到消息历史继续循环
        currentMessages = [
          ...currentMessages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults }
        ]
        continue
      }

      break
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
    res.end()
  } catch (err) {
    console.error('Chat error:', err)
    res.write(`data: ${JSON.stringify({ type: 'error', message: '服务暂时不可用，请稍后重试' })}\n\n`)
    res.end()
  }
})

export default router
