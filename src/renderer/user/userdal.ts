import DB from '../utils/db'
import AliUser from '../aliapi/user'
import message from '../utils/message'
import useUserStore, { ITokenInfo } from './userstore'
import { usePanTreeStore, usePanFileStore, useMyShareStore, useMyFollowingStore, useOtherFollowingStore, useAppStore, useFootStore } from '../store'
import PanDAL from '../pan/pandal'
import DebugLog from '../utils/debuglog'

export const UserTokenMap = new Map<string, ITokenInfo>()

export default class UserDAL {
  
  static async aLoadFromDB() {
    const tokenList = await DB.getUserAll()
    const defaultUser = await DB.getValueString('uiDefaultUser')
    let defaultUserAdd = false
    UserTokenMap.clear()
    if (defaultUser) {
      
      try {
        for (let i = 0, maxi = tokenList.length; i < maxi; i++) {
          const token = tokenList[i]
          if (token.user_id == defaultUser && token.user_id) {
            const isLogin = await AliUser.ApiTokenRefreshAccount(token, false) 
            if (isLogin) {
              defaultUserAdd = true
              await this.UserLogin(token).catch(() => {}) 
              break
            }
          }
        }
      } catch (err: any) {
        DebugLog.mSaveDanger('aLoadFromDB defaultUser', err)
      }
    }

    for (let i = 0, maxi = tokenList.length; i < maxi; i++) {
      const token = tokenList[i]
      try {
        if (token.user_id != defaultUser && token.user_id) {
          const isLogin = await AliUser.ApiTokenRefreshAccount(token, false) 
          if (isLogin) {
            if (defaultUserAdd == false) {
              
              defaultUserAdd = true
              await this.UserLogin(token).catch(() => {}) 
            }
          }
        }
      } catch (err: any) {
        DebugLog.mSaveDanger('aLoadFromDB allUser ' + i + ' ' + token.user_id, err)
      }
    }
    console.log('defaultUserAdd', defaultUserAdd)
    if (defaultUserAdd == false) {
      
      useUserStore().userShowLogin = true
    }
  }

  
  static async aRefreshAllUserToken() {
    const tokenList = await DB.getUserAll()
    const dateNow = new Date().getTime()
    for (let i = 0, maxi = tokenList.length; i < maxi; i++) {
      const token = tokenList[i]
      try {
        const expire_time = new Date(token.expire_time).getTime()
        
        if (expire_time - dateNow < 1800000) await AliUser.ApiTokenRefreshAccount(token, false)
      } catch (err: any) {
        DebugLog.mSaveDanger('aRefreshAllUserToken', err)
      }
    }
  }

  static GetUserToken(user_id: string): ITokenInfo {
    if (user_id && UserTokenMap.has(user_id)) return UserTokenMap.get(user_id)!

    return {
      tokenfrom: 'token',
      access_token: '',
      refresh_token: '',
      expires_in: 0,
      token_type: '',
      user_id: '',
      user_name: '',
      avatar: '',
      nick_name: '',
      default_drive_id: '',
      default_sbox_drive_id: '' ,
      role: '',
      status: '',
      expire_time: '',
      state: '',
      pin_setup: false,
      is_first_login: false,
      need_rp_verify: false,
      name: '',
      spu_id: '',
      is_expires: false,
      used_size: 0,
      total_size: 0,
      spaceinfo: '',
      vipname: '',
      vipexpire: '',
      pic_drive_id: ''
    }
  }

  static async GetUserTokenFromDB(user_id: string) {
    if (!user_id) return undefined
    if (UserTokenMap.has(user_id)) return UserTokenMap.get(user_id)
    const user = await DB.getUser(user_id)
    if (user) UserTokenMap.set(user.user_id, user)
    return user
  }

  
  static async ClearUserTokenMap() {
    UserTokenMap.clear()
  }

