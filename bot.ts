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
    .on('login', async () => {
      const name = bot.currentUser.name()
      const alias = await bot.currentUser.alias()
      logger.info(`${bot.name()}-${name}-${alias} 登录成功`, { label: 'event', event: 'login' })
      schedule(bot)
    })
    .on('logout', () => {
      const name = bot.currentUser.name()
      logger.info(`${bot.name()}-${name} 退出登录`, { label: 'event', event: 'logout' })
    })
    .on('stop', () => {
      const name = bot.currentUser.name()
      logger.info(`${bot.name()}-${name} 退出`, { label: 'event', event: 'stop' })
    })
    .on('error', (error) => {
      logger.error('WechatyError', error)
      console.error(error)
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
}