import { IAliFileResp } from '../aliapi/dirfilelist'
import { IAliGetDirModel, IAliGetFileModel } from '../aliapi/alimodels'
import DB from '../utils/db'
import { ArrayCopy } from '../utils/utils'
import { useSettingStore } from '../store'
import { debounce, throttle } from '../utils/debounce'
import { OrderNode } from '../utils/filenameorder'

export interface TreeNodeData {
  __v_skip: true
  key: string
  title: string
  namesearch?: string
  children: TreeNodeData[]
  icon?: any
  isLeaf?: boolean
}

export interface DirData {
  file_id: string
  parent_file_id: string
  name: string
  time: number
  size: number
}

export interface IDriverModel {
  drive_id: string
  
  DirMap: Map<string, DirData>
  
  DirChildrenMap: Map<string, DirData[]>
  
  DirFileSizeMap: { [key: string]: number }
  
  DirFileSizeTimeMap: { [key: string]: number }
  
  DirTotalSizeMap: { [key: string]: number }
  
  FileOrderMap: { [key: string]: string }
}

const DriverData = new Map<string, IDriverModel>()

const UserAllDir = new Map<string, number>()

export default class TreeStore {

  static async ConvertToOneDriver(drive_id: string, children: DirData[], saveToDB: boolean, saveToDriverData: boolean) {
    console.log('ConvertToOneDriver')
    if (saveToDB) {
      
      UserAllDir.set(drive_id, new Date().getTime()) 
      DB.saveValueObject('AllDir_' + drive_id, children) 
      DB.saveValueNumber('AllDir_' + drive_id, Date.now()) 
    }
    
    const OneDriver: IDriverModel = {
      drive_id,
      DirMap: new Map<string, DirData>(),
      DirChildrenMap: new Map<string, DirData[]>(),
      DirFileSizeMap: {},
      DirFileSizeTimeMap: {},
      DirTotalSizeMap: {},
      FileOrderMap: {}
    }
    
    const jsonsize = await DB.getValueObject('DirFileSize_' + drive_id)
    const sizemap = jsonsize ? (jsonsize as { [key: string]: number }) : {}
    const jsonsizetime = await DB.getValueObject('DirFileSizeTime_' + drive_id)
    const sizetimemap = jsonsizetime ? (jsonsizetime as { [key: string]: number }) : {}
    
    const jsonorder = await DB.getValueObject('DirFileOrder_' + drive_id)
    OneDriver.FileOrderMap = jsonorder ? (jsonorder as { [key: string]: string }) : {}
    
    let root: DirData = { file_id: 'root', parent_file_id: '', name: '根目录', time: 0, size: 0 }
    OneDriver.DirMap.set(root.file_id, root)

    let ChildrenMap = new Map<string, DirData[]>()
    ChildrenMap.set(root.file_id, [])
    
    try {
      let parentid: string = ''
      let childdirlist: DirData[] = [] 
      let item: DirData
      
      for (let i = 0, maxi = children.length; i < maxi; i++) {
        item = children[i]
        OneDriver.DirMap.set(item.file_id, item)
        OneDriver.DirFileSizeMap[item.file_id] = sizemap[item.file_id] || 0
        OneDriver.DirFileSizeTimeMap[item.file_id] = sizetimemap[item.file_id] || 0
        if (parentid != item.parent_file_id) {
          if (ChildrenMap.has(item.parent_file_id)) {
            childdirlist = ChildrenMap.get(item.parent_file_id)! 
          } else {
            childdirlist = [] 
            ChildrenMap.set(item.parent_file_id, childdirlist) 
          }
          parentid = item.parent_file_id
        }
        childdirlist.push(item)
      }
    } catch {}

    if (saveToDriverData) {
      let ChildrenMap2 = new Map<string, DirData[]>()
      ChildrenMap.forEach(function (value, key) {
        Object.freeze(value) 
        ChildrenMap2.set(key, value)
      })
      OneDriver.DirChildrenMap = ChildrenMap2
      
      OneDriver.DirTotalSizeMap['root'] = TotalSize('root', OneDriver.DirTotalSizeMap, OneDriver.DirFileSizeMap, OneDriver.DirChildrenMap)

      DriverData.set(OneDriver.drive_id, OneDriver)
    } else {
      
      OneDriver.DirChildrenMap = ChildrenMap
    }
    return OneDriver
  }

  
  static async SaveOneDriver(OneDriver: IDriverModel) {
    
    let ChildrenMap2 = new Map<string, DirData[]>()
    OneDriver.DirChildrenMap.forEach(function (value, key) {
      Object.freeze(value) 
      ChildrenMap2.set(key, value)
    })
    OneDriver.DirChildrenMap = ChildrenMap2

    
    DriverData.set(OneDriver.drive_id, OneDriver)
    _RefreshAllDirTotalSizeFunc(OneDriver.drive_id) 
  }

  
  static async SaveOneDirFileList(dir: IAliFileResp, hasFiles: boolean) {
    console.log('SaveOneDirFileList', dir.m_dir_id)

    if (dir.m_dir_id == 'favorite' || dir.m_dir_id == 'trash' || dir.m_dir_id == 'recover' || dir.m_dir_id.startsWith('search') || dir.m_dir_id.startsWith('color') || dir.m_dir_id.startsWith('video')) {
      
      return
    }

    let driverData = DriverData.get(dir.m_drive_id)
    if (!driverData) {
      
      let cache = await DB.getValueObject('AllDir_' + dir.m_drive_id) 
      if (cache) {
        console.log('SaveOneDirFileList LoadCacheAllDir')
        driverData = await TreeStore.ConvertToOneDriver(dir.m_drive_id, cache as DirData[], false, true)
      } else {
        console.log('SaveOneDirFileList 找不到cache直接退出')
        return
      }
    }

    let dirs: IAliGetFileModel[] = []
    let files: IAliGetFileModel[] = []
    for (let i = 0, maxi = dir.items.length; i < maxi; i++) {
      if (dir.items[i].isdir) dirs.push(dir.items[i])
      else files.push(dir.items[i])
    }
    if (hasFiles) {
      
      let dirsize = 0
      for (let i = 0, maxi = files.length; i < maxi; i++) {
        if (!files[i].isdir) dirsize += files[i].size
      }
      driverData.DirFileSizeMap[dir.m_dir_id] = dirsize 
      driverData.DirFileSizeTimeMap[dir.m_dir_id] = Math.floor(Date.now() / 1000) - 1654500000 
    }

    
    const dirlist: DirData[] = []
    for (let i = 0, maxi = dirs.length; i < maxi; i++) {
      const item = dirs[i]
      const diritem: DirData = {
        file_id: item.file_id,
        parent_file_id: item.parent_file_id,
        name: item.name,
        time: item.time,
        size: 0
      }
      dirlist.push(diritem)
      driverData.DirMap.set(diritem.file_id, diritem) 
    }
    Object.freeze(dirlist) 
    driverData.DirChildrenMap.set(dir.m_dir_id, dirlist) 

    
    let tdir_id = dir.m_dir_id
    while (true) {
      driverData.DirTotalSizeMap[tdir_id] = TotalSize(tdir_id, driverData.DirTotalSizeMap, driverData.DirFileSizeMap, driverData.DirChildrenMap) 
      let tdir = driverData.DirMap.get(tdir_id)
      if (tdir && tdir.parent_file_id != 'root' && tdir.parent_file_id != '') tdir_id = tdir.parent_file_id
      else break
    }

    if (dir.m_dir_id !== 'root') _SaveDirSize()
  }

  
  static GetDirOrder(drive_id: string, dir_id: string) {
    const settingStore = useSettingStore()
    let order = settingStore.uiFileListOrder || 'name desc'
    if (settingStore.uiFileOrderDuli != 'null') {
      
      let driverData = DriverData.get(drive_id)
      if (driverData) order = driverData.FileOrderMap[dir_id] || settingStore.uiFileOrderDuli || order
    }
    return order.toLowerCase()
  }
  
