import Koa from 'koa'
import { WechatyInterface } from 'wechaty/impls'

import { createBot } from './bot'
import * as message from './event/message'
import * as friendShip from './event/friend-ship'
import * as roomJoin from './event/room-join'

const app = new Koa()

function listen(bot: WechatyInterface): Promise<{
  type: 'scan' | 'login',
  data: any
}> {
  return new Promise((resolve, reject) => {
    bot
      .on('scan', (qrcode) => {
        resolve({
          type: 'scan',
          data: qrcode
        })
      })
      .on('login', (user) => {
        resolve({
          type: 'login',
          data: user
        })
      })
      .on('room-join', roomJoin.handleRoomJoin)
      .on('friendship', friendShip.handleFriendShip)
      .on('message', message.handleMessage)
      .start()
  })
}

app.use(async (ctx) => {
  const bot = createBot()
  const { type, data } = await listen(bot)
  if (type === 'scan') {
    ctx.body = `<img style="width: 300" src="https://devtool.shanyue.tech/api/qrcode?data=${encodeURIComponent(data)}">`
  } else {
    ctx.body = '已登录'
  }
})

app.listen(3000, () => {
  console.log('Listing 3000...')
})