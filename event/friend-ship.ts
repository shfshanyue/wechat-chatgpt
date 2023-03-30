import { Friendship } from 'wechaty'
import { Friendship as FriendshipType } from 'wechaty-puppet/types'
import config from '../config'

// 添加好友
export const handleFriendShip = async (friendship: Friendship) => {
  if (friendship.type() === FriendshipType.Receive) {
    if (config.acceptText.test(friendship.hello())) {
      await friendship.accept()
    }
  }
}
