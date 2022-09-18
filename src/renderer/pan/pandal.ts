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
  iserror: boolean
  iserrorselected: boolean
  user_id: string
  drive_id: string
  dir_id: string
  parent_dir_id: string
  select_keys: string[]
  select_parentkeys: string[]
}

export default class PanDAL {
  
  static async aReLoadDrive(user_id: string, drive_id: string) {
    const pantreeStore = usePanTreeStore()
    pantreeStore.mSaveUser(user_id, drive_id)
    if (!user_id || !drive_id) return

    
    let cache = await DB.getValueObject('AllDir_' + drive_id) 
    if (cache) {
      console.log('aReLoadDrive cache')
      await TreeStore.ConvertToOneDriver(drive_id, cache as IAliGetDirModel[], false, true)
      //PanDAL.RefreshPanTreeAllNode(drive_id) 
    }
    
    await PanDAL.aReLoadOneDirToShow(drive_id, 'root', true)

    if (cache) {
      let dt = await DB.getValueNumber('AllDir_' + drive_id)
      if (Date.now() - dt < 1000 * 60 * 60) {
        
        return
      }
    }
    
    useFootStore().mSaveLoading('加载全部文件夹...')
    window.WinMsgToUpload({ cmd: 'AllDirList', user_id, drive_id })
  }

  static async aReLoadDriveSave(OneDriver: IDriverModel, error: string) {
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
    let OneDriver = TreeStore.GetDriver(drive_id)
    if (!OneDriver) return
    console.log('RefreshPanTreeAllNode')
    let pantreeStore = usePanTreeStore()
    let expandedKeys = new Set(pantreeStore.treeExpandedKeys)

    let dir: TreeNodeData = { __v_skip: true, title: '根目录', namesearch: '', key: 'root', children: [] }
    let map = new Map<string, TreeNodeData>()
    TreeStore.GetTreeDataToShow(OneDriver, dir, expandedKeys, map, true)
    map.set(dir.key, dir) 
    pantreeStore.mSaveTreeAllNode(OneDriver.drive_id, dir, map)
  }

  static GetPanTreeAllNode(drive_id: string, treeExpandedKeys: string[]) {
    let OneDriver = TreeStore.GetDriver(drive_id)
    if (!OneDriver) return []
    console.log('GetPanTreeAllNode')
    let pantreeStore = usePanTreeStore()
    let expandedKeys = new Set(treeExpandedKeys)

    let dir: TreeNodeData = { __v_skip: true, title: '根目录', namesearch: '', key: 'root', children: [] }
    let map = new Map<string, TreeNodeData>()
    TreeStore.GetTreeDataToShow(OneDriver, dir, expandedKeys, map, true)
    map.set(dir.key, dir) 

    return [dir]
  }
  
  static aTreeScrollToDir(dir_id: string) {
    usePanTreeStore().mSaveTreeScrollTo(dir_id)
  }

  
  static async aReLoadOneDirToShow(drive_id: string, file_id: string, selfExpand: boolean) {
    
    
    
    
    const pantreeStore = usePanTreeStore()
    if (!drive_id) drive_id = pantreeStore.drive_id
    if (!drive_id) return

    if (file_id == 'refresh') file_id = pantreeStore.selectDir.file_id 
    let isBack = file_id == 'back' 
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
      
      let findpath = await AliFile.ApiFileGetPath(pantreeStore.user_id, drive_id, file_id)
      if (findpath.length > 0) {
        dirPath = TreeStore.GetDirPath(drive_id, 'root')
        dirPath = dirPath.concat(findpath)
        dir = { ...dirPath[dirPath.length - 1] }
      }
    }

    if (!dir || (dirPath.length == 0 && file_id != 'root')) {
      message.error('出错，找不到指定的文件夹 ' + file_id)
      return false 
    }

    
    if (!isBack && pantreeStore.selectDir.file_id != dir.file_id) {
      
      let history: IAliGetDirModel[] = [dir]
      for (let i = 0, maxi = pantreeStore.History.length; i < maxi; i++) {
        const his = pantreeStore.History[i]
        history.push(his)
        if (history.length >= 50) break
      }
      pantreeStore.History = history 
    }
    
    let treeExpandedKeys = new Set(pantreeStore.treeExpandedKeys)
    treeExpandedKeys.add('root')
    for (let i = 0, maxi = dirPath.length - 1; i < maxi; i++) {
      
      treeExpandedKeys.add(dirPath[i].file_id)
    }
    if (selfExpand) treeExpandedKeys.add(dir.file_id) 

