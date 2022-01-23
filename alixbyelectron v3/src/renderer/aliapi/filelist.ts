import SettingDebug from '@/setting/settingdebug'
import SettingLog from '@/setting/settinglog'
import { humanSize } from '@/store/format'
import { ITokenInfo } from '@/store/models'
import { message } from 'antd'
import AliHttp, { IUrlRespData } from './alihttp'
import getFileIcon from './fileicon'
import { IAliFileItem, IAliGetFileModel } from './models'
import { IsSuccess } from './utils'

export interface IAliFileResp {
  items: IAliGetFileModel[]
  punished_file_count: number
  next_marker: string

  m_user_id: string
  m_drive_id: string
  m_dir_id: string
  m_dir_name: string
  m_need_report: boolean
}

let LimitTest = false
let FileListLock = new Map<string, number>()
export default class AliFileList {
  static LimitMax = 100

  static async ApiFileListTestLimit(token: ITokenInfo) {
    if (LimitTest) return
    LimitTest = true
    const url = 'adrive/v3/file/list'
    const postdata = {
      drive_id: token.default_drive_id,
      parent_file_id: 'root',
      marker: '',
      limit: 10000,
      all: false,
      url_expire_sec: 14400,
      fields: '*',
      order_by: 'name',
      order_direction: 'ASC'
    }
    const resp = await AliHttp.Post(url, postdata, token.user_id, '')
    const msg = (resp.body?.message as string | undefined) || ''
    if (msg.indexOf('limit should be less than 200')) {
      AliFileList.LimitMax = 200
      window.WinMsgToUI({ cmd: 'LimitMax', LimitMax: 200 })
    }
  }

  static async ApiFileListOnePageAria(orderby: string, order: string, dir: IAliFileResp) {
    const url = 'adrive/v3/file/list'
    const postdata = {
      drive_id: dir.m_drive_id,
      parent_file_id: dir.m_dir_id,
      marker: dir.next_marker,
      limit: AliFileList.LimitMax,
      all: false,
      url_expire_sec: 14400,
      fields: 'thumbnail',
      order_by: orderby,
      order_direction: order
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliFileList._FileListOnePage(dir, resp)
  }

  static _FileListOnePage(dir: IAliFileResp, resp: IUrlRespData) {
    try {
      if (IsSuccess(resp.code)) {
        dir.next_marker = resp.body.next_marker
        const downurl = 'https://api.aliyundrive.com/v2/file/download?t=' + Date.now().toString()
        for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
          const item = resp.body.items[i] as IAliFileItem
          const add = this.getFileInfo(item, downurl)
          dir.items.push(add)
        }
        dir.punished_file_count=resp.body.punished_file_count||0
        if (dir.m_need_report && resp.body.items.length % 100 == 0) window.getDvaApp()._store.dispatch({ type: 'file/aLoadDirFiles', loading: true, drive_id: dir.m_drive_id, file_id: dir.m_dir_id, items: dir.items })
        return true
      } else if (resp.code == 404) {
        dir.items = []
        dir.next_marker = ''
        return true
      } else if (resp.body.code) {
        dir.items = []
        dir.next_marker = resp.body.code
        message.warning('列出文件出错 ' + resp.body.code, 2)
        return false
      }
    } catch (e: any) {
      SettingLog.mSaveLog('danger', '_FileListOnePage' + dir.m_dir_id + ' error=' + (e.message || ''))
    }
    dir.next_marker = 'error'
    return false
  }

