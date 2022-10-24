import { IAliGetFileModel } from '../../aliapi/alimodels'
import AliFile from '../../aliapi/file'
import AliFileCmd from '../../aliapi/filecmd'
import { IAliFileResp, NewIAliFileResp } from '../../aliapi/dirfilelist'
import AliTrash from '../../aliapi/trash'
import { IPageVideoXBT } from '../../store/appstore'
import DebugLog from '../../utils/debuglog'
import message from '../../utils/message'
import { modalCopyFileTree, modalCreatNewShareLink, modalDLNAPlayer, modalDownload, modalM3U8Download, modalSearchPan, modalSelectPanDir, modalUpload } from '../../utils/modal'
import { ArrayKeyList } from '../../utils/utils'
import PanDAL from '../pandal'
import usePanFileStore from '../panfilestore'
import usePanTreeStore from '../pantreestore'
import { useSettingStore } from '../../store'
import { Sleep } from '../../utils/format'
import TreeStore from '../../store/treestore'
import { copyToClipboard } from '../../utils/electronhelper'

const topbtnLock = new Set()


export function handleUpload(uploadType: string) {
  const pantreeStore = usePanTreeStore()
  if (!pantreeStore.user_id || !pantreeStore.drive_id || !pantreeStore.selectDir.file_id) {
    message.error('上传操作失败 父文件夹错误')
    return
  }

  if (uploadType == 'file') {
    window.WebShowOpenDialogSync({ title: '选择多个文件上传到网盘', buttonLabel: '上传选中的文件', properties: ['openFile', 'multiSelections', 'showHiddenFiles', 'noResolveAliases', 'treatPackageAsDirectory', 'dontAddToRecent'] }, (files: string[] | undefined) => {
      if (files && files.length > 0) {
        modalUpload(pantreeStore.selectDir.file_id, files)
      }
    })
  } else {
    window.WebShowOpenDialogSync({ title: '选择多个文件夹上传到网盘', buttonLabel: '上传文件夹', properties: ['openDirectory', 'multiSelections', 'showHiddenFiles', 'noResolveAliases', 'treatPackageAsDirectory', 'dontAddToRecent'] }, (files: string[] | undefined) => {
      if (files && files.length > 0) {
        modalUpload(pantreeStore.selectDir.file_id, files)
      }
    })
  }
}


export function menuDownload(istree: boolean) {
  const selectedData = PanDAL.GetPanSelectedData(istree)
  if (selectedData.isError) {
    message.error('下载操作失败 父文件夹错误')
    return
  }
  if (selectedData.isErrorSelected) {
    message.error('没有可以下载的文件')
    return
  }

  if (topbtnLock.has('menuDownload')) return
  topbtnLock.add('menuDownload')
  try {
    const settingStore = useSettingStore()
    if (settingStore.downSavePathDefault) {
      // todo:: 直接下载
    } else modalDownload(false)
  } catch (err: any) {
    message.error(err.message)
    DebugLog.mSaveDanger('menuDownload', err)
  }
  topbtnLock.delete('menuDownload')
}


export async function menuFavSelectFile(istree: boolean, isFavor: boolean) {
  const selectedData = PanDAL.GetPanSelectedData(istree)
  if (selectedData.isError) {
    message.error('收藏操作失败 父文件夹错误')
    return
  }
  if (selectedData.isErrorSelected) {
    message.error('没有可以收藏的文件')
    return
  }

  if (topbtnLock.has('menuFavSelectFile')) return
  topbtnLock.add('menuFavSelectFile')
  try {
    const successList = await AliFileCmd.ApiFavorBatch(selectedData.user_id, selectedData.drive_id, isFavor, true, selectedData.selectedKeys)
    if (isFavor) {
      
      if (usePanTreeStore().selectDir.file_id == 'favorite') {
        PanDAL.aReLoadOneDirToShow('', 'refresh', false) 
      } else {
        usePanFileStore().mFavorFiles(isFavor, successList)
      }
    } else {
      
      if (usePanTreeStore().selectDir.file_id == 'favorite') {
        usePanFileStore().mDeleteFiles('favorite', successList, false) 
      } else {
        usePanFileStore().mFavorFiles(isFavor, successList)
      }
    }
  } catch (err: any) {
    message.error(err.message)
    DebugLog.mSaveDanger('menuFavSelectFile', err)
  }
  topbtnLock.delete('menuFavSelectFile')
}


