import UserDAL from '../user/userdal'
import { humanDateTime, humanDateTimeDateStr, humanSize, Sleep } from '../utils/format'
import { ITokenInfo } from '../user/userstore'
import AliHttp from './alihttp'
import message from '../utils/message'
import DebugLog from '../utils/debuglog'
import { IAliUserDriveCapacity, IAliUserDriveDetails } from './models'


export const TokenReTimeMap = new Map<string, number>()
export const TokenLockMap = new Map<string, number>()
export default class AliUser {
  
  static async _ApiTokenRefresh(token: ITokenInfo, showMessage: boolean): Promise<boolean> {
    if (!token.refresh_token) return false
    while (true) {
      const lock = TokenLockMap.has(token.user_id)
      if (lock) await Sleep(1000)
      else break
    }
    TokenLockMap.set(token.user_id, Date.now())
    const time = TokenReTimeMap.get(token.user_id) || 0 
    if (Date.now() - time < 1000 * 60 * 5) {
      TokenLockMap.delete(token.user_id)
      return true 
    }

    const url = 'token/refresh'
    

    const postData = { refresh_token: token.refresh_token }
    const resp = await AliHttp.Post(url, postData, '', '')
    TokenLockMap.delete(token.user_id)
    if (AliHttp.IsSuccess(resp.code)) {
      TokenReTimeMap.set(resp.body.user_id, Date.now())
      token.tokenfrom = 'token'
      token.access_token = resp.body.access_token
      token.refresh_token = resp.body.refresh_token
      token.expires_in = resp.body.expires_in
      token.token_type = resp.body.token_type
      token.user_id = resp.body.user_id
      token.user_name = resp.body.user_name
      token.avatar = resp.body.avatar
      token.nick_name = resp.body.nick_name
      token.default_drive_id = resp.body.default_drive_id
      token.default_sbox_drive_id = resp.body.default_sbox_drive_id
      token.role = resp.body.role
      token.status = resp.body.status
      token.expire_time = resp.body.expire_time
      token.state = resp.body.state
      token.pin_setup = resp.body.pin_setup
      token.is_first_login = resp.body.is_first_login
      token.need_rp_verify = resp.body.need_rp_verify
      window.WebUserToken({ user_id: token.user_id, name: token.user_name, access_token: token.access_token, refresh: true })
      UserDAL.SaveUserToken(token)
      return true
    } else {
      DebugLog.mSaveWarning('_ApiTokenRefresh err=' + (resp.code || ''))
      if (showMessage) {
        message.error('刷新账号[' + token.user_name + '] token 失败,需要重新登录')
        UserDAL.UserLogOff(token.user_id)
      }
    }
    return false
  }

  
  static async ApiTokenRefreshAccount(token: ITokenInfo, showMessage: boolean): Promise<boolean> {
    if (!token.refresh_token) return false
    while (true) {
      const lock = TokenLockMap.has(token.user_id)
      if (lock) await Sleep(1000)
      else break
    }
    TokenLockMap.set(token.user_id, Date.now())
    const time = TokenReTimeMap.get(token.user_id) || 0 
    if (Date.now() - time < 1000 * 60 * 5) {
      TokenLockMap.delete(token.user_id)
      return true 
    }

    const url = 'https://auth.aliyundrive.com/v2/account/token'
    
    const postData = { refresh_token: token.refresh_token, grant_type: 'refresh_token' }
    const resp = await AliHttp.Post(url, postData, '', '')
    TokenLockMap.delete(token.user_id)
    if (AliHttp.IsSuccess(resp.code)) {
      TokenReTimeMap.set(resp.body.user_id, Date.now())
      token.tokenfrom = 'account'
      token.access_token = resp.body.access_token
      token.refresh_token = resp.body.refresh_token
      token.expires_in = resp.body.expires_in
      token.token_type = resp.body.token_type
      token.user_id = resp.body.user_id
      token.user_name = resp.body.user_name
      token.avatar = resp.body.avatar
      token.nick_name = resp.body.nick_name
      token.default_drive_id = resp.body.default_drive_id
      token.default_sbox_drive_id = resp.body.default_sbox_drive_id
      token.role = resp.body.role
      token.status = resp.body.status
      token.expire_time = resp.body.expire_time
      token.state = resp.body.state
      token.pin_setup = resp.body.pin_setup
      token.is_first_login = resp.body.is_first_login
      token.need_rp_verify = resp.body.need_rp_verify
      window.WebUserToken({ user_id: token.user_id, name: token.user_name, access_token: token.access_token, refresh: true })
      UserDAL.SaveUserToken(token)
      return true
    } else {
      if (resp.body?.code != 'InvalidParameter.RefreshToken') DebugLog.mSaveWarning('ApiTokenRefreshAccount err=' + (resp.code || '') + ' ' + (resp.body?.code || ''))
      if (showMessage) {
        message.error('刷新账号[' + token.user_name + '] token 失败,需要重新登录')
        UserDAL.UserLogOff(token.user_id)
      } else {
        UserDAL.UserClearFromDB(token.user_id)
      }
    }
    return false
  }

  
  static async ApiUserInfo(token: ITokenInfo): Promise<boolean> {
    if (!token.user_id) return false
    const url = 'v2/databox/get_personal_info'
    const postData = ''
    const resp = await AliHttp.Post(url, postData, token.user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      token.used_size = resp.body.personal_space_info.used_size
      token.total_size = resp.body.personal_space_info.total_size
      token.spu_id = resp.body.personal_rights_info.spu_id
      token.is_expires = resp.body.personal_rights_info.is_expires
      token.name = resp.body.personal_rights_info.name
      token.spaceinfo = humanSize(token.used_size) + ' / ' + humanSize(token.total_size)
      return true
    } else {
      DebugLog.mSaveWarning('ApiUserInfo err=' + (resp.code || ''))
    }
    return false
  }

  

  
  static async ApiUserVip(token: ITokenInfo): Promise<boolean> {
    if (!token.user_id) return false
    const url = 'business/v1.0/users/vip/info'
    

    const postData = {}
    const resp = await AliHttp.Post(url, postData, token.user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      let vipList = resp.body.vipList || []
      vipList = vipList.sort((a: any, b: any) => b.expire - a.expire)
      if (vipList.length > 0 && new Date(vipList[0].expire) > new Date()) {
        token.vipname = vipList[0].name
        token.vipexpire = humanDateTime(vipList[0].expire)
      } else {
        token.vipname = '免费用户'
        token.vipexpire = ''
      }
      return true
    } else {
      DebugLog.mSaveWarning('ApiUserPic err=' + (resp.code || ''))
    }
    return false
  }

  
  static async ApiUserPic(token: ITokenInfo): Promise<boolean> {
    if (!token.user_id) return false
    const url = 'adrive/v1/user/albums_info'
    

    const postData = {}
    const resp = await AliHttp.Post(url, postData, token.user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      token.pic_drive_id = resp.body.data.driveId
      return true
    } else {
      DebugLog.mSaveWarning('ApiUserPic err=' + (resp.code || ''))
    }
    return false
  }

  
  static async ApiUserDriveDetails(user_id: string): Promise<IAliUserDriveDetails> {
    const detail: IAliUserDriveDetails = {
      drive_used_size: 0,
      drive_total_size: 0,
      default_drive_used_size: 0,
      album_drive_used_size: 0,
      note_drive_used_size: 0,
      sbox_drive_used_size: 0,
      share_album_drive_used_size: 0
    }
    if (!user_id) return detail
    const url = 'adrive/v1/user/driveCapacityDetails'
    const postData = '{}'
    const resp = await AliHttp.Post(url, postData, user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      detail.drive_used_size = resp.body.drive_used_size || 0
      detail.drive_total_size = resp.body.drive_total_size || 0
      detail.default_drive_used_size = resp.body.default_drive_used_size || 0
      detail.album_drive_used_size = resp.body.album_drive_used_size || 0
      detail.note_drive_used_size = resp.body.note_drive_used_size || 0
      detail.sbox_drive_used_size = resp.body.sbox_drive_used_size || 0
      detail.share_album_drive_used_size = resp.body.share_album_drive_used_size || 0
    } else {
      DebugLog.mSaveWarning('ApiUserDriveDetails err=' + (resp.code || ''))
    }
    return detail
  }

