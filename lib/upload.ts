import stream from 'node:stream'
import path from 'node:path'
import url from 'node:url'
import wretch from 'wretch'
import { request } from 'undici'
import OSS, { Options as OSSConfig } from 'ali-oss'
import dayjs from 'dayjs'

import * as dotenv from 'dotenv'

dotenv.config()

export async function uploadOSS(urlToUpload: string) {
  const client = new OSS({
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET
  })

  // 在微信网页版上，无法传 webp 格式图片，将其以 .webp 后缀结尾
  const format = process.env.WECHATY_PUPPET === 'wechaty-puppet-wechat' && urlToUpload.endsWith('webp') ? '.png' : ''

  // 获取文件名
  const fileName = [
    'midjourney',
    dayjs().format('YYYYMMDD'),
    path.basename(url.parse(urlToUpload).pathname),
  ].join('/') + format

  // 根据URL下载文件内容
  const {
    statusCode,
    headers,
    trailers,
    body
  } = await request(urlToUpload)

  const { name, res: result } = await client.putStream(fileName, body, {
    timeout: 180000,
    headers: {
      'Cache-Control': 'max-age=31536000',
      'Content-Type': headers['content-type']
    }
  } as any)

  // 返回文件新的OSS URL
  return `https://static.prochat.tech/${name}`
}

// uploadOSS('https://cdn.discordapp.com/attachments/1108997745064292384/1109841226104057886/dx_Western_Dragon._2c11f9b1-6e1a-4e79-b559-a6a4544aaa7f.webp')
//   .then(o => {
//     console.log(o)
//   })