export async function menuTrashSelectFile(istree: boolean, isDelete: boolean) {
  const selectedData = PanDAL.GetPanSelectedData(istree)
  if (selectedData.isError) {
    message.error('删除操作失败 父文件夹错误')
    return
  }
  if (selectedData.isErrorSelected) {
    message.error('没有可以删除的文件')
    return
  }
  if (selectedData.dirID.startsWith('video')) {
    message.error('请不要在放映室里删除文件')
    return
  }

  if (topbtnLock.has('menuTrashSelectFile')) return
  topbtnLock.add('menuTrashSelectFile')
  try {
    let successList: string[]
    if (isDelete) {
      successList = await AliFileCmd.ApiDeleteBatch(selectedData.user_id, selectedData.drive_id, selectedData.selectedKeys)
    } else {
      successList = await AliFileCmd.ApiTrashBatch(selectedData.user_id, selectedData.drive_id, selectedData.selectedKeys)
    }

    if (istree) {
      
      PanDAL.aReLoadOneDirToShow(selectedData.drive_id, selectedData.parentDirID, false)
    } else {
      
      usePanFileStore().mDeleteFiles(selectedData.dirID, successList, selectedData.dirID !== 'trash') 
      
      if (selectedData.dirID !== 'trash') {
        // PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, selectedData.dirID)
        TreeStore.ClearDirSize(selectedData.drive_id, selectedData.selectedParentKeys)
      }
    }
  } catch (err: any) {
    message.error(err.message)
    DebugLog.mSaveDanger('menuTrashSelectFile', err)
  }
  topbtnLock.delete('menuTrashSelectFile')
}

export async function topRestoreSelectedFile() {
  const selectedData = PanDAL.GetPanSelectedData(false)
  if (selectedData.isError) {
    message.error('还原文件操作失败 父文件夹错误')
    return
  }
  if (selectedData.isErrorSelected) {
    message.error('没有可以还原的文件')
    return
  }

  const panfileStore = usePanFileStore()
  const diridList: string[] = []
  panfileStore
    .GetSelected()
    .filter((t) => t.isDir)
    .map((t) => diridList.push(t.file_id))

  if (topbtnLock.has('topRestoreSelectedFile')) return
  topbtnLock.add('topRestoreSelectedFile')
  try {
    await AliFileCmd.ApiTrashRestoreBatch(selectedData.user_id, selectedData.drive_id, true, selectedData.selectedKeys)
    if (usePanTreeStore().selectDir.file_id == 'trash') {
      
      usePanFileStore().mDeleteFiles('trash', selectedData.selectedKeys, false) 
    } else {
      
      PanDAL.aReLoadOneDirToShow('', 'refresh', false) 
    }
    await Sleep(2000)
    const dirList = await AliFileCmd.ApiGetFileBatch(selectedData.user_id, selectedData.drive_id, diridList)
    console.log(diridList, dirList)
    
    const pset = new Set<string>()
    for (let i = 0, maxi = dirList.length; i < maxi; i++) {
      const parent_file_id = dirList[i].parent_file_id
      if (pset.has(parent_file_id)) continue 
      pset.add(parent_file_id)
      await PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, parent_file_id)
    }
    TreeStore.ClearDirSize(selectedData.drive_id, Array.from(pset))
  } catch (err: any) {
    message.error(err.message)
    DebugLog.mSaveDanger('topRestoreSelectedFile', err)
  }
  topbtnLock.delete('topRestoreSelectedFile')
}


