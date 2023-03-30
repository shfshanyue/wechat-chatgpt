import _ from 'lodash'
import { Contact, Room } from 'wechaty'

const hello = (contact: Contact) => _.trim(`
欢迎新人入群, 请注意修改昵称 (eg. 山月-前端-北京)

---
由山月自制机器人发送，目前支持面试，基金关键字回复

博客: https://shanyue.tech
github: https://github.com/shfshanyue
`)

export const handleRoomJoin = (room: Room, inviteeList: Contact[], inviter: Contact) => {
  // 如果被邀请进个人群，则打招呼
  if ([/* 个人群的群主 ID 列表 */].includes(room.owner().id)) {
    inviteeList.forEach(c => {
      room.say(hello(c), c)
    })
  }
}
