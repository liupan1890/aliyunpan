import { usePanFileStore, useSettingStore } from '../store'
import TreeStore from '../store/treestore'
import DebugLog from '../utils/debuglog'
import { OrderDir, OrderFile } from '../utils/filenameorder'
import { humanDateTimeDateStr, humanSize, humanTime } from '../utils/format'
import message from '../utils/message'
import { HanToPin, MapValueToArray } from '../utils/utils'
import AliHttp, { IUrlRespData } from './alihttp'
import { IAliFileItem, IAliGetFileModel } from './alimodels'
import getFileIcon from './fileicon'

export interface IAliFileResp {
  items: IAliGetFileModel[]
  itemsKey: Set<string>
  punished_file_count: number
  
  next_marker: string

  m_user_id: string 
  m_drive_id: string 
  dirID: string 
  dirName: string 
  itemsTotal?: number 
}

export function NewIAliFileResp(user_id: string, drive_id: string, dirID: string, dirName: string): IAliFileResp {
  const resp: IAliFileResp = {
    items: [],
    itemsKey: new Set<string>(),
    punished_file_count: 0,
    next_marker: '',
    m_user_id: user_id,
    m_drive_id: drive_id,
    dirID: dirID,
    dirName: dirName
  }

  return resp
}

export default class AliDirFileList {
  
  static LimitMax = 100
  static ItemJsonmask = 'category%2Ccreated_at%2Cdomain_id%2Cdrive_id%2Cfile_extension%2Cfile_id%2Chidden%2Cmime_extension%2Cmime_type%2Cname%2Cparent_file_id%2Cpunish_flag%2Csize%2Cstarred%2Ctype%2Cupdated_at%2Cdescription'
  
