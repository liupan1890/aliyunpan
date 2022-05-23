import AliHttp from '@/aliapi/alihttp'
import { IAliFileItem, IAliGetDirModel, IAliGetFileModel } from '@/aliapi/alimodels'
import AliDirFileList from '@/aliapi/dirfilelist'
import DebugLog from '@/utils/debuglog'
import { humanSize } from '@/utils/format'
import message from '@/utils/message'
import { Ref } from 'vue'
import { FileData, IScanDriverModel } from '../ScanDAL'

export async function GetDuplicateInfo(user_id: string, PanData: IScanDriverModel, ScanType: string) {
  const url = 'adrive/v1/file/getDuplicateInfo'
  const postdata = { category: ScanType, drive_id: PanData.drive_id }
  const resp = await AliHttp.Post(url, postdata, user_id, '')
  try {
    if (AliHttp.IsSuccess(resp.code)) {
      
      return '找到' + (resp.body.total_group_count || 0) + '组重复文件，包含' + (resp.body.total_group_count || 0) + '个文件，总体积' + humanSize(resp.body.total_size || 0)
    }
  } catch (e: any) {
    DebugLog.mSaveLog('danger', 'GetDuplicateInfo ' + PanData.drive_id + ' error=' + (e.message || ''))
  }
  return '查询出错'
}


export async function GetSameFile(user_id: string, PanData: IScanDriverModel, Processing: Ref<number>, ScanCount: Ref<number>, TotalFileCount: Ref<number>, ScanType: string) {
  ScanCount.value = 0

  
  let filelist = await ApiDuplicateList(user_id, PanData.drive_id, ScanType == 'all' ? '' : ScanType)
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

async function ApiDuplicateList(user_id: string, drive_id: string, category: string) {
  let next_marker = ''
  let items: IAliGetFileModel[] = []
  do {
    const url = 'adrive/v1/file/duplicateList'
    let postdata = { drive_id: drive_id, marker: next_marker }
    if (category) postdata = Object.assign(postdata, { category: category })
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        next_marker = resp.body.next_marker
        for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
          const oneitems = resp.body.items[i].items as IAliFileItem[]
          for (let j = 0; j < oneitems.length; j++) {
            const add = AliDirFileList.getFileInfo(oneitems[j], '')
            add.namesearch = oneitems[j].content_hash
            items.push(add)
          }
        }
        continue 
      } else if (resp.body && resp.body.code) {
        message.warning('列出文件出错 ' + resp.body.code, 2)
      }
    } catch (e: any) {
      DebugLog.mSaveLog('danger', 'ApiDuplicateList ' + drive_id + ' error=' + (e.message || ''))
    }
    return []
  } while (next_marker)

  return items
}