  static getFileInfo(item: IAliFileItem, downurl: string): IAliGetFileModel {

    const size = item.size ? item.size : 0
    const date = new Date(item.updated_at)
    const y = date.getFullYear().toString()
    let m: number | string = date.getMonth() + 1
    m = m < 10 ? '0' + m.toString() : m.toString()
    let d: number | string = date.getDate()
    d = d < 10 ? '0' + d.toString() : d.toString()
    let h: number | string = date.getHours()
    h = h < 10 ? '0' + h.toString() : h.toString()
    let minute: number | string = date.getMinutes()
    minute = minute < 10 ? '0' + minute.toString() : minute.toString()
    let second: number | string = date.getSeconds()
    second = second < 10 ? '0' + second.toString() : second.toString()

    const isdir = item.type == 'folder'

    const add: IAliGetFileModel = {
      drive_id: item.drive_id,
      file_id: item.file_id,
      parent_file_id: item.parent_file_id,
      name: item.name,
      ext: item.file_extension?.toLowerCase() || '',
      category: item.category || '',
      starred: item.starred,
      time: date.getTime(),
      size: size,
      sizestr: humanSize(size),
      timestr: y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second,
      icon: 'iconfolder',
      isdir: isdir,
      download_url: item.download_url || '',
      thumbnail: '',
      description: item.description || ''
    }
    if (!isdir) {
      const icon = getFileIcon(add.category, add.ext, item.mime_extension, item.mime_type, add.size)
      add.category = icon[0]
      add.icon = icon[1]

      if (add.category == 'image') {
        add.thumbnail = downurl + '&drive_id=' + add.drive_id + '&file_id=' + add.file_id + '&image_thumbnail_process=image%2Fresize%2Cl_260%2Fformat%2Cjpg%2Fauto-orient%2C1'
      } else if (add.category == 'image2') {
        add.thumbnail = downurl + '&drive_id=' + add.drive_id + '&file_id=' + add.file_id
      } else if (add.category.startsWith('video')) {
        add.thumbnail = downurl + '&drive_id=' + add.drive_id + '&file_id=' + add.file_id + '&video_thumbnail_process=video%2Fsnapshot%2Ct_106000%2Cf_jpg%2Car_auto%2Cw_260%2Cm_fast'
      } else if (add.category == 'doc' || add.category == 'doc2') {
        if (add.ext != 'txt') {
          add.thumbnail = downurl + '&drive_id=' + add.drive_id + '&file_id=' + add.file_id + '&office_thumbnail_process=image%2Fresize%2Cl_260%2Fformat%2Cjpg%2Fauto-orient%2C1'
        }
      } else if (item.thumbnail && add.category != 'others') {
        add.thumbnail = item.thumbnail
      }
    }
    if (item.punish_flag == 2) add.icon = 'iconweifa'
    else if (item.punish_flag > 0) add.icon = 'iconweixiang'
    else if (item.thumbnail && item.thumbnail.indexOf('illegal_thumbnail') > 0) add.icon = 'iconweifa'
    return add
  }

  static async ApiFavorFileListOnePage(orderby: string, order: string, dir: IAliFileResp) {
    const url = 'v2/file/list_by_custom_index_key'
    const postdata = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: AliFileList.LimitMax,
      url_expire_sec: 14400,
      fields: '*',
      order_by: orderby,
      order_direction: order.toUpperCase(),
      custom_index_key: 'starred_yes',
      parent_file_id: 'root'
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliFileList._FileListOnePage(dir, resp)
  }

  static async ApiFavorFileList(user_id: string, drive_id: string, order: string, needReport: boolean, max: number = SettingDebug.debugFavorListMax): Promise<IAliFileResp> {
    const dir: IAliFileResp = {
      items: [],
      punished_file_count:0,
      next_marker: '',
      m_user_id: user_id,
      m_drive_id: drive_id,
      m_dir_id: 'favorite',
      m_dir_name: 'favorite',
      m_need_report: needReport
    }
    let locktime = (Date.now() - (FileListLock.get(drive_id + '_' + dir.m_dir_id) || 0)) / 1000
    if (locktime < 180) return dir

    FileListLock.set(drive_id + '_' + dir.m_dir_id, Date.now())
    if (!order) order = 'updated_at DESC'
    let orders = order.split(' ')
    do {
      const isget = await AliFileList.ApiFavorFileListOnePage(orders[0], orders[1], dir)
      if (isget != true) {
        break
      }
      if (dir.items.length >= max) {
        dir.next_marker = ''
        break
      }
    } while (dir.next_marker != '')
    FileListLock.delete(drive_id + '_' + dir.m_dir_id)
    return dir
  }

