import { IAliGetDirModel } from '../aliapi/alimodels'
import AliFile from '../aliapi/file'
import AliDirFileList from '../aliapi/dirfilelist'
import { useFootStore, usePanFileStore } from '../store'
import TreeStore, { IDriverModel, TreeNodeData } from '../store/treestore'
import DB from '../utils/db'
import DebugLog from '../utils/debuglog'
import message from '../utils/message'
import usePanTreeStore from './pantreestore'

export interface PanSelectedData {
  isError: boolean
  isErrorSelected: boolean
  user_id: string
  drive_id: string
  dirID: string
  parentDirID: string
  selectedKeys: string[]
  selectedParentKeys: string[]
}

const RefreshLock = new Set<string>()

export default class PanDAL {
  
  static async aReLoadDrive(user_id: string, drive_id: string): Promise<void> {
    const pantreeStore = usePanTreeStore()
    pantreeStore.mSaveUser(user_id, drive_id)
    if (!user_id || !drive_id) return

    
    const cache = await DB.getValueObject('AllDir_' + drive_id) 
    if (cache) {
      console.log('aReLoadDrive cache')
      await TreeStore.ConvertToOneDriver(drive_id, cache as IAliGetDirModel[], false, true)
      // PanDAL.RefreshPanTreeAllNode(drive_id) 
    }
    
    await PanDAL.aReLoadOneDirToShow(drive_id, 'root', true)

    if (cache) {
      const dt = await DB.getValueNumber('AllDir_' + drive_id)
      if (Date.now() - dt < 1000 * 60 * 60) {
        
        return
      }
    }
    
    useFootStore().mSaveLoading('加载全部文件夹...')
    window.WinMsgToUpload({ cmd: 'AllDirList', user_id, drive_id })
  }

  static async aReLoadDriveSave(OneDriver: IDriverModel, error: string): Promise<void> {
    if (error == 'time') return 
    if (!error) {
      TreeStore.SaveOneDriver(OneDriver)
      PanDAL.RefreshPanTreeAllNode(OneDriver.drive_id) 
    } else {
      message.error('列出全盘文件夹失败' + error)
    }
    useFootStore().mSaveLoading('')
  }

  
  static RefreshPanTreeAllNode(drive_id: string) {
    const OneDriver = TreeStore.GetDriver(drive_id)
    if (!OneDriver) return
    console.log('RefreshPanTreeAllNode')
    const pantreeStore = usePanTreeStore()
    const expandedKeys = new Set(pantreeStore.treeExpandedKeys)

    const dir: TreeNodeData = { __v_skip: true, title: '根目录', namesearch: '', key: 'root', children: [] }
    const map = new Map<string, TreeNodeData>()
    TreeStore.GetTreeDataToShow(OneDriver, dir, expandedKeys, map, true)
    map.set(dir.key, dir) 
    pantreeStore.mSaveTreeAllNode(OneDriver.drive_id, dir, map)
  }

