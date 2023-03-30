import { Message } from 'wechaty'
import { Message as MessageType } from 'wechaty-puppet/types'
import { routes } from '../message'

// 默认只回复私聊
async function defaultFilter(msg: Message) {
  return msg.type() === MessageType.Text && !msg.room()
}

const createdAt = Date.now()
export async function handleMessage(msg: Message) {
  // 如果是过时的消息，则不理睬
  if (msg.date().getTime() < createdAt) {
    return
  }
  // 如果是群聊，但没有艾特我，则不理睬
  const messionSelf = await msg.mentionSelf()
  if (msg.room() && !messionSelf) {
    return
  }

  const self = msg.listener()
  const text = msg.text().replace('@' + self?.name(), '') || ''
  const route = routes.find((route) => {
    const keyword = route.keyword
    if (typeof keyword === 'string') {
      return text.includes(keyword)
    }
    return keyword.test(text)
  })
  const filter = await (route.filter || defaultFilter)(msg)
  if (!filter || !route) {
    return
  }
  const data = await route.handle(text)
  await msg.say(data)
}