  static SaveDirOrder(drive_id: string, dir_id: string, order: string) {
    const settingStore = useSettingStore()
    if (settingStore.uiFileOrderDuli != 'null') {
      
      let driverData = DriverData.get(drive_id)
      if (driverData) {
        driverData.FileOrderMap[dir_id] = order
        DB.saveValueObject('DirFileOrder_' + drive_id, driverData.FileOrderMap) 
      }
    } else {
      
      settingStore.updateStore({ uiFileListOrder: order }) 
    }
  }

  static GetTreeDataToShow(driverData: IDriverModel, node: TreeNodeData, expandedKeys: Set<string>, map: Map<string, TreeNodeData>, getChildren: boolean, order: string = '') {
    let childdirlist: DirData[] = ArrayCopy(driverData.DirChildrenMap.get(node.key) || [])
    node.isLeaf = childdirlist.length == 0

    let dirorder = ''
    if (!order) {
      const settingStore = useSettingStore()
      if (settingStore.uiFileOrderDuli != 'null') {
        
        dirorder = driverData.FileOrderMap[node.key] || settingStore.uiFileOrderDuli || settingStore.uiFileListOrder || 'name desc'
      } else {
        
        dirorder = settingStore.uiFileListOrder || 'name desc'
        order = dirorder 
      }
    } else dirorder = order
    if (dirorder.startsWith('size ')) {
      
      for (let i = 0, maxi = childdirlist.length; i < maxi; i++) {
        let item = childdirlist[i]
        item.size = driverData.DirTotalSizeMap[item.file_id] || 0
      }
    }
    childdirlist = OrderNode(dirorder, childdirlist) as DirData[]

    let children: TreeNodeData[] = []
    for (let i = 0, maxi = childdirlist.length; i < maxi; i++) {
      let item = childdirlist[i]
      let itemnode: TreeNodeData = { __v_skip: true, key: item.file_id, title: item.name, children: [] }
      if (expandedKeys.has(itemnode.key)) TreeStore.GetTreeDataToShow(driverData, itemnode, expandedKeys, map, true, order)
      else if (getChildren) TreeStore.GetTreeDataToShow(driverData, itemnode, expandedKeys, map, false, order)

      children.push(itemnode)
      map.set(itemnode.key, itemnode)
    }

    node.children = children
  }

