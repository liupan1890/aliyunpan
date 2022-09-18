import { IAliGetFileModel } from '../../aliapi/alimodels'
import AliFile from '../../aliapi/file'
import AliFileCmd from '../../aliapi/filecmd'
import { IAliFileResp, NewIAliFileResp } from '../../aliapi/dirfilelist'
import AliTrash from '../../aliapi/trash'
import UploadDAL from '../../down/uploaddal'
import { IPageVideoXBT } from '../../store/appstore'
import DebugLog from '../../utils/debuglog'
import message from '../../utils/message'
import { modalCopyFileTree, modalCreatNewShareLink, modalDLNAPlayer, modalM3U8Download, modalSearchPan, modalSelectPanDir } from '../../utils/modal'
import { ArrayKeyList } from '../../utils/utils'
import PanDAL from '../pandal'
import usePanFileStore from '../panfilestore'
import usePanTreeStore from '../pantreestore'
import { useSettingStore } from '../../store'
import { Sleep } from '../../utils/format'
import TreeStore from '../../store/treestore'
import { copyToClipboard } from '../../utils/electronhelper'

let topbtnLock = new Set()


export function handleUpload(uploadtype: string) {
  const pantreeStore = usePanTreeStore()
  if (!pantreeStore.user_id || !pantreeStore.drive_id || !pantreeStore.selectDir.file_id) {
    message.error('上传操作失败 父文件夹错误')
    return
  }

  if (uploadtype == 'file') {
    window.WebShowOpenDialogSync({ title: '选择多个文件上传到网盘', buttonLabel: '上传选中的文件', properties: ['openFile', 'multiSelections'] }, (files: string[] | undefined) => {
      if (files && files.length > 0) {
        UploadDAL.UploadLocalFiles(pantreeStore.user_id, pantreeStore.drive_id, pantreeStore.selectDir.file_id, files, true)
      }
    })
  } else {
    window.WebShowOpenDialogSync({ title: '选择多个文件夹上传到网盘', buttonLabel: '上传文件夹', properties: ['openDirectory', 'multiSelections'] }, (files: string[] | undefined) => {
      if (files && files.length > 0) {
        UploadDAL.UploadLocalFiles(pantreeStore.user_id, pantreeStore.drive_id, pantreeStore.selectDir.file_id, files, true)
      }
    })
  }
}


export function menuDownload(istree: boolean) {
  const selectedData = PanDAL.GetPanSelectedData(istree)
  if (selectedData.iserror) {
    message.error('下载操作失败 父文件夹错误')
    return
  }
  if (selectedData.iserrorselected) {
    message.error('没有可以下载的文件')
    return
  }

  if (topbtnLock.has('menuDownload')) return
  topbtnLock.add('menuDownload')
  try {
    const settingStore = useSettingStore()
    if (settingStore.downSavePathDefault) {
    }
    //todo::下载弹窗
  } catch (err: any) {
    message.error(err.message)
    DebugLog.mSaveDanger('menuDownload', err)
  }
  topbtnLock.delete('menuDownload')
}


export async function menuFavSelectFile(istree: boolean, isfavor: boolean) {
  const selectedData = PanDAL.GetPanSelectedData(istree)
  if (selectedData.iserror) {
    message.error('收藏操作失败 父文件夹错误')
    return
  }
  if (selectedData.iserrorselected) {
    message.error('没有可以收藏的文件')
    return
  }

  if (topbtnLock.has('menuFavSelectFile')) return
  topbtnLock.add('menuFavSelectFile')
  try {
    const successlist = await AliFileCmd.ApiFavorBatch(selectedData.user_id, selectedData.drive_id, isfavor, true, selectedData.select_keys)
    if (isfavor) {
      
      if (usePanTreeStore().selectDir.file_id == 'favorite') {
        PanDAL.aReLoadOneDirToShow('', 'refresh', false) 
      } else {
        usePanFileStore().mFavorFiles(isfavor, successlist)
      }
    } else {
      
      if (usePanTreeStore().selectDir.file_id == 'favorite') {
        usePanFileStore().mDeleteFiles('favorite', successlist, false) 
      } else {
        usePanFileStore().mFavorFiles(isfavor, successlist)
      }
    }
  } catch (err: any) {
    message.error(err.message)
    DebugLog.mSaveDanger('menuFavSelectFile', err)
  }
  topbtnLock.delete('menuFavSelectFile')
}


