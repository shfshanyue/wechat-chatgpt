import Koa from 'koa'
import { createBot } from './bot'
import { WechatyInterface } from 'wechaty/impls'

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
      .start()
  })
}

app.use(async (ctx) => {
  const bot = createBot()
  const { type, data } = await listen(bot)
  if (type === 'scan') {
    ctx.body = data
  } else {
    ctx.body = '已登录'
  }
})

app.listen(3000, () => {
  console.log('Listing 3000...')
})