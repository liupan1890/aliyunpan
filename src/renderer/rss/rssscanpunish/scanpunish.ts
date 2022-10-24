import AliHttp from '../../aliapi/alihttp'
import { IAliGetDirModel } from '../../aliapi/alimodels'
import { IAliDirBatchResp } from '../../aliapi/dirlist'
import AliDirFileList from '../../aliapi/dirfilelist'
import DebugLog from '../../utils/debuglog'
import { Ref } from 'vue'
import { foldericonfn, iconWeifaFn, iconWeixiangFn, IScanDriverModel, TreeNodeData } from '../ScanDAL'


export async function GetWeiGuiFile(user_id: string, PanData: IScanDriverModel, Processing: Ref<number>, scanCount: Ref<number>, totalFileCount: Ref<number>, scanType: string) {
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
          const dirID = dirList[i].dirID
          
          const fileList = dirList[i].items
          totalFileCount.value += fileList.length
          let saveList: IAliGetDirModel[] = []
          let weifa = 0
          let noshare = 0
          
          for (let j = 0, maxj = fileList.length; j < maxj; j++) {
            const fileItem = fileList[j]
            if (fileItem.icon == 'iconweifa' || fileItem.icon == 'iconweixiang') {
              saveList.push({
                __v_skip: true,
                drive_id: fileItem.drive_id,
                file_id: fileItem.file_id,
                parent_file_id: fileItem.parent_file_id,
                name: fileItem.name,
                namesearch: '',
                size: fileItem.size,
                time: fileItem.time,
                
                description: fileItem.icon
              } as IAliGetDirModel)

              if (fileItem.icon == 'iconweifa') weifa++
              if (fileItem.icon == 'iconweixiang') noshare++
            }
          }
          if (saveList.length > 0) {
            
            const node = PanData.DirChildrenMap.get(dirID)
            if (node && node.length > 0) {
              node.sort((a, b) => a.name.localeCompare(b.name))
              saveList.sort((a, b) => a.name.localeCompare(b.name))
              saveList = node.concat(saveList)
            } else {
              saveList.sort((a, b) => a.name.localeCompare(b.name))
            }
            PanData.DirChildrenMap.set(dirID, saveList)
          }
          if (weifa > 0) {
            let dir = PanData.DirMap.get(dirID)
            if (dir) {
              PanData.WeiGuiDirMap.set(dir.file_id, 'weifa')
              while (true) {
                if (!dir || !dir.parent_file_id || PanData.WeiGuiDirMap.has(dir.parent_file_id)) break
                PanData.WeiGuiDirMap.set(dir.parent_file_id, 'parent')
                dir = PanData.DirMap.get(dir.parent_file_id)
              }
            }
          }

          if (noshare > 0) {
            let dir = PanData.DirMap.get(dirID)
            if (dir) {
              PanData.NoShareDirMap.set(dir.file_id, 'noshare')
              while (true) {
                if (!dir || !dir.parent_file_id || PanData.NoShareDirMap.has(dir.parent_file_id)) break
                PanData.NoShareDirMap.set(dir.parent_file_id, 'parent')
                dir = PanData.DirMap.get(dir.parent_file_id)
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

  const url = 'v2/batch?jsonmask=responses(id%2Cstatus%2Cbody(next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(name%2Cfile_id%2Cdrive_id%2Ctype%2Csize%2Cupdated_at%2Ccategory%2Cfile_extension%2Cparent_file_id%2Cmime_type%2Cmime_extension%2Cpunish_flag)))'
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
      DebugLog.mSaveWarning('SPApiBatchDirFileList err=' + (resp.code || ''))
    }
  } catch (err: any) {
    DebugLog.mSaveWarning('ApiBatchDirFileList', err)
  }
  return false
}


export function GetTreeNodes(PanData: IScanDriverModel, parent_file_id: string, treeDataMap: Map<string, TreeNodeData>, ShowWeiGui: boolean, ShowNoShare: boolean) {
  const data: TreeNodeData[] = []
  let item: IAliGetDirModel

  const dirList = PanData.DirChildrenMap.get(parent_file_id) || []
  for (let i = 0, maxi = dirList.length; i < maxi; i++) {
    item = dirList[i]
    if (ShowWeiGui && (item.description == 'iconweifa' || PanData.WeiGuiDirMap.has(item.file_id))) {
      
      data.push({
        key: item.file_id,
        title: item.name,
        icon: item.description == 'iconweifa' ? iconWeifaFn : foldericonfn,
        size: item.size,
        children: GetTreeNodes(PanData, item.file_id, treeDataMap, ShowWeiGui, ShowNoShare)
      } as TreeNodeData)
    } else if (ShowNoShare && (item.description == 'iconweixiang' || PanData.NoShareDirMap.has(item.file_id))) {
      
      data.push({
        key: item.file_id,
        title: item.name,
        icon: item.description == 'iconweixiang' ? iconWeixiangFn : foldericonfn,
        size: item.size,
        children: GetTreeNodes(PanData, item.file_id, treeDataMap, ShowWeiGui, ShowNoShare)
      } as TreeNodeData)
    }
  }
  data.map((a) => {
    treeDataMap.set(a.key as string, a)
    return true
  })
  return data
}


export function DeleteFromScanDataPunish(PanData: IScanDriverModel, idList: string[]) {
  const entries = PanData.DirChildrenMap.entries()
  for (let i = 0, maxi = PanData.DirChildrenMap.size; i < maxi && idList.length > 0; i++) {
    const value = entries.next().value
    const children = value[1] as IAliGetDirModel[]
    const saveList: IAliGetDirModel[] = []
    for (let j = 0, maxj = children.length; j < maxj; j++) {
      const key = children[j].file_id
      if (idList.includes(key)) {
        
        idList = idList.filter((t) => t != key)
      } else {
        saveList.push(children[j])
      }
    }
    if (children.length != saveList.length) PanData.DirChildrenMap.set(value[0], saveList)
  }
}

export function GetTreeCheckedSize(PanData: IScanDriverModel, checkedKeys: string[], ShowWeiGui: boolean, ShowNoShare: boolean) {
  if (checkedKeys.length == 0) return 0
  const checkedMap = new Set(checkedKeys)
  let checkedsize = 0
  const treeDataMap = new Map<string, TreeNodeData>()
  GetTreeNodes(PanData, 'root', treeDataMap, ShowWeiGui, ShowNoShare)
  const values = treeDataMap.values()
  let clen = 0
  for (let i = 0, maxi = treeDataMap.size; i < maxi; i++) {
    const node = values.next().value as TreeNodeData
    if (checkedMap.has(node.key)) {
      clen = node.children!.length
      if (clen > 0) {
        // donothing
      } else if (node.icon != foldericonfn) {
        checkedsize += node.size
      }
    }
  }
  return checkedsize
}