  static GetDriver(drive_id: string) {
    return DriverData.get(drive_id)
  }

  
  static GetDir(drive_id: string, dir_id: string): IAliGetDirModel | undefined {
    if (dir_id == 'root') return { __v_skip: true, drive_id, file_id: 'root', parent_file_id: '', name: '根目录', namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id == 'favorite') return { __v_skip: true, drive_id, file_id: 'favorite', parent_file_id: '', name: '收藏夹', namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id == 'trash') return { __v_skip: true, drive_id, file_id: 'trash', parent_file_id: '', name: '回收站', namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id == 'recover') return { __v_skip: true, drive_id, file_id: 'recover', parent_file_id: '', name: '文件恢复', namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id.startsWith('search')) return { __v_skip: true, drive_id, file_id: dir_id, parent_file_id: '', name: ('搜索 ' + dir_id.substring(6)).trimEnd(), namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id.startsWith('color')) return { __v_skip: true, drive_id, file_id: dir_id, parent_file_id: '', name: '标记 · ' + dir_id.substring(dir_id.indexOf(' ') + 1), namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id == 'video') return { __v_skip: true, drive_id, file_id: 'video', parent_file_id: '', name: '放映室', namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id.startsWith('video')) return { __v_skip: true, drive_id, file_id: dir_id, parent_file_id: '', name: '放映室 · ' + dir_id.substring('video'.length), namesearch: '', size: 0, time: 0, description: '' }

    let driverData = DriverData.get(drive_id)
    if (!driverData) return undefined
    const dir = driverData.DirMap.get(dir_id)
    if (!dir) return undefined
    return { __v_skip: true, drive_id, namesearch: '', description: '', ...dir } 
  }

  
  static GetDirPath(drive_id: string, dir_id: string): IAliGetDirModel[] {
    const dirPath: IAliGetDirModel[] = []
    if (!drive_id || !dir_id) return dirPath
    if (dir_id == 'root') return [{ __v_skip: true, drive_id, file_id: 'root', parent_file_id: '', name: '根目录', namesearch: '', size: 0, time: 0, description: '' }]
    if (dir_id == 'favorite') return [{ __v_skip: true, drive_id, file_id: 'favorite', parent_file_id: '', name: '收藏夹', namesearch: '', size: 0, time: 0, description: '' }]
    if (dir_id == 'trash') return [{ __v_skip: true, drive_id, file_id: 'trash', parent_file_id: '', name: '回收站', namesearch: '', size: 0, time: 0, description: '' }]
    if (dir_id == 'recover') return [{ __v_skip: true, drive_id, file_id: 'recover', parent_file_id: '', name: '文件恢复', namesearch: '', size: 0, time: 0, description: '' }]
    if (dir_id == 'search') return [{ __v_skip: true, drive_id, file_id: 'search', parent_file_id: '', name: '全盘搜索', namesearch: '', size: 0, time: 0, description: '' }]
    if (dir_id.startsWith('search')) {
      return [
        { __v_skip: true, drive_id, file_id: 'search', parent_file_id: '', name: '全盘搜索', namesearch: '', size: 0, time: 0, description: '' },
        { __v_skip: true, drive_id, file_id: dir_id, parent_file_id: 'search', name: dir_id.substring(6), namesearch: '', size: 0, time: 0, description: '' }
      ]
    }
    if (dir_id.startsWith('color')) return [{ __v_skip: true, drive_id, file_id: dir_id, parent_file_id: '', name: '标记 · ' + dir_id.substring(dir_id.indexOf(' ') + 1), namesearch: '', size: 0, time: 0, description: '' }]
    if (dir_id == 'video') return [{ __v_skip: true, drive_id, file_id: 'video', parent_file_id: '', name: '放映室', namesearch: '', size: 0, time: 0, description: '' }]
    if (dir_id.startsWith('video'))
      return [
        { __v_skip: true, drive_id, file_id: 'video', parent_file_id: '', name: '放映室', namesearch: '', size: 0, time: 0, description: '' },
        { __v_skip: true, drive_id, file_id: dir_id, parent_file_id: '', name: '放映室 · ' + dir_id.substring('video'.length), namesearch: '', size: 0, time: 0, description: '' }
      ]

    let driverData = DriverData.get(drive_id)
    if (!driverData) return dirPath
    const DirMap = driverData.DirMap

    let file_id = dir_id
    while (true) {
      const dir = DirMap.get(file_id)
      if (!dir) break
      dirPath.push({ __v_skip: true, drive_id, namesearch: '', description: '', ...dir })
      file_id = dir.parent_file_id
    }
    dirPath.reverse()
    return dirPath
  }

  
  static GetDirChildDirID(drive_id: string, dir_id: string): string[] {
    let alllist: string[] = []
    let driverData = DriverData.get(drive_id)
    if (!driverData) return alllist
    const childrens = driverData.DirChildrenMap.get(dir_id)
    if (childrens) childrens.map((t) => alllist.push(t.file_id))
    return alllist
  }

  
  static RenameDirs(drive_id: string, filelist: { file_id: string; parent_file_id: string; name: string; isdir: boolean }[]) {
    let driverData = DriverData.get(drive_id)
    if (!driverData) return
    let DirMap = driverData.DirMap
    for (let i = 0, maxi = filelist.length; i < maxi; i++) {
      let item = filelist[i]
      if (!item.isdir) continue 
      let findnode = DirMap.get(item.file_id)
      if (findnode) findnode.name = item.name
    }
  }

  
  static DeleteDirs(drive_id: string, fileidlist: string[]) {
    let driverData = DriverData.get(drive_id)
    if (!driverData) return
    let DirMap = driverData.DirMap
    let DirChildrenMap = driverData.DirChildrenMap
    for (let i = 0, maxi = fileidlist.length; i < maxi; i++) {
      let dirid = fileidlist[i]
      let dir = DirMap.get(dirid)
      if (dir) {
        let parent_file_id = dir.parent_file_id
        let clist = DirChildrenMap.get(parent_file_id)
        if (clist) {
          clist = clist.filter((t) => t.file_id != dirid)
          Object.freeze(clist)
          DirChildrenMap.set(parent_file_id, clist)
        }
      }
      DirMap.delete(dirid)
      DirChildrenMap.delete(dirid)
    }
  }
  
