import { Message, Sayable } from 'wechaty'
import { FileBox } from 'file-box'
import dayjs from 'dayjs'

import { chat, draw, drawWithMJ } from '../lib/reply'
import { uploadOSS } from '../lib/upload'
import { logger } from '../lib/logger'
import { redis } from '../lib/redis'

export async function handle(text: string, msg: Message) {
  text = text
    .replace(/^画图：?/, '')
    .replace(/^画/, '')
    .replace(/^imagine /, '')

  const DEFAULT_FREE_CREDIT = Number(process.env.DEFAULT_FREE_CREDIT) || 100

  // 凌晨四点重置
  const key = `Contact:${msg.talker().id}:Credit:${dayjs().utcOffset(4).format('YYYYMMDD')}`
  const credit = await redis.get(key).then(v => {
    return v ? Number(v) : DEFAULT_FREE_CREDIT
  }).catch(() => {
    return DEFAULT_FREE_CREDIT
  })
  if (credit <= 0) {
    return '您今日余额已不足，请明日再来。发送红包自动获得 3 次绘制次数。'
  }
  await redis.set(key, credit - 3, 'EX', 3600 * 24)

  await msg.say('🤖 正在绘制中，请稍后...')
  // const url = await draw(text)
  let mjMessage
  try {
    mjMessage = await drawWithMJ(text)
    await redis.set(`MidJourney:${mjMessage.id || Math.random()}`, JSON.stringify(mjMessage), 'EX', 3600 * 24 * 3)
  } catch (e) {
    logger.error(e)
    await redis.incrby(key, 3)
    // TODO: 写一个方法，以 room 为参数
    return '抱歉，绘画失败，有可能你所绘制的内容违规'
  }
  const { uri, id } = mjMessage
  const url = await uploadOSS(uri)
  const prefix = msg.room() ? `@${msg.talker().name()} ` : ''
  await msg.say(`${prefix}🤖 绘制完成

提示词：${text}
图像高清地址：${uri}
国内高清地址：${url}
`)
  await msg.say(`使用 /up 命令进行图像放大与变化，放大第二张示例如下：

/up ${id} U2`)
  // TODO: 个人微信 web 协议不支持 webp
  const png = uri.endsWith('.webp') ? '/format,png' : ''
  const resizeUrl = `${url}?x-oss-process=image/resize,w_900${png}`
  // const testUrl = 'https://static.prochat.tech/midjourney/20230522/dx_Landscape_painting_79ad6f87-c2be-48a6-afc5-8cc075a732ae.webp.png?x-oss-process=image/resize,w_900/format,png'
  const fileBox = FileBox.fromUrl(resizeUrl)

  return fileBox
}