import AliFile from '@/aliapi/file'
import AliFileCmd from '@/aliapi/filecmd'
import AliFileList from '@/aliapi/filelist'
import SettingLog from '@/setting/settinglog'
import PanDAL from '@/store/pandal'
import PanStore from '@/store/panstore'

import SQL from '@/store/sql'
import UserDAL from '@/store/userdal'
import { message } from 'antd'
import { ShowCreatShareModal } from '../share/creatsharemodal'

let _topRestoreSelectFile = false
export async function topRestoreSelectFile() {
  const userID = UserDAL.QueryUserID()
  if (!userID) return
  const files = PanDAL.QuerySelectedFileList()
  const selectkeys: string[] = []
  const selectparentkeys: string[] = ['root', 'trash']
  for (let i = 0, maxi = files.length; i < maxi; i++) {
    selectkeys.push(files[i].file_id)
    if (selectparentkeys.includes(files[i].parent_file_id) == false) selectparentkeys.push(files[i].parent_file_id)
  }
  if (selectkeys.length == 0) return

  if (_topRestoreSelectFile) return
  _topRestoreSelectFile = true
  try {
    const selectDir = PanDAL.QuerySelectDir()
    const data = await AliFileCmd.ApiTrashRestoreBatch(userID, selectDir.drive_id, selectkeys)
    PanStore.DeleteDirFileList(selectDir.drive_id, selectparentkeys)
    if (selectDir.file_id == 'trash') {
      window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true })
    }
  } catch (e: any) {
    message.error(e.message)
    SettingLog.mSaveLog('danger', e.message)
  }
  _topRestoreSelectFile = false
}

let _topTrashDeleteSelectFile = false
export async function topTrashDeleteSelectFile() {
  const userID = UserDAL.QueryUserID()
  if (!userID) return

  const selectkeys = PanDAL.QuerySelectedFileKeys()
  if (selectkeys.length == 0) return

  if (_topTrashDeleteSelectFile) return
  _topTrashDeleteSelectFile = true
  try {
    const selectDir = PanDAL.QuerySelectDir()
    const data = await AliFileCmd.ApiTrashDeleteBatch(userID, selectDir.drive_id, selectkeys, false)

    PanStore.DeleteDirFileList(selectDir.drive_id, ['trash'])
    if (selectDir.file_id == 'trash') {
      window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true })
    }
  } catch (e: any) {
    message.error(e.message)
    SettingLog.mSaveLog('danger', e.message)
  }
  _topTrashDeleteSelectFile = false
}

let _menuFavSelectFile = false
export async function menuFavSelectFile(istree: boolean, isfavor: boolean) {
  const userID = UserDAL.QueryUserID()
  if (!userID) return

  const selectDir = PanDAL.QuerySelectDir()
  const drive_id = selectDir.drive_id
  const parentid = istree ? selectDir.parent_file_id : selectDir.file_id

  let selectkeys: string[] = []
  let selectparentkeys: string[] = ['favorite']

  if (istree) {
    selectkeys.push(selectDir.file_id)
    selectparentkeys.push(parentid)
  } else {
    const files = PanDAL.QuerySelectedFileList()
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      selectkeys.push(files[i].file_id)
      if (selectparentkeys.includes(files[i].parent_file_id) == false) selectparentkeys.push(files[i].parent_file_id)
    }
  }
  if (selectkeys.length == 0) return

  if (_menuFavSelectFile) return
  _menuFavSelectFile = true
  try {
    const data = await AliFileCmd.ApiFavorBatch(userID, drive_id, isfavor, true, selectkeys)

    PanStore.DeleteDirFileList(drive_id, selectparentkeys)

    if (selectDir.file_id == parentid) {
      if (data == selectkeys.length && parentid != 'favorite') {
        window.getDvaApp()._store.dispatch({ type: 'file/mFavor', fileidlist: selectkeys, isfavor: isfavor })
      } else {
        window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true })
      }
    }
  } catch (e: any) {
    message.error(e.message)
    SettingLog.mSaveLog('danger', e.message)
  }
  _menuFavSelectFile = false
}

export async function menuShareSelectFile(istree: boolean) {
  const selectfiles = istree ? [PanDAL.QuerySelectDir()] : PanDAL.QuerySelectedFileList()
  ShowCreatShareModal(selectfiles)
  return
}

export function menuJumpToSelectFile(istree: boolean) {
  if (istree) return
  const files = PanDAL.QuerySelectedFileList()
  if (files.length > 0) {
    const file = files[0]
    if (file.parent_file_id != '') {
      window.getDvaApp()._store.dispatch({ type: 'pan/aSelectDir', key: file.parent_file_id, force: false })
    } else {
      message.info('跳转失败，找不到父文件夹')
    }
  }
}

export async function menuInfoSelectFile(istree: boolean) {
  if (istree) {
    message.info('此版本暂不支持')
    return
  }
  const userID = UserDAL.QueryUserID()
  const token = UserDAL.GetUserToken(userID)
  if (!token || !token.access_token) {
    message.error('账号失效，操作取消')
    return
  }
  const selectfile = PanDAL.QuerySelectedFileList()[0]
  if (selectfile.category == 'video') {
    if (selectfile.icon == 'iconweifa') {
      message.error('违规视频无法预览')
    }
    const pageVideoXBT = { user_id: token.user_id, drive_id: selectfile.drive_id, file_id: selectfile.file_id, name: selectfile.name, token, data: { file: selectfile } }
    window.WebOpenWindow({ showPage: 'pageVideoXBT', pageVideoXBT, theme: 'dark' })
    return
  }
  message.info('此版本暂不支持')
  return
}

