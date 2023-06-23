# ChatGPT/Midjourney 微信机器人

三分钟，创建一个 ChatGPT/Midjourney AI 微信（企业微信）小助手。

+ [x] 负载均衡：多个 OpenAI Token 增强其稳定性
+ [x] 场景模式：可通过 PROMPT 配置机器人为专业的翻译、面试官、医生等
+ [x] 群聊控制：可控制在那些群开启群聊，或关闭群聊
+ [x] 私聊控制：可控制在那些好友开启私聊，或关闭私聊
+ [x] 词语触发：支持通过关键字触发私聊、群聊的 AI 机器人
+ [x] 支持日志：可查看每天多少条记录
+ [x] 反向代理：为不同地区提供更快的 OpenAI 的代理 API 地址
+ [x] 企业微信：支持企业微信登录
+ [x] 自动重启：当发生异常，机器人自动退出后，支持自动重启
+ [x] 错误重试：当 chatgpt 未回复时，尝试三次，减少 chatgpt 罢工几率
+ [x] 命名模式：支持为你的机器人命名
+ [x] 连续对话：支持上下文消息
+ [x] MidJourney：支持 MidJourney 绘制
+ [x] 次数限制：支持每天限制 N 条消息，超出次数通过红包解锁
+ [x] 自动通过：配置关键词可自动通过好友
+ [x] 客服模式：配置文档作为文档库，作为客户消息来源
+ [ ] 邀请入群：将机器人邀请入群则可以获得更多免费消息
+ [ ] 管理后台：可通过管理后台自动配置机器人
+ [ ] 管理模式：内置管理员模式，可查看每个用户的对话次数
+ [ ] 查看余额：可查看该 key 还有多少余额，仅供管理员查看
+ [ ] PDF阅读：可阅读 PDF 等文件，并根据 PDF 内容进行回答
+ [ ] URL阅读：可阅读 URL 等内容，并根据 URL 内容进行回答
+ [ ] 自动总结：转发公众号文章链接至机器人，自动总结内容

功能呢截图及文档见：<https://bot.prochat.tech/wechat/feature>