  static GetUserList() {
    const list: ITokenInfo[] = []
    // eslint-disable-next-line no-unused-vars
    for (const [_, token] of UserTokenMap) {
      list.push(token)
    }
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }

  
  static SaveUserToken(token: ITokenInfo) {
    if (token.user_id) {
      UserTokenMap.set(token.user_id, token)
      DB.saveUser(token)
        .then(() => {
          window.WinMsgToUpload({ cmd: 'ClearUserToken' })
          window.WinMsgToDownload({ cmd: 'ClearUserToken' })
        })
        .catch(() => {})
    }
  }

  
  static async UserLogin(token: ITokenInfo) {
    const loadingKey = 'userlogin_' + Date.now().toString()
    message.loading('加载用户信息中...', 0, loadingKey)
    UserTokenMap.set(token.user_id, token)

    
    
    await Promise.all([AliUser.ApiUserInfo(token), AliUser.ApiUserPic(token), AliUser.ApiUserVip(token)]).catch(() => {})

    useUserStore().userLogin(token.user_id)
    await DB.saveValueString('uiDefaultUser', token.user_id)
    UserDAL.SaveUserToken(token)
    window.WebUserToken({ user_id: token.user_id, name: token.user_name, access_token: token.access_token, login: true })

    
    useAppStore().resetTab()
    
    useMyShareStore().$reset()
    useMyFollowingStore().$reset()
    useOtherFollowingStore().$reset()
    useFootStore().mSaveUserInfo(token)

    
    PanDAL.aReLoadDrive(token.user_id, token.default_drive_id)
    PanDAL.aReLoadQuickFile(token.user_id)
    // PanDAL.aReLoadDirSizeFromDB(token.user_id, token.pic_drive_id)
    // PanDAL.GetAllDirList(token.user_id, token.pic_drive_id) 

    message.success('加载用户成功!', 2, loadingKey)
  }

  
  static async UserLogOff(user_id: string): Promise<boolean> {
    DB.deleteUser(user_id)
    UserTokenMap.delete(user_id)

    
    let newUserID = ''
    for (const [user_id, token] of UserTokenMap) {
      const isLogin = token.user_id && (await AliUser.ApiTokenRefreshAccount(token, false))
      if (isLogin) {
        await this.UserLogin(token).catch(() => {})
        newUserID = user_id
        break
      }
    }
    
    if (!newUserID) {
      useUserStore().userLogOff()
      usePanTreeStore().$reset() 
      usePanFileStore().$reset() 
      useUserStore().userShowLogin = true 
    }
    return newUserID != '' 
  }

  static async UserClearFromDB(user_id: string): Promise<void> {
    DB.deleteUser(user_id)
    UserTokenMap.delete(user_id)
  }

  
  static async UserChange(user_id: string): Promise<boolean> {
    if (UserTokenMap.has(user_id) == false) return false
    const token = UserTokenMap.get(user_id)!

    const isLogin = token.user_id && (await AliUser.ApiTokenRefreshAccount(token, false))
    if (isLogin == false) {
      message.warning('该账号需要重新登陆[' + token.name + ']')
      DB.deleteUser(user_id)
      UserTokenMap.delete(user_id)
      return false
    }

    await this.UserLogin(token).catch(() => {}) 
    return true
  }

  
  static async UserRefreshByUserFace(user_id: string, force: boolean): Promise<boolean> {
    const token = UserDAL.GetUserToken(user_id)
    if (!token || !token.access_token) {
      return false
    }

    let time = Date.now() - (new Date(token.expire_time).getTime() - token.expires_in * 1000) 
    time = time / 1000 

    if (force === false || time < 600) {
      
      await Promise.all([AliUser.ApiUserInfo(token), AliUser.ApiUserPic(token), AliUser.ApiUserVip(token)]).catch(() => {})
      return true 
    } else {
      
      const isLogin = token.user_id && (await AliUser.ApiTokenRefreshAccount(token, true))
      if (isLogin == false) return false 

      
      await Promise.all([AliUser.ApiUserInfo(token), AliUser.ApiUserPic(token), AliUser.ApiUserVip(token)]).catch(() => {})
      useUserStore().userLogin(token.user_id)
      return true
    }
  }

  
  static CurrUserToken(): string {

    return ''
  }
}
