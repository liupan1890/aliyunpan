import { IAliGetFileModel } from '../../aliapi/alimodels'
import AliFile from '../../aliapi/file'
import message from '../../utils/message'
import { Ref } from 'vue'
import { fileiconfn, foldericonfn } from '../ScanDAL'
import AliTrash from '../../aliapi/trash'

export interface ICopyTreeInfo {
  user_id: string
  drive_id: string
  dirID: string
  dirName: string
  parentID: string
  loading: boolean
  onlyDir: boolean
}
export function NewCopyTreeInfo(onlyDir: boolean) {
  const info: ICopyTreeInfo = {
    user_id: '',
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
  children?: ICopyTreeNode[]
}

export async function LoadDir(dirID: string, DirData: ICopyTreeInfo, treeData: Ref<ICopyTreeNode[]>) {
  DirData.loading = true
  if (!dirID) dirID = 'root'
  if (dirID.startsWith('dir_')) dirID = dirID.substring('dir_'.length)

  if (dirID == 'root') {
    DirData.dirID = 'root'
    DirData.dirName = '根目录'
    DirData.parentID = 'root'
  } else {
    const getdir = await AliFile.ApiFileInfo(DirData.user_id, DirData.drive_id, dirID)
    if (getdir) {
      DirData.dirID = getdir.file_id
      DirData.dirName = getdir.name
      DirData.parentID = getdir.parent_file_id
    } else {
      message.error('读取文件夹信息失败')
    }
  }

  const resp = await AliTrash.ApiDirFileListNoLock(DirData.user_id, DirData.drive_id, dirID, '', '', DirData.onlyDir ? 'folder' : '')
  DirData.loading = false
  const list: ICopyTreeNode[] = []
  const items = resp.items
  let item: IAliGetFileModel
  for (let i = 0, maxi = items.length; i < maxi; i++) {
    item = items[i]
    list.push({
      key: (item.isDir ? 'dir_' : 'file_') + item.file_id,
      title: item.name,
      icon: item.isDir ? foldericonfn : fileiconfn,
      download_url: '' // item.download_url
    } as ICopyTreeNode)
  }
  treeData.value = list
}

export async function LoadCopy(LeftData: ICopyTreeInfo, LeftCheckedKeys: string[], LeftTreeData: ICopyTreeNode[], CopyTreeLoading: Ref<boolean>, treeData: ICopyTreeNode[]) {
  CopyTreeLoading.value = true
  treeData.length = 0
  for (let i = 0, maxi = LeftTreeData.length; i < maxi && LeftCheckedKeys.length > 0; i++) {
    const node = LeftTreeData[i]
    if (LeftCheckedKeys.includes(node.key)) {
      const key = node.key
      LeftCheckedKeys = LeftCheckedKeys.filter((t) => t != key)
      treeData.push({ ...node, children: [] } as ICopyTreeNode)
    }
  }
  for (let i = 0, maxi = treeData.length; i < maxi; i++) {
    const node = treeData[i]
    if (node.key.startsWith('dir_')) {
      await LoadChildDir(LeftData.user_id, LeftData.drive_id, node)
    }
  }
  

  CopyTreeLoading.value = false
}

async function LoadChildDir(user_id: string, drive_id: string, node: ICopyTreeNode) {
  const dirID = node.key.substring('dir_'.length)
  const resp = await AliTrash.ApiDirFileListNoLock(user_id, drive_id, dirID, '', '', 'folder')

  const list: ICopyTreeNode[] = []
  const items = resp.items
  let item: IAliGetFileModel
  for (let i = 0, maxi = items.length; i < maxi; i++) {
    item = items[i]
    list.push({
      key: (item.isDir ? 'dir_' : 'file_') + item.file_id,
      title: item.name,
      icon: item.isDir ? foldericonfn : fileiconfn,
      download_url: '', // item.download_url,
      children: []
    } as ICopyTreeNode)
  }
  node.children = list

  for (let i = 0, maxi = list.length; i < maxi; i++) {
    const nd = list[i]
    if (nd.key.startsWith('dir_')) {
      await LoadChildDir(user_id, drive_id, nd)
    }
  }
}


export function GetTreeNodes(treeData: ICopyTreeNode[], treeDataMap: Map<string, ICopyTreeNode>) {
  const data: ICopyTreeNode[] = []
  for (let i = 0, maxi = treeData.length; i < maxi; i++) {
    const item = treeData[i]
    data.push({
      key: item.key,
      title: item.title,
      icon: item.icon,
      download_url: item.download_url,
      children: GetTreeNodes(item.children!, treeDataMap)
    } as ICopyTreeNode)
  }
  data.sort((a, b) => a.title!.localeCompare(b.title!))
  data.map((a) => {
    treeDataMap.set(a.key as string, a)
    return true
  })
  return data
}
