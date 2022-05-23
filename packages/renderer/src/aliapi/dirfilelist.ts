import { ITokenInfo, usePanFileStore, useSettingStore } from '@/store'
import DebugLog from '@/utils/debuglog'
import { humanSize } from '@/utils/format'
import message from '@/utils/message'
import { HanToPin } from '@/utils/utils'
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
  m_dir_id: string 
  m_dir_name: string 
}

export function NewIAliFileResp(user_id: string, drive_id: string, dir_id: string, dir_name: string) {
  return {
    items: [],
    itemsKey: new Set<string>(),
    punished_file_count: 0,
    next_marker: '',
    m_user_id: user_id,
    m_drive_id: drive_id,
    m_dir_id: dir_id,
    m_dir_name: dir_name
  }
}

export default class AliDirFileList {
  
  static LimitMax = 100

  
  static getFileInfo(item: IAliFileItem, downurl: string): IAliGetFileModel {
    
    
    

    
    

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

    const isdir = item.type == 'folder'

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
      sizestr: humanSize(size),
      timestr: y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second ,
      icon: 'iconfolder',
      isdir: isdir,
      thumbnail: '',
      description: item.description || ''
    }
    if (!isdir) {
      const icon = getFileIcon(add.category, add.ext, item.mime_extension, item.mime_type, add.size)
      add.category = icon[0]
      add.icon = icon[1]
      if (downurl) {
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
        }
      }
    }
    if (item.punish_flag == 2) add.icon = 'iconweifa'
     else if (item.punish_flag > 0) add.icon = 'iconweixiang'

    return add
  }

  /**
   * 一个文件夹的全部文件列表
   * type folder file ''
   */
  static async ApiDirFileList(user_id: string, drive_id: string, dir_id: string, dir_name: string, order: string, type: string = '', max: number = useSettingStore().debugFileListMax): Promise<IAliFileResp> {
    const dir: IAliFileResp = {
      items: [],
      itemsKey: new Set(),
      punished_file_count: 0,
      next_marker: '',
      m_user_id: user_id,
      m_drive_id: drive_id,
      m_dir_id: dir_id,
      m_dir_name: dir_name
    }

    if (!order) order = 'updated_at desc'
    order = order.replace(' desc', ' DESC').replace(' asc', ' ASC')
    let orders = order.split(' ')

    let pageindex = 0
    if (dir_id == 'video') {
      await AliDirFileList._ApiVideoListRecent(dir)
      pageindex++
    }
    do {
      let isget = false
      if (dir_id == 'favorite') isget = await AliDirFileList._ApiFavorFileListOnePage(orders[0], orders[1], dir, pageindex)
      else if (dir_id == 'trash') isget = await AliDirFileList._ApiTrashFileListOnePage(orders[0], orders[1], dir, pageindex)
      else if (dir_id == 'recover') isget = await AliDirFileList._ApiDeleteedFileListOnePage(orders[0], orders[1], dir, pageindex)
      else if (dir_id.startsWith('color')) isget = await AliDirFileList._ApiSearchFileListOnePage(order, dir, pageindex)
      else if (dir_id.startsWith('search')) isget = await AliDirFileList._ApiSearchFileListOnePage(order, dir, pageindex)
      else if (dir_id == 'video') isget = await AliDirFileList._ApiVideoListOnePage(order, dir, pageindex)
      else if (dir_id.startsWith('video')) isget = await AliDirFileList._ApiVideoFileListOnePage(order, dir, pageindex)
      else isget = await AliDirFileList._ApiDirFileListOnePage(orders[0], orders[1], dir, type, pageindex)
      if (isget != true) {
        break 
      }
      if (dir.items.length >= max) {
        dir.next_marker = '' 
        break
      }
      pageindex++
    } while (dir.next_marker)

    return dir
  }

  static async _ApiDirFileListOnePage(orderby: string, order: string, dir: IAliFileResp, type: string, pageindex: number) {
    const url = 'adrive/v3/file/list?jsonmask=next_marker,items(category,created_at,domain_id,drive_id,file_extension,file_id,hidden,mime_extension,mime_type,name,parent_file_id,punish_flag,size,starred,type,updated_at,description)'
    let postdata = {
      drive_id: dir.m_drive_id,
      parent_file_id: dir.m_dir_id,
      marker: dir.next_marker,
      limit: AliDirFileList.LimitMax,
      all: false,
      url_expire_sec: 14400,
      fields: '*',
      order_by: orderby,
      order_direction: order.toUpperCase()
    }
    if (type) postdata = Object.assign(postdata, { type })
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(dir, resp, pageindex)
  }
  static async _ApiFavorFileListOnePage(orderby: string, order: string, dir: IAliFileResp, pageindex: number) {
    const url = 'v2/file/list_by_custom_index_key?jsonmask=next_marker,items(category,created_at,domain_id,drive_id,file_extension,file_id,hidden,mime_extension,mime_type,name,parent_file_id,punish_flag,size,starred,type,updated_at,description)'
    const postdata = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: AliDirFileList.LimitMax,
      url_expire_sec: 14400,
      fields: '*',
      order_by: orderby,
      order_direction: order.toUpperCase(),
      custom_index_key: 'starred_yes',
      parent_file_id: 'root'
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(dir, resp, pageindex)
  }
  static async _ApiTrashFileListOnePage(orderby: string, order: string, dir: IAliFileResp, pageindex: number) {
    const url = 'v2/recyclebin/list?jsonmask=next_marker,items(category,created_at,domain_id,drive_id,file_extension,file_id,hidden,mime_extension,mime_type,name,parent_file_id,punish_flag,size,starred,type,updated_at,description)'
    const postdata = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: AliDirFileList.LimitMax,
      all: false,
      url_expire_sec: 14400,
      fields: 'thumbnail',
      order_by: orderby,
      order_direction: order.toUpperCase()
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(dir, resp, pageindex)
  }
  static async _ApiDeleteedFileListOnePage(orderby: string, order: string, dir: IAliFileResp, pageindex: number) {
    const url = 'adrive/v1/file/listDeleted'
    const postdata = {
      drive_id: dir.m_drive_id,
      album_drive_id: dir.m_drive_id,
      marker: dir.next_marker
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(dir, resp, pageindex)
  }
  static async _ApiSearchFileListOnePage(orderby: string, dir: IAliFileResp, pageindex: number) {
    const url = 'adrive/v3/file/search?jsonmask=next_marker,items(category,created_at,domain_id,drive_id,file_extension,file_id,hidden,mime_extension,mime_type,name,parent_file_id,punish_flag,size,starred,type,updated_at,description)'
    
    
    let query = ''
    if (dir.m_dir_id.startsWith('color')) {
      let color = dir.m_dir_id.substring('color'.length).split(' ')[0].replace('#', 'c')
      query = 'description="' + color + '"'
    } else if (dir.m_dir_id.startsWith('search')) {
      let search = dir.m_dir_id.substring('search'.length).split(' ') 

      let word = ''
      for (let i = 0; i < search.length; i++) {
        let itemstr = search[i]
        if (itemstr.split(':').length !== 2) {
          word += itemstr + ' '
          continue
        }

        let kv = search[i].split(':')
        let k = kv[0]
        let v = kv[1]
        if (k == 'type') {
          let arr = v.split(',')
          let type = ''
          for (let j = 0; j < arr.length; j++) {
            if (arr[j] == 'folder') type += 'type="' + arr[j] + '" or ' 
            else if (arr[j]) type += 'category="' + arr[j] + '" or ' 
          }
          type = type.substring(0, type.length - 4).trim()
          if (type && type.indexOf(' or ') > 0) query += '(' + type + ') and '
          else if (type) query += type + ' and '
        } else if (k == 'size') {
          let size = parseInt(v)
          if (size > 0) query += 'size = ' + v + ' and '
        } else if (k == 'max') {
          let max = parseInt(v)
          if (max > 0) query += 'size <= ' + v + ' and '
        } else if (k == 'min') {
          let min = parseInt(v)
          if (min > 0) query += 'size >= ' + v + ' and '
        } else if (k == 'begin') {
          let dt = new Date(v).toISOString()
          query += 'updated_at >= "' + dt.substring(0, dt.lastIndexOf('.')) + '" and '
        } else if (k == 'end') {
          let dt = new Date(v).toISOString()
          query += 'updated_at <= "' + dt.substring(0, dt.lastIndexOf('.')) + '" and '
        } else if (k == 'ext') {
          let arr = v.split(',')
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
    const postdata = {
      drive_id: dir.m_drive_id,
      marker: dir.next_marker,
      limit: 100 ,
      fields: '*',
      query: query,
      order_by: orderby
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(dir, resp, pageindex)
  }

  static async _ApiVideoListRecent(dir: IAliFileResp) {
    //https://api.aliyundrive.com/adrive/v2/video/recentList
    const url = 'adrive/v2/video/recentList'
    const postdata = {}
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(dir, resp, 0)
  }
  static async _ApiVideoListOnePage(order_by: string, dir: IAliFileResp, pageindex: number) {
    const url = 'adrive/v2/video/list'
    const postdata = {
      use_compilation: true,
      duration: 0,
      order_by: order_by.toLowerCase(),
      hidden_type: 'NO_HIDDEN',
      limit: AliDirFileList.LimitMax,
      marker: dir.next_marker,
      url_expire_sec: 14400
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(dir, resp, pageindex)
  }
  static async _ApiVideoFileListOnePage(order_by: string, dir: IAliFileResp, pageindex: number) {
    const url = 'adrive/v2/video/compilation/list'
    const postdata = {
      name: dir.m_dir_id.substring('video'.length),
      use_compilation: true,
      duration: 0,
      order_by: order_by.toLowerCase(),
      hidden_type: 'NO_HIDDEN',
      limit: AliDirFileList.LimitMax,
      marker: dir.next_marker,
      url_expire_sec: 14400
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    return AliDirFileList._FileListOnePage(dir, resp, pageindex)
  }

  
  static _FileListOnePage(dir: IAliFileResp, resp: IUrlRespData, pageindex: number) {
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        const dirpart: IAliFileResp = {
          items: [],
          itemsKey: new Set(),
          punished_file_count: 0,
          next_marker: dir.next_marker,
          m_user_id: dir.m_user_id,
          m_drive_id: dir.m_drive_id,
          m_dir_id: dir.m_dir_id,
          m_dir_name: dir.m_dir_name
        }

        dir.next_marker = resp.body.next_marker || ''
        const isrecover = dir.m_dir_id == 'recover'
        const isvideo = dir.m_dir_id.startsWith('video')
        const downurl = isrecover ? '' : 'https://api.aliyundrive.com/v2/file/download?t=' + Date.now().toString() 
        if (resp.body.items) {
          for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
            const item = resp.body.items[i] as IAliFileItem
            if (isvideo) {
              if (!item.compilation_id && (!item.drive_id || !item.file_id)) continue 
              /** 1.单独的一个视频并且不属于任何专辑 有drive_id,file_id */
              if (!item.compilation_id) {
                item.type = 'file'
                item.compilation_id = item.drive_id + '_' + item.file_id
              }
              /** 2.一个文件夹&&一个专辑  有compilation_id */
              if (item.video_type == 'COMPILATION') {
                item.type = 'folder'
                item.drive_id = item.compilation_id.split('_')[0]
                item.file_id = item.compilation_id.split('_')[1]
              }
              /** 3.一个文件&&属于一个专辑 有compilation_id,drive_id,file_id */
            }
            if (dir.itemsKey.has(item.file_id)) continue
            const add = AliDirFileList.getFileInfo(item, downurl)
            if (isrecover) add.description = item.content_hash
            if (isvideo) {
              add.compilation_id = item.compilation_id
            }
            dirpart.items.push(add)
            dir.items.push(add)
            dir.itemsKey.add(item.file_id)
          }
        }
        dirpart.punished_file_count = resp.body.punished_file_count || 0
        dir.punished_file_count += resp.body.punished_file_count || 0

        let pan = usePanFileStore()
        if (pan.DriveID == dir.m_drive_id) pan.mSaveDirFileLoadingPart(pageindex, dirpart)

        if (isvideo && dir.items.length >= 500) dir.next_marker = ''
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
      }
    } catch (e: any) {
      DebugLog.mSaveLog('danger', '_FileListOnePage' + dir.m_dir_id + ' error=' + (e.message || ''))
    }
    dir.next_marker = 'error ' + resp.code
    return false
  }
}

/**
 category,created_at,domain_id,drive_id,file_extension,file_id,hidden,image_media_metadata,mime_extension,mime_type,name,parent_file_id,punish_flag,revision_id,size,starred,type,updated_at,description
 */
