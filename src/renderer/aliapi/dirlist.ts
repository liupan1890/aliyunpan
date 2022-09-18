import DebugLog from '../utils/debuglog'
import { MapValueToArray } from '../utils/utils'
import AliHttp from './alihttp'
import { IAliGetDirModel, IAliGetFileModel } from './alimodels'
import AliDirFileList from './dirfilelist'
import dayjs from 'dayjs'
import AliTrash from './trash'
import { DirData } from '../store/treestore'
import AliUser from './user'

export interface IAliDirResp {
  items: IAliGetDirModel[]
  next_marker: string

  m_user_id: string 
  m_drive_id: string 
  m_dir_id: string 
  m_dir_name: string 
}

export interface IDirDataResp {
  items: DirData[]
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
    const result: IAliDirResp = {
      items: [],
      next_marker: '',
      m_user_id: user_id,
      m_drive_id: drive_id,
      m_dir_id: 'root',
      m_dir_name: ''
    }
    if (!user_id || !drive_id) return result

    const Lock = new Set<string>()
    let AllMap = new Map<string, IAliGetDirModel>()
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
                let add: IAliGetDirModel = {
                  __v_skip: true,
                  drive_id: item.drive_id,
                  file_id: item.file_id,
                  parent_file_id: item.parent_file_id,
                  name: item.name,
                  namesearch: '',
                  size: item.size || 0,
                  time: new Date(item.updated_at).getTime(),
                  
                  description: item.description || ''
                }
                AllMap.set(add.file_id, add)
                Lock.add(item.file_id)
              }
            }
            for (let i = 0, maxi = resp2.body.items.length; i < maxi; i++) {
              let item = resp2.body.items[i]
              if (Lock.has(item.file_id)) {
                isFind = true
              } else {
                let add: IAliGetDirModel = {
                  __v_skip: true,
                  drive_id: item.drive_id,
                  file_id: item.file_id,
                  parent_file_id: item.parent_file_id,
                  name: item.name,
                  namesearch: '',
                  size: item.size || 0,
                  time: new Date(item.updated_at).getTime(),
                  
                  description: item.description || ''
                }
                AllMap.set(add.file_id, add)
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
        } else if (resp.code == 402) {
          
          DebugLog.mSaveWarning('ApiFastAllDirList err=' + drive_id + ' ' + (resp.code || ''))
          break
        } else {
          errmsg += 'err' + (resp.code || '')
          DebugLog.mSaveWarning('ApiFastAllDirList err=' + (resp.code || ''))
        }
      } catch (err: any) {
        
        errmsg += 'err' + (err.message || '')
        DebugLog.mSaveWarning('ApiFastAllDirList', err)
        break
      }
    }

    const list = MapValueToArray(AllMap)
    console.log('listcount', list.length)
    result.items = errmsg ? [] : list
    result.next_marker = errmsg

    return result
  }
  
  static async ApiBatchDirFileList(user_id: string, drive_id: string, dirlist: IAliDirBatchResp[], limit: number, listtypeorquery: string) {
    if (!user_id || !drive_id) return false

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
      } else {
        DebugLog.mSaveWarning('ApiBatchDirFileList err=' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveWarning('ApiBatchDirFileList', err)
    }
    return false
  }

  
  static async ApiFastAllDirListByTime(user_id: string, drive_id: string, created_at: Date): Promise<IAliDirResp> {
    const result: IAliDirResp = {
      items: [],
      next_marker: '',
      m_user_id: user_id,
      m_drive_id: drive_id,
      m_dir_id: 'root',
      m_dir_name: ''
    }
    if (!user_id || !drive_id) return result

    
    let AllMap = new Map<string, IAliGetDirModel>()

    let dirlist: IAliDirBatchResp[] = []
    let time = dayjs(created_at).add(1, 'hour')
    let DAY = 10
    let END = dayjs().add(DAY + 1, 'day')
    let errmsg = ''
    while (true) {
      while (dirlist.length < 30) {
        let timeend = time.add(DAY, 'day')
        if (timeend.isBefore(END)) {
          let dir_id = 'created_at > "' + time.toISOString().substring(0, 19) + '" and created_at <= "' + timeend.toISOString().substring(0, 19) + '"'
          dirlist.push({ dir_id: dir_id, next_marker: '', items: [], itemsKey: new Set() })
          time = timeend
        } else break
      }
      if (dirlist.length == 0) break
      console.log('dirlist.length', dirlist.length)

      let postdata = '{"requests":['
      for (let i = 0, maxi = dirlist.length; i < maxi; i++) {
        if (i > 0) postdata = postdata + ','
        let query = 'type="folder" and ' + dirlist[i].dir_id
        const data2 = {
          body: {
            drive_id: drive_id,
            query: query,
            marker: dirlist[i].next_marker,
            limit: 100,
            fields: 'thumbnail'
          },
          headers: { 'Content-Type': 'application/json' },
          id: dirlist[i].dir_id.replaceAll('"', '').replaceAll(' ', '').replaceAll('-', '').replaceAll(':', '').replaceAll(',', ''),
          method: 'POST',
          url: '/file/search'
        }
        postdata = postdata + JSON.stringify(data2)
      }
      postdata += '],"resource":"file"}'

      const url = 'v2/batch?jsonmask=responses(id%2Cstatus%2Cbody(next_marker%2Citems(name%2Cfile_id%2Cdrive_id%2Cupdated_at%2Csize%2Cdescription%2Cparent_file_id)))'
      const resp = await AliHttp.Post(url, postdata, user_id, '')

      try {
        if (AliHttp.IsSuccess(resp.code)) {
          const responses = resp.body.responses
          let list: IAliDirBatchResp[] = []
          for (let j = 0, maxj = responses.length; j < maxj; j++) {
            const status = responses[j].status as number
            if (status >= 200 && status <= 205) {
              const respi = responses[j]
              const id = respi.id || ''
              for (let i = 0, maxi = dirlist.length; i < maxi; i++) {
                if (dirlist[i].dir_id.replaceAll('"', '').replaceAll(' ', '').replaceAll('-', '').replaceAll(':', '').replaceAll(',', '') == id) {
                  const dir = dirlist[i]
                  const items = respi.body.items
                  dir.next_marker = respi.body.next_marker
                  if (dir.next_marker) list.push(dir)
                  for (let i = 0, maxi = items.length; i < maxi; i++) {
                    if (AllMap.has(items[i].file_id)) continue
                    let item = items[i]
                    let add: IAliGetDirModel = {
                      __v_skip: true,
                      drive_id: item.drive_id,
                      file_id: item.file_id,
                      parent_file_id: item.parent_file_id,
                      name: item.name,
                      namesearch: '',
                      size: item.size || 0,
                      time: new Date(item.updated_at).getTime(),
                      
                      description: item.description || ''
                    }
                    AllMap.set(add.file_id, add)
                  }
                  break
                }
              }
            }
          }
          dirlist.length = 0
          dirlist = list
        } else {
          errmsg = (resp.code || '').toString()
          DebugLog.mSaveWarning('SSApiBatchDirFileList err=' + (resp.code || ''))
        }
      } catch (err: any) {
        errmsg = err.message || ''
        DebugLog.mSaveWarning('ApiBatchDirFileList', err)
      }
    }

    const list = MapValueToArray(AllMap)
    console.log('listcount', list.length)
    result.items = errmsg ? [] : list
    result.next_marker = errmsg
    return result
  }

  static async _ApiDirFileListInfo(user_id: string, drive_id: string) {
    let url = 'adrive/v3/file/search'
    let postdata = {
      drive_id: drive_id,
      marker: '',
      limit: 1,
      all: false,
      url_expire_sec: 14400,
      fields: 'thumbnail',
      query: 'type="folder"',
      order_by: 'created_at ASC',
      return_total_count: true
    }
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        let items = resp.body.items || []
        let created_at = items.length > 0 ? new Date(items[0].created_at) : new Date()
        let total_count = resp.body.total_count || 0
        return { created_at, total_count }
      } else {
        DebugLog.mSaveWarning('_ApiDirFileListInfo err=' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveDanger('_ApiDirFileListInfo', err)
    }
    return { created_at: new Date(), total_count: 0 }
  }
  
  static async ApiFastAllDirListByPID(user_id: string, drive_id: string): Promise<IDirDataResp> {
    const result: IDirDataResp = {
      items: [],
      next_marker: '',
      m_user_id: user_id,
      m_drive_id: drive_id,
      m_dir_id: 'root',
      m_dir_name: ''
    }
    if (!user_id || !drive_id) return result

    let AllMap = new Map<string, DirData>()
    let DirCount = await AliUser.ApiUserDriveFileCount(user_id, '', 'folder')
    let PIDList: string[] = []
    
    let root = await AliTrash.ApiDirFileListNoLock(user_id, drive_id, 'root', '', 'name ASC', 'folder', 0)
    for (let i = 0, maxi = root.items.length; i < maxi; i++) {
      let item = root.items[i]
      let add: DirData = {
        file_id: item.file_id,
        parent_file_id: item.parent_file_id,
        name: item.name,
        time: item.time,
        size: 0
      }

      AllMap.set(add.file_id, add)
      PIDList.push(add.file_id)
    }

    
    let dirlist: IAliDirBatchResp[] = []
    let errmsg = ''
    let index = 0
    while (true) {
      while (dirlist.length < 30) {
        if (PIDList.length > index) {
          let dir_id = 'parent_file_id in ['
          let add = 0
          for (let maxj = PIDList.length; index < maxj; index++) {
            dir_id += add == 0 ? '"' + PIDList[index] + '"' : ',"' + PIDList[index] + '"'
            add++
            if (add >= 50) break
          }
          dir_id += ']'
          dirlist.push({ dir_id: dir_id, next_marker: '', items: [], itemsKey: new Set() })
        } else break
      }
      if (dirlist.length == 0) break

      let postdata = '{"requests":['
      for (let i = 0, maxi = dirlist.length; i < maxi; i++) {
        if (i > 0) postdata = postdata + ','
        let query = 'type="folder" and ' + dirlist[i].dir_id
        const data2 = {
          body: {
            drive_id: drive_id,
            query: query,
            marker: dirlist[i].next_marker,
            limit: 100,
            fields: 'thumbnail',
            order_by: 'name ASC'
          },
          headers: { 'Content-Type': 'application/json' },
          id: dirlist[i].dir_id.replaceAll('"', '').replaceAll(' ', '').replaceAll(',', '').substring(0, 54),
          method: 'POST',
          url: '/file/search'
        }
        postdata = postdata + JSON.stringify(data2)
      }
      postdata += '],"resource":"file"}'

      const url = 'v2/batch?jsonmask=responses(id%2Cstatus%2Cbody(next_marker%2Citems(name%2Cfile_id%2Cdrive_id%2Cupdated_at%2Csize%2Cdescription%2Cparent_file_id)))'
      const resp = await AliHttp.Post(url, postdata, user_id, '')

      try {
        if (AliHttp.IsSuccess(resp.code)) {
          const responses = resp.body.responses
          let list: IAliDirBatchResp[] = []
          for (let j = 0, maxj = responses.length; j < maxj; j++) {
            const status = responses[j].status as number
            if (status >= 200 && status <= 205) {
              const respi = responses[j]
              const id = respi.id || ''
              for (let i = 0, maxi = dirlist.length; i < maxi; i++) {
                if (dirlist[i].dir_id.replaceAll('"', '').replaceAll(' ', '').replaceAll(',', '').substring(0, 54) == id) {
                  const dir = dirlist[i]
                  const items = respi.body.items
                  dir.next_marker = respi.body.next_marker
                  if (dir.next_marker) list.push(dir)
                  for (let i = 0, maxi = items.length; i < maxi; i++) {
                    if (AllMap.has(items[i].file_id)) continue
                    let item = items[i]
                    let add: DirData = {
                      file_id: item.file_id,
                      parent_file_id: item.parent_file_id,
                      name: item.name,
                      time: new Date(item.updated_at).getTime(),
                      size: 0
                    }
                    AllMap.set(add.file_id, add)
                    PIDList.push(add.file_id)
                  }
                  break
                }
              }
            }
          }
          dirlist.length = 0
          dirlist = list
          if (window.WinMsgToMain) window.WinMsgToMain({ cmd: 'MainShowAllDirProgress', drive_id, index: AllMap.size, total: DirCount })
        } else {
          errmsg = (resp.code || '').toString()
          DebugLog.mSaveWarning('SSApiBatchDirFileList err=' + (resp.code || ''))
        }
      } catch (err: any) {
        errmsg = err.message || ''
        DebugLog.mSaveWarning('ApiBatchDirFileList', err)
      }
    }

    const list = MapValueToArray(AllMap)
    console.log('listcount', list.length)
    result.items = errmsg ? [] : list
    result.next_marker = errmsg

    return result
  }
}