  static GetDirSizeNeedRefresh(drive_id: string, maxCacheTime: number = 604800) {
    let driverData = DriverData.get(drive_id)
    if (!driverData) return []
    let map = driverData.DirMap.keys()
    let timemap = driverData.DirFileSizeTimeMap
    let timeNow = Math.floor(Date.now() / 1000) - 1654500000
    let diridlist: string[] = []
    while (true) {
      let next = map.next()
      if (next.done) break
      let dir_id = next.value as string
      let time = timemap[dir_id] || 0
      if (time == 0 || timeNow - time > maxCacheTime) {
        diridlist.push(dir_id)
      }
    }
    return diridlist
  }
  
  static SaveDirSizeNeedRefresh(drive_id: string, dirsizelist: { dir_id: string; size: number }[]) {
    let driverData = DriverData.get(drive_id)
    if (!driverData) return

    let filemap = driverData.DirFileSizeMap
    let timemap = driverData.DirFileSizeTimeMap
    let timeNow = Math.floor(Date.now() / 1000) - 1654500000
    for (let i = 0, maxi = dirsizelist.length; i < maxi; i++) {
      let t = dirsizelist[i]
      filemap[t.dir_id] = t.size
      timemap[t.dir_id] = timeNow
    }
    _SaveDirSize(drive_id)
    _RefreshAllDirTotalSize(drive_id) 
  }
  