export function menuCopySelectedFile(istree: boolean, copyby: string) {
  const selectedData = PanDAL.GetPanSelectedData(istree)
  if (selectedData.isError) {
    message.error('复制移动操作失败 父文件夹错误')
    return
  }
  if (selectedData.dirID.startsWith('video')) {
    message.error('请不要在放映室里移动文件文件')
    return
  }

  let files: IAliGetFileModel[] = []
  if (istree) {
    files = [{ ...usePanTreeStore().selectDir, isDir: true, ext: '', category: '', icon: '', sizeStr: '', timeStr: '', starred: false, thumbnail: '' } as IAliGetFileModel]
  } else {
    files = usePanFileStore().GetSelected()
  }
  if (files.length == 0) {
    message.error('没有选择要复制移动的文件！')
    return
  }
  const parent_file_id = files[0].parent_file_id

  const file_idList: string[] = []
  const diridList: string[] = []
  for (let i = 0, maxi = files.length; i < maxi; i++) {
    if (files[i].isDir && diridList.includes(files[i].parent_file_id) == false) diridList.push(files[i].parent_file_id)
    file_idList.push(files[i].file_id)
  }

  if (file_idList.length == 0) {
    message.error('没有可以复制移动的文件')
    return
  }
  modalSelectPanDir(copyby, '', async function (user_id: string, drive_id: string, dirID: string) {
    if (!drive_id || !dirID) return 

    if (parent_file_id == dirID) {
      message.error('不能移动复制到原位置！')
      return 
    }

    let successList: string[]
    if (copyby == 'copy') {
      successList = await AliFileCmd.ApiCopyBatch(user_id, drive_id, file_idList, drive_id, dirID)
      
      
      
      PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, dirID)
      TreeStore.ClearDirSize(drive_id, [dirID])
    } else {
      successList = await AliFileCmd.ApiMoveBatch(user_id, drive_id, file_idList, drive_id, dirID)
      
      if (istree) {
        
        PanDAL.aReLoadOneDirToShow(selectedData.drive_id, selectedData.parentDirID, false)
        
        PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, dirID)
      } else {
        
        usePanFileStore().mDeleteFiles(selectedData.dirID, successList, true) 
        
        PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, dirID)
      }
      TreeStore.ClearDirSize(drive_id, [dirID, ...selectedData.selectedParentKeys])
    }
  })
}


export function dropMoveSelectedFile(movetodirid: string) {
  const selectedData = PanDAL.GetPanSelectedData(false)
  if (selectedData.isErrorSelected) return 
  if (selectedData.isError) {
    message.error('复制移动操作失败 父文件夹错误！')
    return
  }

  if (selectedData.dirID == 'trash') {
    message.error('回收站内文件不支持移动！')
    return
  }
  if (!movetodirid) {
    message.error('没有选择要移动到的位置！')
    return
  }
  if (movetodirid == selectedData.dirID) {
    message.error('不能移动到原位置！')
    return
  }

  const file_idList: string[] = []
  const filenameList: string[] = []
  const selectedFile = usePanFileStore().GetSelected()
  if (selectedFile.length == 0) {
    message.error('没有选择要拖放移动的文件！')
    return
  }
  for (let i = 0, maxi = selectedFile.length; i < maxi; i++) {
    file_idList.push(selectedFile[i].file_id)
    filenameList.push(selectedFile[i].name)
  }

  if (file_idList.includes(movetodirid)) {
    
    if (file_idList.length == 1) message.info('用户取消移动')
    else message.error('不能移动到原位置！')
    return
  }

  AliFileCmd.ApiMoveBatch(selectedData.user_id, selectedData.drive_id, file_idList, selectedData.drive_id, movetodirid).then((success: string[]) => {
    
    
    usePanFileStore().mDeleteFiles(selectedData.dirID, success, true) 
    
    PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, movetodirid)
    TreeStore.ClearDirSize(selectedData.drive_id, [movetodirid, ...selectedData.selectedParentKeys])
  })
}


export async function menuFileColorChange(istree: boolean, color: string) {
  const selectedData = PanDAL.GetPanSelectedData(istree)
  if (selectedData.isError) {
    message.error('标记文件操作失败 父文件夹错误')
    return
  }
  if (selectedData.isErrorSelected) {
    message.error('没有可以标记的文件')
    return
  }

  color = color.toLowerCase().replace('#', 'c')

  if (topbtnLock.has('menuFileColorChange')) return
  topbtnLock.add('menuFileColorChange')
  try {
    const successList = await AliFileCmd.ApiFileColorBatch(selectedData.user_id, selectedData.drive_id, color, selectedData.selectedKeys)
    usePanFileStore().mColorFiles(color, successList)
  } catch (err: any) {
    message.error(err.message)
    DebugLog.mSaveDanger('menuFileColorChange', err)
  }
  topbtnLock.delete('menuFileColorChange')
}


export function menuCreatShare(istree: boolean, shareby: string) {
  const selectedData = PanDAL.GetPanSelectedData(istree)
  if (selectedData.isError) {
    message.error('创建分享操作失败 父文件夹错误')
    return
  }

  let list: IAliGetFileModel[] = []
  if (istree) {
    const dir = usePanTreeStore().selectDir
    list = [
      {
        __v_skip: true,
        drive_id: dir.drive_id,
        file_id: dir.file_id,
        parent_file_id: dir.parent_file_id,
        name: dir.name,
        namesearch: dir.namesearch,
        ext: '',
        category: '',
        icon: 'iconfile-folder',
        size: 0,
        sizeStr: '',
        time: 0,
        timeStr: '',
        starred: false,
        isDir: true,
        thumbnail: '',
        description: ''
      }
    ]
  } else {
    list = usePanFileStore().GetSelected()
  }
  if (list.length == 0) {
    message.error('没有可以分享的文件！')
    return
  }
  modalCreatNewShareLink(shareby, list)
}


