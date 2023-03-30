import { WechatyBuilder } from 'wechaty'
import { Contact as ContactType } from 'wechaty-puppet/types'
import Qrterminal from 'qrcode-terminal'
import * as Sentry from '@sentry/node'

import * as message from './event/message'
import * as friendShip from './event/friend-ship'
import * as roomJoin from './event/room-join'

import { schedule } from './schedule'
import config from './config'

Sentry.init({
  dsn: config.sentryDsn
})

const bot = WechatyBuilder.build({
  // name: 'wechat-shanyue',
  puppetOptions: {
    uos: true, // 开启uos协议
  },
  puppet: 'wechaty-puppet-wechat',
})

function handleScan(qrcode: string) {
  Qrterminal.generate(qrcode, { small: true })
}

bot
  .on('scan', handleScan)
  .on('room-join', roomJoin.handleRoomJoin)
  .on('friendship', friendShip.handleFriendShip)
  .on('message', message.handleMessage)
  .on('login', () => {
    console.log(bot.name(), '登录成功')
    setTimeout(() => {
      bot.Contact.findAll().then(async (contacts) => {
        const friends = contacts.filter(contact => {
          return contact.type() === ContactType.Individual
        })
        console.log('您的好友数量', friends.length)
      })
    }, 10000)
    schedule(bot)
  })
  .on('error', (error) => {
    Sentry.captureException(error)
  })
  .start()
