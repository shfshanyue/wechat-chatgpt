import * as dotenv from 'dotenv'
dotenv.config()

export default {
  // 自动同意添加好友的口令
  acceptText: /芝麻开门/,

  baseURL: process.env.BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.OPEN_API_KEY.split(','),
  model: process.env.GPT_MODEL || 'gpt-3.5-turbo'
}