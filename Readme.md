# wechaty bot

三分钟，创建一个微信机器人。

> 本项目托管在我的服务器上: [个人服务器运维指南](https://shanyue.tech/op/)
> 欢迎关注我的博客: [山月行](https://github.com/shfshanyue/blog)

## 技术栈

+ [wechaty](https://github.com/wechaty/wechaty)

> Wechaty is a Bot SDK for Wechat Individual Account which can help you create a bot in 6 lines of javascript, with cross-platform support including Linux, Windows, MacOS, and Docker.

## 目录结构

``` bash
$ tree -L 1
.
├── Readme.md
├── event/           # 关于 wechaty 的事件处理程序
├── message/
├── schedule
├── config.ts
└── index.ts
```

## 步骤

1. 开启一个微信机器人，使用将要作为机器人的微信扫码进行登录

``` bash
$ npm start
```

2. 与机器人对话，机器人默认原样回复

<img src="https://static.shanyue.tech/images/23-03-22/clipboard-0923.93bec5.webp" width="400">

## 交流

<img src="https://static.shanyue.tech/images/23-03-22/clipboard-5137.800093.webp" width="300">