  static ClearDirSize(drive_id: string, parentdiridlist: string[]) {
    let driverData = DriverData.get(drive_id)
    if (!driverData) return
    let TimeMap = driverData.DirFileSizeTimeMap
    for (let i = 0, maxi = parentdiridlist.length; i < maxi; i++) {
      TimeMap[parentdiridlist[i]] = 0
    }
  }
}

const _SaveDirSize = throttle((drive_id: string) => {
  let driverData = DriverData.get(drive_id)
  if (!driverData) return
  DB.saveValueObjectBatch(['DirFileSize_' + driverData.drive_id, 'DirFileSizeTime_' + driverData.drive_id], [driverData.DirFileSizeMap, driverData.DirFileSizeTimeMap])
}, 5000)

const _RefreshAllDirTotalSize = debounce(_RefreshAllDirTotalSizeFunc, 12000, false, true, true)

function _RefreshAllDirTotalSizeFunc(drive_id: string) {
  let driverData = DriverData.get(drive_id)
  if (!driverData) return
  console.log('_RefreshAllDirTotalSizeFuncbegin')
  
  driverData.DirTotalSizeMap['root'] = TotalSize('root', driverData.DirTotalSizeMap, driverData.DirFileSizeMap, driverData.DirChildrenMap)
  console.log('_RefreshAllDirTotalSizeFunc')
  _SaveDirSize(drive_id)
}
function TotalSize(dir_id: string, DirTotalSizeMap: { [key: string]: number }, DirFileSizeMap: { [key: string]: number }, DirChildrenMap: Map<string, DirData[]>): number {
  let dirclist = DirChildrenMap.get(dir_id) || []
  let size = DirFileSizeMap[dir_id] || 0
  for (let i = 0, maxi = dirclist.length; i < maxi; i++) {
    size += TotalSize(dirclist[i].file_id, DirTotalSizeMap, DirFileSizeMap, DirChildrenMap)
  }
  DirTotalSizeMap[dir_id] = size
  return size
}
