import { h, Ref } from 'vue'
import AliDirList from '../aliapi/dirlist'
import { IAliGetDirModel } from '../aliapi/alimodels'
import DebugLog from '../utils/debuglog'
import message from '../utils/message'
import DB from '../utils/db'

export interface TreeNodeData {
  key: string
  title: string
  selectable?: boolean
  disabled?: boolean
  disableCheckbox?: boolean
  checkable?: boolean
  children: TreeNodeData[]
  icon: any
  size: number
  sizestr?: string
}

export interface FileNodeData {
  hash: string
  files: FileData[]
}
export interface FileData {
  file_id: string
  name: string
  parent_file_id: string
  size: number
  sizestr: string
  time: number
  timestr: string
  icon: string
  parent_file_path: string
}

export interface ScanTreeDataModel {
  expandedKeys: string[]
  checkedKeys: string[]
  TreeData: TreeNodeData[]
  TreeDataMap: Map<string, TreeNodeData>
}

export interface IScanDriverModel {
  drive_id: string
  
  DirMap: Map<string, IAliGetDirModel>
  
  DirChildrenMap: Map<string, IAliGetDirModel[]>
  
  EnmptyDirMap: Map<string, string>
  WeiGuiDirMap: Map<string, string>
  NoShareDirMap: Map<string, string>
  SameDirMap: Map<string, FileData[]>
  CleanDirMap: Map<string, string>
}

export function NewScanDriver(drive_id: string): IScanDriverModel {
  return {
    drive_id,
    DirMap: new Map<string, IAliGetDirModel>(),
    DirChildrenMap: new Map<string, IAliGetDirModel[]>(),
    EnmptyDirMap: new Map<string, string>(),
    WeiGuiDirMap: new Map<string, string>(),
    NoShareDirMap: new Map<string, string>(),
    SameDirMap: new Map<string, FileData[]>(),
    CleanDirMap: new Map<string, string>()
  }
}
export function ResetScanDriver(data: IScanDriverModel) {
  data.drive_id = ''
  data.DirMap = new Map<string, IAliGetDirModel>()
  data.DirChildrenMap = new Map<string, IAliGetDirModel[]>()
  data.EnmptyDirMap = new Map<string, string>()
  data.WeiGuiDirMap = new Map<string, string>()
  data.NoShareDirMap = new Map<string, string>()
  data.SameDirMap = new Map<string, FileData[]>()
}

function GetScanDriver(drive_id: string, children: IAliGetDirModel[]) {
  let ts = Date.now()
  const DriverData = NewScanDriver(drive_id)
  
  let root: IAliGetDirModel = { __v_skip: true, drive_id, file_id: 'root', parent_file_id: '', name: '根目录', namesearch: '', size: 0, time: 0, description: '' }
  DriverData.DirMap.set(root.file_id, root)
  let ChildrenMap = new Map<string, IAliGetDirModel[]>()
  ChildrenMap.set(root.file_id, [])

  try {
    let parentid: string = ''
    let parentdir: IAliGetDirModel[] = [] 
    let item: IAliGetDirModel
    
    for (let i = 0, maxi = children.length; i < maxi; i++) {
      item = children[i]
      item.description = '' 
      DriverData.DirMap.set(item.file_id, item)
      if (parentid != item.parent_file_id) {
        if (ChildrenMap.has(item.parent_file_id)) {
          parentdir = ChildrenMap.get(item.parent_file_id)! 
        } else {
          parentdir = [] 
          ChildrenMap.set(item.parent_file_id, parentdir) 
        }
        parentid = item.parent_file_id
      }
      parentdir.push(item)
    }
  } catch {}
  DriverData.DirChildrenMap = ChildrenMap
  console.log('SaveAllDirLite time=', Date.now() - ts)
  return DriverData
}


export function LoadScanDir(user_id: string, drive_id: string, TotalDirCount: Ref<number>, Processing: Ref<number>, ScanPanData: IScanDriverModel) {
  ScanPanData.drive_id = drive_id
  ScanPanData.DirMap = new Map<string, IAliGetDirModel>()
  ScanPanData.DirChildrenMap = new Map<string, IAliGetDirModel[]>()

  return GetAllDir(user_id, drive_id).then((dirlist: IAliGetDirModel[]) => {
    TotalDirCount.value = dirlist.length
    Processing.value = 50
    const PanData = GetScanDriver(drive_id, dirlist)
    Object.assign(ScanPanData, PanData) 
  })
}