export async function menuTrashSelectFile(istree: boolean, isdelete: boolean) {
  const selectedData = PanDAL.GetPanSelectedData(istree)
  if (selectedData.iserror) {
    message.error('删除操作失败 父文件夹错误')
    return
  }
  if (selectedData.iserrorselected) {
    message.error('没有可以删除的文件')
    return
  }
  if (selectedData.dir_id.startsWith('video')) {
    message.error('请不要在放映室里删除文件')
    return
  }

  if (topbtnLock.has('menuTrashSelectFile')) return
  topbtnLock.add('menuTrashSelectFile')
  try {
    let successlist: string[]
    if (isdelete) {
      successlist = await AliFileCmd.ApiDeleteBatch(selectedData.user_id, selectedData.drive_id, selectedData.select_keys)
    } else {
      successlist = await AliFileCmd.ApiTrashBatch(selectedData.user_id, selectedData.drive_id, selectedData.select_keys)
    }

    if (istree) {
      
      PanDAL.aReLoadOneDirToShow(selectedData.drive_id, selectedData.parent_dir_id, false)
    } else {
      
      usePanFileStore().mDeleteFiles(selectedData.dir_id, successlist, selectedData.dir_id !== 'trash') 
      
      if (selectedData.dir_id !== 'trash') {
        PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, selectedData.dir_id)
        TreeStore.ClearDirSize(selectedData.drive_id, selectedData.select_parentkeys)
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
  if (selectedData.iserror) {
    message.error('还原文件操作失败 父文件夹错误')
    return
  }
  if (selectedData.iserrorselected) {
    message.error('没有可以还原的文件')
    return
  }

  const panfileStore = usePanFileStore()
  let diridlist: string[] = []
  panfileStore
    .GetSelected()
    .filter((t) => t.isdir)
    .map((t) => diridlist.push(t.file_id))

  if (topbtnLock.has('topRestoreSelectedFile')) return
  topbtnLock.add('topRestoreSelectedFile')
  try {
    const successlist = await AliFileCmd.ApiTrashRestoreBatch(selectedData.user_id, selectedData.drive_id, true, selectedData.select_keys)
    if (usePanTreeStore().selectDir.file_id == 'trash') {
      
      usePanFileStore().mDeleteFiles('trash', selectedData.select_keys, false) 
    } else {
      
      PanDAL.aReLoadOneDirToShow('', 'refresh', false) 
    }
    await Sleep(2000)
    let dirlist = await AliFileCmd.ApiGetFileBatch(selectedData.user_id, selectedData.drive_id, diridlist)
    console.log(diridlist, dirlist)
    
    let pset = new Set<string>()
    for (let i = 0, maxi = dirlist.length; i < maxi; i++) {
      let parent_file_id = dirlist[i].parent_file_id
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
  if (selectedData.iserror) {
    message.error('复制移动操作失败 父文件夹错误')
    return
  }
  if (selectedData.dir_id.startsWith('video')) {
    message.error('请不要在放映室里移动文件文件')
    return
  }

  let files: IAliGetFileModel[] = []
  if (istree) {
    files = [{ ...usePanTreeStore().selectDir, isdir: true, ext: '', category: '', icon: '', sizestr: '', timestr: '', starred: false, thumbnail: '' }]
  } else {
    files = usePanFileStore().GetSelected()
  }

  const fileidlist: string[] = []
  const diridlist: string[] = []
  for (let i = 0, maxi = files.length; i < maxi; i++) {
    if (files[i].isdir && diridlist.includes(files[i].parent_file_id) == false) diridlist.push(files[i].parent_file_id)
    fileidlist.push(files[i].file_id)
  }

  if (fileidlist.length == 0) {
    message.error('没有可以复制移动的文件')
    return
  }
  modalSelectPanDir(copyby, '', async function (user_id: string, drive_id: string, dir_id: string) {
    if (!drive_id || !dir_id) return 
    let successlist: string[]
    if (copyby == 'copy') {
      successlist = await AliFileCmd.ApiCopyBatch(user_id, drive_id, fileidlist, drive_id, dir_id)
      
      
      
      PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, dir_id)
      TreeStore.ClearDirSize(drive_id, [dir_id])
    } else {
      successlist = await AliFileCmd.ApiMoveBatch(user_id, drive_id, fileidlist, drive_id, dir_id)
      
      if (istree) {
        
        PanDAL.aReLoadOneDirToShow(selectedData.drive_id, selectedData.parent_dir_id, false)
        
        PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, dir_id)
      } else {
        
        usePanFileStore().mDeleteFiles(selectedData.dir_id, successlist, true) 
        
        PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, dir_id)
      }
      TreeStore.ClearDirSize(drive_id, [dir_id, ...selectedData.select_parentkeys])
    }
  })
}


export function dropMoveSelectedFile(movetodirid: string) {
  const selectedData = PanDAL.GetPanSelectedData(false)
  if (selectedData.iserrorselected) return 
  if (selectedData.iserror) {
    message.error('复制移动操作失败 父文件夹错误')
    return
  }

  if (selectedData.dir_id == 'trash') {
    message.error('回收站内文件不支持移动')
    return
  }
  if (!movetodirid) {
    message.error('没有选择要移动到的位置')
    return
  }
  if (movetodirid == selectedData.dir_id) {
    message.error('不能移动到原位置')
    return
  }

  const fileidlist: string[] = []
  const filenamelist: string[] = []
  const selectedFile = usePanFileStore().GetSelected()
  for (let i = 0, maxi = selectedFile.length; i < maxi; i++) {
    fileidlist.push(selectedFile[i].file_id)
    filenamelist.push(selectedFile[i].name)
  }

  if (fileidlist.includes(movetodirid)) {
    
    if (fileidlist.length == 1) message.info('用户取消移动')
    else message.error('不能移动到原位置')
    return
  }

  AliFileCmd.ApiMoveBatch(selectedData.user_id, selectedData.drive_id, fileidlist, selectedData.drive_id, movetodirid).then((success: string[]) => {
    
    
    usePanFileStore().mDeleteFiles(selectedData.dir_id, success, true) 
    
    PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, movetodirid)
    TreeStore.ClearDirSize(selectedData.drive_id, [movetodirid, ...selectedData.select_parentkeys])
  })
}


