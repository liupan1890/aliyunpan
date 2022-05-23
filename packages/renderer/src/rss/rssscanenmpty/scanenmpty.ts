import AliHttp from '@/aliapi/alihttp'
import { IAliGetDirModel } from '@/aliapi/alimodels'
import DebugLog from '@/utils/debuglog'
import { Ref } from 'vue'
import { foldericonfn, IScanDriverModel, TreeNodeData } from '../ScanDAL'


export async function GetEnmptyDir(user_id: string, PanData: IScanDriverModel, Processing: Ref<number>, ScanCount: Ref<number>) {
  ScanCount.value = 0
  
  let enmpty = new Map<string, IAliGetDirModel>()
  let entries = PanData.DirMap.keys()
  for (let i = 0, maxi = PanData.DirMap.size; i < maxi; i++) {
    let key = entries.next().value
    if (!PanData.DirChildrenMap.has(key)) {
      
      enmpty.set(key, PanData.DirMap.get(key)!)
    }
  }
  
  let proadd = (100 - Processing.value) / ((enmpty.size + 1) / 99)
  let proval = Processing.value
  let idlist: string[] = []
  let keys = enmpty.keys()
  for (let i = 0, maxi = enmpty.size; i < maxi; i++) {
    idlist.push(keys.next().value)
    if (idlist.length >= 100) {
      proval += proadd
      Processing.value = Math.max(50, Math.floor(proval))
      ScanCount.value += await TestEnmptyDir(user_id, PanData, idlist) 
      idlist.length = 0
    }
  }
  if (idlist.length > 0) {
    ScanCount.value += await TestEnmptyDir(user_id, PanData, idlist) 
    idlist.length = 0
  }
  Processing.value = 99
}

async function TestEnmptyDir(user_id: string, PanData: IScanDriverModel, idlist: string[]) {
  let enmptyidlist = await ApiTestEnmptyDir(user_id, PanData.drive_id, idlist) 
  if (enmptyidlist.length > 0) {
    for (let i = 0, maxi = enmptyidlist.length; i < maxi; i++) {
      let dir = PanData.DirMap.get(enmptyidlist[i])!
      PanData.EnmptyDirMap.set(dir.file_id, 'enmpty')
      while (true) {
        if (!dir.parent_file_id || PanData.EnmptyDirMap.has(dir.parent_file_id)) break
        PanData.EnmptyDirMap.set(dir.parent_file_id, 'parent')
        dir = PanData.DirMap.get(dir.parent_file_id)!
      }
    }
  }
  return enmptyidlist.length
}

async function ApiTestEnmptyDir(user_id: string, drive_id: string, idlist: string[]) {
  let list: string[] = []

  let postdata = '{"requests":['
  for (let i = 0, maxi = idlist.length; i < maxi; i++) {
    if (i > 0) postdata = postdata + ','
    const data2 = {
      body: {
        drive_id: drive_id,
        query: 'parent_file_id="' + idlist[i] + '"',
        limit: 1,
        fields: 'thumbnail'
      },
      headers: { 'Content-Type': 'application/json' },
      id: idlist[i],
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
          if (respi.body.items.length == 0) list.push(respi.id) 
        }
      }
      return list
    }
  } catch (err: any) {
    DebugLog.mSaveLog('warning', 'ApiTestEnmptyDir err=' + (err.message || ''))
  }
  return list
}


export function GetTreeNodes(PanData: IScanDriverModel, parentid: string, TreeDataMap: Map<string, TreeNodeData>) {
  let data: TreeNodeData[] = []
  let item: IAliGetDirModel

  let dirlist = PanData.DirChildrenMap.get(parentid) || []
  for (let i = 0, maxi = dirlist.length; i < maxi; i++) {
    item = dirlist[i]
    if (PanData.EnmptyDirMap.has(item.file_id)) {
      data.push({
        key: item.file_id,
        title: item.name,
        icon: foldericonfn,
        size: item.size,
        children: GetTreeNodes(PanData, item.file_id, TreeDataMap)
      })
    }
  }
  data.sort((a, b) => a.title!.localeCompare(b.title!))
  data.map((a) => {
    TreeDataMap.set(a.key as string, a)
  })
  return data
}