  static GetPanTreeAllNode(drive_id: string, treeExpandedKeys: string[]): TreeNodeData[] {
    const OneDriver = TreeStore.GetDriver(drive_id)
    if (!OneDriver) return []
    console.log('GetPanTreeAllNode')
    const expandedKeys = new Set(treeExpandedKeys)

    const dir: TreeNodeData = { __v_skip: true, title: '根目录', namesearch: '', key: 'root', children: [] }
    const map = new Map<string, TreeNodeData>()
    TreeStore.GetTreeDataToShow(OneDriver, dir, expandedKeys, map, true)
    map.set(dir.key, dir) 

    return [dir]
  }

  
  static aTreeScrollToDir(dirID: string) {
    usePanTreeStore().mSaveTreeScrollTo(dirID)
  }

  
  static async aReLoadOneDirToShow(drive_id: string, file_id: string, selfExpand: boolean): Promise<boolean> {
    
    
    
    
    const pantreeStore = usePanTreeStore()
    if (!drive_id) drive_id = pantreeStore.drive_id
    if (!drive_id) return false

    if (file_id == 'refresh') file_id = pantreeStore.selectDir.file_id 
    const isBack = file_id == 'back' 
    if (isBack) {
      
      if (pantreeStore.History.length > 0) {
        pantreeStore.History.splice(0, 1) 
        if (pantreeStore.History.length > 0) {
          drive_id = pantreeStore.History[0].drive_id
          file_id = pantreeStore.History[0].file_id
        }
      }
      if (file_id == 'back') {
        
        pantreeStore.History = []
        file_id = 'root'
      }
    }

    
    let dir = TreeStore.GetDir(drive_id, file_id)
    let dirPath = TreeStore.GetDirPath(drive_id, file_id)
    if (!dir || (dirPath.length == 0 && file_id != 'root')) {
      
      const findPath = await AliFile.ApiFileGetPath(pantreeStore.user_id, drive_id, file_id)
      if (findPath.length > 0) {
        dirPath = findPath
        dir = { ...dirPath[dirPath.length - 1] }
      }
    }

    if (!dir || (dirPath.length == 0 && file_id != 'root')) {
      message.error('出错，找不到指定的文件夹 ' + file_id)
      return false 
    }

    
    if (!isBack && pantreeStore.selectDir.file_id != dir.file_id) {
      
      const history: IAliGetDirModel[] = [dir]
      for (let i = 0, maxi = pantreeStore.History.length; i < maxi; i++) {
        const his = pantreeStore.History[i]
        history.push(his)
        if (history.length >= 50) break
      }
      pantreeStore.History = history 
    }
    
    const treeExpandedKeys = new Set(pantreeStore.treeExpandedKeys)
    treeExpandedKeys.add('root')
    for (let i = 0, maxi = dirPath.length - 1; i < maxi; i++) {
      
      treeExpandedKeys.add(dirPath[i].file_id)
    }
    if (selfExpand) treeExpandedKeys.add(dir.file_id) 

    pantreeStore.mShowDir(dir, dirPath, [dir.file_id], Array.from(treeExpandedKeys))
    PanDAL.RefreshPanTreeAllNode(drive_id) 

    const panfileStore = usePanFileStore()
    if (panfileStore.ListLoading && panfileStore.DriveID == drive_id && panfileStore.DirID == dir.file_id) return false
    panfileStore.mSaveDirFileLoading(drive_id, dir.file_id, dir.name)
    return PanDAL.GetDirFileList(pantreeStore.user_id, dir.drive_id, dir.file_id, dir.name)
  }

  
  static GetDirFileList(user_id: string, drive_id: string, dirID: string, dirName: string, hasFiles: boolean = true): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      
      if (dirID == 'search') {
        if (hasFiles) usePanFileStore().mSaveDirFileLoadingFinish(drive_id, dirID, [])
        resolve(true)
        return
      }

      
      const order = TreeStore.GetDirOrder(drive_id, dirID).replace('ext ', 'updated_at ') 
      AliDirFileList.ApiDirFileList(user_id, drive_id, dirID, dirName, order, hasFiles ? '' : 'folder')
        .then((dir) => {
          if (!dir.next_marker) {
            TreeStore.SaveOneDirFileList(dir, hasFiles).then(() => {
              
              if (hasFiles) usePanFileStore().mSaveDirFileLoadingFinish(drive_id, dirID, dir.items, dir.itemsTotal || 0)
              PanDAL.RefreshPanTreeAllNode(drive_id) 
              resolve(true)
            }) 
          } else if (dir.next_marker == 'cancel') {
            resolve(false)
          } else {
            message.warning('列出文件夹失败 ' + dir.next_marker)
            if (hasFiles) usePanFileStore().mSaveDirFileLoadingFinish(drive_id, dirID, [])
            resolve(false)
          }
        })
        .catch((err: any) => {
          if (hasFiles) usePanFileStore().mSaveDirFileLoadingFinish(drive_id, dirID, [])
          message.warning('列出文件夹失败 ' + (err.message || ''))
          DebugLog.mSaveWarning('列出文件夹失败file_id=' + dirID, err)
          resolve(false)
        })
    })
  }

  
  static aReLoadOneDirToRefreshTree(user_id: string, drive_id: string, dirID: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      
      if (dirID == 'favorite' || dirID.startsWith('color') || dirID.startsWith('search') || dirID.startsWith('video')) {
        resolve(true)
        return
      }

      if (RefreshLock.has(dirID)) {
        resolve(true)
        return
      }
      RefreshLock.add(dirID)
      
      const order = TreeStore.GetDirOrder(drive_id, dirID).replace('ext ', 'updated_at ') 
      AliDirFileList.ApiDirFileList(user_id, drive_id, dirID, '', order, 'folder')
        .then((dir) => {
          if (!dir.next_marker) {
            TreeStore.SaveOneDirFileList(dir, false).then(() => {
              
              PanDAL.RefreshPanTreeAllNode(drive_id) 

              const pantreeStore = usePanTreeStore()
              if (pantreeStore.selectDir.drive_id == drive_id && pantreeStore.selectDir.file_id == dirID) {
                PanDAL.aReLoadOneDirToShow(drive_id, dirID, false).then(() => {
                  RefreshLock.delete(dirID)
                  resolve(true)
                })
              } else {
                RefreshLock.delete(dirID)
                resolve(true)
              }
            }) 
          } else if (dir.next_marker == 'cancel') {
            RefreshLock.delete(dirID)
            resolve(false)
          } else {
            RefreshLock.delete(dirID)
            resolve(false)
          }
        })
        .catch((err: any) => {
          DebugLog.mSaveWarning('列出文件夹失败file_id=' + dirID, err)
          RefreshLock.delete(dirID)
          resolve(false)
        })
    })
  }

  
  static GetPanSelectedData(istree: boolean): PanSelectedData {
    const pantreeStore = usePanTreeStore()

    const data: PanSelectedData = {
      isError: false,
      
      isErrorSelected: false,
      user_id: pantreeStore.user_id,
      drive_id: pantreeStore.drive_id,
      dirID: pantreeStore.selectDir.file_id,
      parentDirID: pantreeStore.selectDir.parent_file_id,
      selectedKeys: istree ? [pantreeStore.selectDir.file_id] : usePanFileStore().GetSelectedID(),
      selectedParentKeys: istree ? [pantreeStore.selectDir.parent_file_id] : usePanFileStore().GetSelectedParentDirID()
    }

    data.isError = !data.user_id || !data.drive_id || !data.dirID
    data.isErrorSelected = data.selectedKeys.length == 0
    return data
  }

  
  static updateQuickFile(list: { key: string; title: string }[]) {
    if (list.length == 0) return
    const pantreeStore = usePanTreeStore()
    const jsonstr = localStorage.getItem('FileQuick-' + pantreeStore.user_id)
    const arr = jsonstr ? JSON.parse(jsonstr) : []
    list.map((t) => {
      let find = false
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].key == t.key) {
          arr[i].title = t.title
          find = true
        }
      }
      if (find == false) arr.push({ key: t.key, title: t.title })
      return true
    })
    localStorage.setItem('FileQuick-' + pantreeStore.user_id, JSON.stringify(arr))
    pantreeStore.mSaveQuick(arr)
  }

  
  static deleteQuickFile(key: string) {
    if (!key) return
    const pantreeStore = usePanTreeStore()
    const jsonstr = localStorage.getItem('FileQuick-' + pantreeStore.user_id)
    const arr = jsonstr ? JSON.parse(jsonstr) : []
    const newArray: { key: string; title: string }[] = []
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].key != key) newArray.push(arr[i])
    }
    localStorage.setItem('FileQuick-' + pantreeStore.user_id, JSON.stringify(newArray))
    pantreeStore.mSaveQuick(newArray)
  }

  
  static getQuickFileList() {
    const pantreeStore = usePanTreeStore()
    const jsonstr = localStorage.getItem('FileQuick-' + pantreeStore.user_id)
    const arr = jsonstr ? JSON.parse(jsonstr) : []
    return arr
  }

  
  static aReLoadQuickFile(user_id: string) {
    const jsonstr = localStorage.getItem('FileQuick-' + user_id)
    const arr = jsonstr ? JSON.parse(jsonstr) : []
    usePanTreeStore().mSaveQuick(arr)
  }

  
  static async aUpdateDirFileSize(): Promise<void> {
    const pantreeStore = usePanTreeStore()
    const user_id = pantreeStore.user_id
    const drive_id = pantreeStore.drive_id

    const diridList = TreeStore.GetDirSizeNeedRefresh(drive_id, 604800)
    const partList: string[] = []
    for (let i = 0, maxi = diridList.length; i < maxi; i++) {
      partList.push(diridList[i])
      if (partList.length >= 30) {
        const partResult = await AliDirFileList.ApiDirFileSize(user_id, drive_id, partList)
        if (!partResult) return 
        if (partResult) TreeStore.SaveDirSizeNeedRefresh(drive_id, partResult)
        partList.length = 0
      }
    }
    if (partList.length > 0) {
      const partResult = await AliDirFileList.ApiDirFileSize(user_id, drive_id, partList)
      if (partResult) TreeStore.SaveDirSizeNeedRefresh(drive_id, partResult)
      partList.length = 0
    }
  }
}
