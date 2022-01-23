import { IAliFileResp } from '@/aliapi/filelist'
import { IAliGetDirModel, IAliGetFileModel } from '@/aliapi/models'
import { FolderIcon } from '@/components/folder'
import DB from '@/setting/db'
import SettingPan from '@/setting/settingpan'
import { DataNode } from 'antd/lib/tree'
import { humanSize, SortNumber } from './format'
import { ArrayCopy } from './utils'
interface IPanDriverModel {
  drive_id: string
  DirMap: Map<string, IAliGetDirModel>
  DirChildrenMap: Map<string, IAliGetDirModel[]>
  TreeChildrenMap: Map<string, string[]>
  DirSizeMap: Map<string, number>
  FileOrderMap: Map<string, string>
  FileListMap: Map<string, IAliFileResp>
}
const PanData = new Map<string, IPanDriverModel>()
const UserAllDir = new Map<string, number>()

export default class PanStore {
  static async SaveAllDir(drive_id: string, children: IAliGetDirModel[], init: boolean = false) {
    console.log('SaveAllDir')
    let ts = Date.now()
    if (!init) {
      UserAllDir.set(drive_id, new Date().getTime())
      await DB.saveValueObject('AllDir_' + drive_id, children)
    } else {
      let cc = await DB.getValueObject('AllDir_' + drive_id)
      children = cc ? (cc as IAliGetDirModel[]) : []
    }
    const DriverData: IPanDriverModel = {
      drive_id,
      DirMap: new Map<string, IAliGetDirModel>(),
      DirChildrenMap: new Map<string, IAliGetDirModel[]>(),
      TreeChildrenMap: new Map<string, string[]>(),
      DirSizeMap: new Map<string, number>(),
      FileOrderMap: new Map<string, string>(),
      FileListMap: new Map<string, IAliFileResp>()
    }
    let root: IAliGetDirModel = { drive_id, file_id: 'root', parent_file_id: '', name: '根目录', size: 0, time: 0, description: '' }

    DriverData.DirMap.set(root.file_id, root)
    let ChildrenMap = new Map<string, IAliGetDirModel[]>()
    ChildrenMap.set(root.file_id, [])
    const jsonsize = await DB.getValueString('DirSize_' + drive_id)
    const sizemap = jsonsize ? new Map<string, number>(JSON.parse(jsonsize)) : new Map<string, number>()
    try {
      let parentid: string = ''
      let parentdir: IAliGetDirModel[] = []
      let item: IAliGetDirModel
      for (let i = 0, maxi = children.length; i < maxi; i++) {
        item = children[i]
        DriverData.DirMap.set(item.file_id, item)
        DriverData.DirSizeMap.set(item.file_id, sizemap.get(item.file_id) || 0)
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
    const jsonorder = await DB.getValueString('FileOrder_' + drive_id)
    DriverData.FileOrderMap = jsonorder ? new Map<string, string>(JSON.parse(jsonorder)) : new Map<string, string>()

    let ChildrenMap2 = new Map<string, IAliGetDirModel[]>()
    ChildrenMap.forEach(function (value, key) {
      let arr = value.sort((a, b) => {
        let i = SortNumber(a.name, b.name)
        if (i == 0) i = a.time - b.time
        return i
      })
      Object.freeze(arr)
      ChildrenMap2.set(key, arr)
    })
    DriverData.DirChildrenMap = ChildrenMap2
    PanData.set(drive_id, DriverData)
    if (!init) PanStore.RefreshTreeData(drive_id, 'root')
    console.log('SaveAllDir', Date.now() - ts)
  }

  static IsAllDir(drive_id: string) {
    return UserAllDir.has(drive_id)
  }

  static GetOneDirFileList(drive_id: string, dir_id: string) {
    let driverData = PanData.get(drive_id)
    if (!driverData) return undefined
    return driverData.FileListMap.get(dir_id)
  }
  static DeleteOneDirFileList(drive_id: string, dir_id: string) {
    let driverData = PanData.get(drive_id)
    if (driverData) driverData.FileListMap.delete(dir_id)
  }

  static DeleteDirFileList(drive_id: string, diridlist: string[]) {
    let driverData = PanData.get(drive_id)
    if (driverData) {
      for (let i = 0; i < diridlist.length; i++) {
        let dir_id = diridlist[i]
        if (dir_id) driverData.FileListMap.delete(dir_id)
      }
    }
  }

  static async SaveOneDirFileList(dir: IAliFileResp) {
    console.log('SaveOneDirFileList', dir.m_dir_id)
    let driverData = PanData.get(dir.m_drive_id)
    if (!driverData) {
      await PanStore.SaveAllDir(dir.m_drive_id, [], true)
      driverData = PanData.get(dir.m_drive_id)!
    }

    let dirs: IAliGetFileModel[] = []
    let files: IAliGetFileModel[] = []
    for (let i = 0, maxi = dir.items.length; i < maxi; i++) {
      if (dir.items[i].isdir) dirs.push(dir.items[i])
      else files.push(dir.items[i])
    }
    dirs = dirs.sort((a, b) => {
      let i = SortNumber(a.name, b.name)
      if (i == 0) i = a.time - b.time
      return i
    })

    const dirlist: IAliGetDirModel[] = []
    for (let i = 0, maxi = dirs.length; i < maxi; i++) {
      const item = dirs[i]
      const diritem = {
        drive_id: item.drive_id,
        file_id: item.file_id,
        parent_file_id: item.parent_file_id,
        name: item.name,
        size: 0,
        time: item.time,
        description: item.description
      }
      dirlist.push(diritem)
      driverData.DirMap.set(diritem.file_id, diritem)
    }
    driverData.DirChildrenMap.set(dir.m_dir_id, dirlist)

    let dirsize = 0
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      dirsize += files[i].size
    }
    driverData.DirSizeMap.set(dir.m_dir_id, dirsize)

    dir.items = PanStore._OrderFile(driverData, dir.m_dir_id, dirs, files)
    driverData.FileListMap.set(dir.m_dir_id, dir)
    PanStore.RefreshTreeData(dir.m_drive_id, dir.m_dir_id)
  }

  static SaveDirSize(drive_id: string, dir_id: string, children: IAliGetFileModel[]) {
    let dirsize = 0
    for (let i = 0, maxi = children.length; i < maxi; i++) {
      dirsize += children[i].size
    }
    const DriverData = PanData.get(drive_id)
    if (DriverData) DriverData.DirSizeMap.set(dir_id, dirsize)
  }

  static RefreshTreeData(drive_id: string, dir_id: string) {
    let dt = Date.now()
    if (drive_id != window.getDvaApp()._store.getState().treedir.selectDir.drive_id) return
    let driverData = PanData.get(drive_id)
    if (!driverData) return

    if (dir_id == 'order') {
      driverData.TreeChildrenMap.clear()
      return
    }

    let nodechild = PanStore._RefreshTreeData(driverData, dir_id, '').children!
    let nodechecks: string[] = []
    for (let i = 0, maxi = nodechild.length; i < maxi; i++) {
      nodechecks.push(nodechild[i].title! as string)
    }
    if (driverData.TreeChildrenMap.has(dir_id)) {
      let nodenames = driverData.TreeChildrenMap.get(dir_id)!
      let issame = nodechecks.length == nodenames.length
      if (issame) {
        for (let i = 0, maxi = nodechecks.length; i < maxi; i++) {
          if (nodechecks[i] != nodenames[i]) {
            issame = false
            break
          }
        }
      }
      if (issame) {
        console.log('RefreshTreeData', 'samebreak', dir_id)
        return
      }
    }
    driverData.TreeChildrenMap.set(dir_id, nodechecks)
    let noderoot = PanStore._RefreshTreeData(driverData, 'root', '根目录')
    console.log('RefreshTreeData', dir_id, Date.now() - dt, noderoot.children)
    window.getDvaApp()._store.dispatch({ type: 'treedir/mSaveTreeData', drive_id: drive_id, node: noderoot })
  }
  static _RefreshTreeData(driverData: IPanDriverModel, dir_id: string, name: string) {
    let node: DataNode = { key: dir_id, title: name, icon: FolderIcon, children: [] }

    let child = PanStore._OrderDir(driverData, dir_id, ArrayCopy(driverData.DirChildrenMap.get(dir_id) || []))
    node.isLeaf = child.length == 0

    let children: DataNode[] = []
    for (let i = 0, maxi = child.length; i < maxi; i++) {
      let dir = driverData.DirMap.get(child[i].file_id)
      if (dir) {
        let item = PanStore._RefreshTreeData(driverData, dir.file_id, dir.name)
        if (item) children!.push(item)
      }
    }
    node.children = children
    return node
  }
  static _OrderDir(driverData: IPanDriverModel, parent_dir_id: string, dirs: IAliGetDirModel[]) {
    let order = SettingPan.uiFileListOrder || 'updated_at desc'
    if (SettingPan.uiFileOrderDuli) order = driverData.FileOrderMap.get(parent_dir_id) || SettingPan.uiFileOrderDuli || order

    if (order == 'name asc') {
    } else if (order == 'name desc') {
      dirs = dirs.reverse()
    } else if (order == 'updated_at asc') {
      dirs = dirs.sort((a, b) => a.time - b.time)
    } else if (order == 'updated_at desc') {
      dirs = dirs.reverse()
      dirs = dirs.sort((a, b) => b.time - a.time)
    } else if (order == 'ext asc') {
      dirs = dirs.sort((a, b) => a.time - b.time)
    } else if (order == 'ext desc') {
      dirs = dirs.reverse()
      dirs = dirs.sort((a, b) => b.time - a.time)
    } else if (order == 'size asc' || order == 'size desc') {
      if (SettingPan.uiFolderSize) {
        const getDirSize = function (file_id: string, sizeMap: Map<string, number>, dirMap: Map<string, IAliGetDirModel[]>) {
          let size = sizeMap.get(file_id) || 0
          const children = dirMap.get(file_id)
          if (children) {
            for (let i = 0, maxi = children.length; i < maxi; i++) {
              size += getDirSize(children[i].file_id, sizeMap, dirMap)
            }
          }
          return size
        }
        const sizeMap = driverData.DirSizeMap
        const dirMap = driverData.DirChildrenMap

        for (let i = 0, maxi = dirs.length; i < maxi; i++) {
          const size = getDirSize(dirs[i].file_id, sizeMap, dirMap)
          dirs[i].size = size
        }
        if (order == 'size asc') {
          dirs = dirs.sort((a, b) => a.size - b.size)
        } else {
          dirs = dirs.reverse()
          dirs = dirs.sort((a, b) => b.size - a.size)
        }
      } else {
        if (order == 'size asc') {
          dirs = dirs.sort((a, b) => a.time - b.time)
        } else {
          dirs = dirs.reverse()
          dirs = dirs.sort((a, b) => b.time - a.time)
        }
      }
    }

    return dirs
  }

  static _OrderFile(driverData: IPanDriverModel, parent_dir_id: string, dirs: IAliGetFileModel[], files: IAliGetFileModel[]) {
    if (SettingPan.uiFolderSize) {
      const getDirSize = function (file_id: string, sizeMap: Map<string, number>, dirMap: Map<string, IAliGetDirModel[]>) {
        let size = sizeMap.get(file_id) || 0
        const children = dirMap.get(file_id)
        if (children) {
          for (let i = 0, maxi = children.length; i < maxi; i++) {
            size += getDirSize(children[i].file_id, sizeMap, dirMap)
          }
        }
        return size
      }
      const sizeMap = driverData.DirSizeMap
      const dirMap = driverData.DirChildrenMap

      for (let i = 0, maxi = dirs.length; i < maxi; i++) {
        const size = getDirSize(dirs[i].file_id, sizeMap, dirMap)
        dirs[i].size = size
        dirs[i].sizestr = humanSize(size)
      }
    }

    let order = SettingPan.uiFileListOrder || 'updated_at desc'
    if (SettingPan.uiFileOrderDuli) order = driverData.FileOrderMap.get(parent_dir_id) || SettingPan.uiFileOrderDuli || order

    if (order == 'name asc') {
      files = files.sort((a, b) => {
        let i = SortNumber(a.name, b.name)
        if (i == 0) i = a.time - b.time
        return i
      })
    } else if (order == 'name desc') {
      dirs = dirs.reverse()
      files = files.sort((b, a) => {
        let i = SortNumber(a.name, b.name)
        if (i == 0) i = a.time - b.time
        return i
      })
    } else if (order == 'updated_at asc') {
      dirs = dirs.sort((a, b) => {
        let i = a.time - b.time
        if (i == 0) i = SortNumber(a.name, b.name)
        if (i == 0) i = a.size - b.size
        return i
      })
      files = files.sort((a, b) => {
        let i = a.time - b.time
        if (i == 0) i = SortNumber(a.name, b.name)
        if (i == 0) i = a.size - b.size
        return i
      })
    } else if (order == 'updated_at desc') {
      dirs = dirs.sort((b, a) => {
        let i = a.time - b.time
        if (i == 0) i = SortNumber(a.name, b.name)
        if (i == 0) i = a.size - b.size
        return i
      })
      files = files.sort((b, a) => {
        let i = a.time - b.time
        if (i == 0) i = SortNumber(a.name, b.name)
        if (i == 0) i = a.size - b.size
        return i
      })
    } else if (order == 'ext asc') {
      dirs = dirs.sort((a, b) => {
        let i = a.ext.localeCompare(b.ext)
        if (i == 0) i = a.time - b.time
        if (i == 0) i = SortNumber(a.name, b.name)
        if (i == 0) i = a.size - b.size
        return i
      })
      files = files.sort((a, b) => {
        let i = a.ext.localeCompare(b.ext)
        if (i == 0) i = a.time - b.time
        if (i == 0) i = SortNumber(a.name, b.name)
        if (i == 0) i = a.size - b.size
        return i
      })
    } else if (order == 'ext desc') {
      dirs = dirs.sort((b, a) => {
        let i = a.ext.localeCompare(b.ext)
        if (i == 0) i = a.time - b.time
        if (i == 0) i = SortNumber(a.name, b.name)
        if (i == 0) i = a.size - b.size
        return i
      })
      files = files.sort((b, a) => {
        let i = a.ext.localeCompare(b.ext)
        if (i == 0) i = a.time - b.time
        if (i == 0) i = SortNumber(a.name, b.name)
        if (i == 0) i = a.size - b.size
        return i
      })
    } else if (order == 'size asc' || order == 'size desc') {
      if (SettingPan.uiFolderSize) {
        if (order == 'size asc') {
          dirs = dirs.sort((a, b) => {
            let i = a.size - b.size
            if (i == 0) i = a.time - b.time
            if (i == 0) i = SortNumber(a.name, b.name)
            return i
          })
          files = files.sort((a, b) => {
            let i = a.size - b.size
            if (i == 0) i = a.time - b.time
            if (i == 0) i = SortNumber(a.name, b.name)
            return i
          })
        } else {
          dirs = dirs.sort((b, a) => {
            let i = a.size - b.size
            if (i == 0) i = a.time - b.time
            if (i == 0) i = SortNumber(a.name, b.name)
            return i
          })
          files = files.sort((b, a) => {
            let i = a.size - b.size
            if (i == 0) i = a.time - b.time
            if (i == 0) i = SortNumber(a.name, b.name)
            return i
          })
        }
      } else {
        if (order == 'size asc') {
          dirs = dirs.sort((a, b) => {
            let i = a.time - b.time
            if (i == 0) i = SortNumber(a.name, b.name)
            if (i == 0) i = a.size - b.size
            return i
          })
          files = files.sort((a, b) => {
            let i = a.time - b.time
            if (i == 0) i = SortNumber(a.name, b.name)
            if (i == 0) i = a.size - b.size
            return i
          })
        } else {
          dirs = dirs.sort((b, a) => {
            let i = a.time - b.time
            if (i == 0) i = SortNumber(a.name, b.name)
            if (i == 0) i = a.size - b.size
            return i
          })
          files = files.sort((b, a) => {
            let i = a.time - b.time
            if (i == 0) i = SortNumber(a.name, b.name)
            if (i == 0) i = a.size - b.size
            return i
          })
        }
      }
    }

    let list: IAliGetFileModel[] = []
    if (dirs.length > 0) {
      if (files.length > 0) list = dirs.concat(files)
      else list = dirs
    } else {
      list = files
    }
    return list
  }

  static GetDir(drive_id: string, dir_id: string): IAliGetDirModel {
    if (dir_id == 'root') return { drive_id, file_id: 'root', parent_file_id: '', name: '根目录', size: 0, time: 0, description: '' }
    if (dir_id == 'favorite') return { drive_id, file_id: 'favorite', parent_file_id: '', name: '收藏夹', size: 0, time: 0, description: '' }
    if (dir_id == 'trash') return { drive_id, file_id: 'trash', parent_file_id: '', name: '回收站', size: 0, time: 0, description: '' }
    if (dir_id == 'search') return { drive_id, file_id: 'search', parent_file_id: '', name: '搜索', size: 0, time: 0, description: '' }
    if (dir_id.startsWith('search-')) return { drive_id, file_id: dir_id, parent_file_id: '', name: '搜索 ' + dir_id.substring(7), size: 0, time: 0, description: '' }

    let driverData = PanData.get(drive_id)
    if (!driverData) return { drive_id: '', file_id: '', parent_file_id: '', name: '', size: 0, time: 0, description: '' }
    const dir = driverData.DirMap.get(dir_id)
    if (!dir) return { drive_id: '', file_id: '', parent_file_id: '', name: '', size: 0, time: 0, description: '' }
    return { ...dir }
  }

  static GetDirPath(drive_id: string, dir_id: string): IAliGetDirModel[] {
    const dirPath: IAliGetDirModel[] = []
    if (!drive_id || !dir_id) return dirPath
    if (dir_id == 'root') return [{ drive_id, file_id: 'root', parent_file_id: '', name: '根目录', size: 0, time: 0, description: '' }]
    if (dir_id == 'favorite') return [{ drive_id, file_id: 'favorite', parent_file_id: '', name: '收藏夹', size: 0, time: 0, description: '' }]
    if (dir_id == 'trash') return [{ drive_id, file_id: 'trash', parent_file_id: '', name: '回收站', size: 0, time: 0, description: '' }]
    if (dir_id == 'search') return [{ drive_id, file_id: 'search', parent_file_id: '', name: '搜索', size: 0, time: 0, description: '' }]
    if (dir_id.startsWith('search-'))
      return [
        { drive_id, file_id: 'search', parent_file_id: '', name: '搜索', size: 0, time: 0, description: '' },
        { drive_id, file_id: dir_id, parent_file_id: 'search', name: dir_id.substring(7), size: 0, time: 0, description: '' }
      ]

    let driverData = PanData.get(drive_id)
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
  static GetDirOrder(drive_id: string, dir_id: string) {
    let order = SettingPan.uiFileListOrder || 'updated_at desc'
    if (SettingPan.uiFileOrderDuli) {
      let driverData = PanData.get(drive_id)
      if (!driverData) return ''
      order = driverData.FileOrderMap.get(dir_id) || SettingPan.uiFileOrderDuli || order
    }
    return order
  }
  static SaveDirOrder(drive_id: string, dir_id: string, order: string) {
    if (SettingPan.uiFileOrderDuli) {
      let driverData = PanData.get(drive_id)
      if (driverData) {
        driverData.FileOrderMap.set(dir_id, order)
        let jsonorder = JSON.stringify(Array.from(driverData.FileOrderMap))
        console.log(jsonorder)
        DB.saveValueString('FileOrder_' + drive_id, jsonorder)
      }
    } else {
      SettingPan.mSaveUiFileListOrder(order)
    }
  }
  static GetDirChildrenMap(drive_id: string) {
    let driverData = PanData.get(drive_id)
    if (!driverData) return new Map<string, IAliGetDirModel[]>()
    return driverData.DirChildrenMap
  }
  static GetDirSizeMap(drive_id: string) {
    let driverData = PanData.get(drive_id)
    if (!driverData) return new Map<string, number>()
    return driverData.DirSizeMap
  }
}
