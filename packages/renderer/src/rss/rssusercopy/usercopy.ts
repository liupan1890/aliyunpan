import { IAliGetFileModel } from '@/aliapi/alimodels'
import AliFile from '@/aliapi/file'
import AliDirFileList from '@/aliapi/dirfilelist'
import message from '@/utils/message'
import { Ref } from 'vue'
import { fileiconfn, foldericonfn } from '../ScanDAL'
import AliTrash from '@/aliapi/trash'

export interface ICopyTreeInfo {
  user_id: string
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
  children?: ICopyTreeNode[]
}

export async function LoadDir(dir_id: string, DirData: ICopyTreeInfo, TreeData: Ref<ICopyTreeNode[]>) {
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

  let resp = await AliTrash.ApiDirFileListNoLock(DirData.user_id, DirData.drive_id, dir_id, '', '', DirData.onlydir ? 'folder' : '')
  DirData.loading = false
  let list: ICopyTreeNode[] = []
  let items = resp.items
  let item: IAliGetFileModel
  for (let i = 0, maxi = items.length; i < maxi; i++) {
    item = items[i]
    list.push({
      key: (item.isdir ? 'dir_' : 'file_') + item.file_id,
      title: item.name,
      icon: item.isdir ? foldericonfn : fileiconfn,
      download_url: '' //item.download_url
    })
  }
  TreeData.value = list
}

export async function LoadCopy(LeftData: ICopyTreeInfo, LeftCheckedKeys: string[], LeftTreeData: ICopyTreeNode[], CopyTreeLoading: Ref<boolean>, TreeData: ICopyTreeNode[]) {
  CopyTreeLoading.value = true
  TreeData.length = 0
  for (let i = 0, maxi = LeftTreeData.length; i < maxi && LeftCheckedKeys.length > 0; i++) {
    let node = LeftTreeData[i]
    if (LeftCheckedKeys.includes(node.key)) {
      let key = node.key
      LeftCheckedKeys = LeftCheckedKeys.filter((t) => t != key)
      TreeData.push({ ...node, children: [] })
    }
  }
  for (let i = 0, maxi = TreeData.length; i < maxi; i++) {
    let node = TreeData[i]
    if (node.key.startsWith('dir_')) {
      await LoadChildDir(LeftData.user_id, LeftData.drive_id, node)
    }
  }
  

  CopyTreeLoading.value = false
}

async function LoadChildDir(user_id: string, drive_id: string, node: ICopyTreeNode) {
  let dir_id = node.key.substring('dir_'.length)
  let resp = await AliTrash.ApiDirFileListNoLock(user_id, drive_id, dir_id, '', '', 'folder')

  let list: ICopyTreeNode[] = []
  let items = resp.items
  let item: IAliGetFileModel
  for (let i = 0, maxi = items.length; i < maxi; i++) {
    item = items[i]
    list.push({
      key: (item.isdir ? 'dir_' : 'file_') + item.file_id,
      title: item.name,
      icon: item.isdir ? foldericonfn : fileiconfn,
      download_url: '', //item.download_url,
      children: []
    })
  }
  node.children = list

  for (let i = 0, maxi = list.length; i < maxi; i++) {
    let nd = list[i]
    if (nd.key.startsWith('dir_')) {
      await LoadChildDir(user_id, drive_id, nd)
    }
  }
}


export function GetTreeNodes(TreeData: ICopyTreeNode[], TreeDataMap: Map<string, ICopyTreeNode>) {
  let data: ICopyTreeNode[] = []
  for (let i = 0, maxi = TreeData.length; i < maxi; i++) {
    let item = TreeData[i]
    data.push({
      key: item.key,
      title: item.title,
      icon: item.icon,
      download_url: item.download_url,
      children: GetTreeNodes(item.children!, TreeDataMap)
    })
  }
  data.sort((a, b) => a.title!.localeCompare(b.title!))
  data.map((a) => {
    TreeDataMap.set(a.key as string, a)
  })
  return data
}
