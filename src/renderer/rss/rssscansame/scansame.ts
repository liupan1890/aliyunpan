import AliHttp from '../../aliapi/alihttp'
import { IAliGetDirModel } from '../../aliapi/alimodels'
import { IAliDirBatchResp } from '../../aliapi/dirlist'
import AliDirFileList from '../../aliapi/dirfilelist'
import DebugLog from '../../utils/debuglog'
import message from '../../utils/message'
import { Ref } from 'vue'
import { FileData, IScanDriverModel } from '../ScanDAL'


export async function GetSameFile(user_id: string, PanData: IScanDriverModel, Processing: Ref<number>, ScanCount: Ref<number>, TotalFileCount: Ref<number>, ScanType: string) {
  ScanCount.value = 0
  let keys = PanData.DirMap.keys() 
  let dirlist: IAliDirBatchResp[] = []

  Processing.value = 0
  while (true) {
    let add = 0
    while (dirlist.length < 20) {
      let key = keys.next()
      if (!key.done) {
        add++
        dirlist.push({ dir_id: key.value, next_marker: '', items: [], itemsKey: new Set() })
      } else break
    }
    Processing.value += add
    if (dirlist.length == 0) break
    if (!PanData.drive_id) break 

    let isget = await ApiBatchDirFileList(user_id, PanData.drive_id, dirlist, ScanType)
    if (isget) {
      let list: IAliDirBatchResp[] = []
      for (let i = 0, maxi = dirlist.length; i < maxi; i++) {
        if (dirlist[i].next_marker && dirlist[i].items.length < 2000) {
          list.push(dirlist[i]) 
        } else {
          
          let filelist = dirlist[i].items
          TotalFileCount.value += filelist.length
          
          for (let j = 0, maxj = filelist.length; j < maxj; j++) {
            let fileitem = filelist[j]
            let hash = fileitem.namesearch
            if (hash) {
              let savelist = PanData.SameDirMap.get(hash)
              if (!savelist) savelist = []

              if (savelist.length < 50) {
                
                savelist.push({
                  file_id: fileitem.file_id,
                  name: fileitem.name,
                  parent_file_id: fileitem.parent_file_id,
                  size: fileitem.size,
                  sizestr: fileitem.sizestr,
                  time: fileitem.time,
                  timestr: fileitem.timestr,
                  icon: fileitem.icon,
                  parent_file_path: ''
                })
                PanData.SameDirMap.set(hash, savelist)
              }
            }
          }
        }
      }
      dirlist.length = 0
      dirlist = list
    }
  }
  Processing.value = PanData.DirMap.size

  
  let SameDirMap = new Map<string, FileData[]>()
  let entries = PanData.SameDirMap.entries()
  for (let i = 0, maxi = PanData.SameDirMap.size; i < maxi; i++) {
    let value = entries.next().value
    let arr = value[1] as FileData[]
    if (arr.length > 1) {
      arr.map((a) => {
        a.parent_file_path = GetParentPath(PanData, a.parent_file_id)
      })
      arr.sort((a, b) => b.time - a.time)
      SameDirMap.set(value[0], arr)
    }
  }
  PanData.SameDirMap = SameDirMap
  ScanCount.value = SameDirMap.size
}
/*计算出完整的路径* */
function GetParentPath(PanData: IScanDriverModel, file_id: string) {
  let path: string[] = []
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

async function ApiBatchDirFileList(user_id: string, drive_id: string, dirlist: IAliDirBatchResp[], ScanType: string) {
  if (!user_id || !drive_id || dirlist.length == 0) return false
  let postdata = '{"requests":['
  for (let i = 0, maxi = dirlist.length; i < maxi; i++) {
    if (i > 0) postdata = postdata + ','
    
    let query = 'parent_file_id="' + dirlist[i].dir_id + '"'
    if (ScanType == 'size10') query += ' and size > 10485760'
    else if (ScanType == 'size100') query += ' and size > 104857600'
    else if (ScanType == 'size1000') query += ' and size > 1048576000'
    else if (['video', 'doc', 'image', 'audio', 'others', 'zip'].includes(ScanType)) query += ' and category = "' + ScanType + '"'
    if (!query.includes('category')) query += ' and type = "file"'

    const data2 = {
      body: {
        drive_id: drive_id,
        query: query,
        marker: dirlist[i].next_marker,
        limit: 100,
        fields: 'thumbnail'
      },
      headers: { 'Content-Type': 'application/json' },
      id: dirlist[i].dir_id,
      method: 'POST',
      url: '/file/search'
    }
    postdata = postdata + JSON.stringify(data2)
  }
  postdata += '],"resource":"file"}'

  const url = 'v2/batch?jsonmask=responses(id%2Cstatus%2Cbody(next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(name%2Cfile_id%2Cdrive_id%2Ctype%2Csize%2Cupdated_at%2Ccategory%2Cfile_extension%2Cparent_file_id%2Cmime_type%2Cmime_extension%2Ccontent_hash%2Cpunish_flag)))'
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

async function ApiWalkDirFileList(user_id: string, drive_id: string, file_id: string, limit: number, category: string) {
  if (!user_id || !drive_id || !file_id) return false
  let next_marker = ''
  let items: any[] = []
  do {
    let url = 'v2/file/walk?jsonmask=next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(name%2Cfile_id%2Cdrive_id%2Ctype%2Csize%2Cupdated_at%2Ccategory%2Cfile_extension%2Cparent_file_id%2Cmime_type%2Cmime_extension%2Ccontent_hash%2Cpunish_flag)'
    let postdata = {
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
    if (category && category != 'all') postdata = Object.assign(postdata, { category })
    const resp = await AliHttp.Post(url, postdata, user_id, '')
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


export function DeleteFromSameData(PanData: IScanDriverModel, idlist: string[]) {
  let entries = PanData.SameDirMap.entries()
  for (let i = 0, maxi = PanData.SameDirMap.size; i < maxi && idlist.length > 0; i++) {
    let value = entries.next().value
    let children = value[1] as FileData[]
    let savelist: FileData[] = []
    for (let j = 0, maxj = children.length; j < maxj; j++) {
      let key = children[j].file_id
      if (idlist.includes(key)) {
        
        idlist = idlist.filter((t) => t != key)
      } else {
        savelist.push(children[j])
      }
    }
    if (children.length != savelist.length) PanData.SameDirMap.set(value[0], savelist)
  }
}
