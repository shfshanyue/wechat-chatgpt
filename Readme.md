# ChatGPT 微信机器人

三分钟，创建一个 ChatGPT AI 小助手。

+ 负载均衡：多个 Token 增强其稳定性
+ 场景模式：可通过 PROMPT 配置机器人为专业的翻译、面试官、医生等
+ 群聊控制：可通过正则表达式根据群聊名称控制在哪个群开启机器人
+ 私聊控制：可通过正则表达式根据私聊微信昵称控制开启机器人
+ 支持日志：可查看每天多少条记录

## 配置与环境变量

编辑 `./config.ts` 配置文件。

``` ts
export default {
  // 自动同意添加好友的口令
  acceptText: /芝麻开门/,

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
}
```

对于 OpenAI 的 `key` 及国内代理 BaseURL 等敏感地址，可以置于环境变量中，编辑 `.env` 配置文件。

``` .env
OPEN_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxybnC"
```

其中，`OPEN_API_KEY` 支持多个 `key` 负载均衡，在环境变量中使用 `,` 隔开

``` .env
OPEN_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxybnC,k-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxybnC,k-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxybnC"
```

## 步骤

1. 开启一个微信机器人，使用将要作为机器人的微信扫码进行登录

``` bash
$ npm start
```

2. 与机器人对话

<img src="https://static.shanyue.tech/images/23-03-31/clipboard-5702.703b02.webp" width="400">

## 交流

<img src="https://static.shanyue.tech/images/23-03-22/clipboard-5137.800093.webp" width="300">