  static getFileInfo(item: IAliFileItem, downUrl: string): IAliGetFileModel {
    
    
    

    
    

    const size = item.size ? item.size : 0
    const date = new Date(item.updated_at || item.gmt_deleted || item.last_played_at || '')
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

    const isDir = item.type == 'folder'

    const add: IAliGetFileModel = {
      __v_skip: true,
      drive_id: item.drive_id,
      file_id: item.file_id,
      parent_file_id: item.parent_file_id || '',
      name: item.name,
      namesearch: HanToPin(item.name),
      ext: item.file_extension?.toLowerCase() || '',
      category: item.category || '',
      starred: item.starred || false,
      time: date.getTime() ,
      size: size,
      sizeStr: humanSize(size),
      timeStr: y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second ,
      icon: 'iconfile-folder',
      isDir: isDir,
      thumbnail: '',
      description: item.description || ''
    }
    if (!isDir) {
      const icon = getFileIcon(add.category, add.ext, item.mime_extension, item.mime_type, add.size)
      add.category = icon[0]
      add.icon = icon[1]
      if (downUrl) {
        if (downUrl == 'download_url') {
          add.download_url = item.download_url || ''
        } else if (add.category == 'image') {
          add.thumbnail = downUrl + '&drive_id=' + add.drive_id + '&file_id=' + add.file_id + '&image_thumbnail_process=image%2Fresize%2Cl_260%2Fformat%2Cjpg%2Fauto-orient%2C1'
        } else if (add.category == 'image2') {
          add.thumbnail = downUrl + '&drive_id=' + add.drive_id + '&file_id=' + add.file_id
        } else if (add.category.startsWith('video')) {
          add.thumbnail = downUrl + '&drive_id=' + add.drive_id + '&file_id=' + add.file_id + '&video_thumbnail_process=video%2Fsnapshot%2Ct_106000%2Cf_jpg%2Car_auto%2Cw_260%2Cm_fast'
        } else if (add.category == 'doc' || add.category == 'doc2') {
          if (add.ext != 'txt' && add.ext != 'epub' && add.ext != 'azw' && add.ext != 'azw3') {
            add.thumbnail = downUrl + '&drive_id=' + add.drive_id + '&file_id=' + add.file_id + '&office_thumbnail_process=image%2Fresize%2Cl_260%2Fformat%2Cjpg%2Fauto-orient%2C1'
          }
        }
      }

      if (item.video_media_metadata) {
        add.media_width = item.video_media_metadata.width || 0
        add.media_height = item.video_media_metadata.height || 0
        add.media_time = humanDateTimeDateStr(item.video_media_metadata.time)
        add.media_duration = humanTime(item.video_media_metadata.duration)
      } else if (item.video_preview_metadata) {
        add.media_width = item.video_preview_metadata.width || 0
        add.media_height = item.video_preview_metadata.height || 0
        add.media_time = humanDateTimeDateStr(item.video_preview_metadata.time)
        add.media_duration = humanTime(item.video_preview_metadata.duration)
      } else if (item.image_media_metadata) {
        add.media_width = item.image_media_metadata.width || 0
        add.media_height = item.image_media_metadata.height || 0
        add.media_time = humanDateTimeDateStr(item.image_media_metadata.time)
      }
    }
    if (item.punish_flag == 2) add.icon = 'iconweifa'
     else if (item.punish_flag > 0) add.icon = 'iconweixiang'

    return add
  }

  
  static async ApiDirFileList(user_id: string, drive_id: string, dirID: string, dirName: string, order: string, type: string = ''): Promise<IAliFileResp> {
    const dir: IAliFileResp = {
      items: [],
      itemsKey: new Set(),
      punished_file_count: 0,
      next_marker: '',
      m_user_id: user_id,
      m_drive_id: drive_id,
      dirID: dirID,
      dirName: dirName
    }

    if (!user_id || !drive_id || !dirID) return dir

    if (!order) order = 'updated_at desc'
    order = order.replace(' desc', ' DESC').replace(' asc', ' ASC')
    const orders = order.split(' ')

    let pageIndex = 0
    if (dirID == 'video') {
      await AliDirFileList._ApiVideoListRecent(dir)
      pageIndex++
    }

    let max: number = useSettingStore().debugFileListMax
    if (dirID == 'favorite' || dirID.startsWith('color') || dirID.startsWith('search') || dirID.startsWith('video')) max = useSettingStore().debugFavorListMax

    let needTotal
    do {
      let isGet = false
      if (dirID == 'favorite') {
        if (!needTotal) {
          needTotal = AliDirFileList._ApiFavoriteFileListCount(dir).then((total) => {
            dir.itemsTotal = total
          })
        }
        isGet = await AliDirFileList._ApiFavorFileListOnePage(orders[0], orders[1], dir, pageIndex)
      } else if (dirID == 'trash') isGet = await AliDirFileList._ApiTrashFileListOnePage(orders[0], orders[1], dir, pageIndex)
      else if (dirID == 'recover') isGet = await AliDirFileList._ApiDeleteedFileListOnePage(orders[0], orders[1], dir, pageIndex)
      else if (dirID.startsWith('color')) {
        if (!needTotal) {
          needTotal = AliDirFileList._ApiSearchFileListCount(dir).then((total) => {
            dir.itemsTotal = total
          })
        }
        isGet = await AliDirFileList._ApiSearchFileListOnePage(orders[0], orders[1], dir, pageIndex)
      } else if (dirID.startsWith('search')) {
        if (!needTotal) {
          needTotal = AliDirFileList._ApiSearchFileListCount(dir).then((total) => {
            dir.itemsTotal = total
          })
        }
        isGet = await AliDirFileList._ApiSearchFileListOnePage(orders[0], orders[1], dir, pageIndex)
      } else if (dirID == 'video') isGet = await AliDirFileList._ApiVideoListOnePage(orders[0], orders[1], dir, pageIndex)
      else if (dirID.startsWith('video')) isGet = await AliDirFileList._ApiVideoFileListOnePage(orders[0], orders[1], dir, pageIndex)
      else {
        if (!needTotal) {
          needTotal = AliDirFileList._ApiDirFileListCount(dir, type).then((total) => {
            dir.itemsTotal = total
          })
        }
        isGet = await AliDirFileList._ApiDirFileListOnePage(orders[0], orders[1], dir, type, pageIndex)
      }

      if (isGet != true) {
        if (needTotal) dir.itemsTotal = -1
        break 
      }

      if (dir.next_marker == 'cancel') {
        if (needTotal) dir.itemsTotal = -1
        break 
      }

      if (dir.items.length >= max && max > 0) {
        dir.next_marker = '' 
        break
      }

      pageIndex++
    } while (dir.next_marker)

    if (needTotal) await needTotal
    return dir
  }

