import * as dotenv from 'dotenv'

dotenv.config()

type Config = {
  acceptText: RegExp
  enableGroup: RegExp | boolean
  enablePrivate: RegExp | boolean

  baseURL: string
  apiKey: string[]
  model: string
  prompt: string
}

export default {
  // 自动同意添加好友的口令
  acceptText: /芝麻开门/,

  baseURL: process.env.BASE_URL || 'https://api.openai.com',
  apiKey: process.env.OPEN_API_KEY.split(','),
  model: process.env.GPT_MODEL || 'gpt-3.5-turbo',
  prompt: process.env.PROMPT || '',

  // 判断在哪里开启机器人，默认是私聊以及艾特机器人的群聊
  // 是否开启群聊模式，可使用正则以及 boolen，如果是正则用以决定在那些群开启群聊
  enableGroup: /^(技术交流群|面试直通车|学习)$/,
  // enableGroup: true,

  // 是否开启私聊模式，可使用正则以及 boolen，如果是正则用以决定与谁私聊
  // enablePrivate: true,
  enablePrivate: /(山月)/,
} as Config