export async function menuFileColorChange(istree: boolean, color: string) {
  const selectedData = PanDAL.GetPanSelectedData(istree)
  if (selectedData.iserror) {
    message.error('标记文件操作失败 父文件夹错误')
    return
  }
  if (selectedData.iserrorselected) {
    message.error('没有可以标记的文件')
    return
  }

  color = color.toLowerCase().replace('#', 'c')

  if (topbtnLock.has('menuFileColorChange')) return
  topbtnLock.add('menuFileColorChange')
  try {
    let successlist = await AliFileCmd.ApiFileColorBatch(selectedData.user_id, selectedData.drive_id, color, selectedData.select_keys)
    usePanFileStore().mColorFiles(color, successlist)
  } catch (err: any) {
    message.error(err.message)
    DebugLog.mSaveDanger('menuFileColorChange', err)
  }
  topbtnLock.delete('menuFileColorChange')
}


export function menuCreatShare(istree: boolean, shareby: string) {
  const selectedData = PanDAL.GetPanSelectedData(istree)
  if (selectedData.iserror) {
    message.error('创建分享操作失败 父文件夹错误')
    return
  }

  let list: IAliGetFileModel[] = []
  if (istree) {
    let dir = usePanTreeStore().selectDir
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
        sizestr: '',
        time: 0,
        timestr: '',
        starred: false,
        isdir: true,
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
  if (selectedData.iserror) {
    message.error('清空收藏夹操作失败 父文件夹错误')
    return
  }
  if (topbtnLock.has('topFavorDeleteAll')) return
  topbtnLock.add('topFavorDeleteAll')
  try {
    const loadingkey = 'cleartrash_' + Date.now().toString()
    message.loading('清空收藏夹执行中...', 60, loadingkey)
    let count = 0
    while (true) {
      
      const resp: IAliFileResp = NewIAliFileResp(selectedData.user_id, selectedData.drive_id, 'favorite', '收藏夹')
      await AliTrash.ApiFavorFileListOnePageForClean('updated_at', 'DESC', resp)
      if (resp.items.length > 0) {
        
        const selectkeys = ArrayKeyList('file_id', resp.items)
        let successlist = await AliFileCmd.ApiFavorBatch(selectedData.user_id, selectedData.drive_id, false, false, selectkeys)
        count += successlist.length
        
        message.loading('清空收藏夹执行中...(' + count.toString() + ')', 60, loadingkey)
      } else {
        break 
      }
    }
    message.success('清空收藏夹 成功!', 3, loadingkey)
    if (usePanTreeStore().selectDir.file_id == 'favorite') PanDAL.aReLoadOneDirToShow('', 'refresh', false) 
  } catch (err: any) {
    message.error(err.message)
    DebugLog.mSaveDanger('topFavorDeleteAll', err)
  }
  topbtnLock.delete('topFavorDeleteAll')
}


export async function topTrashDeleteAll() {
  const selectedData = PanDAL.GetPanSelectedData(false)
  if (selectedData.iserror) {
    message.error('清空回收站操作失败 父文件夹错误')
    return
  }

  if (topbtnLock.has('topTrashDeleteAll')) return
  topbtnLock.add('topTrashDeleteAll')
  const loadingkey = 'cleartrash_' + Date.now().toString()
  try {
    message.loading('清空回收站执行中...', 60, loadingkey)
    let count = 0
    while (true) {
      
      const resp: IAliFileResp = NewIAliFileResp(selectedData.user_id, selectedData.drive_id, 'trash', '回收站')
      await AliTrash.ApiTrashFileListOnePageForClean('updated_at', 'DESC', resp)
      if (resp.items.length > 0) {
        
        const selectkeys = ArrayKeyList('file_id', resp.items)
        let successlist = await AliFileCmd.ApiTrashCleanBatch(selectedData.user_id, selectedData.drive_id, false, selectkeys)
        count += successlist.length
        
        message.loading('清空回收站执行中...(' + count.toString() + ')', 0, loadingkey)
      } else {
        break 
      }
    }
    message.success('清空回收站 成功!', 3, loadingkey)
    if (usePanTreeStore().selectDir.file_id == 'trash') PanDAL.aReLoadOneDirToShow('', 'refresh', false) 
  } catch (err: any) {
    message.error(err.message, 3, loadingkey)
    DebugLog.mSaveDanger('topTrashDeleteAll', err)
  }
  topbtnLock.delete('topTrashDeleteAll')
}


export async function topRecoverSelectedFile() {
  const selectedData = PanDAL.GetPanSelectedData(false)
  if (selectedData.iserror) {
    message.error('恢复文件操作失败 父文件夹错误')
    return
  }

  
  const files = usePanFileStore().GetSelected()
  const resumelist: { drive_id: string; file_id: string; content_hash: string; size: number; name: string }[] = []
  const selectparentkeys: string[] = ['root', 'recover']
  for (let i = 0, maxi = files.length; i < maxi; i++) {
    let file = files[i]
    resumelist.push({ drive_id: file.drive_id, file_id: file.file_id, content_hash: file.description, size: file.size, name: file.name })
    if (selectparentkeys.includes(files[i].parent_file_id) == false) selectparentkeys.push(files[i].parent_file_id)
  }

  if (resumelist.length == 0) {
    message.error('没有可以恢复的文件')
    return
  }

  if (topbtnLock.has('topRecoverSelectedFile')) return
  topbtnLock.add('topRecoverSelectedFile')
  
  const loadingkey = 'recover_' + Date.now().toString()
  try {
    message.loading('文件恢复执行中...', 60, loadingkey)
    let successlist: string[] = []
    let onetimelist: { drive_id: string; file_id: string; content_hash: string; size: number; name: string }[] = []
    for (let i = 0, maxi = resumelist.length; i < maxi; i++) {
      onetimelist.push(resumelist[i])
      if (onetimelist.length > 99) {
        const data = await AliFileCmd.ApiRecoverBatch(selectedData.user_id, onetimelist)
        successlist = successlist.concat(data)
        onetimelist.length = 0
        message.loading('文件恢复执行中...(' + i.toString() + ')', 60, loadingkey)
      }
    }
    if (onetimelist.length > 0) {
      const data = await AliFileCmd.ApiRecoverBatch(selectedData.user_id, onetimelist)
      successlist = successlist.concat(data)
      onetimelist.length = 0
    }
    message.success('文件恢复(' + successlist.length + ') 成功!', 3, loadingkey)
    
    PanDAL.aReLoadOneDirToRefreshTree(selectedData.user_id, selectedData.drive_id, 'root') 
    
    usePanFileStore().mDeleteFiles('recover', successlist, false) 
  } catch (err: any) {
    message.error(err.message, 3, loadingkey)
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
  let searchid = 'search' + word
  PanDAL.aReLoadOneDirToShow('', searchid, false) 
}


export async function menuJumpToDir() {
  let first = usePanFileStore().GetSelectedFirst()
  if (first && first.parent_file_id == '') first = await AliFile.ApiGetFile(usePanTreeStore().user_id, first.drive_id, first.file_id)
  if (!first) {
    message.error('没有选中任何文件')
    return
  }

  PanDAL.aReLoadOneDirToShow('', first.parent_file_id, true)
}

export function menuVideoXBT() {
  let first = usePanFileStore().GetSelectedFirst()
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
  let first = usePanFileStore().GetSelectedFirst()
  if (!first) {
    message.error('没有选中任何文件')
    return
  }
  modalDLNAPlayer()
}

export function menuM3U8Download() {
  let first = usePanFileStore().GetSelectedFirst()
  if (!first) {
    message.error('没有选中任何文件')
    return
  }
  modalM3U8Download()
}

export function menuCopyFileName() {
  let list: IAliGetFileModel[] = usePanFileStore().GetSelected()
  if (list.length == 0) {
    message.error('没有可以复制文件名的文件！')
    return
  }

  if (topbtnLock.has('menuCopyFileName')) return
  topbtnLock.add('menuCopyFileName')
  try {
    let namelist: string[] = []
    for (let i = 0, maxi = list.length; i < maxi; i++) {
      namelist.push(list[i].name)
    }
    let fullstr = namelist.join('\r\n')
    copyToClipboard(fullstr)
    message.success('选中文件的文件名已复制到剪切板')
  } catch (err: any) {
    message.error(err.message)
    DebugLog.mSaveDanger('menuCopyFileName', err)
  }
  topbtnLock.delete('menuCopyFileName')
}

export function menuCopyFileTree() {
  let list: IAliGetFileModel[] = usePanFileStore().GetSelected()

  if (list.length == 0) {
    message.error('没有选中任何文件！')
    return
  }

  modalCopyFileTree(list)
}
