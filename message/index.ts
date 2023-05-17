import { Message, Sayable } from 'wechaty'
import config from '../config'
import { chat, reply } from '../lib/reply'
import * as echo from './echo'
import { cache } from '../lib/cache'

type Route = {
  handle: ((text: string, msg: Message) => Sayable) | ((text: string, msg: Message) => Promise<Sayable>)
  keyword: string | RegExp
  filter?: (msg: Message) => boolean | Promise<boolean>
}

export const routes: Route[] = [
  {
    keyword: '/ping',
    handle() {
      return 'pong'
    },
  },
  {
    keyword: '收到红包，请在手机上查看',
    handle () {
      // 后续在这里给发红包的人加次数
      return ''
    },
    filter () {
      return false
    }
  },
  {
    keyword: '[收到一条微信转账消息，请在手机上查看]',
    handle() {
      return ''
    },
    filter () {
      return false
    }
  },
  {
    keyword: '',
    async handle(text, msg) {
      text = text
        .replace(new RegExp(`^${config.groupPrefix}`), '')
        .replace(new RegExp(`^${config.privatePrefix}`), '')
      const talker = msg.talker()

      const conversation = msg.conversation()

      const key = `Conversation:${conversation.id}:Talker:${talker.id}:Message`
      const answer = await chat(text, config.prompt, key)

      if (msg.room()) {
        const isLontText = text.length > 20
        return `@${talker.name()}  ${text.slice(0, 20)}${isLontText ? '...' : ''}
---------------------------------
${answer}`
      }
      return answer
    },
    async filter(msg) {
      const room = msg.room()
      if (room && config.enableGroup && msg.text().startsWith(config.groupPrefix)) {
        if (config.enableGroup === true) {
          return true
        }
        const topic = await room.topic()
        return config.enableGroup.test(topic)
      }
      if (!room && config.enablePrivate && msg.text().startsWith(config.privatePrefix)) {
        if (config.enablePrivate === true) {
          return true
        }
        return config.enablePrivate.test(msg.talker().name())
      }
      return false
    }
  },
]
