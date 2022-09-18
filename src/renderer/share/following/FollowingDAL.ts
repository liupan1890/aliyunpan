import AliFollowing from '../../aliapi/following'
import { IAliOtherFollowingModel } from '../../aliapi/alimodels'
import message from '../../utils/message'
import useOtherFollowingStore from './OtherFollowingStore'
import useMyFollowingStore from './MyFollowingStore'
import { throttle } from '../../utils/debounce'

export default class FollowingDAL {
  
  static async aReloadOtherFollowingList(user_id: string, force: boolean) {
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
      let item = classed[i]
      if (!item.class_name) continue
      if (map.has(item.class_name) == false) map.set(item.class_name, [])
      let list = map.get(item.class_name)!
      let add: IAliOtherFollowingModel = {
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

    let entries = map.entries()
    for (let i = 0, maxi = map.size; i < maxi; i++) {
      let entry = entries.next().value
      if (entry[1].length > 0) otherfollowingStore.aSaveOtherFollowingList(entry[0] + ' (' + entry[1].length + ')', 'orangered', entry[1])
    }

    otherfollowingStore.TuiJianLoading = false
    otherfollowingStore.TuiJianLoaded = true
  }
  
  static async aReloadMyFollowing(user_id: string, force: boolean) {
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
  
  static async aSetFollowing(user_id: string, followingid: string, following: boolean) {
    await AliFollowing.ApiSetFollowing(user_id, followingid, following, true)
    useMyFollowingStore().mSetFollowing(followingid, following)
    FollowingDAL.onRFollowing(user_id) 
  }
  
  static async aSetFollowingBatch(user_id: string, idlist: string[], following: boolean) {
    let followingid = ''
    for (let i = 0, maxi = idlist.length; i < maxi; i++) {
      followingid = idlist[i]
      message.info((following ? '' : '取消') + '订阅中( ' + i + ' / ' + maxi + ' )', 3, 'aSetFollowingBatch' + following)
      await AliFollowing.ApiSetFollowing(user_id, followingid, following, false)
      useMyFollowingStore().mSetFollowing(followingid, following)
    }
    message.success((following ? '订阅' : '取消订阅') + ' 成功', 3, 'aSetFollowingBatch' + following)
  }
  
  static aSetFollowingText(user_id: string, text: string, following: boolean) {
    let idlist: string[] = []

    
    
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
      if (id.length == 32 && /^[A-Za-z0-9]+$/.test(id) && idlist.includes(id) == false) idlist.push(id)
      text = text.substring(index + 'aliyundrive.com/u/'.length)
      index = text.indexOf('aliyundrive.com/u/')
    }

    if (idlist.length == 0) {
      message.error('解析订阅链接失败，格式错误')
      return Promise.resolve(false) 
    }
    return FollowingDAL.aSetFollowingBatch(user_id, idlist, following).then(() => true)
  }
}
