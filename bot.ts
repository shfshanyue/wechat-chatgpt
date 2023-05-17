import { WechatyBuilder } from 'wechaty'
import * as Sentry from '@sentry/node'
import { MemoryCard } from 'memory-card'

import * as message from './event/message'
import * as friendShip from './event/friend-ship'
import * as roomJoin from './event/room-join'

import { schedule } from './schedule'
import config from './config'
import { logger } from './lib/logger'
import { cache } from './lib/cache'

Sentry.init({
  dsn: (config as any)?.sentryDsn || ''
})

export function createBot() {
  return WechatyBuilder.build({
    name: 'memory/wechat-shanyue',
    puppetOptions: {
      uos: true, // 开启uos协议
      timeoutSeconds: 4 * 60,
      tls: {
        disable: true
      }
    },
    // puppet: 'wechaty-puppet-wechat',

    // 可采用基于 iPad 协议的 PUPPET
    // puppet: 'wechaty-puppet-padlocal'
  })
}

function handleScan(qrcode: string) {
  // Qrterminal.generate(qrcode, { small: true })
  if (cache.get(qrcode)) {
    return
  }
  // 十分钟不出现相同的二维码
  cache.set(qrcode, 1, {
    ttl: 10 * 60000
  })
  console.log(`open https://devtool.tech/api/qrcode?data=${encodeURIComponent(qrcode)}`)
}

if (require.main === module) {
  const bot = createBot()

  bot.on('scan', handleScan)
    .on('room-join', roomJoin.handleRoomJoin)
    .on('friendship', friendShip.handleFriendShip)
    .on('message', msg => {
      message
        .handleMessage(msg)
        .catch(e => {
          Sentry.captureException(e)
          return msg.say('抱歉，我发生了一点小意外。')
        })
        .catch(e => {
          Sentry.captureException(e)
        })
    })
    .on('login', async (user) => {
      const name = user.name()
      logger.info(`${bot.name()}-${name} 登录成功`, { label: 'event', event: 'login' })
      schedule(bot)
    })
    .on('logout', (user, reason) => {
      const name = user.name()
      logger.info(`${bot.name()}-${name} 退出登录`, { label: 'event', event: 'logout', reason })
    })
    .on('stop', () => {
      logger.info(`${bot.name()}-${bot.isLoggedIn ? bot.currentUser.name() : '未登录用户'} 退出`, { label: 'event', event: 'stop' })
    })
    .on('error', (error) => {
      logger.error(error)
      Sentry.captureException(error)
    })
    .start()

  process.on('uncaughtException', e => {
    logger.error('UN_CAUGHT_EXCEPTION', e)
    Sentry.captureException(e)
  })

  process.on('unhandledRejection', e => {
    logger.error('UN_HANDLED_REJECTION', e)
    Sentry.captureException(e)
  })

  // const n = (bot as any).listenerCount('scan')
  // console.log(n)

  // // 真正的退出登录，手机微信上方横条消失，触发 logout 事件
  // bot.logout()

  // // 停止机器人运行，手机微信上方横条不会消失，触发 stop 事件，如果此时是登录状态，触发 logout 事件
  // bot.stop()
}