async function GetAllDir(user_id: string, drive_id: string) {
  let data = await DB.getValueObject('AllDir_' + drive_id)
  if (data) {
    let dt = await DB.getValueNumber('AllDir_' + drive_id)
    if (Date.now() - dt < 1000 * 60 * 60) {
      
      return data as IAliGetDirModel[]
    }
  }

  return AliDirList.ApiFastAllDirListByPID(user_id, drive_id)
    .then((data) => {
      if (!data.next_marker) {
        //return data.items
        let list: IAliGetDirModel[] = []
        for (let i = 0, maxi = data.items.length; i < maxi; i++) {
          let item = data.items[i]
          list.push({
            __v_skip: true,
            drive_id: drive_id,
            file_id: item.file_id,
            parent_file_id: item.parent_file_id,
            name: item.name,
            namesearch: '',
            size: 0,
            time: 0,
            description: ''
          })
        }

        DB.saveValueObject('AllDir_' + drive_id, data.items) 
        DB.saveValueNumber('AllDir_' + drive_id, Date.now()) 

        return list
      } else {
        DebugLog.mSaveWarning('列出文件夹失败file_id=all' + ' next_marker=' + data.next_marker)
        message.error('列出全盘文件夹失败' + data.next_marker)
        return []
      }
    })
    .catch((err: any) => {
      DebugLog.mSaveWarning('列出文件夹失败file_id=all', err)
      message.error('列出全盘文件夹失败' + err.message)
      return []
    })
}

const iconfolder = h('i', { class: 'iconfont iconfile-folder' })
export const foldericonfn = () => iconfolder
const fileicon = h('i', { class: 'iconfont iconwenjian' })
export const fileiconfn = () => fileicon
const iconweifa = h('i', { class: 'iconfont iconweifa' })
const iconweixiang = h('i', { class: 'iconfont iconweixiang' })
export const iconweixiangfn = () => iconweixiang
export const iconweifafn = () => iconweifa

export function TreeSelectAll(checkedKeys: Ref<string[]>, checkedKeysBak: string[]) {
  if (checkedKeys.value.length == checkedKeysBak.length) {
    checkedKeys.value = []
  } else {
    checkedKeys.value = checkedKeysBak.concat()
  }
}

export function TreeSelectOne(selectedKeys: string[], checkedKeys: Ref<string[]>) {
  if (selectedKeys.length > 0) {
    let key = selectedKeys[0] 
    let checkedkeys = checkedKeys.value
    if (checkedkeys.includes(key)) {
      checkedKeys.value = checkedkeys.filter(function (x) {
        return x != key
      })
    } else {
      checkedKeys.value.push(key)
    }
  }
}

export function TreeCheckFileChild(node: TreeNodeData, checkedKeys: Ref<string[]>) {
  if (node.icon != foldericonfn) {
    TreeSelectOne([node.key], checkedKeys) 
    return
  }
  let keys: string[] = []
  
  GetFileChildNode(keys, node)
  if (keys.length == 0) return
  let isall = true
  let checkedkeys = new Set(checkedKeys.value)
  for (let i = 0, maxi = keys.length; i < maxi; i++) {
    if (!checkedkeys.has(keys[i])) {
      isall = false
      break
    }
  }
  
  if (isall) {
    
    for (let i = 0, maxi = keys.length; i < maxi; i++) {
      checkedkeys.delete(keys[i])
    }
  } else {
    
    for (let i = 0, maxi = keys.length; i < maxi; i++) {
      checkedkeys.add(keys[i])
    }
  }
  checkedKeys.value = Array.from(checkedkeys)
}

function GetFileChildNode(keys: string[], node: TreeNodeData) {
  if (node.children && node.children.length > 0) {
    for (let i = 0, maxi = node.children.length; i < maxi; i++) {
      if (node.children[i].icon != foldericonfn) {
        keys.push(node.children[i].key) 
      } else {
        GetFileChildNode(keys, node.children[i]) 
      }
    }
  } else if (node.icon != foldericonfn) {
    keys.push(node.key) 
  }
}