如果需要搭建基于 ChatGPT 的飞书、钉钉、企微内部应用、公众号机器人，可参考个人的另一项目 [feishu-chatgpt](https://github.com/shfshanyue/feishu-chatgpt)。

## 环境要求

1. `node.js >= 18`
2. 基于 Web 协议的机器人最近有可能被封禁，可采用 iPad 其它协议的机器人，可在 `index.ts` 中更换其他 `Puppet`。

## 配置与环境变量

编辑 `./config.ts` 配置文件。

``` ts
export default {
  // 自动同意添加好友的口令
  acceptText: /ChatGPT/,

  // 如果微信机器人跑在国内，必须配置该项，其为官方 API 在国内的代理
  baseURL: process.env.BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.OPEN_API_KEY.split(','),
  model: process.env.GPT_MODEL || 'gpt-3.5-turbo',
  // 通过 prompt 可以配置为各种各样的机器人，如翻译、面试、SQL 生成器等。
  prompt: process.env.PROMPT || '',

  // 判断在哪里开启机器人，默认是私聊以及艾特机器人的群聊
  // 是否开启群聊模式，可使用正则以及 boolen，如果是正则用以决定在那些群开启群聊
  enableGroup: /^(技术交流群|面试直通车|学习)$/,
  // enableGroup: true,

  // 是否开启私聊模式，可使用正则以及 boolen，如果是正则用以决定与谁私聊
  // enablePrivate: true,
  enablePrivate: /(山月)/,

  // 私聊模式时，配置关键词触发
  groupPrefix: '',

  // 私聊模式时，配置关键词触发
  privatePrefix: '山月',

  // 开启异常报错上传 sentry
  sentryDsn: process.env.SENTRY_DSN || ''
}
```

对于 OpenAI 的 `key` 及国内代理 BaseURL 等敏感数据，可以置于环境变量中，编辑 `.env` 配置文件。

``` .env
OPEN_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxybnC"
```

其中，`OPEN_API_KEY` 支持多个 `key` 负载均衡，在环境变量中使用 `,` 隔开

``` .env
OPEN_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxybnC,k-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxybnC,k-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxybnC"
```

| Name                | Description | Default                |
|---------------------|-------------|------------------------|
| OPEN_API_KEY        |             | gpt-3.5-turbo          |
| BASE_URL            |             | null                   |
| PROMPT              |             | null                   |
| WECHATY_PUPPET      |             | wechaty-puppet-wechat  |
| MJ_SALAI_TOKEN      | Midjorney 的 User Token，如何获取见 [如何获取 Midjourney 的 token](https://www.androidauthority.com/get-discord-token-3149920/)             |                        |
| MJ_SERVER_ID       | Midjorney 的 ServerID |                        |
| MJ_CHANNEL_ID      | Midjorney 的 ChannelID |                        |
| DEFAULT_FREE_CREDIT | 默认每天的免费使用次数，ChatGPT 算一次，MidJourney 算十次 | 1000                       |
| OSS_REGION= | OSS 配置，存储 MidJourney 图片，选填 | |
| OSS_ACCESS_KEY_ID= | OSS 配置，存储 MidJourney 图片 | |
| OSS_ACCESS_KEY_SECRET= | OSS 配置，存储 MidJourney 图片 | |
| OSS_BUCKET= | OSS 配置，存储 MidJourney 图片 | |

## 每天次数限制配置

为了避免 MidJourney 及 ChatGPT 每天耗费额度过大，可通过环境变量 `DEFAULT_FREE_CREDIT` 可配置每用户每天限制使用次数，默认为 100 次点数。

默认消耗次数规则为：

1. ChatGPT 提问消耗一次点数
1. Midjourney 画图消耗五次点数
1. Midjourney 图生图消耗五次点数
1. Midjourney 图生文消耗三次点数

## 企业微信

如果需要企业微信作为机器人，请编辑环境变量，更换 PUPPET

``` bash
# 如果是企业微信的话，使用以下两行代码
WECHATY_PUPPET_SERVICE_TOKEN="puppet_workpro_xxxxxxxxx"
WECHATY_PUPPET="wechaty-puppet-service"
```

## 步骤

1. 编辑环境变量

``` bash
$ cp .example.env .env
```

并编辑以下环境变量。**注意，如果你在国内服务器部署，必须配置 `BASE_URL` 环境变量，其为 OpenAI 在国内的代理 API，需自行搭建**。

``` bash
# 如果部署在 vercel 等境外服务器，则不需要此项配置
# 如果部署在境内，可以使用山月的临时代理 API，不过强烈建议自行搭建
BASE_URL="https://ai.devtool.tech/proxy"
OPEN_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

2. 编辑是否允许群聊以及私聊

编辑 `./config.ts`，配置是否开启群聊以及私聊模式。

``` js
{
  // 判断在哪里开启机器人，默认是私聊以及艾特机器人的群聊
  // 是否开启群聊模式，可使用正则以及 boolen，如果是正则用以决定在那些群开启群聊
  enableGroup: true,

  // 或者只允许在特定的群开启群聊
  enableGroup: /^(技术交流群|面试直通车|学习)$/,

  // 是否开启私聊模式，可使用正则以及 boolen，如果是正则用以决定与谁私聊
  enablePrivate: true,

  // 或者只允许对特定的人开启私聊
  enablePrivate: /(山月)/,

  // 私聊模式时，配置关键词触发
  groupPrefix: '',

  // 私聊模式时，配置关键词触发
  privatePrefix: '山月',
}
```

3. 开启一个微信机器人，使用将要作为机器人的微信扫码进行登录

``` bash
$ apt install redis
$ apt install ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

$ pnpm i
$ npx prisma generate

$ pnpm start
```

此时会出现二维码链接，通过链接链接打开二维码，扫码登录。待出现登录成功字样时，则机器人成功开启。

4. 健康检查

向机器人发送 `/ping` 指定，它会默认回复 `pong`。以确保机器人已经正常工作。

<img src="https://static.shanyue.tech/images/23-03-31/clipboard-7744.654969.webp" width="400">

5. 与机器人对话

<img src="https://static.shanyue.tech/images/23-03-31/clipboard-5702.703b02.webp" width="400">

## 部署方式

### Docker

``` bash
# 启动服务，并在后台启动
$ docker compose up -d --build

# 查看日志，并扫码登录
$ docker compose logs --tail 100 --follow
```

### 私有化部署

在本地操作：

``` bash
$ npm run build
$ rsync -lahvz --exclude ./lib --exclude ./message --exclude logs --exclude node_modules --exclude .env --exclude .git . shanyue:/home/shanyue/Documents/wechat-chatgpt-prod
```

在目标服务器：

``` bash
# 同时修改 /etc/hosts
$ apt install redis
$ apt install ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

$ pnpm i
$ npx prisma generate
$ pnpm start:prod
```

## 商务合作与交流

如果开源版无法满足您团队或公司的需求，推荐我们团队商业开发的基于 ChatGPT 的飞书、钉钉、企微内部应用、公众号、个人微信、企业微信的 SaaS 平台。

1. 基于 ChatGPT 的飞书、钉钉、企微内部应用、公众号、个人微信、企业微信的 SaaS 平台 (内测中)
1. 企业级私有部署服务或者 Sass 部署
1. 若仅仅需要提供部署服务指导，可付费咨询，订阅包年服务
1. 若需二次开发定制服务，可付费开发

<img src="https://static.shanyue.tech/images/23-04-02/wechat.892011.webp" width="600">

