import DebugLog from '@/utils/debuglog'
import message from '@/utils/message'
import AliHttp, { IUrlRespData } from './alihttp'
import { IAliFileItem } from './alimodels'
import AliDirFileList, { IAliFileResp } from './dirfilelist'

export default class AliTrash {
  
  static async ApiTrashFileListOnePageForClean(orderby: string, order: string, dir: IAliFileResp) {
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
    return AliTrash._FileListOnePage(dir, resp)
  }
  
  static async ApiFavorFileListOnePageForClean(orderby: string, order: string, dir: IAliFileResp) {
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
    return AliTrash._FileListOnePage(dir, resp)
  }

  /**
   * 一个文件夹的全部文件列表,copy弹窗调用
   */
  static async ApiDirFileListNoLock(user_id: string, drive_id: string, dir_id: string, dir_name: string, order: string, type: string = '', max: number = 3000): Promise<IAliFileResp> {
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
    let orders = order.split(' ')
    do {
      const isget = await AliTrash._ApiDirFileListOnePage(orders[0], orders[1], dir, type)
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
  static async _ApiDirFileListOnePage(orderby: string, order: string, dir: IAliFileResp, type: string = '') {
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
    return AliTrash._FileListOnePage(dir, resp)
  }
  static _FileListOnePage(dir: IAliFileResp, resp: IUrlRespData) {
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        dir.next_marker = resp.body.next_marker
        const isrecover = dir.m_dir_id == 'recover'
        const downurl = isrecover ? '' : 'https://api.aliyundrive.com/v2/file/download?t=' + Date.now().toString() 

        for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
          const item = resp.body.items[i] as IAliFileItem
          if (dir.itemsKey.has(item.file_id)) continue
          const add = AliDirFileList.getFileInfo(item, downurl)
          if (isrecover) add.description = item.content_hash
          dir.items.push(add)
          dir.itemsKey.add(item.file_id)
        }
        dir.punished_file_count = resp.body.punished_file_count || 0

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

  
  static async ApiFileListOnePageAria(orderby: string, order: string, dir: IAliFileResp) {
    const url = 'adrive/v3/file/list'
    const postdata = {
      drive_id: dir.m_drive_id,
      parent_file_id: dir.m_dir_id,
      marker: dir.next_marker,
      limit: 100,
      all: false,
      url_expire_sec: 14400,
      fields: 'thumbnail',
      order_by: orderby,
      order_direction: order
    }
    const resp = await AliHttp.Post(url, postdata, dir.m_user_id, '')
    //todo::
    //return AliDirFileList._FileListOnePage(dir, resp)
    return Promise.resolve(false)
  }
}
