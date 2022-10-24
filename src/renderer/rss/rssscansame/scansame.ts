import AliHttp from '../../aliapi/alihttp'
import { IAliGetDirModel } from '../../aliapi/alimodels'
import { IAliDirBatchResp } from '../../aliapi/dirlist'
import AliDirFileList from '../../aliapi/dirfilelist'
import DebugLog from '../../utils/debuglog'
import message from '../../utils/message'
import { Ref } from 'vue'
import { FileData, IScanDriverModel } from '../ScanDAL'


export async function GetSameFile(user_id: string, PanData: IScanDriverModel, Processing: Ref<number>, scanCount: Ref<number>, totalFileCount: Ref<number>, scanType: string) {
  scanCount.value = 0
  const keys = PanData.DirMap.keys() 
  let dirList: IAliDirBatchResp[] = []

  Processing.value = 0
  while (true) {
    let add = 0
    while (dirList.length < 20) {
      const key = keys.next()
      if (!key.done) {
        add++
        dirList.push({ dirID: key.value, next_marker: '', items: [], itemsKey: new Set() } as IAliDirBatchResp)
      } else break
    }
    Processing.value += add
    if (dirList.length == 0) break
    if (!PanData.drive_id) break 

    const isGet = await ApiBatchDirFileList(user_id, PanData.drive_id, dirList, scanType)
    if (isGet) {
      const list: IAliDirBatchResp[] = []
      for (let i = 0, maxi = dirList.length; i < maxi; i++) {
        if (dirList[i].next_marker && dirList[i].items.length < 2000) {
          list.push(dirList[i]) 
        } else {
          
          const fileList = dirList[i].items
          totalFileCount.value += fileList.length
          
          for (let j = 0, maxj = fileList.length; j < maxj; j++) {
            const fileItem = fileList[j]
            const hash = fileItem.namesearch
            if (hash) {
              let saveList = PanData.SameDirMap.get(hash)
              if (!saveList) saveList = []

              if (saveList.length < 50) {
                
                saveList.push({
                  file_id: fileItem.file_id,
                  name: fileItem.name,
                  parent_file_id: fileItem.parent_file_id,
                  size: fileItem.size,
                  sizeStr: fileItem.sizeStr,
                  time: fileItem.time,
                  timeStr: fileItem.timeStr,
                  icon: fileItem.icon,
                  parent_file_path: ''
                } as FileData)
                PanData.SameDirMap.set(hash, saveList)
              }
            }
          }
        }
      }
      dirList.length = 0
      dirList = list
    }
  }
  Processing.value = PanData.DirMap.size

  
  const sameDirMap = new Map<string, FileData[]>()
  const entries = PanData.SameDirMap.entries()
  for (let i = 0, maxi = PanData.SameDirMap.size; i < maxi; i++) {
    const value = entries.next().value
    const arr = value[1] as FileData[]
    if (arr.length > 1) {
      arr.map((a) => {
        a.parent_file_path = GetParentPath(PanData, a.parent_file_id)
        return true
      })
      arr.sort((a, b) => b.time - a.time)
      sameDirMap.set(value[0], arr)
    }
  }
  PanData.SameDirMap = sameDirMap
  scanCount.value = sameDirMap.size
}
/* 计算出完整的路径* */
function GetParentPath(PanData: IScanDriverModel, file_id: string) {
  const path: string[] = []
  let dir: IAliGetDirModel | undefined
  while (true) {
    dir = PanData.DirMap.get(file_id)
    if (!dir) break
    path.push(dir.name)
    file_id = dir.parent_file_id
    if (!file_id) break
  }
  if (path.length == 0) return ''
  path.reverse()
  return path.join(' > ')
}

