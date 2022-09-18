import AliHttp from '../../aliapi/alihttp'
import { IAliGetDirModel } from '../../aliapi/alimodels'
import { IAliDirBatchResp } from '../../aliapi/dirlist'
import AliDirFileList from '../../aliapi/dirfilelist'
import DebugLog from '../../utils/debuglog'
import { humanSize } from '../../utils/format'
import { HanToPin } from '../../utils/utils'
import { h, Ref } from 'vue'
import { foldericonfn, IScanDriverModel, TreeNodeData } from '../ScanDAL'


export async function GetCleanFile(user_id: string, PanData: IScanDriverModel, Processing: Ref<number>, ScanCount: Ref<number>, TotalFileCount: Ref<number>, ScanType: string) {
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
          let dir_id = dirlist[i].dir_id
          
          let filelist = dirlist[i].items
          TotalFileCount.value += filelist.length
          let savelist: IAliGetDirModel[] = []
          
          for (let j = 0, maxj = filelist.length; j < maxj; j++) {
            let fileitem = filelist[j]
            savelist.push({
              __v_skip: true,
              drive_id: fileitem.drive_id,
              file_id: fileitem.file_id,
              parent_file_id: fileitem.parent_file_id,
              name: fileitem.name,
              namesearch: fileitem.namesearch || HanToPin(fileitem.name),
              size: fileitem.size,
              time: fileitem.time,
              
              description: fileitem.icon
            })
          }
          if (savelist.length > 0) {
            
            let node = PanData.DirChildrenMap.get(dir_id)
            if (node && node.length > 0) {
              node.sort((a, b) => a.name.localeCompare(b.name))
              savelist.sort((a, b) => b.size - a.size)
              savelist = node.concat(savelist)
            } else {
              savelist.sort((a, b) => b.size - a.size)
            }
            PanData.DirChildrenMap.set(dir_id, savelist)
          }
          if (savelist.length > 0) {
            let dir = PanData.DirMap.get(dir_id)
            if (dir) {
              PanData.CleanDirMap.set(dir.file_id, 'clean')
              while (true) {
                if (!dir.parent_file_id || PanData.CleanDirMap.has(dir.parent_file_id)) break
                PanData.CleanDirMap.set(dir.parent_file_id, 'parent')
                dir = PanData.DirMap.get(dir.parent_file_id)!
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
    else if (['video', 'doc', 'image', 'audio', 'others', 'zip'].includes(ScanType)) query += ' and size > 1048576000 and category = "' + ScanType + '"'
    if (!query.includes('category')) query += ' and type = "file"'
    const data2 = {
      body: {
        drive_id: drive_id,
        query: query,
        marker: dirlist[i].next_marker,
        limit: 100,
        fields: 'thumbnail',
        order_by: 'size DESC'
      },
      headers: { 'Content-Type': 'application/json' },
      id: dirlist[i].dir_id,
      method: 'POST',
      url: '/file/search'
    }
    postdata = postdata + JSON.stringify(data2)
  }
  postdata += '],"resource":"file"}'

  const url = 'v2/batch?jsonmask=responses(id%2Cstatus%2Cbody(next_marker%2Cpunished_file_count%2Ctotal_count%2Citems(name%2Cfile_id%2Cdrive_id%2Ctype%2Csize%2Cupdated_at%2Ccategory%2Cfile_extension%2Cparent_file_id%2Cmime_type%2Cmime_extension%2Cpunish_flag)))'
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
      DebugLog.mSaveWarning('SCApiDuplicateList err=' + (resp.code || ''))
    }
  } catch (err: any) {
    DebugLog.mSaveWarning('ApiBatchDirFileList', err)
  }
  return false
}
const fileiconfn = (icon: string) => h('i', { class: 'iconfont ' + icon })

export function GetTreeNodes(PanData: IScanDriverModel, parentid: string, TreeDataMap: Map<string, TreeNodeData>) {
  let data: TreeNodeData[] = []
  let item: IAliGetDirModel

  let dirlist = PanData.DirChildrenMap.get(parentid) || []
  for (let i = 0, maxi = dirlist.length; i < maxi; i++) {
    item = dirlist[i]
    if (item.description != '' || PanData.CleanDirMap.has(item.file_id)) {
      
      let isdir = item.description == 'iconfile-folder' || item.description == ''
      data.push({
        key: item.file_id,
        title: item.name,
        icon: isdir ? foldericonfn : () => fileiconfn(item.description),
        children: GetTreeNodes(PanData, item.file_id, TreeDataMap),
        size: isdir ? 0 : item.size,
        sizestr: isdir ? '' : humanSize(item.size)
      })
    }
  }
  data.map((a) => {
    TreeDataMap.set(a.key as string, a)
  })
  return data
}


export function DeleteFromScanClean(PanData: IScanDriverModel, idlist: string[]) {
  let entries = PanData.DirChildrenMap.entries()
  for (let i = 0, maxi = PanData.DirChildrenMap.size; i < maxi && idlist.length > 0; i++) {
    let value = entries.next().value
    let children = value[1] as IAliGetDirModel[]
    let savelist: IAliGetDirModel[] = []
    for (let j = 0, maxj = children.length; j < maxj; j++) {
      let key = children[j].file_id
      if (idlist.includes(key)) {
        
        idlist = idlist.filter((t) => t != key)
      } else {
        savelist.push(children[j])
      }
    }
    if (children.length != savelist.length) PanData.DirChildrenMap.set(value[0], savelist)
  }
}

export function GetTreeCheckedSize(PanData: IScanDriverModel, checkedKeys: string[]) {
  if (checkedKeys.length == 0) return 0
  let checkedmap = new Set(checkedKeys)
  let checkedsize = 0
  let TreeDataMap = new Map<string, TreeNodeData>()
  GetTreeNodes(PanData, 'root', TreeDataMap)
  let values = TreeDataMap.values()
  let clen = 0
  for (let i = 0, maxi = TreeDataMap.size; i < maxi; i++) {
    let node = values.next().value as TreeNodeData
    if (checkedmap.has(node.key)) {
      clen = node.children!.length
      if (clen > 0) {
      } else if (node.icon != foldericonfn) {
        checkedsize += node.size
      }
    }
  }
  return checkedsize
}
