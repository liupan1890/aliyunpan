import DebugLog from '../utils/debuglog'
import AliHttp, { IUrlRespData } from './alihttp'
import { IAliFileItem } from './alimodels'
import AliDirFileList, { IAliFileResp } from './dirfilelist'

export default class AliFileWalk {
  static async ApiWalkFileList(user_id: string, drive_id: string, dirID: string, dirName: string, order: string, type: string = '', max: number = 3000): Promise<IAliFileResp> {
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

    if (!order) order = 'updated_at desc'
    const orders = order.split(' ')
    do {
      const isGet = await AliFileWalk._ApiWalkFileListOnePage(orders[0], orders[1], dir, type)
      if (isGet != true) {
        break 
      }
      if (dir.items.length >= max && max > 0) {
        dir.next_marker = '' 
        break
      }
    } while (dir.next_marker != '')
    return dir
  }

  private static async _ApiWalkFileListOnePage(orderby: string, order: string, dir: IAliFileResp, type: string = '') {
    const url = 'v2/file/walk?jsonmask=next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(category%2Ccreated_at%2Cdomain_id%2Cdrive_id%2Cfile_extension%2Cfile_id%2Chidden%2Cmime_extension%2Cmime_type%2Cname%2Cparent_file_id%2Cpunish_flag%2Csize%2Cstarred%2Ctype%2Cupdated_at%2Cdescription)'
    let postData = {
      drive_id: dir.m_drive_id,
      parent_file_id: dir.dirID,
      marker: dir.next_marker,
      limit: 1000,
      all: false,
      url_expire_sec: 14400,
      fields: 'thumbnail'
      // order_by: orderby,
      // order_direction: order.toUpperCase()
    }
    if (type) postData = Object.assign(postData, { type })
    const resp = await AliHttp.Post(url, postData, dir.m_user_id, '')
    return AliFileWalk._FileListOnePage(dir, resp)
  }

  private static _FileListOnePage(dir: IAliFileResp, resp: IUrlRespData) {
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        dir.next_marker = resp.body.next_marker
        const isRecover = dir.dirID == 'recover'
        const downUrl = isRecover ? '' : 'https://api.aliyundrive.com/v2/file/download?t=' + Date.now().toString() 

        for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
          const item = resp.body.items[i] as IAliFileItem
          if (dir.itemsKey.has(item.file_id)) continue
          const add = AliDirFileList.getFileInfo(item, downUrl)
          if (isRecover) add.description = item.content_hash
          dir.items.push(add)
          dir.itemsKey.add(item.file_id)
        }
        dir.punished_file_count += resp.body.punished_file_count || 0

        return true
      } else if (resp.code == 404) {
        
        dir.items.length = 0
        dir.next_marker = ''
        return true
      } else if (resp.body && resp.body.code) {
        dir.items.length = 0
        dir.next_marker = resp.body.code 
        // message.warning('列出文件出错 ' + resp.body.code, 2)
        return false
      } else {
        DebugLog.mSaveWarning('_FileListOnePage err=' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveDanger('_FileListOnePage ' + dir.dirID, err)
    }
    dir.next_marker = 'error ' + resp.code
    console.log(resp)
    return false
  }
}
