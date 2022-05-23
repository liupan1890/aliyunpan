import { IAliFileResp } from '../aliapi/dirfilelist'
import { IAliGetDirModel, IAliGetFileModel } from '../aliapi/alimodels'
import DB from '../utils/db'
import { humanSize, SortNumber } from '../utils/format'
import { ArrayCopy, HanToPin } from '../utils/utils'
import { usePanTreeStore, useSettingStore } from '@/store'

export interface TreeNodeData {
  __v_skip: true
  key: string
  title: string
  namesearch: string
  children: TreeNodeData[]
  icon?: any
  isLeaf?: boolean
}

interface IDriverModel {
  drive_id: string
  
  DirMap: Map<string, IAliGetDirModel>
  
  DirChildrenMap: Map<string, IAliGetDirModel[]>
  
  DirSizeMap: Map<string, number>

  
  FileOrderMap: Map<string, string>
}

const DriverData = new Map<string, IDriverModel>()

const UserAllDir = new Map<string, number>()

export default class TreeStore {
  /**
   * 加载文件夹体积，文件夹排序，刷新整个Tree
   * 登录后第一次加载全部文件夹,完整的覆盖保存一次 saveToDB=是否保存到DB
   */
  static async SaveAllDir(drive_id: string, children: IAliGetDirModel[], saveToDB: boolean) {
    console.time('SaveAllDir')
    if (saveToDB) {
      
      UserAllDir.set(drive_id, new Date().getTime()) 
      await DB.saveValueObject('AllDir_' + drive_id, children) 
      await DB.saveValueNumber('AllDir_' + drive_id, Date.now()) 
    }
    
    const OneDriver: IDriverModel = {
      drive_id,
      DirMap: new Map<string, IAliGetDirModel>(),
      DirChildrenMap: new Map<string, IAliGetDirModel[]>(),
      DirSizeMap: new Map<string, number>(),
      FileOrderMap: new Map<string, string>()
    }
    
    const jsonsize = await DB.getValueString('DirSize_' + drive_id)
    const sizemap = jsonsize ? new Map<string, number>(JSON.parse(jsonsize)) : new Map<string, number>()
    
    const jsonorder = await DB.getValueString('FileOrder_' + drive_id)
    OneDriver.FileOrderMap = jsonorder ? new Map<string, string>(JSON.parse(jsonorder)) : new Map<string, string>()
    
    let root: IAliGetDirModel = { __v_skip: true, drive_id, file_id: 'root', parent_file_id: '', name: '根目录', namesearch: '', size: 0, time: 0, description: '' }
    OneDriver.DirMap.set(root.file_id, root)

    let ChildrenMap = new Map<string, IAliGetDirModel[]>()
    ChildrenMap.set(root.file_id, [])
    
    try {
      let parentid: string = ''
      let childdirlist: IAliGetDirModel[] = [] 
      let item: IAliGetDirModel
      
      for (let i = 0, maxi = children.length; i < maxi; i++) {
        item = children[i]
        OneDriver.DirMap.set(item.file_id, item)
        OneDriver.DirSizeMap.set(item.file_id, sizemap.get(item.file_id) || 0)
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

    
    let ChildrenMap2 = new Map<string, IAliGetDirModel[]>()
    ChildrenMap.forEach(function (value, key) {
      Object.freeze(value) 
      ChildrenMap2.set(key, value)
    })
    OneDriver.DirChildrenMap = ChildrenMap2
    
    DriverData.set(drive_id, OneDriver)

    TreeStore.RefreshPanTreeAllNode(OneDriver) 
    console.timeEnd('SaveAllDir')
  }

  
  static async SaveOneDirFileList(dir: IAliFileResp) {
    console.log('SaveOneDirFileList', dir.m_dir_id)

    if (dir.m_dir_id == 'favorite' || dir.m_dir_id == 'trash' || dir.m_dir_id == 'recover' || dir.m_dir_id.startsWith('search') || dir.m_dir_id.startsWith('color') || dir.m_dir_id.startsWith('video')) {
      
      return
    }

    let driverData = DriverData.get(dir.m_drive_id)
    if (!driverData) {
      
      let cache = await DB.getValueObject('AllDir_' + dir.m_drive_id) 
      if (cache) {
        console.log('SaveOneDirFileList LoadCacheAllDir')
        await TreeStore.SaveAllDir(dir.m_drive_id, cache as IAliGetDirModel[], false)
        driverData = DriverData.get(dir.m_drive_id)!
      } else return
    }

    let dirs: IAliGetFileModel[] = []
    let files: IAliGetFileModel[] = []
    for (let i = 0, maxi = dir.items.length; i < maxi; i++) {
      if (dir.items[i].isdir) dirs.push(dir.items[i])
      else files.push(dir.items[i])
    }

    
    let dirsize = 0
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      dirsize += files[i].size
    }
    driverData.DirSizeMap.set(dir.m_dir_id, dirsize) 

    
    const dirlist: IAliGetDirModel[] = []
    for (let i = 0, maxi = dirs.length; i < maxi; i++) {
      const item = dirs[i]
      const diritem: IAliGetDirModel = {
        __v_skip: true,
        drive_id: item.drive_id,
        file_id: item.file_id,
        parent_file_id: item.parent_file_id,
        name: item.name,
        namesearch: '' ,
        size: 0,
        time: item.time,
        description: item.description
      }
      dirlist.push(diritem)
      driverData.DirMap.set(diritem.file_id, diritem) 
    }
    Object.freeze(dirlist) 
    driverData.DirChildrenMap.set(dir.m_dir_id, dirlist) 

    TreeStore.RefreshPanTreeOneDirNode(driverData, dir.m_dir_id, dir.m_dir_name) 
  }

  
  static GetDirOrder(drive_id: string, dir_id: string) {
    const settingStore = useSettingStore()
    let order = settingStore.uiFileListOrder || 'name desc'
    if (settingStore.uiFileOrderDuli != 'null') {
      
      let driverData = DriverData.get(drive_id)
      if (driverData) order = driverData.FileOrderMap.get(dir_id) || settingStore.uiFileOrderDuli || order
    }
    return order.toLowerCase()
  }
  static SaveDirOrder(drive_id: string, dir_id: string, order: string) {
    const settingStore = useSettingStore()
    if (settingStore.uiFileOrderDuli != 'null') {
      
      let driverData = DriverData.get(drive_id)
      if (driverData) {
        driverData.FileOrderMap.set(dir_id, order)
        let jsonorder = JSON.stringify(Array.from(driverData.FileOrderMap))
        DB.saveValueString('FileOrder_' + drive_id, jsonorder) 
      }
    } else {
      
      settingStore.updateStore({ uiFileListOrder: order }) 
    }
  }

  static RefreshPanTreeAllNode(OneDriver: IDriverModel) {
    let dir: TreeNodeData = { __v_skip: true, title: '根目录', namesearch: '', key: 'root', children: [] }
    let map = new Map<string, TreeNodeData>()
    TreeStore._GetTreeDataOneDir(OneDriver, dir, map, true) 
    map.set(dir.key, dir) 
    usePanTreeStore().mSaveTreeAllNode(OneDriver.drive_id, dir, map)
  }

  static RefreshPanTreeOneDirNode(OneDriver: IDriverModel, dir_id: string, dir_name: string) {
    let finddir = OneDriver.DirMap.get(dir_id)
    if (!finddir) return
    let dir: TreeNodeData = { __v_skip: true, title: dir_name, namesearch: '', key: dir_id, children: [] }
    let map = new Map<string, TreeNodeData>()
    TreeStore._GetTreeDataOneDir(OneDriver, dir, map, true) 
    usePanTreeStore().mSaveTreeOneDirNode(OneDriver.drive_id, dir_id, dir, map)
  }
  
  static GetPanTreeAllNodeForModal(drive_id: string) {
    let driverData = DriverData.get(drive_id)
    if (!driverData) return []
    let dir: TreeNodeData = { __v_skip: true, title: '根目录', namesearch: '', key: 'root', children: [] }
    let map = new Map<string, TreeNodeData>()
    TreeStore._GetTreeDataOneDir(driverData, dir, map, true) 
    return [dir]
  }

  static _GetTreeDataOneDir(driverData: IDriverModel, node: TreeNodeData, map: Map<string, TreeNodeData>, getChildren: boolean) {
    let childdirlist: IAliGetDirModel[] = ArrayCopy(driverData.DirChildrenMap.get(node.key) || [])
    node.isLeaf = childdirlist.length == 0

    let children: TreeNodeData[] = []
    for (let i = 0, maxi = childdirlist.length; i < maxi; i++) {
      let item = childdirlist[i]
      let itemnode: TreeNodeData = { __v_skip: true, key: item.file_id, title: item.name, namesearch: item.namesearch, children: [] }
      if (getChildren) TreeStore._GetTreeDataOneDir(driverData, itemnode, map, getChildren)
      children.push(itemnode)
      map.set(itemnode.key, itemnode)
    }
    node.children = children
  }

  
  static GetDir(drive_id: string, dir_id: string): IAliGetDirModel | undefined {
    if (dir_id == 'root') return { __v_skip: true, drive_id, file_id: 'root', parent_file_id: '', name: '根目录', namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id == 'favorite') return { __v_skip: true, drive_id, file_id: 'favorite', parent_file_id: '', name: '收藏夹', namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id == 'trash') return { __v_skip: true, drive_id, file_id: 'trash', parent_file_id: '', name: '回收站', namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id == 'recover') return { __v_skip: true, drive_id, file_id: 'recover', parent_file_id: '', name: '恢复文件', namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id.startsWith('search')) return { __v_skip: true, drive_id, file_id: dir_id, parent_file_id: '', name: ('搜索 ' + dir_id.substring(6)).trimEnd(), namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id.startsWith('color')) return { __v_skip: true, drive_id, file_id: dir_id, parent_file_id: '', name: '标记 · ' + dir_id.substring(dir_id.indexOf(' ') + 1), namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id == 'video') return { __v_skip: true, drive_id, file_id: 'video', parent_file_id: '', name: '放映室', namesearch: '', size: 0, time: 0, description: '' }
    if (dir_id.startsWith('video')) return { __v_skip: true, drive_id, file_id: dir_id, parent_file_id: '', name: '放映室 · ' + dir_id.substring('video'.length), namesearch: '', size: 0, time: 0, description: '' }

    let driverData = DriverData.get(drive_id)
    if (!driverData) return undefined
    const dir = driverData.DirMap.get(dir_id)
    if (!dir) return undefined
    return { ...dir } 
  }

  
  static GetDirPath(drive_id: string, dir_id: string): IAliGetDirModel[] {
    const dirPath: IAliGetDirModel[] = []
    if (!drive_id || !dir_id) return dirPath
    if (dir_id == 'root') return [{ __v_skip: true, drive_id, file_id: 'root', parent_file_id: '', name: '根目录', namesearch: '', size: 0, time: 0, description: '' }]
    if (dir_id == 'favorite') return [{ __v_skip: true, drive_id, file_id: 'favorite', parent_file_id: '', name: '收藏夹', namesearch: '', size: 0, time: 0, description: '' }]
    if (dir_id == 'trash') return [{ __v_skip: true, drive_id, file_id: 'trash', parent_file_id: '', name: '回收站', namesearch: '', size: 0, time: 0, description: '' }]
    if (dir_id == 'recover') return [{ __v_skip: true, drive_id, file_id: 'recover', parent_file_id: '', name: '恢复文件', namesearch: '', size: 0, time: 0, description: '' }]
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
      dirPath.push({ ...dir })
      file_id = dir.parent_file_id
    }
    dirPath.reverse()
    return dirPath
  }

  
  static ReGetDirAllChildDirID(drive_id: string, dir_id: string): string[] {
    let alllist = [dir_id]
    let driverData = DriverData.get(drive_id)
    if (!driverData) return alllist
    const childrens = driverData.DirChildrenMap.get(dir_id)
    if (childrens) TreeStore._ReGetDirAllChildDirID(alllist, childrens, driverData.DirChildrenMap)
    return alllist
  }
  static _ReGetDirAllChildDirID(alllist: string[], childrens: IAliGetDirModel[], DirChildrenMap: Map<string, IAliGetDirModel[]>) {
    for (let i = 0, maxi = childrens.length; i < maxi; i++) {
      alllist.push(childrens[i].file_id)
      const childrens2 = DirChildrenMap.get(childrens[i].file_id)
      if (childrens2) TreeStore._ReGetDirAllChildDirID(alllist, childrens2, DirChildrenMap)
    }
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
}