export async function topFavorDeleteAll() {
  const selectedData = PanDAL.GetPanSelectedData(false)
  if (selectedData.isError) {
    message.error('清空收藏夹操作失败 父文件夹错误')
    return
  }
  if (topbtnLock.has('topFavorDeleteAll')) return
  topbtnLock.add('topFavorDeleteAll')
  try {
    const loadingKey = 'cleartrash_' + Date.now().toString()
    message.loading('清空收藏夹执行中...', 60, loadingKey)
    let count = 0
    while (true) {
      
      const resp: IAliFileResp = NewIAliFileResp(selectedData.user_id, selectedData.drive_id, 'favorite', '收藏夹')
      await AliTrash.ApiFavorFileListOnePageForClean('updated_at', 'DESC', resp)
      if (resp.items.length > 0) {
        
        const selectkeys = ArrayKeyList<string>('file_id', resp.items)
        const successList = await AliFileCmd.ApiFavorBatch(selectedData.user_id, selectedData.drive_id, false, false, selectkeys)
        count += successList.length
        
        message.loading('清空收藏夹执行中...(' + count.toString() + ')', 60, loadingKey)
      } else {
        break 
      }
    }
    message.success('清空收藏夹 成功!', 3, loadingKey)
    if (usePanTreeStore().selectDir.file_id == 'favorite') PanDAL.aReLoadOneDirToShow('', 'refresh', false) 
  } catch (err: any) {
    message.error(err.message)
    DebugLog.mSaveDanger('topFavorDeleteAll', err)
  }
  topbtnLock.delete('topFavorDeleteAll')
}


export async function topTrashDeleteAll() {
  const selectedData = PanDAL.GetPanSelectedData(false)
  if (selectedData.isError) {
    message.error('清空回收站操作失败 父文件夹错误')
    return
  }

  if (topbtnLock.has('topTrashDeleteAll')) return
  topbtnLock.add('topTrashDeleteAll')
  const loadingKey = 'cleartrash_' + Date.now().toString()
  try {
    message.loading('清空回收站执行中...', 60, loadingKey)
    let count = 0
    while (true) {
      
      const resp: IAliFileResp = NewIAliFileResp(selectedData.user_id, selectedData.drive_id, 'trash', '回收站')
      await AliTrash.ApiTrashFileListOnePageForClean('updated_at', 'DESC', resp)
      if (resp.items.length > 0) {
        
        const selectkeys = ArrayKeyList<string>('file_id', resp.items)
        const successList = await AliFileCmd.ApiTrashCleanBatch(selectedData.user_id, selectedData.drive_id, false, selectkeys)
        count += successList.length
        
        message.loading('清空回收站执行中...(' + count.toString() + ')', 0, loadingKey)
      } else {
        break 
      }
    }
    message.success('清空回收站 成功!', 3, loadingKey)
    if (usePanTreeStore().selectDir.file_id == 'trash') PanDAL.aReLoadOneDirToShow('', 'refresh', false) 
  } catch (err: any) {
    message.error(err.message, 3, loadingKey)
    DebugLog.mSaveDanger('topTrashDeleteAll', err)
  }
  topbtnLock.delete('topTrashDeleteAll')
}


