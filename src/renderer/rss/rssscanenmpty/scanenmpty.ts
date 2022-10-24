import AliHttp from '../../aliapi/alihttp'
import { IAliGetDirModel } from '../../aliapi/alimodels'
import DebugLog from '../../utils/debuglog'
import { Ref } from 'vue'
import { foldericonfn, IScanDriverModel, TreeNodeData } from '../ScanDAL'


export async function GetEnmptyDir(user_id: string, PanData: IScanDriverModel, Processing: Ref<number>, scanCount: Ref<number>) {
  scanCount.value = 0
  
  const enmpty = new Map<string, IAliGetDirModel>()
  const entries = PanData.DirMap.keys()
  for (let i = 0, maxi = PanData.DirMap.size; i < maxi; i++) {
    const key = entries.next().value
    if (!PanData.DirChildrenMap.has(key)) {
      
      enmpty.set(key, PanData.DirMap.get(key)!)
    }
  }
  
  const proAdd = (100 - Processing.value) / ((enmpty.size + 1) / 99)
  let proVal = Processing.value
  const idList: string[] = []
  const keys = enmpty.keys()
  for (let i = 0, maxi = enmpty.size; i < maxi; i++) {
    idList.push(keys.next().value)
    if (idList.length >= 100) {
      proVal += proAdd
      Processing.value = Math.max(50, Math.floor(proVal))
      scanCount.value += await TestEnmptyDir(user_id, PanData, idList) 
      idList.length = 0
    }
  }
  if (idList.length > 0) {
    scanCount.value += await TestEnmptyDir(user_id, PanData, idList) 
    idList.length = 0
  }
  Processing.value = 99
}

async function TestEnmptyDir(user_id: string, PanData: IScanDriverModel, idList: string[]) {
  const enmptyidList = await ApiTestEnmptyDir(user_id, PanData.drive_id, idList) 
  if (enmptyidList.length > 0) {
    for (let i = 0, maxi = enmptyidList.length; i < maxi; i++) {
      let dir = PanData.DirMap.get(enmptyidList[i])
      if (dir) {
        PanData.EnmptyDirMap.set(dir.file_id, 'enmpty')
        while (true) {
          if (!dir || !dir.parent_file_id || PanData.EnmptyDirMap.has(dir.parent_file_id)) break
          PanData.EnmptyDirMap.set(dir.parent_file_id, 'parent')
          dir = PanData.DirMap.get(dir.parent_file_id)
        }
      }
    }
  }
  return enmptyidList.length
}

async function ApiTestEnmptyDir(user_id: string, drive_id: string, idList: string[]) {
  const list: string[] = []
  if (!user_id || !drive_id || idList.length === 0) return []
  let postData = '{"requests":['
  for (let i = 0, maxi = idList.length; i < maxi; i++) {
    if (i > 0) postData = postData + ','
    const data2 = {
      body: {
        drive_id: drive_id,
        query: 'parent_file_id="' + idList[i] + '"',
        limit: 1,
        fields: 'thumbnail'
      },
      headers: { 'Content-Type': 'application/json' },
      id: idList[i],
      method: 'POST',
      url: '/file/search'
    }
    postData = postData + JSON.stringify(data2)
  }
  postData += '],"resource":"file"}'

  const url = 'v2/batch?jsonmask=responses(id%2Cstatus%2Cbody(next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(name%2Cfile_id%2Cdrive_id%2Ctype%2Csize%2Cupdated_at%2Ccategory%2Cfile_extension%2Cparent_file_id%2Cmime_type%2Cmime_extension%2Cpunish_flag)))'
  const resp = await AliHttp.Post(url, postData, user_id, '')

  try {
    if (AliHttp.IsSuccess(resp.code)) {
      const responses = resp.body.responses
      for (let j = 0, maxj = responses.length; j < maxj; j++) {
        const status = responses[j].status as number
        if (status >= 200 && status <= 205) {
          const respi = responses[j]
          if (respi.body.items.length == 0) list.push(respi.id) 
        }
      }
      return list
    } else {
      DebugLog.mSaveWarning('ApiTestEnmptyDir err=' + (resp.code || ''))
    }
  } catch (err: any) {
    DebugLog.mSaveWarning('ApiTestEnmptyDir', err)
  }
  return list
}


export function GetTreeNodes(PanData: IScanDriverModel, parent_file_id: string, treeDataMap: Map<string, TreeNodeData>) {
  const data: TreeNodeData[] = []
  let item: IAliGetDirModel

  const dirList = PanData.DirChildrenMap.get(parent_file_id) || []
  for (let i = 0, maxi = dirList.length; i < maxi; i++) {
    item = dirList[i]
    if (PanData.EnmptyDirMap.has(item.file_id)) {
      data.push({
        key: item.file_id,
        title: item.name,
        icon: foldericonfn,
        size: item.size,
        children: GetTreeNodes(PanData, item.file_id, treeDataMap)
      } as TreeNodeData)
    }
  }
  data.sort((a, b) => a.title!.localeCompare(b.title!))
  data.map((a) => {
    treeDataMap.set(a.key as string, a)
    return true
  })
  return data
}
