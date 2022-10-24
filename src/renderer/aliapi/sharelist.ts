import DebugLog from '../utils/debuglog'
import { humanDateTime, humanExpiration, Sleep } from '../utils/format'
import message from '../utils/message'
import AliHttp, { IUrlRespData } from './alihttp'
import { IAliShareItem } from './alimodels'
import AliDirFileList from './dirfilelist'

export interface IAliShareResp {
  items: IAliShareItem[]
  itemsKey: Set<string>
  next_marker: string

  m_time: number 
  m_user_id: string 
}
export default class AliShareList {
  
  static async ApiShareListAll(user_id: string): Promise<IAliShareResp> {
    const dir: IAliShareResp = {
      items: [],
      itemsKey: new Set(),
      next_marker: '',
      m_time: 0,
      m_user_id: user_id
    }

    do {
      const isGet = await AliShareList.ApiShareListOnePage(dir)
      if (isGet != true) {
        break 
      }
    } while (dir.next_marker)
    return dir
  }

  static async ApiShareListOnePage(dir: IAliShareResp): Promise<boolean> {
    const url = 'adrive/v3/share_link/list'
    const postData = {
      
      marker: dir.next_marker,
      creator: dir.m_user_id,
      include_canceled: false,
      order_by: 'created_at',
      order_direction: 'DESC'
    }
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    return AliShareList._ShareListOnePage(dir, resp)
  }

  static _ShareListOnePage(dir: IAliShareResp, resp: IUrlRespData): boolean {
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        dir.next_marker = resp.body.next_marker
        const downUrl = 'https://api.aliyundrive.com/v2/file/download?t=' + Date.now().toString()
        const timeNow = new Date().getTime()
        for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
          const item = resp.body.items[i] as IAliShareItem
          if (dir.itemsKey.has(item.share_id)) continue
          let icon = 'iconwenjian'
          let first_file
          if (item.first_file) {
            first_file = AliDirFileList.getFileInfo(item.first_file, downUrl)
            icon = first_file.icon || 'iconwenjian'
          }
          const add = Object.assign({}, item, { first_file, icon }) as IAliShareItem
          if (!add.share_msg) add.share_msg = ''
          if (!add.share_name) add.share_name = 'share_name'
          if (!add.share_pwd) add.share_pwd = ''
          if (!add.preview_count) add.preview_count = 0
          if (!add.download_count) add.download_count = 0
          if (!add.save_count) add.save_count = 0
          if (!add.expired) add.expired = false
          if (item.created_at) {
            add.created_at = humanDateTime(new Date(item.created_at).getTime())
          } else {
            add.created_at = ''
          }

          add.share_msg = humanExpiration(item.expiration, timeNow)
          if (item.status == 'forbidden') add.share_msg = '分享违规'
          dir.items.push(add)
          dir.itemsKey.add(add.share_id)
        }

        return true
      } else if (resp.code == 404) {
        
        dir.items.length = 0
        dir.next_marker = ''
        return true
      } else if (resp.body && resp.body.code) {
        dir.items.length = 0
        dir.next_marker = resp.body.code
        message.warning('列出分享列表出错' + resp.body.code, 2)
        return false
      } else {
        DebugLog.mSaveWarning('_ShareListOnePage err=' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveDanger('_ShareListOnePage', err)
    }
    dir.next_marker = 'error ' + resp.code
    return false
  }

  static async ApiShareListUntilShareID(user_id: string, share_id: string): Promise<boolean> {
    const url = 'adrive/v3/share_link/list'
    const postData = {
      
      marker: '',
      creator: user_id,
      include_canceled: false,
      order_by: 'created_at',
      order_direction: 'DESC'
    }
    for (let j = 0; j < 10; j++) {
      const resp = await AliHttp.Post(url, postData, user_id, '')
      try {
        if (AliHttp.IsSuccess(resp.code)) {
          for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
            const item = resp.body.items[i] as IAliShareItem
            if (item.share_id == share_id) return true 
          }
        }
      } catch {}
      await Sleep(500)
    }
    return false
  }
}