  private static async _ApiDirFileListOnePage(orderby: string, order: string, dir: IAliFileResp, type: string, pageIndex: number): Promise<boolean> {
    let url = 'adrive/v3/file/list'
    if (useSettingStore().uiShowPanMedia == false) url += '?jsonmask=next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(' + AliDirFileList.ItemJsonmask + ')'
    else url += '?jsonmask=next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(' + AliDirFileList.ItemJsonmask + '%2Cvideo_media_metadata(duration%2Cwidth%2Cheight%2Ctime)%2Cvideo_preview_metadata%2Fduration%2Cimage_media_metadata)'

    let postData = {
      drive_id: dir.m_drive_id,
      parent_file_id: dir.dirID,
      marker: dir.next_marker,
      limit: 200,
      all: false,
      url_expire_sec: 14400,
      fields: '*',
      order_by: orderby,
      order_direction: order.toUpperCase()
    }
    if (type) {
      postData = Object.assign(postData, { type })
      pageIndex = -1 
    }
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(orderby, order, dir, resp, pageIndex, type)
  }

  
  private static async _ApiDirFileListCount(dir: IAliFileResp, type: string): Promise<number> {
    const url = 'adrive/v3/file/search'
    const postData = {
      drive_id: dir.m_drive_id,
      marker: '',
      limit: 1,
      all: false,
      url_expire_sec: 14400,
      fields: 'thumbnail',
      query: 'parent_file_id="' + dir.dirID + '"' + (type ? ' and type="' + type + '"' : ''),
      return_total_count: true
    }
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        return resp.body.total_count || 0
      } else {
        DebugLog.mSaveWarning('_ApiDirFileListCount err=' + dir.dirID + ' ' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveDanger('_ApiDirFileListCount ' + dir.dirID, err)
    }
    return 0
  }

  
  private static async _ApiFavoriteFileListCount(dir: IAliFileResp): Promise<number> {
    const url = 'adrive/v3/file/search'
    const postData = {
      drive_id: dir.m_drive_id,
      marker: '',
      limit: 1,
      all: false,
      url_expire_sec: 14400,
      fields: 'thumbnail',
      query: 'starred=true',
      return_total_count: true
    }
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        return resp.body.total_count || 0
      } else {
        DebugLog.mSaveWarning('_ApiFavoriteFileListCount err=' + dir.dirID + ' ' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveDanger('_ApiFavoriteFileListCount ' + dir.dirID, err)
    }
    return 0
  }

