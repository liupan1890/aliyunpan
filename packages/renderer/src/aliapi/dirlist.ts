import DebugLog from '@/utils/debuglog'
import { HanToPin } from '@/utils/utils'
import AliHttp from './alihttp'
import { IAliGetDirModel, IAliGetFileModel } from './alimodels'
import AliDirFileList from './dirfilelist'

export interface IAliDirResp {
  items: IAliGetDirModel[]
  next_marker: string

  m_user_id: string 
  m_drive_id: string 
  m_dir_id: string 
  m_dir_name: string 
}

export interface IAliDirBatchResp {
  items: IAliGetFileModel[]
  itemsKey: Set<string>
  next_marker: string
  dir_id: string 
}

export default class AliDirList {
  
  static async ApiFastAllDirList(user_id: string, drive_id: string): Promise<IAliDirResp> {
    const Lock = new Set<string>()
    const list1: IAliGetDirModel[] = []
    const list2: IAliGetDirModel[] = []
    let errmsg = ''
    let next_marker1 = ''
    let next_marker2 = ''
    while (true) {
      let postdata = '{"requests":['
      postdata += '{"body": {"drive_id": "' + drive_id + '","query": "type = \\"folder\\"","limit": 100,"fields": "thumbnail","order_by":"name ASC"' + (next_marker1 ? ',"marker":"' + next_marker1 + '"' : '') + '},'
      postdata += '"headers": { "Content-Type": "application/json" }, "id": "id1","method": "POST","url": "/file/search"},'
      postdata += '{"body": {"drive_id": "' + drive_id + '","query": "type = \\"folder\\"","limit": 100,"fields": "thumbnail","order_by":"name DESC"' + (next_marker2 ? ',"marker":"' + next_marker2 + '"' : '') + '},'
      postdata += '"headers": { "Content-Type": "application/json" }, "id": "id2","method": "POST","url": "/file/search"}'
      postdata += '],"resource":"file"}'

      const url = 'v2/batch?jsonmask=responses(id%2Cstatus%2Cbody(next_marker%2Citems(name%2Cfile_id%2Cdrive_id%2Cupdated_at%2Csize%2Cdescription%2Cparent_file_id)))'
      const resp = await AliHttp.Post(url, postdata, user_id, '')

      try {
        if (AliHttp.IsSuccess(resp.code)) {
          const resp1 = resp.body.responses[0]
          const resp2 = resp.body.responses[1]
          if (resp1.status >= 200 && resp1.status <= 205 && resp2.status >= 200 && resp2.status <= 205) {
            next_marker1 = resp1.body.next_marker
            next_marker2 = resp2.body.next_marker

            let isFind = false
            for (let i = 0, maxi = resp1.body.items.length; i < maxi; i++) {
              let item = resp1.body.items[i]
              if (Lock.has(item.file_id)) {
                isFind = true
              } else {
                list1.push({
                  __v_skip: true,
                  drive_id: item.drive_id,
                  file_id: item.file_id,
                  parent_file_id: item.parent_file_id,
                  name: item.name,
                  namesearch: '',
                  size: item.size || 0,
                  time: new Date(item.updated_at).getTime(),
                  
                  description: item.description || ''
                })
                Lock.add(item.file_id)
              }
            }
            for (let i = 0, maxi = resp2.body.items.length; i < maxi; i++) {
              let item = resp2.body.items[i]
              if (Lock.has(item.file_id)) {
                isFind = true
              } else {
                list2.push({
                  __v_skip: true,
                  drive_id: item.drive_id,
                  file_id: item.file_id,
                  parent_file_id: item.parent_file_id,
                  name: item.name,
                  namesearch: '',
                  size: item.size || 0,
                  time: new Date(item.updated_at).getTime(),
                  
                  description: item.description || ''
                })
                Lock.add(item.file_id)
              }
            }
            if (isFind) break 
            if (resp1.body.next_marker == '' && resp2.body.next_marker == '') break 
          } else {
            
            errmsg += 'err1' + (resp1.status || '')
            errmsg += 'err2' + (resp2.status || '')
            break
          }
        }
      } catch (err: any) {
        
        errmsg += 'err' + (err.message || '')
        DebugLog.mSaveLog('warning', 'ApiFastAllDirList err=' + (err.message || ''))
        break
      }
    }

    const list = list1.concat(list2.reverse())
    const result: IAliDirResp = {
      items: errmsg ? [] : list,
      next_marker: errmsg,
      m_user_id: user_id,
      m_drive_id: drive_id,
      m_dir_id: 'root',
      m_dir_name: ''
    }
    return result
  }
  
  static async ApiBatchDirFileList(user_id: string, drive_id: string, dirlist: IAliDirBatchResp[], limit: number, listtypeorquery: string) {
    let postdata = '{"requests":['
    for (let i = 0, maxi = dirlist.length; i < maxi; i++) {
      if (i > 0) postdata = postdata + ','

      let query = 'parent_file_id="' + dirlist[i].dir_id + '"'
      if (listtypeorquery == 'all') query = 'parent_file_id="' + dirlist[i].dir_id + '"'
      else if (listtypeorquery == 'folder') query = 'parent_file_id="' + dirlist[i].dir_id + '" and type = "folder"'
      else if (listtypeorquery == 'file') query = 'parent_file_id="' + dirlist[i].dir_id + '" and type = "file"'
      else query = query + listtypeorquery
      const data2 = {
        body: {
          drive_id: drive_id,
          query: query,
          marker: dirlist[i].next_marker,
          url_expire_sec: 14400,
          limit: limit,
          //fields: 'thumbnail',
          image_thumbnail_process: '',
          video_thumbnail_process: '',
          image_url_process: ''
        },
        headers: { 'Content-Type': 'application/json' },
        id: dirlist[i].dir_id,
        method: 'POST',
        url: '/file/search'
      }
      postdata = postdata + JSON.stringify(data2)
    }
    postdata += '],"resource":"file"}'

    const url = 'v2/batch'
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    try {
      if (AliHttp.IsSuccess(resp.code)) {
        const responses = resp.body.responses
        for (let j = 0, maxj = responses.length; j < maxj; j++) {
          const status = responses[j].status as number
          if (status >= 200 && status <= 205) {
            const respi = responses[j]
            const id = respi.id || ''
            for (let i = 0, maxi = dirlist.length; i < maxi; i++) {
              if (dirlist[i].dir_id == id) {
                const dir = dirlist[i]
                dir.next_marker = respi.body.next_marker
                const items = respi.body.items
                for (let i = 0, maxi = items.length; i < maxi; i++) {
                  const add = AliDirFileList.getFileInfo(items[i], '')
                  dir.items.push(add)
                }
                break
              }
            }
          }
        }
        return true
      }
    } catch (err: any) {
      DebugLog.mSaveLog('warning', 'ApiBatchDirFileList err=' + (err.message || ''))
    }
    return false
  }
}