  static async ApiTrashFileListOnePage(orderby: string, order: string, dir: IAliFileResp) {
    const url = 'v2/recyclebin/list'
    const postdata = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: AliFileList.LimitMax,
      all: false,
      url_expire_sec: 14400,
      fields: 'thumbnail',
      order_by: orderby,
      order_direction: order.toUpperCase()
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliFileList._FileListOnePage(dir, resp)
  }

  static async ApiTrashFileList(user_id: string, drive_id: string, order: string, needReport: boolean, max: number = SettingDebug.debugFavorListMax): Promise<IAliFileResp> {
    const dir: IAliFileResp = {
      items: [],
      punished_file_count:0,
      next_marker: '',
      m_user_id: user_id,
      m_drive_id: drive_id,
      m_dir_id: 'trash',
      m_dir_name: 'trash',
      m_need_report: needReport
    }
    let locktime = (Date.now() - (FileListLock.get(drive_id + '_' + dir.m_dir_id) || 0)) / 1000
    if (locktime < 180) return dir

    FileListLock.set(drive_id + '_' + dir.m_dir_id, Date.now())
    if (!order) order = 'updated_at DESC'
    let orders = order.split(' ')
    do {
      const isget = await AliFileList.ApiTrashFileListOnePage(orders[0], orders[1], dir)
      if (isget != true) {
        break
      }
      if (dir.items.length >= max) {
        dir.next_marker = ''
        break
      }
    } while (dir.next_marker != '')
    FileListLock.delete(drive_id + '_' + dir.m_dir_id)
    return dir
  }

