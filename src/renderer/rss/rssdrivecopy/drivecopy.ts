import { IAliGetFileModel } from '../../aliapi/alimodels'
import AliFile from '../../aliapi/file'
import message from '../../utils/message'
import { fileiconfn, foldericonfn } from '../ScanDAL'
import AliTrash from '../../aliapi/trash'

export interface ICopyTreeInfo {
  user_id: string
  drive_type: string
  drive_id: string
  dir_id: string
  dir_name: string
  parent_id: string
  loading: boolean
  onlydir: boolean
}
export function NewCopyTreeInfo(onlydir: boolean) {
  return {
    user_id: '',
    drive_type: '',
    drive_id: '',
    dir_id: '',
    dir_name: '',
    parent_id: '',
    loading: false,
    onlydir: onlydir
  }
}

export interface ICopyTreeNode {
  key: string
  title: string
  icon: any
  download_url: string
  disabled: boolean
  children?: ICopyTreeNode[]
}

export async function LoadDir(dir_id: string, DirData: ICopyTreeInfo, TreeData: ICopyTreeNode[], disabledfile: boolean) {
  DirData.loading = true
  if (!dir_id) dir_id = 'root'
  if (dir_id.startsWith('dir_')) dir_id = dir_id.substring('dir_'.length)
  if (dir_id == 'root') {
    DirData.dir_id = 'root'
    DirData.dir_name = '根目录'
    DirData.parent_id = 'root'
  } else {
    let getdir = await AliFile.ApiFileInfo(DirData.user_id, DirData.drive_id, dir_id)
    if (getdir) {
      DirData.dir_id = getdir.file_id
      DirData.dir_name = getdir.name
      DirData.parent_id = getdir.parent_file_id
    } else {
      message.error('读取文件夹信息失败')
    }
  }

  let resp = await AliTrash.ApiDirFileListNoLock(DirData.user_id, DirData.drive_id, dir_id, '', '', '')
  DirData.loading = false
  let list: ICopyTreeNode[] = []
  let items = resp.items
  let item: IAliGetFileModel
  for (let i = 0, maxi = items.length; i < maxi; i++) {
    item = items[i]
    list.push({
      key: (item.isdir ? 'dir_' : 'file_') + item.file_id,
      title: item.name,
      disabled: item.isdir ? false : disabledfile,
      icon: item.isdir ? foldericonfn : fileiconfn,
      download_url: ''
    })
  }
  TreeData.splice(0, TreeData.length, ...list)
}
