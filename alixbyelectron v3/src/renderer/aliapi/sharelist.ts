import SettingLog from '@/setting/settinglog'
import { humanDateTime, humanExpiration } from '@/store/format'
import { message } from 'antd'
import AliHttp, { IUrlRespData } from './alihttp'
import AliFileList from './filelist'
import { IAliShareItem } from './models'
import { IsSuccess } from './utils'

export interface IAliShareResp {
  items: IAliShareItem[]
  next_marker: string

  m_time: number
  m_user_id: string
}
export default class AliShareList {
  static async ApiShareListAll(user_id: string) {
    const dir: IAliShareResp = {
      items: [],
      next_marker: '',
      m_time: 0,
      m_user_id: user_id
    }

    do {
      const isget = await AliShareList.ApiShareListOnePage(dir)
      if (isget != true) {
        break
      }
    } while (dir.next_marker != '')
    return dir
  }

  static async ApiShareListOnePage(dir: IAliShareResp) {
    const url = 'https://api.aliyundrive.com/adrive/v3/share_link/list'
    const postdata = {
      marker: dir.next_marker,
      creator: dir.m_user_id,
      include_canceled: false,
      order_by: 'created_at',
      order_direction: 'DESC'
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliShareList._ShareListOnePage(dir, resp)
  }

  static _ShareListOnePage(dir: IAliShareResp, resp: IUrlRespData) {
    try {
      if (IsSuccess(resp.code)) {
        dir.next_marker = resp.body.next_marker
        const downurl = 'https://api.aliyundrive.com/v2/file/download?t=' + Date.now().toString()
        const timenow = new Date().getTime()
        for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
          const item = resp.body.items[i] as IAliShareItem
          let icon = 'iconwenjian'
          let first_file = undefined
          if (item.first_file) {
            first_file = AliFileList.getFileInfo(item.first_file, downurl)
            icon = first_file.icon || 'iconwenjian'
          }
          const add = Object.assign({}, item, { first_file, icon })
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

          add.share_msg = humanExpiration(item.expiration, timenow)
          if (item.status == 'forbidden') add.share_msg = '分享违规'
          dir.items.push(add)
        }

        return true
      } else if (resp.code == 404) {
        dir.items = []
        dir.next_marker = ''
        return true
      } else if (resp.body.code) {
        dir.items = []
        dir.next_marker = resp.body.code
        message.warning('列出分享列表出错' + resp.body.code, 2)
        return false
      }
    } catch (e: any) {
      SettingLog.mSaveLog('danger', '_ShareListOnePage' + ' error=' + (e.message || ''))
    }
    dir.next_marker = 'error'
    return false
  }
}