  static async ApiDirFileListOnePage(orderby: string, order: string, dir: IAliFileResp) {
    const url = 'adrive/v3/file/list'
    const postdata = {
      drive_id: dir.m_drive_id,
      parent_file_id: dir.m_dir_id,
      marker: dir.next_marker,
      limit: AliFileList.LimitMax,
      all: false,
      url_expire_sec: 14400,
      fields: '*',
      order_by: orderby,
      order_direction: order.toUpperCase()
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliFileList._FileListOnePage(dir, resp)
  }
  static async ApiDirFileList(user_id: string, drive_id: string, dir_id: string, dir_name: string, order: string, needReport: boolean, max: number = SettingDebug.debugFileListMax): Promise<IAliFileResp> {
    if (dir_id == 'favorite') return AliFileList.ApiFavorFileList(user_id, drive_id, order, needReport)
    if (dir_id == 'trash') return AliFileList.ApiTrashFileList(user_id, drive_id, order, needReport)

    const dir: IAliFileResp = {
      items: [],
      punished_file_count:0,
      next_marker: '',
      m_user_id: user_id,
      m_drive_id: drive_id,
      m_dir_id: dir_id,
      m_dir_name: dir_name,
      m_need_report: needReport
    }

    let locktime = (Date.now() - (FileListLock.get(drive_id + '_' + dir.m_dir_id) || 0)) / 1000
    if (locktime < 180) return dir

    FileListLock.set(drive_id + '_' + dir.m_dir_id, Date.now())
    if (!order) order = 'updated_at DESC'
    let orders = order.split(' ')
    do {
      const isget = await AliFileList.ApiDirFileListOnePage(orders[0], orders[1], dir)
      if (isget != true) {
        break
      }
      if (dir.items.length >= max) {
        dir.next_marker = ''
        break
      }
    } while (dir.next_marker != '')
    FileListLock.delete(drive_id + '_' + dir.m_dir_id)
    return dir
  }

  static async ApiFileListForCopy(user_id: string, drive_id: string, dir_id: string, dir_name: string, order: string, onlyDir: boolean): Promise<IAliFileResp> {
    const dir: IAliFileResp = {
      items: [],
      punished_file_count:0,
      next_marker: '',
      m_user_id: user_id,
      m_drive_id: drive_id,
      m_dir_id: dir_id,
      m_dir_name: dir_name,
      m_need_report: false
    }

    if (!order) order = 'updated_at DESC'
    let orders = order.split(' ')
    do {
      const isget = await AliFileList.ApiDirFileListOnePage(orders[0], orders[1], dir)
      if (isget != true) {
        break
      }
      if (onlyDir) {
        let list: IAliGetFileModel[] = []
        for (let i = 0, maxi = dir.items.length; i < maxi; i++) {
          if (dir.items[i].isdir == false) break
          list.push(dir.items[i])
        }
        dir.items = list
        dir.next_marker = ''
      }
    } while (dir.next_marker != '')
    return dir
  }

  static async ApiSearchFileListOnePage(orderby: string, dir: IAliFileResp) {
    const url = 'adrive/v3/file/search'
    let query = ''
    let search = dir.m_dir_id.split('-')
    for (let i = 1; i < search.length; i++) {
      let kv = search[i].split(':')
      let k = kv[0]
      let v = kv[1]
      if (k == 'type') {
        if (v == 'folder') query += 'type="' + v + '" and '
        else query += 'category="' + v + '" and '
      } else if (k == 'max') query += 'size <= ' + v + ' and '
      else if (k == 'min') query += 'size >= ' + v + ' and '
      else if (k == 'begin') {
        let dt = new Date(parseInt(v)).toISOString()
        query += 'updated_at >= "' + dt.substring(0, dt.lastIndexOf('.')) + '" and '
      } else if (k == 'end') {
        let dt = new Date(parseInt(v)).toISOString()
        query += 'updated_at <= "' + dt.substring(0, dt.lastIndexOf('.')) + '" and '
      } else if (k == 'ext') {
        let arr = v.split(',')
        let extin = ''
        for (let j = 0; j < arr.length; j++) {
          extin += '"' + arr[j] + '",'
        }
        if (extin.length > 0) extin = extin.substring(0, extin.length - 1)
        query += 'file_extension in [' + extin + '] and '
      } else if (k == 'name') query += 'name match "' + v.replaceAll('\\u002d', '-').replaceAll('\\u003a', ':').replaceAll('\\', '\\\\').replaceAll('"', '\\"') + '" and '
      else if (k == 'fav') query += 'starred = ' + v + ' and '
    }

    if (query.length > 0) query = query.substring(0, query.length - 4)
    const postdata = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: 100,
      fields: '*',
      query: query,
      order_by: orderby
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliFileList._FileListOnePage(dir, resp)
  }
  static async ApiSearchFileList(user_id: string, drive_id: string, dir_id: string, dir_name: string, order: string, needReport: boolean, max: number = SettingDebug.debugFavorListMax): Promise<IAliFileResp> {
    const dir: IAliFileResp = {
      items: [],
      punished_file_count:0,
      next_marker: '',
      m_user_id: user_id,
      m_drive_id: drive_id,
      m_dir_id: dir_id,
      m_dir_name: 'search',
      m_need_report: needReport
    }
    if (!order) order = 'updated_at DESC'
    do {
      const isget = await AliFileList.ApiSearchFileListOnePage(order, dir)
      if (isget != true) {
        break
      }
      if (dir.items.length >= max) {
        dir.next_marker = ''
        break
      }
    } while (dir.next_marker != '')
    return dir
  }

  static async ApiDescriptionFileListOnePage(orderby: string, dir: IAliFileResp) {
    const url = 'adrive/v3/file/search'
    const postdata = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: 100,
      fields: 'thumbnail',
      query: 'description="' + dir.m_dir_name + '"',
      order_by: orderby
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliFileList._FileListOnePage(dir, resp)
  }
  static async ApiDescriptionFileList(user_id: string, drive_id: string, description: string): Promise<IAliFileResp> {
    const dir: IAliFileResp = {
      items: [],
      punished_file_count:0,
      next_marker: '',
      m_user_id: user_id,
      m_drive_id: drive_id,
      m_dir_id: description,
      m_dir_name: description,
      m_need_report: false
    }

    do {
      const isget = await AliFileList.ApiDescriptionFileListOnePage('updated_at DESC', dir)
      if (isget != true) {
        break
      }
      if (dir.items.length >= 2000) {
        dir.next_marker = ''
        break
      }
    } while (dir.next_marker != '')
    dir.items.sort((a, b) => b.time - a.time)
    return dir
  }
}