let _menuFileColorChange = false
export async function menuFileColorChange(istree: boolean, color: string) {
  const userID = UserDAL.QueryUserID()
  if (!userID) return

  color = color.toLowerCase().replace('#', 'c')

  const selectDir = PanDAL.QuerySelectDir()
  const drive_id = selectDir.drive_id
  const selectkeys = istree ? [selectDir.file_id] : PanDAL.QuerySelectedFileKeys()

  if (selectkeys.length == 0) return

  if (_menuFileColorChange) return
  _menuFileColorChange = true
  try {
    let data = await AliFileCmd.ApiDescriptionBatch(userID, drive_id, color, selectkeys)
    window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true })
    message.success(color ? '颜色已标记' : '颜色已清除')
  } catch (e: any) {
    message.error(e.message)
    SettingLog.mSaveLog('danger', e.message)
  }
  _menuFileColorChange = false
}

let _menuTrashSelectFile = false
export async function menuTrashSelectFile(istree: boolean) {
  const userID = UserDAL.QueryUserID()
  if (!userID) return

  const selectDir = PanDAL.QuerySelectDir()
  const drive_id = selectDir.drive_id
  const parentid = istree ? selectDir.parent_file_id : selectDir.file_id

  let selectkeys: string[] = []
  let selectparentkeys: string[] = ['trash', 'favorite']

  if (istree) {
    selectkeys.push(selectDir.file_id)
    selectparentkeys.push(parentid)
  } else {
    const files = PanDAL.QuerySelectedFileList()
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      selectkeys.push(files[i].file_id)
      if (selectparentkeys.includes(files[i].parent_file_id) == false) selectparentkeys.push(files[i].parent_file_id)
    }
  }
  if (selectkeys.length == 0) return

  if (_menuTrashSelectFile) return
  _menuTrashSelectFile = true
  try {
    let data = await AliFileCmd.ApiTrashBatch(userID, drive_id, selectkeys)
    for (let i = 0, maxi = selectparentkeys.length; i < maxi; i++) {
      PanDAL.GetDirFileList(userID, drive_id, selectparentkeys[i], true)
    }

    if (istree) {
      window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: drive_id, file_id: parentid, force: true })
    } else {
      window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true })
    }
  } catch (e: any) {
    message.error(e.message)
    SettingLog.mSaveLog('danger', e.message)
  }
  _menuTrashSelectFile = false
}

let _topTrashDeleteAll = false
export async function topTrashDeleteAll() {
  const userID = UserDAL.QueryUserID()
  if (!userID) return
  if (_topTrashDeleteAll) return
  _topTrashDeleteAll = true
  try {
    const selectDir = PanDAL.QuerySelectDir()
    const loadingkey = 'cleartrash_' + Date.now().toString()
    message.loading({ content: '清空回收站执行中...', key: loadingkey, duration: 0 })
    let count = 0
    while (true) {
      const resp = await AliFileList.ApiTrashFileList(userID, selectDir.drive_id, 'updated_at DESC', false, 100)
      if (resp.next_marker == '' && resp.items.length > 0) {
        const selectkeys: string[] = []
        for (let i = 0, maxi = resp.items.length; i < maxi; i++) {
          selectkeys.push(resp.items[i].file_id)
        }
        count += await AliFileCmd.ApiTrashCleanBatch(userID, selectDir.drive_id, selectkeys)
        message.loading({ content: '清空回收站执行中...(' + count.toString() + ')', key: loadingkey, duration: 0 })
      } else {
        break
      }
    }
    message.success({ content: '清空回收站 成功!', key: loadingkey, duration: 2 })
    PanStore.DeleteDirFileList(selectDir.drive_id, ['trash'])
    if (selectDir.file_id == 'trash') {
      window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true })
    }
  } catch (e: any) {
    message.error(e.message)
    SettingLog.mSaveLog('danger', e.message)
  }
  _topTrashDeleteAll = false
}

let _topFavorDeleteAll = false
export async function topFavorDeleteAll() {
  const userID = UserDAL.QueryUserID()
  if (!userID) return
  if (_topFavorDeleteAll) return
  _topFavorDeleteAll = true
  try {
    const selectDir = PanDAL.QuerySelectDir()
    const loadingkey = 'cleartrash_' + Date.now().toString()
    message.loading({ content: '清空收藏夹执行中...', key: loadingkey, duration: 0 })
    let count = 0
    while (true) {
      const resp = await AliFileList.ApiFavorFileList(userID, selectDir.drive_id, 'updated_at DESC', false, 100)
      if (resp.next_marker == '' && resp.items.length > 0) {
        const selectkeys: string[] = []
        for (let i = 0, maxi = resp.items.length; i < maxi; i++) {
          selectkeys.push(resp.items[i].file_id)
        }
        count += await AliFileCmd.ApiFavorBatch(userID, selectDir.drive_id, false, false, selectkeys)
        message.loading({ content: '清空收藏夹执行中...(' + count.toString() + ')', key: loadingkey, duration: 0 })
      } else {
        break
      }
    }
    message.success({ content: '清空收藏夹 成功!', key: loadingkey, duration: 2 })
    PanStore.DeleteDirFileList(selectDir.drive_id, ['favorite'])
    if (selectDir.file_id == 'favorite') {
      window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true })
    }
  } catch (e: any) {
    message.error(e.message)
    SettingLog.mSaveLog('danger', e.message)
  }
  _topFavorDeleteAll = false
}
