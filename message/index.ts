import { Message, Sayable } from 'wechaty'
import * as echo from './echo'
import * as fund from './fund'

type Route = {
  handle: ((text: string) => Sayable) | ((text: string) => Promise<Sayable>)
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
    handle: echo.handle,
    // 仅仅是一个示例
    // 仅仅对名称为 山月 的人，进行原样输出对话
    filter(msg) {
      return msg.talker().name() === '山月'
    },
  },
]
