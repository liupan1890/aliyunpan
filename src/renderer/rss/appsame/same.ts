import AliHttp from '../../aliapi/alihttp'
import { IAliFileItem, IAliGetDirModel, IAliGetFileModel } from '../../aliapi/alimodels'
import AliDirFileList from '../../aliapi/dirfilelist'
import DebugLog from '../../utils/debuglog'
import { humanSize } from '../../utils/format'
import message from '../../utils/message'
import { Ref } from 'vue'
import { FileData, IScanDriverModel } from '../ScanDAL'

export async function GetDuplicateInfo(user_id: string, PanData: IScanDriverModel, scanType: string): Promise<string> {
  if (!user_id) return '查询出错'
  const url = 'adrive/v1/file/getDuplicateInfo'
  const postData = { category: scanType, drive_id: PanData.drive_id }
  const resp = await AliHttp.Post(url, postData, user_id, '')
  try {
    if (AliHttp.IsSuccess(resp.code)) {
      
      return '找到' + (resp.body.total_group_count || 0) + '组重复文件，包含' + (resp.body.total_group_count || 0) + '个文件，总体积' + humanSize(resp.body.total_size || 0)
    } else {
      DebugLog.mSaveWarning('GetDuplicateInfo err=' + (resp.code || ''))
    }
  } catch (err: any) {
    DebugLog.mSaveDanger('GetDuplicateInfo ' + PanData.drive_id, err)
  }
  return '查询出错'
}


export async function GetSameFile(user_id: string, PanData: IScanDriverModel, Processing: Ref<number>, scanCount: Ref<number>, totalFileCount: Ref<number>, scanType: string): Promise<boolean> {
  scanCount.value = 0

  
  const fileList = await ApiDuplicateList(user_id, PanData.drive_id, scanType == 'all' ? '' : scanType, Processing)
  if (!fileList) return false
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
  return true
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

async function ApiDuplicateList(user_id: string, drive_id: string, category: string, Processing: Ref<number>) {
  if (!user_id || !drive_id) return []
  let next_marker = ''
  const items: IAliGetFileModel[] = []
  do {
    const url = 'adrive/v1/file/duplicateList'
    let postData = { drive_id: drive_id, marker: next_marker }
    if (category) postData = Object.assign(postData, { category: category })
    const resp = await AliHttp.Post(url, postData, user_id, '')

    Processing.value += 1
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        next_marker = resp.body.next_marker
        for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
          const oneItems = resp.body.items[i].items as IAliFileItem[]
          for (let j = 0; j < oneItems.length; j++) {
            const add = AliDirFileList.getFileInfo(oneItems[j], '')
            add.namesearch = oneItems[j].content_hash
            items.push(add)
          }
        }
        continue 
      } else if (resp.code && resp.code == 403) {
        if (resp.body?.code == 'UserNotVip') message.error('此功能需要开通阿里云盘会员，请使用 扫描重复文件 功能代替')
        else message.error(resp.body?.code || '拒绝访问')
        return undefined
      } else if (resp.body && resp.body.code) {
        message.warning('列出文件出错 ' + resp.body.code, 2)
      } else {
        DebugLog.mSaveWarning('ApiDuplicateList err=' + (resp.code || ''))
      }
    } catch (err: any) {
      DebugLog.mSaveDanger('ApiDuplicateList ' + drive_id, err)
    }
    return []
  } while (next_marker)

  return items
}
