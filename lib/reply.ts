import config from '../config'
import { sample } from 'midash'
import wretch from 'wretch'
import { retry } from 'wretch/middlewares/retry'
import { retry as pRetry } from '@shanyue/promise-utils'
import * as Sentry from '@sentry/node'
import { logger } from './logger'

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type GPTModel =
  | 'gpt-4'
  | 'gpt-4-0314'
  | 'gpt-4-32k'
  | 'gpt-4-32k-0314'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-0301'

const errorMessages = [
  '抱歉，我没听懂你的意思，你可以再说一遍吗',
  '对不起，我没有理解您的意思，请再说一遍。',
  '抱歉，我不明白您想表达什么，请您提供更多细节。',
  '不好意思，我需要更多信息来帮助您，您能否再解释一下您的问题？',
  '我很抱歉，我需要更多上下文来理解您的意思，请您详细说明一下。',
  '对不起，我听了您的问题，但是不太明白您的意思，您能否用不同的方式解释一下？',
  '请您再慢慢说一遍，我听不太清楚，不太理解您的意思。',
  '能否请您再用不同的方式描述一下，我才能更好地理解您所说的内容。',
  '对不起，可能是我的理解能力有限，能否再解释一下？',
]

export async function reply(messages: ChatMessage[]) {
  const apiKey = sample(config.apiKey)

  // TODO: wretch retry 中间件无法返回 40x 异常，需修复
  const w = wretch(config.baseURL).middlewares([
    // retry({
    //   delayTimer: 500,
    //   maxAttempts: 3,
    //   until (response, error) {
    //     return response && response.ok
    //   }
    // })
  ])
  const getReply = () => w
    .url('/v1/chat/completions')
    .headers({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
    .post({
      model: config.model,
      messages
    })
    .json((data) => {
      if (!data.choices.length) {
        throw new Error('No Content')
      }
      return data.choices[0].message.content
    })
  return pRetry(getReply, { times: 5 })
    .catch((e) => {
      logger.error(e)
      Sentry.captureException(e)
      // return '抱歉，我发生了一点小意外。'
      return sample(errorMessages)
    })
}