export async function topRecoverSelectedFile() {
  const selectedData = PanDAL.GetPanSelectedData(false)
  if (selectedData.isError) {
    message.error('恢复文件操作失败 父文件夹错误')
    return
  }

  
  const files = usePanFileStore().GetSelected()
  if (files.length == 0) {
    message.error('没有选择要恢复的文件！')
    return
  }

  const resumeList: { drive_id: string; file_id: string; content_hash: string; size: number; name: string }[] = []
  const selectParentKeys: string[] = ['root', 'recover']
  for (let i = 0, maxi = files.length; i < maxi; i++) {
    const file = files[i]
    resumeList.push({ drive_id: file.drive_id, file_id: file.file_id, content_hash: file.description, size: file.size, name: file.name })
    if (selectParentKeys.includes(files[i].parent_file_id) == false) selectParentKeys.push(files[i].parent_file_id)
  }

  if (resumeList.length == 0) {
    message.error('没有可以恢复的文件')
    return
  }

  if (topbtnLock.has('topRecoverSelectedFile')) return
  topbtnLock.add('topRecoverSelectedFile')
  
  const loadingKey = 'recover_' + Date.now().toString()
  try {
    message.loading('文件恢复执行中...', 60, loadingKey)
    let successList: string[] = []
    const oneTimeList: { drive_id: string; file_id: string; content_hash: string; size: number; name: string }[] = []
    for (let i = 0, maxi = resumeList.length; i < maxi; i++) {
      oneTimeList.push(resumeList[i])
      if (oneTimeList.length > 99) {
        const data = await AliFileCmd.ApiRecoverBatch(selectedData.user_id, oneTimeList)
        successList = successList.concat(data)
        oneTimeList.length = 0
        message.loading('文件恢复执行中...(' + i.toString() + ')', 60, loadingKey)
      }
    }
    if (oneTimeList.length > 0) {
      const data = await AliFileCmd.ApiRecoverBatch(selectedData.user_id, oneTimeList)
      successList = successList.concat(data)
      oneTimeList.length = 0
    }
    message.success('文件恢复(' + successList.length + ') 成功!', 3, loadingKey)
    
    PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, 'root') 
    
    usePanFileStore().mDeleteFiles('recover', successList, false) 
  } catch (err: any) {
    message.error(err.message, 3, loadingKey)
    DebugLog.mSaveDanger('topRecoverSelectedFile', err)
  }
  topbtnLock.delete('topRecoverSelectedFile')
}


export async function topSearchAll(word: string) {
  
  if (word == 'topSearchAll高级搜索') {
    modalSearchPan()
    return
  }
  
  const pantreeStore = usePanTreeStore()
  if (!pantreeStore.user_id || !pantreeStore.drive_id || !pantreeStore.selectDir.file_id) {
    message.error('搜索文件操作失败 父文件夹错误')
    return
  }
  const searchid = 'search' + word
  PanDAL.aReLoadOneDirToShow('', searchid, false) 
}


export async function menuJumpToDir() {
  let first = usePanFileStore().GetSelectedFirst()
  if (first && !first.parent_file_id) first = await AliFile.ApiGetFile(usePanTreeStore().user_id, first.drive_id, first.file_id)
  if (!first) {
    message.error('没有选中任何文件')
    return
  }

  PanDAL.aReLoadOneDirToShow('', first.parent_file_id, true).then(() => {
    usePanFileStore().mKeyboardSelect(first!.file_id, false, false)
    usePanFileStore().mSaveFileScrollTo(first!.file_id)
  })
}

export function menuVideoXBT() {
  const first = usePanFileStore().GetSelectedFirst()
  if (!first) {
    message.error('没有选中任何文件')
    return
  }
  
  if (first.icon == 'iconweifa') {
    message.error('违规视频无法预览')
    return
  }
  const pageVideoXBT: IPageVideoXBT = { user_id: usePanTreeStore().user_id, drive_id: first.drive_id, file_id: first.file_id, file_name: first.name }
  window.WebOpenWindow({ page: 'PageVideoXBT', data: pageVideoXBT, theme: 'dark' })
}

export function menuDLNA() {
  const first = usePanFileStore().GetSelectedFirst()
  if (!first) {
    message.error('没有选中任何文件')
    return
  }
  modalDLNAPlayer()
}

export function menuM3U8Download() {
  const first = usePanFileStore().GetSelectedFirst()
  if (!first) {
    message.error('没有选中任何文件')
    return
  }
  modalM3U8Download()
}

export function menuCopyFileName() {
  const list: IAliGetFileModel[] = usePanFileStore().GetSelected()
  if (list.length == 0) {
    message.error('没有选择要复制文件名的文件！')
    return
  }

  if (topbtnLock.has('menuCopyFileName')) return
  topbtnLock.add('menuCopyFileName')
  try {
    const nameList: string[] = []
    for (let i = 0, maxi = list.length; i < maxi; i++) {
      nameList.push(list[i].name)
    }
    const fullStr = nameList.join('\r\n')
    copyToClipboard(fullStr)
    message.success('选中文件的文件名已复制到剪切板')
  } catch (err: any) {
    message.error(err.message)
    DebugLog.mSaveDanger('menuCopyFileName', err)
  }
  topbtnLock.delete('menuCopyFileName')
}

export function menuCopyFileTree() {
  const list: IAliGetFileModel[] = usePanFileStore().GetSelected()
  if (list.length == 0) {
    message.error('没有选中任何文件！')
    return
  }
  modalCopyFileTree(list)
}
