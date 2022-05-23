import UserDAL from '@/user/userdal'
import { humanSize, Sleep } from '@/utils/format'
import { ITokenInfo } from '@/user/userstore'
import AliHttp from './alihttp'
import message from '@/utils/message'


export const TokenReTimeMap = new Map<string, number>()
export const TokenLockMap = new Map<string, number>()
export default class AliUser {
  
  static async _ApiTokenRefresh(token: ITokenInfo, showMessage: boolean): Promise<boolean> {
    while (true) {
      const lock = TokenLockMap.has(token.user_id)
      if (lock) await Sleep(1000)
      else break
    }
    TokenLockMap.set(token.user_id, Date.now())
    const time = TokenReTimeMap.get(token.user_id) || 0 
    if (Date.now() - time < 1000 * 60 * 5) return true 

    const url = 'token/refresh'
    

    const postdata = { refresh_token: token.refresh_token }
    const resp = await AliHttp.Post(url, postdata, '', '')
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
    } else if (showMessage) {
      message.error('刷新账号[' + token.user_name + '] token 失败,需要重新登录')
      UserDAL.UserLogOff(token.user_id)
    }
    return false
  }

  
  static async ApiTokenRefreshAccount(token: ITokenInfo, showMessage: boolean): Promise<boolean> {
    while (true) {
      const lock = TokenLockMap.has(token.user_id)
      if (lock) await Sleep(1000)
      else break
    }
    TokenLockMap.set(token.user_id, Date.now())
    const time = TokenReTimeMap.get(token.user_id) || 0 
    if (Date.now() - time < 1000 * 60 * 5) return true 

    const url = 'https://auth.aliyundrive.com/v2/account/token'
    
    const postdata = { refresh_token: token.refresh_token, grant_type: 'refresh_token' }
    const resp = await AliHttp.Post(url, postdata, '', '')
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
    } else if (showMessage) {
      message.error('刷新账号[' + token.user_name + '] token 失败,需要重新登录')
      UserDAL.UserLogOff(token.user_id)
    }
    return false
  }

  
  static async ApiUserInfo(token: ITokenInfo): Promise<boolean> {
    const url = 'v2/databox/get_personal_info'
    const postdata = ''
    const resp = await AliHttp.Post(url, postdata, token.user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      token.used_size = resp.body.personal_space_info.used_size
      token.total_size = resp.body.personal_space_info.total_size
      token.spu_id = resp.body.personal_rights_info.spu_id
      token.is_expires = resp.body.personal_rights_info.is_expires
      token.name = resp.body.personal_rights_info.name
      token.spaceinfo = humanSize(token.used_size) + ' / ' + humanSize(token.total_size)
      return true
    }
    return false
  }

  

  
  static async ApiUserPic(token: ITokenInfo): Promise<boolean> {
    const url = 'adrive/v1/user/albums_info'
    

    const postdata = {}
    const resp = await AliHttp.Post(url, postdata, token.user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      token.pic_drive_id = resp.body.data.driveId
      return true
    }
    return false
  }
}
