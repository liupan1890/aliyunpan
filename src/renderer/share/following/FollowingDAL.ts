import AliFollowing from '../../aliapi/following'
import { IAliOtherFollowingModel } from '../../aliapi/alimodels'
import message from '../../utils/message'
import useOtherFollowingStore from './OtherFollowingStore'
import useMyFollowingStore from './MyFollowingStore'
import { throttle } from '../../utils/debounce'

export default class FollowingDAL {
  
  static async aReloadOtherFollowingList(user_id: string, force: boolean): Promise<void> {
    if (!user_id) return
    const otherfollowingStore = useOtherFollowingStore()
    if (!force && otherfollowingStore.TuiJianLoaded) return 
    if (otherfollowingStore.TuiJianLoading == true) return
    otherfollowingStore.TuiJianLoading = true
    const resp = await AliFollowing.ApiOtherFollowingListAll(user_id)
    otherfollowingStore.aSaveOtherFollowingList('官方推荐', 'arcoblue', resp.items)

    const classed = await AliFollowing.ApiOtherFollowingClassListAll()

    const map = new Map<string, IAliOtherFollowingModel[]>()
    for (let i = 0, maxi = classed.length; i < maxi; i++) {
      const item = classed[i]
      if (!item.class_name) continue
      if (map.has(item.class_name) == false) map.set(item.class_name, [])
      const list = map.get(item.class_name)!
      const add: IAliOtherFollowingModel = {
        avatar: item.avatar || '',
        phone: '',
        is_following: false,
        description: item.description,
        user_id: item.user_id,
        nick_name: item.nick_name,
        follower_count: item.follower_count
      }
      list.push(add)
    }

    const entries = map.entries()
    for (let i = 0, maxi = map.size; i < maxi; i++) {
      const entry = entries.next().value
      if (entry[1].length > 0) otherfollowingStore.aSaveOtherFollowingList(entry[0] + ' (' + entry[1].length + ')', 'orangered', entry[1])
    }

    otherfollowingStore.TuiJianLoading = false
    otherfollowingStore.TuiJianLoaded = true
  }

  
  static async aReloadMyFollowing(user_id: string, force: boolean): Promise<void> {
    if (!user_id) return
    const myfollowingStore = useMyFollowingStore()
    if (!force && myfollowingStore.ListDataRaw.length > 0) return 
    if (myfollowingStore.ListLoading == true) return
    myfollowingStore.ListLoading = true
    const resp = await AliFollowing.ApiMyFollowingListAll(user_id)
    myfollowingStore.aLoadListData(resp.items)
    myfollowingStore.ListLoading = false
  }

  static onRFollowing = throttle((user_id: string) => {
    FollowingDAL.aReloadMyFollowing(user_id, true)
  }, 3000)

  
  static async aSetFollowing(user_id: string, followingid: string, isFollowing: boolean): Promise<void> {
    await AliFollowing.ApiSetFollowing(user_id, followingid, isFollowing, true)
    useMyFollowingStore().mSetFollowing(followingid, isFollowing)
    FollowingDAL.onRFollowing(user_id) 
  }

  
  static async aSetFollowingBatch(user_id: string, idList: string[], isFollowing: boolean): Promise<void> {
    let followingid = ''
    for (let i = 0, maxi = idList.length; i < maxi; i++) {
      followingid = idList[i]
      message.info((isFollowing ? '' : '取消') + '订阅中( ' + i + ' / ' + maxi + ' )', 3, 'aSetFollowingBatch' + isFollowing)
      await AliFollowing.ApiSetFollowing(user_id, followingid, isFollowing, false)
      useMyFollowingStore().mSetFollowing(followingid, isFollowing)
    }
    message.success((isFollowing ? '订阅' : '取消订阅') + ' 成功', 3, 'aSetFollowingBatch' + isFollowing)
  }

  
  static aSetFollowingText(user_id: string, text: string, isFollowing: boolean): Promise<boolean> {
    const idList: string[] = []

    
    
    text = text.replaceAll('/drive/subscription', '')
    let index = text.indexOf('aliyundrive.com/u/')
    while (index > 0) {
      let id = text.substring(index + 'aliyundrive.com/u/'.length)

      
      if (id.length > 50) id = id.substring(0, 50)
      if (id.indexOf('/') > 0) id = id.substring(0, id.indexOf('/'))
      if (id.indexOf('#') > 0) id = id.substring(0, id.indexOf('#'))
      if (id.indexOf('?') > 0) id = id.substring(0, id.indexOf('?'))
      if (id.indexOf('&') > 0) id = id.substring(0, id.indexOf('&'))
      id = id.trim()
      if (id.length == 32 && /^[A-Za-z0-9]+$/.test(id) && idList.includes(id) == false) idList.push(id)
      text = text.substring(index + 'aliyundrive.com/u/'.length)
      index = text.indexOf('aliyundrive.com/u/')
    }

    if (idList.length == 0) {
      message.error('解析订阅链接失败，格式错误')
      return Promise.resolve(false) 
    }
    return FollowingDAL.aSetFollowingBatch(user_id, idList, isFollowing).then(() => true)
  }
}
