import config from '../config'
import { sample } from 'midash'

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
  return fetch(`${config.baseURL}/v1/chat/completions`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      model: config.model,
      messages,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(JSON.stringify({
        input: messages,
        output: data.choices[0].message
      }))
      return data.choices[0].message.content
    })
    .catch((e) => {
      console.error(e)
      return '抱歉，我发生了一点小意外。'
    })
}
