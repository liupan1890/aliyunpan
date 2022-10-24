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
  dirID: string 
  dirName: string 
}

export interface IDirDataResp {
  items: DirData[]
  next_marker: string

  m_user_id: string 
  m_drive_id: string 
  dirID: string 
  dirName: string 
}

export interface IAliDirBatchResp {
  items: IAliGetFileModel[]
  itemsKey: Set<string>
  next_marker: string
  dirID: string 
}

export default class AliDirList {
  
  static async ApiFastAllDirList(user_id: string, drive_id: string): Promise<IAliDirResp> {
    const result: IAliDirResp = {
      items: [],
      next_marker: '',
      m_user_id: user_id,
      m_drive_id: drive_id,
      dirID: 'root',
      dirName: ''
    }
    if (!user_id || !drive_id) return result

    const lockSet = new Set<string>()
    const allMap = new Map<string, IAliGetDirModel>()
    let errorMessage = ''
    let next_marker1 = ''
    let next_marker2 = ''
    while (true) {
      let postData = '{"requests":['
      postData += '{"body": {"drive_id": "' + drive_id + '","query": "type = \\"folder\\"","limit": 100,"fields": "thumbnail","order_by":"name ASC"' + (next_marker1 ? ',"marker":"' + next_marker1 + '"' : '') + '},'
      postData += '"headers": { "Content-Type": "application/json" }, "id": "id1","method": "POST","url": "/file/search"},'
      postData += '{"body": {"drive_id": "' + drive_id + '","query": "type = \\"folder\\"","limit": 100,"fields": "thumbnail","order_by":"name DESC"' + (next_marker2 ? ',"marker":"' + next_marker2 + '"' : '') + '},'
      postData += '"headers": { "Content-Type": "application/json" }, "id": "id2","method": "POST","url": "/file/search"}'
      postData += '],"resource":"file"}'

      const url = 'v2/batch?jsonmask=responses(id%2Cstatus%2Cbody(next_marker%2Citems(name%2Cfile_id%2Cdrive_id%2Cupdated_at%2Csize%2Cdescription%2Cparent_file_id)))'
      const resp = await AliHttp.Post(url, postData, user_id, '')

      try {
        if (AliHttp.IsSuccess(resp.code)) {
          const resp1 = resp.body.responses[0]
          const resp2 = resp.body.responses[1]
          if (resp1.status >= 200 && resp1.status <= 205 && resp2.status >= 200 && resp2.status <= 205) {
            next_marker1 = resp1.body.next_marker
            next_marker2 = resp2.body.next_marker

            let isFind = false
            for (let i = 0, maxi = resp1.body.items.length; i < maxi; i++) {
              const item = resp1.body.items[i]
              if (lockSet.has(item.file_id)) {
                isFind = true
              } else {
                const add: IAliGetDirModel = {
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
                allMap.set(add.file_id, add)
                lockSet.add(item.file_id)
              }
            }
            for (let i = 0, maxi = resp2.body.items.length; i < maxi; i++) {
              const item = resp2.body.items[i]
              if (lockSet.has(item.file_id)) {
                isFind = true
              } else {
                const add: IAliGetDirModel = {
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
                allMap.set(add.file_id, add)
                lockSet.add(item.file_id)
              }
            }
            if (isFind) break 
            if (resp1.body.next_marker == '' && resp2.body.next_marker == '') break 
          } else {
            
            errorMessage += 'err1' + (resp1.status || '')
            errorMessage += 'err2' + (resp2.status || '')
            break
          }
        } else if (resp.code == 402) {
          
          DebugLog.mSaveWarning('ApiFastAllDirList err=' + drive_id + ' ' + (resp.code || ''))
          break
        } else {
          errorMessage += 'err' + (resp.code || '')
          DebugLog.mSaveWarning('ApiFastAllDirList err=' + (resp.code || ''))
        }
      } catch (err: any) {
        
        errorMessage += 'err' + (err.message || '')
        DebugLog.mSaveWarning('ApiFastAllDirList', err)
        break
      }
    }

    const list = MapValueToArray(allMap)
    console.log('listcount', list.length)
    result.items = errorMessage ? [] : list
    result.next_marker = errorMessage

    return result
  }

  
  static async ApiBatchDirFileList(user_id: string, drive_id: string, dirList: IAliDirBatchResp[], limit: number, listTypeOrQuery: string): Promise<boolean> {
    if (!user_id || !drive_id) return false

    let postData = '{"requests":['
    for (let i = 0, maxi = dirList.length; i < maxi; i++) {
      if (i > 0) postData = postData + ','

      let query = 'parent_file_id="' + dirList[i].dirID + '"'
      if (listTypeOrQuery == 'all') query = 'parent_file_id="' + dirList[i].dirID + '"'
      else if (listTypeOrQuery == 'folder') query = 'parent_file_id="' + dirList[i].dirID + '" and type = "folder"'
      else if (listTypeOrQuery == 'file') query = 'parent_file_id="' + dirList[i].dirID + '" and type = "file"'
      else query = query + listTypeOrQuery
      const data2 = {
        body: {
          drive_id: drive_id,
          query: query,
          marker: dirList[i].next_marker,
          url_expire_sec: 14400,
          limit: limit,
          // fields: 'thumbnail',
          image_thumbnail_process: '',
          video_thumbnail_process: '',
          image_url_process: ''
        },
        headers: { 'Content-Type': 'application/json' },
        id: dirList[i].dirID,
        method: 'POST',
        url: '/file/search'
      }
      postData = postData + JSON.stringify(data2)
    }
    postData += '],"resource":"file"}'

    const url = 'v2/batch'
    const resp = await AliHttp.Post(url, postData, user_id, '')

    try {
      if (AliHttp.IsSuccess(resp.code)) {
        const responses = resp.body.responses
        for (let j = 0, maxj = responses.length; j < maxj; j++) {
          const status = responses[j].status as number
          if (status >= 200 && status <= 205) {
            const respi = responses[j]
            const id = respi.id || ''
            for (let i = 0, maxi = dirList.length; i < maxi; i++) {
              if (dirList[i].dirID == id) {
                const dir = dirList[i]
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
      dirID: 'root',
      dirName: ''
    }
    if (!user_id || !drive_id) return result

    
    const allMap = new Map<string, IAliGetDirModel>()

    let dirList: IAliDirBatchResp[] = []
    let time = dayjs(created_at).add(1, 'hour')
    const day = 10
    const end = dayjs().add(day + 1, 'day')
    let errorMessage = ''
    while (true) {
      while (dirList.length < 30) {
        const timeEnd = time.add(day, 'day')
        if (timeEnd.isBefore(end)) {
          const dirID = 'created_at > "' + time.toISOString().substring(0, 19) + '" and created_at <= "' + timeEnd.toISOString().substring(0, 19) + '"'
          dirList.push({ dirID: dirID, next_marker: '', items: [], itemsKey: new Set() } as IAliDirBatchResp)
          time = timeEnd
        } else break
      }
      if (dirList.length == 0) break
      console.log('dirList.length', dirList.length)

      let postData = '{"requests":['
      for (let i = 0, maxi = dirList.length; i < maxi; i++) {
        if (i > 0) postData = postData + ','
        const query = 'type="folder" and ' + dirList[i].dirID
        const data2 = {
          body: {
            drive_id: drive_id,
            query: query,
            marker: dirList[i].next_marker,
            limit: 100,
            fields: 'thumbnail'
          },
          headers: { 'Content-Type': 'application/json' },
          id: dirList[i].dirID.replaceAll('"', '').replaceAll(' ', '').replaceAll('-', '').replaceAll(':', '').replaceAll(',', ''),
          method: 'POST',
          url: '/file/search'
        }
        postData = postData + JSON.stringify(data2)
      }
      postData += '],"resource":"file"}'

      const url = 'v2/batch?jsonmask=responses(id%2Cstatus%2Cbody(next_marker%2Citems(name%2Cfile_id%2Cdrive_id%2Cupdated_at%2Csize%2Cdescription%2Cparent_file_id)))'
      const resp = await AliHttp.Post(url, postData, user_id, '')

      try {
        if (AliHttp.IsSuccess(resp.code)) {
          const responses = resp.body.responses
          const list: IAliDirBatchResp[] = []
          for (let j = 0, maxj = responses.length; j < maxj; j++) {
            const status = responses[j].status as number
            if (status >= 200 && status <= 205) {
              const respi = responses[j]
              const id = respi.id || ''
              for (let i = 0, maxi = dirList.length; i < maxi; i++) {
                if (dirList[i].dirID.replaceAll('"', '').replaceAll(' ', '').replaceAll('-', '').replaceAll(':', '').replaceAll(',', '') == id) {
                  const dir = dirList[i]
                  const items = respi.body.items
                  dir.next_marker = respi.body.next_marker
                  if (dir.next_marker) list.push(dir)
                  for (let i = 0, maxi = items.length; i < maxi; i++) {
                    if (allMap.has(items[i].file_id)) continue
                    const item = items[i]
                    const add: IAliGetDirModel = {
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
                    allMap.set(add.file_id, add)
                  }
                  break
                }
              }
            }
          }
          dirList.length = 0
          dirList = list
        } else {
          errorMessage = (resp.code || '').toString()
          DebugLog.mSaveWarning('SSApiBatchDirFileList err=' + (resp.code || ''))
        }
      } catch (err: any) {
        errorMessage = err.message || ''
        DebugLog.mSaveWarning('ApiBatchDirFileList', err)
      }
    }

    const list = MapValueToArray(allMap)
    console.log('listcount', list.length)
    result.items = errorMessage ? [] : list
    result.next_marker = errorMessage
    return result
  }

  static async _ApiDirFileListInfo(user_id: string, drive_id: string) {
    const url = 'adrive/v3/file/search'
    const postData = {
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
    const resp = await AliHttp.Post(url, postData, user_id, '')
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        const items = resp.body.items || []
        const created_at = items.length > 0 ? new Date(items[0].created_at) : new Date()
        const total_count = resp.body.total_count || 0
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
      dirID: 'root',
      dirName: ''
    }
    if (!user_id || !drive_id) return result

    const allMap = new Map<string, DirData>()
    const dirCount = await AliUser.ApiUserDriveFileCount(user_id, '', 'folder')
    const PIDList: string[] = []
    
    const root = await AliTrash.ApiDirFileListNoLock(user_id, drive_id, 'root', '', 'name ASC', 'folder', 0)
    for (let i = 0, maxi = root.items.length; i < maxi; i++) {
      const item = root.items[i]
      const add: DirData = {
        file_id: item.file_id,
        parent_file_id: item.parent_file_id,
        name: item.name,
        time: item.time,
        size: 0
      }

      allMap.set(add.file_id, add)
      PIDList.push(add.file_id)
    }

    
    let dirList: IAliDirBatchResp[] = []
    let errorMessage = ''
    let index = 0
    while (true) {
      while (dirList.length < 30) {
        if (PIDList.length > index) {
          let dirID = 'parent_file_id in ['
          let add = 0
          for (let maxj = PIDList.length; index < maxj; index++) {
            dirID += add == 0 ? '"' + PIDList[index] + '"' : ',"' + PIDList[index] + '"'
            add++
            if (add >= 50) break
          }
          dirID += ']'
          dirList.push({ dirID: dirID, next_marker: '', items: [], itemsKey: new Set() } as IAliDirBatchResp)
        } else break
      }
      if (dirList.length == 0) break

      let postData = '{"requests":['
      for (let i = 0, maxi = dirList.length; i < maxi; i++) {
        if (i > 0) postData = postData + ','
        const query = 'type="folder" and ' + dirList[i].dirID
        const data2 = {
          body: {
            drive_id: drive_id,
            query: query,
            marker: dirList[i].next_marker,
            limit: 100,
            fields: 'thumbnail',
            order_by: 'name ASC'
          },
          headers: { 'Content-Type': 'application/json' },
          id: dirList[i].dirID.replaceAll('"', '').replaceAll(' ', '').replaceAll(',', '').substring(0, 54),
          method: 'POST',
          url: '/file/search'
        }
        postData = postData + JSON.stringify(data2)
      }
      postData += '],"resource":"file"}'

      const url = 'v2/batch?jsonmask=responses(id%2Cstatus%2Cbody(next_marker%2Citems(name%2Cfile_id%2Cdrive_id%2Cupdated_at%2Csize%2Cdescription%2Cparent_file_id)))'
      const resp = await AliHttp.Post(url, postData, user_id, '')

      try {
        if (AliHttp.IsSuccess(resp.code)) {
          const responses = resp.body.responses
          const list: IAliDirBatchResp[] = []
          for (let j = 0, maxj = responses.length; j < maxj; j++) {
            const status = responses[j].status as number
            if (status >= 200 && status <= 205) {
              const respi = responses[j]
              const id = respi.id || ''
              for (let i = 0, maxi = dirList.length; i < maxi; i++) {
                if (dirList[i].dirID.replaceAll('"', '').replaceAll(' ', '').replaceAll(',', '').substring(0, 54) == id) {
                  const dir = dirList[i]
                  const items = respi.body.items
                  dir.next_marker = respi.body.next_marker
                  if (dir.next_marker) list.push(dir)
                  for (let i = 0, maxi = items.length; i < maxi; i++) {
                    if (allMap.has(items[i].file_id)) continue
                    const item = items[i]
                    const add: DirData = {
                      file_id: item.file_id,
                      parent_file_id: item.parent_file_id,
                      name: item.name,
                      time: new Date(item.updated_at).getTime(),
                      size: 0
                    }
                    allMap.set(add.file_id, add)
                    PIDList.push(add.file_id)
                  }
                  break
                }
              }
            }
          }
          dirList.length = 0
          dirList = list
          if (window.WinMsgToMain) window.WinMsgToMain({ cmd: 'MainShowAllDirProgress', drive_id, index: allMap.size, total: dirCount })
        } else {
          errorMessage = (resp.code || '').toString()
          DebugLog.mSaveWarning('SSApiBatchDirFileList err=' + (resp.code || ''))
        }
      } catch (err: any) {
        errorMessage = err.message || ''
        DebugLog.mSaveWarning('ApiBatchDirFileList', err)
      }
    }

    const list = MapValueToArray(allMap)
    console.log('listcount', list.length)
    result.items = errorMessage ? [] : list
    result.next_marker = errorMessage

    return result
  }
}