    pantreeStore.mShowDir(dir, dirPath, [dir.file_id], Array.from(treeExpandedKeys))
    PanDAL.RefreshPanTreeAllNode(drive_id) 
    usePanFileStore().mSaveDirFileLoading(drive_id, dir.file_id, dir.name)
    return PanDAL.GetDirFileList(pantreeStore.user_id, dir.drive_id, dir.file_id, dir.name)
  }

  
  static GetDirFileList(user_id: string, drive_id: string, dir_id: string, dir_name: string, hasFiles: boolean = true) {
    return new Promise<boolean>((resolve) => {
      
      if (dir_id == 'search') {
        if (hasFiles) usePanFileStore().mSaveDirFileLoadingFinish(drive_id, dir_id, [])
        resolve(true)
        return
      }

      
      let order = TreeStore.GetDirOrder(drive_id, dir_id).replace('ext ', 'updated_at ') 
      AliDirFileList.ApiDirFileList(user_id, drive_id, dir_id, dir_name, order, hasFiles ? '' : 'folder')
        .then((dir) => {
          if (!dir.next_marker) {
            TreeStore.SaveOneDirFileList(dir, hasFiles).then(() => {
              
              if (hasFiles) usePanFileStore().mSaveDirFileLoadingFinish(drive_id, dir_id, dir.items, dir.itemsTotal || 0)
              PanDAL.RefreshPanTreeAllNode(drive_id) 
              resolve(true)
            }) 
          } else if (dir.next_marker == 'cancel') {
            resolve(false)
          } else {
            message.warning('列出文件夹失败 ' + dir.next_marker)
            if (hasFiles) usePanFileStore().mSaveDirFileLoadingFinish(drive_id, dir_id, [])
            resolve(false)
          }
        })
        .catch((err: any) => {
          if (hasFiles) usePanFileStore().mSaveDirFileLoadingFinish(drive_id, dir_id, [])
          message.warning('列出文件夹失败 ' + (err.message || ''))
          DebugLog.mSaveWarning('列出文件夹失败file_id=' + dir_id, err)
          resolve(false)
        })
    })
  }

  
  static aReLoadOneDirToRefreshTree(user_id: string, drive_id: string, dir_id: string) {
    return new Promise<boolean>((resolve) => {
      
      if (dir_id == 'favorite' || dir_id.startsWith('color') || dir_id.startsWith('search') || dir_id.startsWith('video')) {
        resolve(true)
        return
      }

      
      let order = TreeStore.GetDirOrder(drive_id, dir_id).replace('ext ', 'updated_at ') 
      AliDirFileList.ApiDirFileList(user_id, drive_id, dir_id, '', order, 'folder')
        .then((dir) => {
          if (!dir.next_marker) {
            TreeStore.SaveOneDirFileList(dir, false).then(() => {
              
              PanDAL.RefreshPanTreeAllNode(drive_id) 
              resolve(true)
            }) 
          } else if (dir.next_marker == 'cancel') {
            resolve(false)
          } else {
            resolve(false)
          }
        })
        .catch((err: any) => {
          DebugLog.mSaveWarning('列出文件夹失败file_id=' + dir_id, err)
          resolve(false)
        })
    })
  }
  
  static GetPanSelectedData(istree: boolean): PanSelectedData {
    const pantreeStore = usePanTreeStore()

    let data: PanSelectedData = {
      iserror: false,
      
      iserrorselected: false,
      user_id: pantreeStore.user_id,
      drive_id: pantreeStore.drive_id,
      dir_id: pantreeStore.selectDir.file_id,
      parent_dir_id: pantreeStore.selectDir.parent_file_id,
      select_keys: istree ? [pantreeStore.selectDir.file_id] : usePanFileStore().GetSelectedID(),
      select_parentkeys: istree ? [pantreeStore.selectDir.parent_file_id] : usePanFileStore().GetSelectedParentDirID()
    }

    data.iserror = !data.user_id || !data.drive_id || !data.dir_id
    data.iserrorselected = data.select_keys.length == 0
    return data
  }
  
  static updateQuickFile(list: { key: string; title: string }[]) {
    if (list.length == 0) return
    const pantreeStore = usePanTreeStore()
    let jsonstr = localStorage.getItem('FileQuick-' + pantreeStore.user_id)
    let arr = jsonstr ? JSON.parse(jsonstr) : []
    list.map((t) => {
      let find = false
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].key == t.key) {
          arr[i].title = t.title
          find = true
        }
      }
      if (find == false) arr.push({ key: t.key, title: t.title })
    })
    localStorage.setItem('FileQuick-' + pantreeStore.user_id, JSON.stringify(arr))
    pantreeStore.mSaveQuick(arr)
  }
  
  static deleteQuickFile(key: string) {
    if (!key) return
    const pantreeStore = usePanTreeStore()
    let jsonstr = localStorage.getItem('FileQuick-' + pantreeStore.user_id)
    let arr = jsonstr ? JSON.parse(jsonstr) : []
    let newarry: { key: string; title: string }[] = []
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].key != key) newarry.push(arr[i])
    }
    localStorage.setItem('FileQuick-' + pantreeStore.user_id, JSON.stringify(newarry))
    pantreeStore.mSaveQuick(newarry)
  }
  
  static getQuickFileList() {
    const pantreeStore = usePanTreeStore()
    let jsonstr = localStorage.getItem('FileQuick-' + pantreeStore.user_id)
    let arr = jsonstr ? JSON.parse(jsonstr) : []
    return arr
  }
  
  static aReLoadQuickFile(user_id: string) {
    let jsonstr = localStorage.getItem('FileQuick-' + user_id)
    let arr = jsonstr ? JSON.parse(jsonstr) : []
    usePanTreeStore().mSaveQuick(arr)
  }
  
  static async aUpdateDirFileSize() {
    const pantreeStore = usePanTreeStore()
    const user_id = pantreeStore.user_id
    const drive_id = pantreeStore.drive_id

    let diridlist = TreeStore.GetDirSizeNeedRefresh(drive_id, 604800)
    let partlist: string[] = []
    for (let i = 0, maxi = diridlist.length; i < maxi; i++) {
      partlist.push(diridlist[i])
      if (partlist.length >= 30) {
        let partresult = await AliDirFileList.ApiDirFileSize(user_id, drive_id, partlist)
        if (!partresult) return 
        if (partresult) TreeStore.SaveDirSizeNeedRefresh(drive_id, partresult)
        partlist.length = 0
      }
    }
    if (partlist.length > 0) {
      let partresult = await AliDirFileList.ApiDirFileSize(user_id, drive_id, partlist)
      if (partresult) TreeStore.SaveDirSizeNeedRefresh(drive_id, partresult)
      partlist.length = 0
    }
  }
}
