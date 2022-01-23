import { ITokenInfo } from './models'
import DB from '../setting/db'
import { message } from 'antd'
import AliUser from '@/aliapi/user'
import AliFileList from '@/aliapi/filelist'
import PanDAL from './pandal'
import PanStore from './panstore'
import AliFileCmd from '@/aliapi/filecmd'
import { Unicode } from './format'

export const UserTokenMap = new Map<string, ITokenInfo>()

export default class UserDAL {
  static async aLoadFromDB() {
    const tokenlist = await DB.getUserAll()
    let defaultUser = await DB.getValueString('uiDefaultUser')
    let defaultUserAdd = false
    UserTokenMap.clear()
    if (defaultUser) {
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
    }

    for (let i = 0, maxi = tokenlist.length; i < maxi; i++) {
      const token = tokenlist[i]
      if (token.user_id != defaultUser && token.user_id) {
        const islogin = await AliUser.ApiTokenRefreshAccount(token, false)
        if (islogin) {
          if (defaultUserAdd == false) {
            defaultUserAdd = true
            await this.UserLogin(token).catch(() => {})
          }
        }
      }
    }

    if (defaultUserAdd == false) {
      window.getDvaApp()._store.dispatch({ type: 'global/save', showUserInfo: true })
    }
  }

  static GetUserToken(userID: string) {
    if (!userID) return undefined
    return UserTokenMap.get(userID)
  }

  static async GetUserTokenFromDB(userID: string) {
    if (!userID) return undefined
    if (UserTokenMap.has(userID)) return UserTokenMap.get(userID)
    return await DB.getUser(userID)
  }

  static GetUserListFace() {
    let user_id = UserDAL.QueryUserID()
    const list: string[] = []
    if (UserTokenMap.has(user_id)) list.push(UserTokenMap.get(user_id)!.avatar)
    for (let [id, token] of UserTokenMap) {
      if (user_id != id) list.push(token.avatar)
    }
    list.reverse()

    let userfacelist: string[] = []
    for (let i = 0; i < 3 && i < list.length; i++) {
      userfacelist.push(list[i])
    }
    userfacelist.push('userface.png')

    return userfacelist
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
      let oldtoken = UserTokenMap.get(token.user_id)
      if (oldtoken && oldtoken.is_expires == false) {
        if (parseInt(oldtoken.expire_time) > parseInt(token.expire_time)) {
          token.access_token = oldtoken.access_token
          token.token_type = oldtoken.token_type
          token.refresh_token = oldtoken.refresh_token
          token.expire_time = oldtoken.expire_time
          token.expires_in = oldtoken.expires_in
          token.tokenfrom = oldtoken.tokenfrom
        }
      }
      UserTokenMap.set(token.user_id, token)
      DB.saveUser(token).catch(() => {})
    }
  }

  static async UserLogin(token: ITokenInfo) {
    const loadingkey = 'userlogin_' + Date.now().toString()
    message.loading({ content: '加载用户信息中...', key: loadingkey, duration: 0 })
    UserTokenMap.set(token.user_id, token)
    AliFileList.ApiFileListTestLimit(token)
    await Promise.all([AliUser.ApiUserInfo(token), AliUser.ApiUserPic(token)]).catch(() => {})

    window.getDvaApp()._store.dispatch({ type: 'user/mSaveUser', userID: token.user_id })
    await DB.saveValueString('uiDefaultUser', token.user_id)
    UserDAL.SaveUserToken(token)
    window.WebUserToken({ user_id: token.user_id, name: token.user_name, access_token: token.access_token, login: true })

    window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: token.default_drive_id, file_id: 'root', force: true })
    window.getDvaApp()._store.dispatch({ type: 'share/aRefresh' })
    PanDAL.GetFastAllDirList(token.user_id, token.default_drive_id)


    message.success({ content: '加载用户成功!', key: loadingkey, duration: 2 })
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
      window.getDvaApp()._store.dispatch({ type: 'user/mSaveUser', userID: '', userFace: undefined })
      window.getDvaApp()._store.dispatch({ type: 'pan/aLoadData', key: 'root' })
      window.getDvaApp()._store.dispatch({ type: 'global/save', showUserInfo: true })
    }
    return newUserID != ''
  }

  static async UserChange(userID: string) {
    if (UserTokenMap.has(userID) == false) return false
    const token = UserTokenMap.get(userID)!

    const islogin = token.user_id && (await AliUser.ApiTokenRefreshAccount(token, false))
    if (islogin == false) {
      message.warning('该账号需要重新登陆')
      DB.deleteUser(userID)
      UserTokenMap.delete(userID)
      return false
    }

    await this.UserLogin(token).catch(() => {})
    return true
  }

  static async UserRefreshByUserFace(userID: string, force: boolean) {
    let token = UserDAL.GetUserToken(userID)
    if (!token || !token.access_token) return
    let time = Date.now() - (new Date(token.expire_time).getTime() - token.expires_in * 1000)
    time = time / 1000
    if (force === false && time < 600) return true

    const islogin = token.user_id && (await AliUser.ApiTokenRefreshAccount(token, true))
    if (islogin == false) return false
    await Promise.all([AliUser.ApiUserInfo(token), AliUser.ApiUserPic(token)]).catch(() => {})
    window.getDvaApp()._store.dispatch({ type: 'user/mSaveUser', userID: token.user_id })
    return true
  }

  static QueryUserID(): string {
    return window.getDvaApp()._store.getState().user.userID
  }
}