async function ApiBatchDirFileList(user_id: string, drive_id: string, dirList: IAliDirBatchResp[], scanType: string) {
  if (!user_id || !drive_id || dirList.length == 0) return false
  let postData = '{"requests":['
  for (let i = 0, maxi = dirList.length; i < maxi; i++) {
    if (i > 0) postData = postData + ','
    
    let query = 'parent_file_id="' + dirList[i].dirID + '"'
    if (scanType == 'size10') query += ' and size > 10485760'
    else if (scanType == 'size100') query += ' and size > 104857600'
    else if (scanType == 'size1000') query += ' and size > 1048576000'
    else if (['video', 'doc', 'image', 'audio', 'others', 'zip'].includes(scanType)) query += ' and category = "' + scanType + '"'
    if (!query.includes('category')) query += ' and type = "file"'

    const data2 = {
      body: {
        drive_id: drive_id,
        query: query,
        marker: dirList[i].next_marker,
        limit: 100,
        fields: 'thumbnail'
      },
      headers: { 'Content-Type': 'application/json' },
      id: dirList[i].dirID,
      method: 'POST',
      url: '/file/search'
    }
    postData = postData + JSON.stringify(data2)
  }
  postData += '],"resource":"file"}'

  const url = 'v2/batch?jsonmask=responses(id%2Cstatus%2Cbody(next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(name%2Cfile_id%2Cdrive_id%2Ctype%2Csize%2Cupdated_at%2Ccategory%2Cfile_extension%2Cparent_file_id%2Cmime_type%2Cmime_extension%2Ccontent_hash%2Cpunish_flag)))'
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
              const items = respi.body.items
              dir.next_marker = respi.body.next_marker
              for (let i = 0, maxi = items.length; i < maxi; i++) {
                if (dir.itemsKey.has(items[i].file_id)) continue
                const add = AliDirFileList.getFileInfo(items[i], '')
                add.namesearch = items[i].content_hash 
                dir.items.push(add)
                dir.itemsKey.add(add.file_id)
              }
              if (dir.items.length >= 3000) dir.next_marker = '' 
              break
            }
          }
        }
      }
      return true
    } else {
      DebugLog.mSaveWarning('SSApiBatchDirFileList err=' + (resp.code || ''))
    }
  } catch (err: any) {
    DebugLog.mSaveWarning('ApiBatchDirFileList', err)
  }
  return false
}

// eslint-disable-next-line no-unused-vars
async function ApiWalkDirFileList(user_id: string, drive_id: string, file_id: string, limit: number, category: string) {
  if (!user_id || !drive_id || !file_id) return false
  let next_marker = ''
  let items: any[] = []
  do {
    const url = 'v2/file/walk?jsonmask=next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(name%2Cfile_id%2Cdrive_id%2Ctype%2Csize%2Cupdated_at%2Ccategory%2Cfile_extension%2Cparent_file_id%2Cmime_type%2Cmime_extension%2Ccontent_hash%2Cpunish_flag)'
    let postData = {
      all: false,
      drive_id: drive_id,
      parent_file_id: file_id,
      marker: next_marker,
      limit: 1000,
      fields: 'thumbnail',
      order_by: 'updated_at',
      order_direction: 'DESC',
      image_cropping_aspect_ratios: ['1:1'],
      type: 'file'
    }
    if (category && category != 'all') postData = Object.assign(postData, { category })
    const resp = await AliHttp.Post(url, postData, user_id, '')
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        next_marker = resp.body.next_marker
        items = items.concat(resp.body.items)
      } else if (resp.code == 404) {
        
        next_marker = ''
        break
      } else if (resp.body && resp.body.code) {
        items.length = 0
        next_marker = resp.body.code 
        message.warning('列出文件出错 ' + resp.body.code, 2)
        return false
      } else {
        DebugLog.mSaveWarning('ApiWalkDirFileList err=' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveDanger('ApiWalkDirFileList' + file_id, err)
      break 
    }
  } while (next_marker)
  return items
}


export function DeleteFromSameData(PanData: IScanDriverModel, idList: string[]) {
  const entries = PanData.SameDirMap.entries()
  for (let i = 0, maxi = PanData.SameDirMap.size; i < maxi && idList.length > 0; i++) {
    const value = entries.next().value
    const children = value[1] as FileData[]
    const saveList: FileData[] = []
    for (let j = 0, maxj = children.length; j < maxj; j++) {
      const key = children[j].file_id
      if (idList.includes(key)) {
        
        idList = idList.filter((t) => t != key)
      } else {
        saveList.push(children[j])
      }
    }
    if (children.length != saveList.length) PanData.SameDirMap.set(value[0], saveList)
  }
}
