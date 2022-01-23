import SettingLog from '@/setting/settinglog'
import AliHttp, { IUrlRespData } from './alihttp'
import { IAliFileItem, IAliGetDirModel } from './models'
import { GetDriveID, IsSuccess } from './utils'

export interface IAliDirResp {
  items: IAliGetDirModel[]
  next_marker: string

  m_user_id: string
  m_drive_id: string
  m_dir_id: string
  m_dir_name: string
}

export default class AliDirList {
  static GetDirLock = new Map<string, number>()

  static ApiCheckFastSearchDirLock(user_id: string, drive_id: string, dir_id: string) {
    const dt = AliDirList.GetDirLock.get('search_' + user_id + '_' + drive_id + '_fast_' + dir_id) || 0
    if (dt == 0) return false
    if (Date.now() - dt > 1 * 60 * 1000) return false
    return true
  }
  static ApiAddFastSearchDirLock(user_id: string, drive_id: string, dir_id: string) {
    AliDirList.GetDirLock.set('search_' + user_id + '_' + drive_id + '_fast_' + dir_id, Date.now())
  }
  static ApiDelFastSearchDirLock(user_id: string, drive_id: string, dir_id: string) {
    AliDirList.GetDirLock.delete('search_' + user_id + '_' + drive_id + '_fast_' + dir_id)
  }

  static async ApiFastSearchDirList(user_id: string, drive_id: string, dir_id: string, dir_name: string): Promise<IAliDirResp> {
    let query = 'type = "folder"'
    if (dir_id != '') query = 'parent_file_id="' + dir_id + '" and ' + query
    const Lock = new Map<string, boolean>()
    const list: IAliGetDirModel[] = []
    let errmsg = ''
    const p1 = new Promise(async (resolve) => {
      const dir: IAliDirResp = {
        items: [],
        next_marker: '',
        m_user_id: user_id,
        m_drive_id: drive_id,
        m_dir_id: '',
        m_dir_name: ''
      }
      let isFind = false
      do {
        const isget = await AliDirList.ApiSearchDirListOnePage(dir, query, 'name ASC')
        if (isget != true) {
          errmsg += dir.next_marker
          break
        }

        for (let i = 0, maxi = dir.items.length; i < maxi; i++) {
          let item = dir.items[i]
          if (Lock.has(item.file_id)) {
            isFind = true
            break
          } else {
            list.push(item)
            Lock.set(item.file_id, true)
          }
        }

        dir.items = []
        if (isFind) break
      } while (dir.next_marker != '')
      resolve(dir.next_marker)
    })
    const p2 = new Promise(async (resolve) => {
      const dir: IAliDirResp = {
        items: [],
        next_marker: '',
        m_user_id: user_id,
        m_drive_id: drive_id,
        m_dir_id: '',
        m_dir_name: ''
      }
      let isFind = false
      do {
        const isget = await AliDirList.ApiSearchDirListOnePage(dir, query, 'name DESC')
        if (isget != true) {
          errmsg += dir.next_marker
          break
        }

        for (let i = 0, maxi = dir.items.length; i < maxi; i++) {
          let item = dir.items[i]
          if (Lock.has(item.file_id)) {
            isFind = true
            break
          } else {
            list.push(item)
            Lock.set(item.file_id, true)
          }
        }

        dir.items = []
        if (isFind) break
      } while (dir.next_marker != '')
      resolve(dir.next_marker)
    })
    await Promise.all([p1, p2]).catch(() => {
      errmsg += ' err'
    })

    const result: IAliDirResp = {
      items: list.sort((a, b) => b.time - a.time),
      next_marker: errmsg,
      m_user_id: user_id,
      m_drive_id: drive_id,
      m_dir_id: dir_id,
      m_dir_name: dir_name
    }
    return result
  }

  static async ApiSearchDirListOnePage(dir: IAliDirResp, query: string, orderby: string) {
    const url = 'adrive/v3/file/search'
    const postdata = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: 100,
      fields: 'thumbnail',
      query: query,
      order_by: orderby
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliDirList._DirListOnePage(dir, resp)
  }

  static _DirListOnePage(dir: IAliDirResp, resp: IUrlRespData) {
    try {
      if (IsSuccess(resp.code)) {
        dir.next_marker = resp.body.next_marker
        const items = resp.body.items
        for (let i = 0, maxi = items.length; i < maxi; i++) {
          const item = items[i] as IAliFileItem
          if (item.type !== 'folder') {
            dir.next_marker = ''
            continue
          }
          const add: IAliGetDirModel = {
            drive_id: item.drive_id,
            file_id: item.file_id,
            parent_file_id: item.parent_file_id,
            name: item.name,
            size: 0,
            time: new Date(item.updated_at).getTime(),
            description: item.description || ''
          }
          dir.items.push(add)
        }
        return true
      } else if (resp.code == 404) {
        dir.items = []
        dir.next_marker = ''
        return true
      }
    } catch (err: any) {
      SettingLog.mSaveLog('warning', '列出文件夹失败pagefile_id=' + dir.m_dir_id + ' err=' + (err.message || ''))
    }
    dir.items = []
    dir.next_marker = 'error'
    return false
  }
}
