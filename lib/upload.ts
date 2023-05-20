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

  // 获取文件名
  const fileName = [
    'midjourney',
    dayjs().format('YYYYMMDD'),
    path.basename(url.parse(urlToUpload).pathname)
  ].join('/')

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
      'Cache-Control': 'max-age=31536000'
    }
  } as any)

  // 返回文件新的OSS URL
  return `https://static.prochat.tech/${name}`
}

// uploadOSS('https://static.shanyue.tech/images/23-05-16/clipboard-7590.dd2989.webp')
//   .then(o => {
//     console.log(o)
//   })
