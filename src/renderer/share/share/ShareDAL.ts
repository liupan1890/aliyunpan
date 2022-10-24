import AliShareList from '../../aliapi/sharelist'
import DB from '../../utils/db'
import { humanDateTime, humanExpiration, Sleep } from '../../utils/format'
import message from '../../utils/message'
import useMyShareStore from './MyShareStore'
import { useServerStore, IShareSiteModel } from '../../store'
import useOtherShareStore, { IOtherShareLinkModel } from './OtherShareStore'
import ServerHttp from '../../aliapi/server'
import { IID, ParseShareIDList } from '../../utils/shareurl'
import { RunBatch } from '../../aliapi/batch'
import AliShare from '../../aliapi/share'
import { IAliShareAnonymous } from '../../aliapi/alimodels'

export default class ShareDAL {
  
  static async aLoadFromDB(): Promise<void> {
    
    const shareSiteList = await DB.getValueObject('shareSiteList')
    useServerStore().mSaveShareSiteList(shareSiteList as IShareSiteModel[])
    
    ShareDAL.aReloadOtherShare()
  }

  
  
  static async aReloadMyShare(user_id: string, force: boolean): Promise<void> {
    if (!user_id) return
    const myshareStore = useMyShareStore()
    if (!force && myshareStore.ListDataRaw.length > 0) return 
    if (myshareStore.ListLoading == true) return
    myshareStore.ListLoading = true
    const resp = await AliShareList.ApiShareListAll(user_id)
    myshareStore.aLoadListData(resp.items)
    myshareStore.ListLoading = false
  }

  
  static async aReloadMyShareUntilShareID(user_id: string, share_id: string): Promise<void> {
    if (!user_id) return
    const find = await AliShareList.ApiShareListUntilShareID(user_id, share_id)
    if (find) ShareDAL.aReloadMyShare(user_id, true)
  }

  

  
  static async aReloadOtherShare(): Promise<void> {
    const othershareStore = useOtherShareStore()
    if (othershareStore.ListLoading == true) return
    othershareStore.ListLoading = true

    const shareList = await DB.getOtherShareAll()
    const timeNow = new Date().getTime()
    for (let i = 0, maxi = shareList.length; i < maxi; i++) {
      const item = shareList[i]
      if (item.updated_at) {
        const updated_at = new Date(item.updated_at).getTime()
        item.updated_at = humanDateTime(updated_at)
      }
      if (item.expired == false) {
        if (item.share_msg != '已失效') item.share_msg = humanExpiration(item.expiration, timeNow)
        item.expired = item.share_msg == '过期失效'
      }
    }
    othershareStore.aLoadListData(shareList)
    await Sleep(1000)
    othershareStore.ListLoading = false
  }

  
  static async SaveOtherShare(password: string, info: IAliShareAnonymous, refresh: boolean) {
    let share = await DB.getOtherShare(info.shareinfo.share_id)
    if (!share) {
      share = {
        share_id: info.shareinfo.share_id,
        share_name: info.shareinfo.share_id,
        description: '',
        share_pwd: password,
        expiration: '0',
        expired: false,
        created_at: '',
        updated_at: new Date().toISOString(),
        saved_at: '',
        saved_time: Date.now(),
        share_msg: ''
      }
    }
    share.share_name = info.shareinfo.display_name || info.shareinfo.share_id
    share.created_at = info.shareinfo.created_at || new Date().toISOString()
    share.updated_at = info.shareinfo.updated_at || new Date().toISOString()
    share.saved_at = humanDateTime(share.saved_time)

    if (info.error != '') {
      share.share_msg = '已失效'
      share.expired = false
    } else {
      share.expiration = info.shareinfo.expiration
      share.share_msg = humanExpiration(share.expiration)
      share.expired = share.share_msg == '过期失效'
    }
    await DB.saveOtherShare(share)
    if (!refresh) return 
    ShareDAL.aReloadOtherShare()
  }

  
  static async SaveOtherShareText(text: string): Promise<boolean> {
    const idList = ParseShareIDList(text)

    if (idList.length == 0) {
      message.error('解析分享链接失败，格式错误')
      return false 
    }

    const savefunc = (one: IID) => {
      return AliShare.ApiGetShareAnonymous(one.id).then((info) => {
        return ShareDAL.SaveOtherShare(one.pwd, info, false)
      })
    }

    await RunBatch('解析分享链接', idList, 10, savefunc)
    ShareDAL.aReloadOtherShare()
    return true
  }

  
  static async SaveOtherShareRefresh(): Promise<boolean> {
    const shareList = await DB.getOtherShareAll()

    if (shareList.length == 0) {
      return false
    }
    const savefunc = (share: IOtherShareLinkModel) => {
      return AliShare.ApiGetShareAnonymous(share.share_id).then((info) => {
        if (info.error != '') {
          share.expired = false
          share.share_msg = '已失效'
        } else {
          share.share_name = info.shareinfo.display_name
          share.expiration = info.shareinfo.expiration
          share.updated_at = info.shareinfo.updated_at
          share.share_msg = humanExpiration(share.expiration)
          share.expired = share.share_msg == '过期失效'
        }
        return DB.saveOtherShare(share)
      })
    }
    await RunBatch('更新状态', shareList, 10, savefunc)
    ShareDAL.aReloadOtherShare()
    return true
  }

  
  static async DeleteOtherShare(selectKeys: string[]): Promise<void> {
    if (selectKeys) await DB.deleteOtherShareBatch(selectKeys)
    useOtherShareStore().mDeleteFiles(selectKeys)
  }

  
  
  static aLoadShareSite() {
    if (useServerStore().shareSiteList.length == 0) ServerHttp.CheckUpgrade(false)
  }

  
  static SaveShareSite(list: IShareSiteModel[]) {
    DB.saveValueObject('shareSiteList', list).catch(() => {})
    useServerStore().mSaveShareSiteList(list)
  }
}
