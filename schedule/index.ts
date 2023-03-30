import { Wechaty } from 'wechaty'
import path from 'path'
import fs from 'fs'

export async function schedule(bot: Wechaty) {
  const files = fs.readdirSync(__dirname).filter((file) => {
    return file !== 'index.ts'
  })
  for (const file of files) {
    await import(path.join(__dirname, file)).then((m) => {
      return m.default(bot)
    })
  }
}
