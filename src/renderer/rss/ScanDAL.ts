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
  sizeStr?: string
}

export interface FileData {
  file_id: string
  name: string
  parent_file_id: string
  size: number
  sizeStr: string
  time: number
  timeStr: string
  icon: string
  parent_file_path: string
}

export interface FileNodeData {
  hash: string
  files: FileData[]
}

export interface ScanTreeDataModel {
  expandedKeys: string[]
  checkedKeys: string[]
  treeData: TreeNodeData[]
  treeDataMap: Map<string, TreeNodeData>
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

function GetScanDriver(drive_id: string, children: IAliGetDirModel[]): IScanDriverModel {
  const ts = Date.now()
  const driverData = NewScanDriver(drive_id)
  
  const root: IAliGetDirModel = { __v_skip: true, drive_id, file_id: 'root', parent_file_id: '', name: '根目录', namesearch: '', size: 0, time: 0, description: '' }
  driverData.DirMap.set(root.file_id, root)
  const childrenMap = new Map<string, IAliGetDirModel[]>()
  childrenMap.set(root.file_id, [])

  try {
    let parent_file_id: string = ''
    let parentDir: IAliGetDirModel[] = [] 
    let item: IAliGetDirModel
    
    for (let i = 0, maxi = children.length; i < maxi; i++) {
      item = children[i]
      item.description = '' 
      driverData.DirMap.set(item.file_id, item)
      if (parent_file_id != item.parent_file_id) {
        if (childrenMap.has(item.parent_file_id)) {
          parentDir = childrenMap.get(item.parent_file_id)! 
        } else {
          parentDir = [] 
          childrenMap.set(item.parent_file_id, parentDir) 
        }
        parent_file_id = item.parent_file_id
      }
      parentDir.push(item)
    }
  } catch {}
  driverData.DirChildrenMap = childrenMap
  console.log('SaveAllDirLite time=', Date.now() - ts)
  return driverData
}


export function LoadScanDir(user_id: string, drive_id: string, totalDirCount: Ref<number>, processing: Ref<number>, scanPanData: IScanDriverModel) {
  scanPanData.drive_id = drive_id
  scanPanData.DirMap = new Map<string, IAliGetDirModel>()
  scanPanData.DirChildrenMap = new Map<string, IAliGetDirModel[]>()

  return GetAllDir(user_id, drive_id).then((dirList: IAliGetDirModel[]) => {
    totalDirCount.value = dirList.length
    processing.value = 50
    const PanData = GetScanDriver(drive_id, dirList)
    Object.assign(scanPanData, PanData) 
  })
}

async function GetAllDir(user_id: string, drive_id: string) {
  const data = await DB.getValueObject('AllDir_' + drive_id)
  if (data) {
    const dt = await DB.getValueNumber('AllDir_' + drive_id)
    if (Date.now() - dt < 1000 * 60 * 60) {
      
      return data as IAliGetDirModel[]
    }
  }

  return AliDirList.ApiFastAllDirListByPID(user_id, drive_id)
    .then((data) => {
      if (!data.next_marker) {
        // return data.items
        const list: IAliGetDirModel[] = []
        for (let i = 0, maxi = data.items.length; i < maxi; i++) {
          const item = data.items[i]
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
          } as IAliGetDirModel)
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

const iconFolder = h('i', { class: 'iconfont iconfile-folder' })
export const foldericonfn = () => iconFolder
const fileIcon = h('i', { class: 'iconfont iconwenjian' })
export const fileiconfn = () => fileIcon
const iconWeifa = h('i', { class: 'iconfont iconweifa' })
const iconWeixiang = h('i', { class: 'iconfont iconweixiang' })
export const iconWeixiangFn = () => iconWeixiang
export const iconWeifaFn = () => iconWeifa

export function TreeSelectAll(checkedKeys: Ref<string[]>, checkedKeysBak: string[]) {
  if (checkedKeys.value.length == checkedKeysBak.length) {
    checkedKeys.value = []
  } else {
    checkedKeys.value = checkedKeysBak.concat()
  }
}

export function TreeSelectOne(selectedKeys: string[], checkedKeys: Ref<string[]>) {
  if (selectedKeys.length > 0) {
    const key = selectedKeys[0] 
    const checkedkeys = checkedKeys.value
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
  const keys: string[] = []
  
  GetFileChildNode(keys, node)
  if (keys.length == 0) return
  let isall = true
  const checkedkeysSet = new Set(checkedKeys.value)
  for (let i = 0, maxi = keys.length; i < maxi; i++) {
    if (!checkedkeysSet.has(keys[i])) {
      isall = false
      break
    }
  }
  
  if (isall) {
    
    for (let i = 0, maxi = keys.length; i < maxi; i++) {
      checkedkeysSet.delete(keys[i])
    }
  } else {
    
    for (let i = 0, maxi = keys.length; i < maxi; i++) {
      checkedkeysSet.add(keys[i])
    }
  }
  checkedKeys.value = Array.from(checkedkeysSet)
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