  static async ApiUserDriveFileCount(user_id: string, category: string, type: string): Promise<number> {
    if (!user_id) return 0
    const token = await UserDAL.GetUserTokenFromDB(user_id)
    if (!token) return 0
    const url = 'adrive/v3/file/search'
    const postData = {
      drive_id_list: [token?.default_drive_id, token?.pic_drive_id],
      marker: '',
      limit: 1,
      all: false,
      url_expire_sec: 14400,
      fields: 'thumbnail',
      query: type ? 'type="' + type + '"' : 'category="' + category + '"',
      return_total_count: true
    }
    const resp = await AliHttp.Post(url, postData, user_id, '')
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        return resp.body.total_count || 0
      } else {
        DebugLog.mSaveWarning('ApiUserDriveFileCount err=' + category + ' ' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveDanger('ApiUserDriveFileCount' + category, err)
    }
    return 0
  }

  
  static async ApiUserCapacityDetails(user_id: string): Promise<IAliUserDriveCapacity[]> {
    let result: IAliUserDriveCapacity[] = []
    if (!user_id) return result
    const url = 'adrive/v1/user/capacityDetails'
    const postData = '{}'
    const resp = await AliHttp.Post(url, postData, user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      const list = resp.body.capacity_details || []
      const today = new Date()
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        const item = list[i]
        let expiredstr = ''

        if (item.expired == 'permanent_condition') expiredstr = '永久有效，每年激活'
        else if (item.expired == 'permanent') expiredstr = '永久有效'
        else {
          const data = new Date(item.expired)

          if (data > today) expiredstr = humanDateTimeDateStr(item.expired) + ' 到期'
          else expiredstr = '已过期'
        }

        result.push({
          type: item.type,
          size: item.size,
          sizeStr: humanSize(item.size),
          expired: item.expired,
          expiredstr: expiredstr,
          description: item.description,
          latest_receive_time: humanDateTimeDateStr(item.latest_receive_time)
        } as IAliUserDriveCapacity)
      }
      result = result.sort((a, b) => a.latest_receive_time.localeCompare(b.latest_receive_time))
    } else {
      DebugLog.mSaveWarning('ApiUserCapacityDetails err=' + (resp.code || ''))
    }
    return result
  }
}
