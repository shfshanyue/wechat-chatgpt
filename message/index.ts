import { Message, Sayable } from 'wechaty'
import { reply } from '../lib/reply'
import * as echo from './echo'
import * as fund from './fund'

type Route = {
  handle: ((text: string, msg: Message) => Sayable) | ((text: string, msg: Message) => Promise<Sayable>)
  keyword: string | RegExp
  filter?: (msg: Message) => boolean
}

export const routes: Route[] = [
  {
    keyword: '/ping',
    handle() {
      return 'pong'
    },
  },
  { keyword: '基金', handle: fund.handle },
  {
    keyword: '',
    async handle(text, msg) {
      const talker = msg.talker()
      const answer = await reply([
        {
          role: 'user',
          content: text,
        },
      ])
      return msg.room() ? `@${talker.name()} ${answer}` : answer
    },
  },
]
