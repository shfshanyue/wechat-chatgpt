import { sample } from "midash"
import { Configuration, OpenAIApi } from "openai"
import config from "../config"

export function createOpenAI () {
  const options = new Configuration({
    apiKey: sample(config.apiKey),
    basePath: config.baseURL + '/v1'
  })
  const openai = new OpenAIApi(options)
  return openai
}