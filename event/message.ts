import { Message } from 'wechaty'
import { Message as MessageType } from 'wechaty-puppet/types'
import { routes } from '../message'

// 默认只回复私聊，以及艾特我的群聊
async function defaultFilter(msg: Message) {
  const metionSelf = await msg.mentionSelf()
  return (
    msg.type() === MessageType.Text &&
    (!msg.room() || (msg.room() && metionSelf))
  )
}

const createdAt = Date.now()
export async function handleMessage(msg: Message) {
  // 如果是过时的消息，则不理睬
  if (msg.date().getTime() < createdAt) {
    return
  }
  // 如果是自己发的消息，则不理睬
  if (msg.talker().self()) {
    return
  }
  const enable = await defaultFilter(msg)
  if (!enable) {
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
  const data = await route.handle(text, msg)
  await msg.say(data)
}
