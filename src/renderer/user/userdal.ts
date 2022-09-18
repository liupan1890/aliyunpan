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
    const tokenlist = await DB.getUserAll()
    let defaultUser = await DB.getValueString('uiDefaultUser')
    let defaultUserAdd = false
    UserTokenMap.clear()
    if (defaultUser) {
      
      try {
        for (let i = 0, maxi = tokenlist.length; i < maxi; i++) {
          const token = tokenlist[i]
          if (token.user_id == defaultUser && token.user_id) {
            const islogin = await AliUser.ApiTokenRefreshAccount(token, false) 
            if (islogin) {
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

    for (let i = 0, maxi = tokenlist.length; i < maxi; i++) {
      const token = tokenlist[i]
      try {
        if (token.user_id != defaultUser && token.user_id) {
          const islogin = await AliUser.ApiTokenRefreshAccount(token, false) 
          if (islogin) {
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
    const tokenlist = await DB.getUserAll()
    let datenow = new Date().getTime()
    for (let i = 0, maxi = tokenlist.length; i < maxi; i++) {
      const token = tokenlist[i]
      try {
        let expire_time = new Date(token.expire_time).getTime()
        
        if (expire_time - datenow < 1800000) await AliUser.ApiTokenRefreshAccount(token, false)
      } catch (err: any) {
        DebugLog.mSaveDanger('aRefreshAllUserToken', err)
      }
    }
  }

  static GetUserToken(userID: string): ITokenInfo {
    if (userID && UserTokenMap.has(userID)) return UserTokenMap.get(userID)!

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

  static async GetUserTokenFromDB(userID: string) {
    if (!userID) return undefined
    if (UserTokenMap.has(userID)) return UserTokenMap.get(userID)
    return await DB.getUser(userID)
  }

  static GetUserList() {
    const list: ITokenInfo[] = []
    for (let [id, token] of UserTokenMap) {
      list.push(token)
    }
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }

  
  static SaveUserToken(token: ITokenInfo) {
    if (token.user_id) {
      UserTokenMap.set(token.user_id, token)
      DB.saveUser(token).catch(() => {})
    }
  }

  
  static async UserLogin(token: ITokenInfo) {
    const loadingkey = 'userlogin_' + Date.now().toString()
    message.loading('加载用户信息中...', 0, loadingkey)
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
    //PanDAL.aReLoadDirSizeFromDB(token.user_id, token.pic_drive_id)
    //PanDAL.GetAllDirList(token.user_id, token.pic_drive_id) 

    message.success('加载用户成功!', 2, loadingkey)
  }

  
  static async UserLogOff(userID: string) {
    DB.deleteUser(userID)
    UserTokenMap.delete(userID)

    
    let newUserID = ''
    for (let [user_id, token] of UserTokenMap) {
      const islogin = token.user_id && (await AliUser.ApiTokenRefreshAccount(token, false))
      if (islogin) {
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

  
  static async UserChange(userID: string) {
    if (UserTokenMap.has(userID) == false) return false
    const token = UserTokenMap.get(userID)!

    const islogin = token.user_id && (await AliUser.ApiTokenRefreshAccount(token, false))
    if (islogin == false) {
      message.warning('该账号需要重新登陆[' + token.name + ']')
      DB.deleteUser(userID)
      UserTokenMap.delete(userID)
      return false
    }

    await this.UserLogin(token).catch(() => {}) 
    return true
  }

  
  static async UserRefreshByUserFace(userID: string, force: boolean) {
    let token = UserDAL.GetUserToken(userID)
    if (!token || !token.access_token) {
      return false
    }

    let time = Date.now() - (new Date(token.expire_time).getTime() - token.expires_in * 1000) 
    time = time / 1000 

    if (force === false || time < 600) {
      
      await Promise.all([AliUser.ApiUserInfo(token), AliUser.ApiUserPic(token), AliUser.ApiUserVip(token)]).catch(() => {})
      return true 
    } else {
      
      const islogin = token.user_id && (await AliUser.ApiTokenRefreshAccount(token, true))
      if (islogin == false) return false 

      
      await Promise.all([AliUser.ApiUserInfo(token), AliUser.ApiUserPic(token), AliUser.ApiUserVip(token)]).catch(() => {})
      useUserStore().userLogin(token.user_id)
      return true
    }
  }

  
  static CurrUserToken() {
    const userID = useUserStore().userID
    const token = UserTokenMap.get(userID)
    if (token) {
      return token.user_id + '\n' + token.default_drive_id + '\n' + token.refresh_token + '\n' + token.token_type + ' ' + token.access_token
    }
    return ''
  }
}
