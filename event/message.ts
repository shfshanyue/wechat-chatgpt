import { Message } from 'wechaty'
import { Message as MessageType } from 'wechaty-puppet/types'
import { Contact as ContactType } from 'wechaty-puppet/types'
import { routes } from '../message'
import { logger } from '../lib/logger'

// 默认只回复私聊，以及艾特我的群聊
async function defaultFilter(msg: Message) {
  const metionSelf = await msg.mentionSelf()
  // 屏蔽微信运动、公众号消息等
  return (
    msg.type() === MessageType.Text &&
    (!msg.room() || (msg.room() && metionSelf)) && msg.talker().type() !== ContactType.Official
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

  const text = await msg.mentionText()
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
  const replyText = await route.handle(text, msg)
  if (replyText) {
    let group = null
    if (msg.room()) {
      group = await msg.room().topic()
    }
    logger.info(replyText.toString(), {
      text,
      reply: replyText,
      user: msg.talker().name(),
      group
    })
    await msg.say(replyText)
  }
}
