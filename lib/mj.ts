import { Midjourney } from 'midjourney'

console.log(process.env)

export const mjClient = new Midjourney({
  ServerId: <string>process.env.MJ_SERVER_ID,
  ChannelId: <string>process.env.MJ_CHANNEL_ID,
  SalaiToken: <string>process.env.MJ_SALAI_TOKEN,
  Debug: true,
})
