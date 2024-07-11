import { WechatyBuilder, types, ScanStatus } from '@juzi/wechaty'
import * as Sentry from '@sentry/node'
import { MemoryCard } from 'memory-card'
import inquirer from 'inquirer'

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
  const botName = process.env.BOT_NAME || 'wechat-shanyue'
  return WechatyBuilder.build({
    name: `memory/${botName}`,
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

const store = {
  qrcodeKey: '',
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
          logger.error(e)
          return msg.say('抱歉，我发生了一点小意外。')
        })
        .catch(e => {
          Sentry.captureException(e)
        })
    })
    .on('verify-code', async (id: string, message: string, scene: types.VerifyCodeScene, status: types.VerifyCodeStatus) => {
        // 需要注意的是，验证码事件不是完全即时的，可能有最多10秒的延迟。
        console.log("verify", status, scene, id)
        // 这与底层轮询二维码状态的时间间隔有关。
        //if (status === types.VerifyCodeStatus.WAITING && scene === types.VerifyCodeScene.LOGIN && id === store.qrcodeKey) {
          console.log(`receive verify-code event`)
          const { verifyCode } = await inquirer.prompt([
            {
              type: 'input',
              name: 'verifyCode',
              prefix: '>',
              message: 'Please enter the verification code:',
            },
          ])
          try {
            await bot.enterVerifyCode(id, verifyCode) // 如果没抛错，则说明输入成功，会推送登录事件
            return
          } catch (e) {
            console.log((e as Error).message)
            // 如果抛错，请根据 message 处理，目前发现可以输错3次，超过3次错误需要重新扫码。
            // 错误关键词: 验证码错误输入错误，请重新输入
            // 错误关键词：验证码错误次数超过阈值，请重新扫码'
            // 目前不会推送 EXPIRED 事件，需要根据错误内容判断
          }
        //}
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