  private static async _ApiFavorFileListOnePage(orderby: string, order: string, dir: IAliFileResp, pageIndex: number): Promise<boolean> {
    let url = 'v2/file/list_by_custom_index_key'
    if (useSettingStore().uiShowPanMedia == false) url += '?jsonmask=next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(' + AliDirFileList.ItemJsonmask + ')'
    else url += '?jsonmask=next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(' + AliDirFileList.ItemJsonmask + '%2Cvideo_media_metadata(duration%2Cwidth%2Cheight%2Ctime)%2Cvideo_preview_metadata%2Fduration%2Cimage_media_metadata)'

    const postData = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: 100,
      url_expire_sec: 14400,
      fields: '*',
      order_by: orderby,
      order_direction: order.toUpperCase(),
      custom_index_key: 'starred_yes',
      parent_file_id: 'root'
    }
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(orderby, order, dir, resp, pageIndex)
  }

  private static async _ApiTrashFileListOnePage(orderby: string, order: string, dir: IAliFileResp, pageIndex: number): Promise<boolean> {
    const url = 'v2/recyclebin/list?jsonmask=next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(' + AliDirFileList.ItemJsonmask + ')'

    const postData = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: 100,
      all: false,
      url_expire_sec: 14400,
      fields: 'thumbnail',
      order_by: orderby,
      order_direction: order.toUpperCase()
    }
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(orderby, order, dir, resp, pageIndex)
  }

  static async _ApiDeleteedFileListOnePage(orderby: string, order: string, dir: IAliFileResp, pageIndex: number): Promise<boolean> {
    const url = 'adrive/v1/file/listDeleted'
    const postData = {
      drive_id: dir.m_drive_id,
      album_drive_id: dir.m_drive_id,
      marker: dir.next_marker
    }
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(orderby, order, dir, resp, pageIndex)
  }

  static async _ApiSearchFileListOnePage(orderby: string, order: string, dir: IAliFileResp, pageIndex: number): Promise<boolean> {
    let url = 'adrive/v3/file/search'
    if (useSettingStore().uiShowPanMedia == false) url += '?jsonmask=next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(' + AliDirFileList.ItemJsonmask + ')'
    else url += '?jsonmask=next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(' + AliDirFileList.ItemJsonmask + '%2Cvideo_media_metadata(duration%2Cwidth%2Cheight%2Ctime)%2Cvideo_preview_metadata%2Fduration%2Cimage_media_metadata)'

    
    
    let query = ''
    if (dir.dirID.startsWith('color')) {
      const color = dir.dirID.substring('color'.length).split(' ')[0].replace('#', 'c')
      query = 'description="' + color + '"'
    } else if (dir.dirID.startsWith('search')) {
      const search = dir.dirID.substring('search'.length).split(' ') 

      let word = ''
      for (let i = 0; i < search.length; i++) {
        const itemstr = search[i]
        if (itemstr.split(':').length !== 2) {
          word += itemstr + ' '
          continue
        }

        const kv = search[i].split(':')
        const k = kv[0]
        const v = kv[1]
        if (k == 'type') {
          const arr = v.split(',')
          let type = ''
          for (let j = 0; j < arr.length; j++) {
            if (arr[j] == 'folder') type += 'type="' + arr[j] + '" or ' 
            else if (arr[j]) type += 'category="' + arr[j] + '" or ' 
          }
          type = type.substring(0, type.length - 4).trim()
          if (type && type.indexOf(' or ') > 0) query += '(' + type + ') and '
          else if (type) query += type + ' and '
        } else if (k == 'size') {
          const size = parseInt(v)
          if (size > 0) query += 'size = ' + v + ' and '
        } else if (k == 'max') {
          const max = parseInt(v)
          if (max > 0) query += 'size <= ' + v + ' and '
        } else if (k == 'min') {
          const min = parseInt(v)
          if (min > 0) query += 'size >= ' + v + ' and '
        } else if (k == 'begin') {
          const dt = new Date(v).toISOString()
          query += 'updated_at >= "' + dt.substring(0, dt.lastIndexOf('.')) + '" and '
        } else if (k == 'end') {
          const dt = new Date(v).toISOString()
          query += 'updated_at <= "' + dt.substring(0, dt.lastIndexOf('.')) + '" and '
        } else if (k == 'ext') {
          const arr = v.split(',')
          let extin = ''
          for (let j = 0; j < arr.length; j++) {
            extin += '"' + arr[j] + '",'
          }
          if (extin.length > 0) extin = extin.substring(0, extin.length - 1) 
          if (extin) query += 'file_extension in [' + extin + '] and '
        } else if (k == 'fav') query += 'starred = ' + v + ' and '
      }
      word = word.trim()
      if (word) query += 'name match "' + word.replaceAll('"', '\\"') + '" and '
      if (query.length > 0) query = query.substring(0, query.length - 5) 
      if (query.startsWith('(') && query.endsWith(')')) query = query.substring(1, query.length - 1)
    }
    const postData = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: 100 ,
      fields: '*',
      query: query,
      order_by: orderby + ' ' + order
    }
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(orderby, order, dir, resp, pageIndex)
  }

  static async _ApiSearchFileListCount(dir: IAliFileResp): Promise<number> {
    const url = 'adrive/v3/file/search'
    
    
    let query = ''
    if (dir.dirID.startsWith('color')) {
      const color = dir.dirID.substring('color'.length).split(' ')[0].replace('#', 'c')
      query = 'description="' + color + '"'
    } else if (dir.dirID.startsWith('search')) {
      const search = dir.dirID.substring('search'.length).split(' ') 

      let word = ''
      for (let i = 0; i < search.length; i++) {
        const itemstr = search[i]
        if (itemstr.split(':').length !== 2) {
          word += itemstr + ' '
          continue
        }

        const kv = search[i].split(':')
        const k = kv[0]
        const v = kv[1]
        if (k == 'type') {
          const arr = v.split(',')
          let type = ''
          for (let j = 0; j < arr.length; j++) {
            if (arr[j] == 'folder') type += 'type="' + arr[j] + '" or ' 
            else if (arr[j]) type += 'category="' + arr[j] + '" or ' 
          }
          type = type.substring(0, type.length - 4).trim()
          if (type && type.indexOf(' or ') > 0) query += '(' + type + ') and '
          else if (type) query += type + ' and '
        } else if (k == 'size') {
          const size = parseInt(v)
          if (size > 0) query += 'size = ' + v + ' and '
        } else if (k == 'max') {
          const max = parseInt(v)
          if (max > 0) query += 'size <= ' + v + ' and '
        } else if (k == 'min') {
          const min = parseInt(v)
          if (min > 0) query += 'size >= ' + v + ' and '
        } else if (k == 'begin') {
          const dt = new Date(v).toISOString()
          query += 'updated_at >= "' + dt.substring(0, dt.lastIndexOf('.')) + '" and '
        } else if (k == 'end') {
          const dt = new Date(v).toISOString()
          query += 'updated_at <= "' + dt.substring(0, dt.lastIndexOf('.')) + '" and '
        } else if (k == 'ext') {
          const arr = v.split(',')
          let extin = ''
          for (let j = 0; j < arr.length; j++) {
            extin += '"' + arr[j] + '",'
          }
          if (extin.length > 0) extin = extin.substring(0, extin.length - 1) 
          if (extin) query += 'file_extension in [' + extin + '] and '
        } else if (k == 'fav') query += 'starred = ' + v + ' and '
      }
      word = word.trim()
      if (word) query += 'name match "' + word.replaceAll('"', '\\"') + '" and '
      if (query.length > 0) query = query.substring(0, query.length - 5) 
      if (query.startsWith('(') && query.endsWith(')')) query = query.substring(1, query.length - 1)
    }
    const postData = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: 1 ,
      fields: '*',
      query: query,
      return_total_count: true
    }
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        return (resp.body.total_count as number) || 0
      } else {
        DebugLog.mSaveWarning('_ApiSearchFileListCount err=' + dir.dirID + ' ' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveDanger('_ApiSearchFileListCount ' + dir.dirID, err)
    }
    return 0
  }

  static async _ApiVideoListRecent(dir: IAliFileResp): Promise<boolean> {
    const url = 'adrive/v2/video/recentList'
    const postData = {}
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage('', '', dir, resp, 0) 
  }

  static async _ApiVideoListOnePage(orderby: string, order: string, dir: IAliFileResp, pageIndex: number): Promise<boolean> {
    const url = 'adrive/v2/video/list'
    const postData = {
      use_compilation: true,
      duration: 0,
      order_by: (orderby + ' ' + order).toLowerCase(),
      hidden_type: 'NO_HIDDEN',
      limit: 100,
      marker: dir.next_marker,
      url_expire_sec: 14400
    }
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(orderby, order, dir, resp, pageIndex)
  }

  static async _ApiVideoFileListOnePage(orderby: string, order: string, dir: IAliFileResp, pageIndex: number): Promise<boolean> {
    const url = 'adrive/v2/video/compilation/list'
    const postData = {
      name: dir.dirID.substring('video'.length),
      use_compilation: true,
      duration: 0,
      order_by: (orderby + ' ' + order).toLowerCase(),
      hidden_type: 'NO_HIDDEN',
      limit: 100,
      marker: dir.next_marker,
      url_expire_sec: 14400
    }
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(orderby, order, dir, resp, pageIndex)
  }

  
  static _FileListOnePage(orderby: string, order: string, dir: IAliFileResp, resp: IUrlRespData, pageIndex: number, type: string = ''): boolean {
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        const dirPart: IAliFileResp = {
          items: [],
          itemsKey: new Set(),
          punished_file_count: 0,
          next_marker: dir.next_marker,
          m_user_id: dir.m_user_id,
          m_drive_id: dir.m_drive_id,
          dirID: dir.dirID,
          dirName: dir.dirName
        }

        dir.next_marker = resp.body.next_marker || ''
        const isRecover = dir.dirID == 'recover'
        const isDirFile = dir.dirID == 'root' || (dir.dirID.length == 40 && !dir.dirID.startsWith('search'))
        const isVideo = dir.dirID.startsWith('video')
        // const issearch = dir.dirID.startsWith('search')
        // const iscolor = dir.dirID.startsWith('color')
        const downUrl = isRecover ? '' : 'https://api.aliyundrive.com/v2/file/download?t=' + Date.now().toString() 

        if (resp.body.items) {
          const driverData = TreeStore.GetDriver(dir.m_drive_id)
          const DirFileSizeMap = driverData?.DirFileSizeMap || {}
          const DirTotalSizeMap = driverData?.DirTotalSizeMap || {}
          const isFolderSize = useSettingStore().uiFolderSize
          let dirList: IAliGetFileModel[] = []
          let fileList: IAliGetFileModel[] = []
          for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
            const item = resp.body.items[i] as IAliFileItem
            if (isVideo) {
              if (!item.compilation_id && (!item.drive_id || !item.file_id)) continue 
              
              if (!item.compilation_id) {
                item.type = 'file'
                item.compilation_id = item.drive_id + '_' + item.file_id
              }
              
              if (item.video_type == 'COMPILATION') {
                item.type = 'folder'
                item.drive_id = item.compilation_id.split('_')[0]
                item.file_id = item.compilation_id.split('_')[1]
              }
              
            }
            if (dir.itemsKey.has(item.file_id)) continue
            const add = AliDirFileList.getFileInfo(item, downUrl)
            if (isRecover) add.description = item.content_hash
            if (isVideo) {
              add.compilation_id = item.compilation_id
            }
            if (add.isDir) {
              if (isFolderSize) {
                add.size = DirTotalSizeMap[add.file_id] || DirFileSizeMap[add.file_id] || 0
                add.sizeStr = humanSize(add.size)
              }
              if (isDirFile) dirList.push(add)
              else fileList.push(add) 
            } else fileList.push(add)
            dir.itemsKey.add(item.file_id)
          }
          if (dirList.length > 0) {
            dirList = OrderDir(orderby, order, dirList) as IAliGetFileModel[]
            dirPart.items.push(...dirList)
            dir.items.push(...dirList)
          }
          if (fileList.length > 0) {
            fileList = OrderFile(orderby, order, fileList) as IAliGetFileModel[]
            dirPart.items.push(...fileList)
            dir.items.push(...fileList)
          }
        }

        dirPart.punished_file_count = resp.body.punished_file_count || 0
        dir.punished_file_count += resp.body.punished_file_count || 0

        if (pageIndex >= 0 && type == '') {
          const pan = usePanFileStore()
          if (pan.DriveID == dir.m_drive_id) pan.mSaveDirFileLoadingPart(pageIndex, dirPart, dir.itemsTotal || 0)
        }
        if (dirPart.next_marker == 'cancel') dir.next_marker = 'cancel'
        if (isVideo && dir.items.length >= 500) dir.next_marker = ''
        return true
      } else if (resp.code == 404) {
        
        dir.items.length = 0
        dir.next_marker = ''
        return true
      } else if (resp.body && resp.body.code) {
        dir.items.length = 0
        dir.next_marker = resp.body.code 
        message.warning('列出文件出错 ' + resp.body.code, 2)
        return false
      } else {
        DebugLog.mSaveWarning('_FileListOnePage err=' + dir.dirID + ' ' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveDanger('_FileListOnePage ' + dir.dirID, err)
    }
    dir.next_marker = 'error ' + resp.code
    return false
  }

  
  static async ApiDirFileSize(user_id: string, drive_id: string, file_idList: string[]): Promise<{ dirID: string; size: number }[] | undefined> {
    const list: Map<string, { dirID: string; size: number }> = new Map<string, { dirID: string; size: number }>()

    let postData = '{"requests":['
    for (let i = 0, maxi = file_idList.length; i < maxi; i++) {
      list.set(file_idList[i], { dirID: file_idList[i], size: 0 })
      if (i > 0) postData = postData + ','
      const data2 = {
        body: {
          drive_id: drive_id,
          query: 'parent_file_id="' + file_idList[i] + '" and type="file"',
          limit: 100,
          fields: 'thumbnail',
          order_by: 'size DESC'
        },
        headers: { 'Content-Type': 'application/json' },
        id: file_idList[i],
        method: 'POST',
        url: '/file/search'
      }
      postData = postData + JSON.stringify(data2)
    }
    postData += '],"resource":"file"}'

    const url = 'v2/batch?jsonmask=responses(id%2Cstatus%2Cbody(next_marker%2Citems(size)))'
    const resp = await AliHttp.Post(url, postData, user_id, '')

    try {
      if (AliHttp.IsSuccess(resp.code)) {
        const responses = resp.body.responses
        for (let j = 0, maxj = responses.length; j < maxj; j++) {
          const respi = responses[j]
          
          if (respi.id && respi.status && respi.status >= 200 && respi.status <= 205) {
            if (respi.body && respi.body.items && respi.body.items.length > 0) {
              let size = 0
              const items = respi.body.items
              for (let k = 0, maxk = items.length; k < maxk; k++) {
                size += items[k].size || 0
              }
              const find = list.get(respi.id)
              if (find) find.size = size
            }
          }
          
        }
        return MapValueToArray(list)
      } else {
        
        DebugLog.mSaveWarning('ApiDirFileSize err=' + (resp.code || ''))
        return undefined
      }
    } catch (err: any) {
      DebugLog.mSaveWarning('ApiDirFileSize', err)
    }
    return MapValueToArray(list)
  }
}
