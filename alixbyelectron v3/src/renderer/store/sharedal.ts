import { IAliShareItem, IShareInfoModel } from '@/aliapi/models'
import DB from '@/setting/db'
import { ShareModelState } from 'umi'
import { humanDateTime, humanExpiration } from './format'
import { IShareLinkModel } from './models'

export default class ShareDAL {
  static async aLoadFromDB() {
    const shareSiteList = await DB.getValueObject('shareSiteList')
    if (shareSiteList) window.getDvaApp()._store.dispatch({ type: 'share/mSaveShareSiteList', ShareSiteList: shareSiteList })

    const sharelist = await DB.getShareAll()
    const timenow = new Date().getTime()
    for (let i = 0, maxi = sharelist.length; i < maxi; i++) {
      const item = sharelist[i]
      if (item.expired == false) {
        item.share_msg = humanExpiration(item.expiration, timenow)
        item.expired = item.share_msg == '过期已失效'
      }
    }
    window.getDvaApp()._store.dispatch({ type: 'share/mSaveOtherShareList', items: sharelist })
  }

  static async SaveOtherShare(password: string, info: IShareInfoModel, refresh: boolean) {
    const share: IShareLinkModel = {
      share_id: info.shareinfo.shareid,
      share_name: info.shareinfo.share_name,
      share_pwd: password,
      expiration: info.shareinfo.expiration,
      logtime: Date.now(),
      expired: false,
      updated_at: '',
      share_msg: ''
    }

    if (share.logtime) share.updated_at = humanDateTime(share.logtime)
    share.share_msg = humanExpiration(share.expiration)
    share.expired = share.share_msg == '过期已失效'

    await DB.saveShare(share)
    if (!refresh) return
    const sharelist = await DB.getShareAll()
    const timenow = new Date().getTime()
    for (let i = 0, maxi = sharelist.length; i < maxi; i++) {
      const item = sharelist[i]
      if (item.expired == false) {
        item.share_msg = humanExpiration(item.expiration, timenow)
        item.expired = item.share_msg == '过期已失效'
      }
    }

    window.getDvaApp()._store.dispatch({ type: 'share/mSaveOtherShareList', items: sharelist })
  }

  static async DeleteOtherShare(share_id: string, refresh: boolean) {
    if (share_id) await DB.deleteShare(share_id)
    if (!refresh) return
    const sharelist = await DB.getShareAll()
    window.getDvaApp()._store.dispatch({ type: 'share/mSaveOtherShareList', items: sharelist })
  }

  static QuerySelectedShareList() {
    const filelist: IAliShareItem[] = []
    const share = window.getDvaApp()._store.getState().share as ShareModelState
    const ShareList = share.ShareList
    const selectedShares = share.selectedShares
    for (let i = 0, maxi = ShareList.length; i < maxi; i++) {
      const share_id = ShareList[i].share_id
      if (selectedShares.has(share_id)) filelist.push(ShareList[i])
    }
    return filelist
  }
  
  static QueryAllShareList() {
    const share = window.getDvaApp()._store.getState().share as ShareModelState
    const ShareList = share.ShareList
    return ShareList
  }

  static QuerySelectedOtherShareList() {
    const filelist: IShareLinkModel[] = []
    const share = window.getDvaApp()._store.getState().share as ShareModelState
    const OtherShareList = share.OtherShareList
    const selectedOtherShares = share.selectedOtherShares
    for (let i = 0, maxi = OtherShareList.length; i < maxi; i++) {
      const share_id = OtherShareList[i].share_id
      if (selectedOtherShares.has(share_id)) filelist.push(OtherShareList[i])
    }
    return filelist
  }


}
