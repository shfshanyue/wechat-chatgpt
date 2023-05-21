import config from '../config'
import { sample } from 'midash'
import wretch from 'wretch'
import { retry } from 'wretch/middlewares/retry'
import { retry as pRetry } from '@shanyue/promise-utils'
import * as Sentry from '@sentry/node'
import { logger } from './logger'
import { cache } from './cache'
import { Configuration, CreateImageRequestResponseFormatEnum, CreateImageRequestSizeEnum, OpenAIApi } from 'openai'
import { createOpenAI } from './openai'
import { mjClient } from './mj'
import { LoadingHandler } from 'midjourney'
import { uploadOSS } from './upload'

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

export async function reply(messages: ChatMessage[]): Promise<string> {
  const getReply = () => wretch(config.baseURL)
    .url('/v1/chat/completions')
    .headers({
      Authorization: `Bearer ${sample(config.apiKey)}`,
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

export async function draw(prompt: string) {
  const openai = createOpenAI()

  const response = await openai.createImage({
    prompt: prompt,
    size: CreateImageRequestSizeEnum._512x512,
    response_format: CreateImageRequestResponseFormatEnum.Url,
  }).then((res) => res.data)
    .catch((err) => {
      console.error(err)
    });
  if (response) {
    return response.data[0].url
  } else {
    return '绘制图片失败，请您再试'
  }
}

export async function drawWithMJ(prompt: string, cb: LoadingHandler) {
  if (/[\u4e00-\u9fa5]/.test(prompt)) {
    prompt = await chat(prompt, '中译英，直接翻译，无需解释')
  }
  if (!prompt.includes('--quality') && !prompt.includes('--q')) {
    prompt = `${prompt} --quality .75`
  }
  const getURI = async () => {
    const data = await mjClient.Imagine(prompt, cb)
    console.log(data)
    const { id, uri, content, ...args } = data
    return uri
  }
  return pRetry(getURI, { times: 3 })
}

export async function chat(content: string, prompt: string, key?: string): Promise<string> {
  const history: any = (key && cache.get(key)) || []
  const system = prompt ? [{
    content: prompt,
    role: 'system'
  }] : []
  const answer = await reply([
    ...system,
    ...history,
    {
      role: 'user',
      content
    },
  ])
  cache.set(key, [
    ...history.slice(-2),
    {
      role: 'user',
      content,
    },
    {
      role: 'assistant',
      content: answer
    }
  ])
  return answer
}