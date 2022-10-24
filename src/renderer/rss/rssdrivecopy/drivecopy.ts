import { IAliGetFileModel } from '../../aliapi/alimodels'
import AliFile from '../../aliapi/file'
import message from '../../utils/message'
import { fileiconfn, foldericonfn } from '../ScanDAL'
import AliTrash from '../../aliapi/trash'

export interface ICopyTreeInfo {
  user_id: string
  drive_id: string
  driveType: string
  dirID: string
  dirName: string
  parentID: string
  loading: boolean
  onlyDir: boolean
}
export function NewCopyTreeInfo(onlyDir: boolean) {
  const info: ICopyTreeInfo = {
    user_id: '',
    driveType: '',
    drive_id: '',
    dirID: '',
    dirName: '',
    parentID: '',
    loading: false,
    onlyDir: onlyDir
  }
  return info
}

export interface ICopyTreeNode {
  key: string
  title: string
  icon: any
  download_url: string
  disabled: boolean
  children?: ICopyTreeNode[]
}

export async function LoadDir(dirID: string, DirData: ICopyTreeInfo, treeData: ICopyTreeNode[], disabledFile: boolean): Promise<void> {
  DirData.loading = true
  if (!dirID) dirID = 'root'
  if (dirID.startsWith('dir_')) dirID = dirID.substring('dir_'.length)
  if (dirID == 'root') {
    DirData.dirID = 'root'
    DirData.dirName = '根目录'
    DirData.parentID = 'root'
  } else {
    const getDir = await AliFile.ApiFileInfo(DirData.user_id, DirData.drive_id, dirID)
    if (getDir) {
      DirData.dirID = getDir.file_id
      DirData.dirName = getDir.name
      DirData.parentID = getDir.parent_file_id
    } else {
      message.error('读取文件夹信息失败')
    }
  }

  const resp = await AliTrash.ApiDirFileListNoLock(DirData.user_id, DirData.drive_id, dirID, '', '', '')
  DirData.loading = false
  const list: ICopyTreeNode[] = []
  const items = resp.items
  let item: IAliGetFileModel
  for (let i = 0, maxi = items.length; i < maxi; i++) {
    item = items[i]
    list.push({
      key: (item.isDir ? 'dir_' : 'file_') + item.file_id,
      title: item.name,
      disabled: item.isDir ? false : disabledFile,
      icon: item.isDir ? foldericonfn : fileiconfn,
      download_url: ''
    } as ICopyTreeNode)
  }
  treeData.splice(0, treeData.length, ...list)
}
