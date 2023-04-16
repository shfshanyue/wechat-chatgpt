import { Wechaty } from 'wechaty'
import * as Sentry from '@sentry/node'
import path from 'path'
import fs from 'fs'

export async function schedule(bot: Wechaty) {
  const files = fs.readdirSync(__dirname).filter((file) => {
    return file !== 'index.ts'
  })
  for (const file of files) {
    try {
      await import(path.join(__dirname, file)).then((m) => {
        return m.default(bot)
      })
    } catch (e) {
      Sentry.captureException(e)
    }
  }
}
