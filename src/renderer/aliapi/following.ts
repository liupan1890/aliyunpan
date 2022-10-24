import { humanTimeAgo } from '../utils/format'
import message from '../utils/message'
import DebugLog from '../utils/debuglog'
import AliHttp, { IUrlRespData } from './alihttp'
import { IAliOtherFollowingModel, IAliMyFollowingModel } from './alimodels'

export interface IAliOtherFollowingResp {
  items: IAliOtherFollowingModel[]
  itemsKey: Set<string>
  next_marker: string

  m_time: number 
  m_user_id: string 
}
export interface IAliMyFollowingResp {
  items: IAliMyFollowingModel[]
  itemsKey: Set<string>
  next_marker: string

  m_time: number 
  m_user_id: string 
}
export default class AliFollowing {
  
  static async ApiOtherFollowingListAll(user_id: string): Promise<IAliOtherFollowingResp> {
    const dir: IAliOtherFollowingResp = {
      items: [],
      itemsKey: new Set(),
      next_marker: '',
      m_time: 0,
      m_user_id: user_id
    }

    do {
      const isGet = await AliFollowing.ApiOtherFollowingListOnePage(dir)
      if (isGet != true) {
        break 
      }
    } while (dir.next_marker)
    return dir
  }

  static async ApiOtherFollowingListOnePage(dir: IAliOtherFollowingResp): Promise<boolean> {
    const url = 'adrive/v1/timeline/user/recommend'
    let postData = {
      user_id: dir.m_user_id,
      limit: 100,
      order_by: 'updated_at',
      order_direction: 'DESC'
    }
    if (dir.next_marker) postData = Object.assign(postData, { marker: dir.next_marker })
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    return AliFollowing._OtherFollowingListOnePage(dir, resp)
  }

  private static _OtherFollowingListOnePage(dir: IAliOtherFollowingResp, resp: IUrlRespData): boolean {
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        dir.next_marker = resp.body.next_marker || ''

        for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
          const item = resp.body.items[i] as IAliOtherFollowingModel
          if (dir.itemsKey.has(item.user_id)) continue
          const add = Object.assign({}, item)
          dir.items.push(add)
          dir.itemsKey.add(add.user_id)
        }

        return true
      } else if (resp.code == 404) {
        
        dir.items.length = 0
        dir.next_marker = ''
        return true
      } else if (resp.body && resp.body.code) {
        dir.items.length = 0
        dir.next_marker = resp.body.code
        message.warning('列出官方推荐列表出错' + resp.body.code, 2)
        return false
      } else {
        DebugLog.mSaveWarning('_OtherFollowingListOnePage err=' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveDanger('_OtherFollowingListOnePage', err)
    }
    dir.next_marker = 'error ' + resp.code
    return false
  }

  

  
  static async ApiMyFollowingListAll(user_id: string): Promise<IAliMyFollowingResp> {
    const dir: IAliMyFollowingResp = {
      items: [],
      itemsKey: new Set(),
      next_marker: '',
      m_time: 0,
      m_user_id: user_id
    }

    do {
      const isGet = await AliFollowing.ApiMyFollowingListOnePage(dir)
      if (isGet != true) {
        break 
      }
    } while (dir.next_marker)
    return dir
  }

  static async ApiMyFollowingListOnePage(dir: IAliMyFollowingResp): Promise<boolean> {
    const url = 'adrive/v1/member/list_following'
    const postData = {
      marker: dir.next_marker,
      limit: 100,
      order_by: 'updated_at',
      order_direction: 'DESC'
    }
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    return AliFollowing._MyFollowingListOnePage(dir, resp)
  }

  private static _MyFollowingListOnePage(dir: IAliMyFollowingResp, resp: IUrlRespData): boolean {
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        dir.next_marker = resp.body.next_marker || ''

        for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
          const item = resp.body.items[i] as IAliMyFollowingModel
          if (dir.itemsKey.has(item.user_id)) continue
          const add = Object.assign({}, item)
          if (add.latest_messages && add.latest_messages.length > 0) {
            for (let j = 0; j < add.latest_messages.length; j++) {
              add.latest_messages[j].createdstr = humanTimeAgo(add.latest_messages[j].created)
            }
          } else {
            add.latest_messages = [
              {
                action: '',
                content: {
                  file_id_list: [],
                  share: { popularity: 0, popularity_emoji: '', popularity_str: '', share_id: '', share_pwd: '' }
                },
                created: 0,
                createdstr: '',
                creator: { avatar: '', description: '', is_following: false, nick_name: '', phone: '', user_id: '', follower_count: 0 },
                creator_id: '',
                display_action: '',
                sequence_id: 0
              }
            ]
          }
          dir.items.push(add)
          dir.itemsKey.add(add.user_id)
        }

        return true
      } else if (resp.code == 404) {
        
        dir.items.length = 0
        dir.next_marker = ''
        return true
      } else if (resp.body && resp.body.code) {
        dir.items.length = 0
        dir.next_marker = resp.body.code
        message.warning('列出订阅列表出错' + resp.body.code, 2)
        return false
      } else {
        DebugLog.mSaveWarning('_MyFollowingListOnePage err=' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveDanger('_MyFollowingListOnePage', err)
    }
    dir.next_marker = 'error ' + resp.code
    return false
  }

  
  static async ApiSetFollowing(user_id: string, followingid: string, isFollowing: boolean, tip: boolean): Promise<void> {
    if (!user_id || !followingid || !followingid) return
    let url = 'adrive/v1/member/follow_user'
    if (!isFollowing) url = 'adrive/v1/member/unfollow_user'
    const postData = JSON.stringify({ user_id: followingid })
    const resp = await AliHttp.Post(url, postData, user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      if (tip) message.success(isFollowing ? '订阅成功' : '取消订阅成功')
    } else {
      DebugLog.mSaveWarning('ApiSetFollowing err=' + followingid + ' ' + (resp.code || ''))
      message.error((isFollowing ? '订阅' : '取消订阅') + ' 操作失败，请稍后重试')
    }
  }

  
  static async ApiSetFollowingMarkRead(user_id: string, followingid: string): Promise<boolean> {
    if (!user_id || !followingid) return false
    const url = 'adrive/v1/member/mark_read'
    const postData = JSON.stringify({ user_id: followingid })
    const resp = await AliHttp.Post(url, postData, user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      return true
    } else {
      DebugLog.mSaveWarning('ApiSetFollowingMarkRead err=' + followingid + ' ' + (resp.code || ''))
      return false
    }
  }
  

  
  static async ApiOtherFollowingClassListAll() {
    const url = 'https://gitee.com/liupanxiaobaiyang/aliyunpan/raw/master/follow.json'
    const resp = await AliHttp.Get(url, '')
    return resp.body?.FollowList || []
  }
}
