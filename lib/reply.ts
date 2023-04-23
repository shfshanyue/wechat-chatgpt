import config from '../config'
import { sample } from 'midash'
import wretch from 'wretch'
import { retry } from 'wretch/middlewares/retry'
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

export async function reply(messages: ChatMessage[]) {
  const apiKey = sample(config.apiKey)
  const w = wretch(config.baseURL).middlewares([
    retry({
      delayTimer: 500,
      maxAttempts: 3,
      until: (response, error) => response && response.ok
    })
  ])
  return w
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
        logger.error('Error', data)
      }
      return data.choices[0].message.content
    })
    .catch((e) => {
      logger.error(e)
      return '抱歉，我发生了一点小意外。'
    })
}
