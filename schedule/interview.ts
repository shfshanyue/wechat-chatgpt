import { Wechaty } from 'wechaty'
import { CronJob } from 'cron'

export default async (bot: Wechaty) => {
  return new CronJob('0 9 * * *', async () => {
    const rooms = await bot.Room.findAll({ topic: /学习/ })
    for (const room of rooms) {
      if (room.owner().name().includes('山月')) {
        await room.say('早安')
      }
    }
  }, null, true, 'Asia/Shanghai')
}
