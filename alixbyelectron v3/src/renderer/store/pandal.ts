import AliDirList from '@/aliapi/dirlist'
import AliFileCmd from '@/aliapi/filecmd'
import AliFileList, { IAliFileResp } from '@/aliapi/filelist'
import DB from '@/setting/db'
import SettingLog from '@/setting/settinglog'
import SettingPan from '@/setting/settingpan'
import React from 'react'
import PanStore from './panstore'
import UserDAL from './userdal'

import { FixedSizeList, FixedSizeGrid } from 'react-window'
import Tree from 'rc-tree/lib/Tree'
import { IAliGetDirModel, IAliGetFileModel } from '@/aliapi/models'
import { message } from 'antd'
import { FileModelState, selectDirFileList, TreeDirModelState } from 'umi'

const FootMap = new Map<string, string>()
export function FootLoading(msg: string, key: string) {
  console.log('FootLoading', key, msg)

  if (msg != '') FootMap.set(key, msg)
  else FootMap.delete(key)

  let info = ''
  FootMap.forEach(function (value, key) {
    let item = '<span style="margin-right:8px">' + value + '</span>'
    if (info.includes(item) == false) info += item
  })

  let doc = document.getElementById('footLoading')
  if (doc) {
    if (!info) {
      doc.innerHTML = ''
    } else {
      doc.innerHTML = '<div class="ant-spin-spinning"><i class="iconfont iconsync anticon-spin" ></i></div>' + info
    }
  }
}

export const PanTreeRef = React.createRef<Tree>()
export const PanFileListRef = React.createRef<FixedSizeList>()
export const PanFileGridRef = React.createRef<FixedSizeGrid>()

export default class PanDAL {
  static async aLoadFromDB() {}

  static GetFastAllDirList(user_id: string, drive_id: string) {
    return new Promise<boolean>((resolve) => {
      if (AliDirList.ApiCheckFastSearchDirLock(user_id, drive_id, 'all')) resolve(false)
      else if (PanStore.IsAllDir(drive_id)) resolve(true)
      else {
        FootLoading('加载全部文件夹...', 'loaddir' + drive_id)
        AliDirList.ApiAddFastSearchDirLock(user_id, drive_id, 'all')
        let dt = Date.now()
        AliDirList.ApiFastSearchDirList(user_id, drive_id, '', '')
          .then((data) => {
            AliDirList.ApiDelFastSearchDirLock(user_id, drive_id, 'all')
            if (!data.next_marker) {
              console.log('dircount', data.items.length, Date.now() - dt)
              PanStore.SaveAllDir(drive_id, data.items).then(() => {
                resolve(true)
              })
            } else resolve(false)
          })
          .catch((err) => {
            AliDirList.ApiDelFastSearchDirLock(user_id, drive_id, 'all')
            SettingLog.mSaveLog('warning', '列出文件夹失败file_id=all' + ' err=' + (err.message || ''))
            resolve(false)
          })
          .then(() => {
            window.getDvaApp()._store.dispatch({ type: 'pan/mRefreshDirSize', user_id: user_id, drive_id: drive_id })
            window.getDvaApp()._store.dispatch({ type: 'pan/mChangSelectDirFileOrder' })
            FootLoading('', 'loaddir' + drive_id)
          })
      }
    })
  }

  static GetDirFileList(user_id: string, drive_id: string, dir_id: string, force: boolean) {
    if (force) PanStore.DeleteOneDirFileList(drive_id, dir_id)
    return new Promise<boolean>((resolve) => {
      let dir = PanStore.GetOneDirFileList(drive_id, dir_id)
      if (dir && dir.items.length > 0) {
        PanStore.SaveOneDirFileList(dir).then(() => {
          window.getDvaApp()._store.dispatch({ type: 'file/aLoadDirFiles', loading: false, drive_id: drive_id, file_id: dir_id, items: dir!.items })
          resolve(true)
        })
      } else {
        let order = PanStore.GetDirOrder(drive_id, dir_id).replace('ext ', 'updated_at ')
        let getlist: Promise<IAliFileResp>
        let issearch = dir_id.startsWith('search-')
        if (issearch) {
          getlist = AliFileList.ApiSearchFileList(user_id, drive_id, dir_id, '', order, true)
        } else {
          getlist = AliFileList.ApiDirFileList(user_id, drive_id, dir_id, '', order, true)
        }
        getlist
          .then((dir) => {
            if (!dir.next_marker) {
              PanStore.SaveOneDirFileList(dir).then(() => {
                window.getDvaApp()._store.dispatch({ type: 'file/aLoadDirFiles', loading: false, drive_id: dir.m_drive_id, file_id: dir.m_dir_id, items: dir.items })
                resolve(true)
              })
            } else {
              message.warning('列出文件夹失败')
              window.getDvaApp()._store.dispatch({ type: 'file/aLoadDirFiles', loading: false, drive_id: dir.m_drive_id, file_id: dir.m_dir_id, items: [] })
              resolve(false)
            }
          })
          .catch((err) => {
            window.getDvaApp()._store.dispatch({ type: 'file/aLoadDirFiles', loading: false, drive_id: drive_id, file_id: dir_id, items: [] })
            message.warning('列出文件夹失败')
            SettingLog.mSaveLog('warning', '列出文件夹失败file_id=' + dir_id + ' err=' + (err.message || ''))
            resolve(false)
          })
      }
    })
  }

  static syncTrashClean = false
  static async TrashAutoClean() {
    if (SettingPan.uiTrashAutoCleanDay > 30) return
    if (PanDAL.syncTrashClean) return
    let defaultUser = await DB.getValueString('uiDefaultUser')
    let token = UserDAL.GetUserToken(defaultUser)
    if (!token || !token.access_token) return
    PanDAL.syncTrashClean = true
    let logtime = Date.now() - SettingPan.uiTrashAutoCleanDay * 24 * 60 * 60 * 1000

    const resp: IAliFileResp = {
      items: [],
      punished_file_count:0,
      next_marker: '',
      m_user_id: token.user_id,
      m_drive_id: token.default_drive_id,
      m_dir_id: 'trash',
      m_dir_name: 'trash',
      m_need_report: false
    }

    for (let i = 0; i < 20; i++) {
      await AliFileList.ApiTrashFileListOnePage('updated_at', 'ASC', resp).catch(() => {})
      if (!resp.next_marker) break
    }

    const filekeys: string[] = []
    if (resp.items.length > 0) {
      for (let i = 0, maxi = resp.items.length; i < maxi; i++) {
        const item = resp.items[i]
        if (item.time < logtime) {
          filekeys.push(item.file_id)
        }
      }
    }

    if (filekeys.length > 0) {
      await AliFileCmd.ApiTrashCleanBatch(token.user_id, token.default_drive_id, filekeys).catch(() => {})
      PanDAL.syncTrashClean = false
      setTimeout(() => {
        PanDAL.TrashAutoClean()
      }, 200)
      return
    }
    PanDAL.syncTrashClean = false
  }

  static QuerySelectedFileKeys() {
    const filelist: string[] = []
    const file = window.getDvaApp()._store.getState().file as FileModelState
    const selectedFiles = file.selectedFiles

    for (let i = 0, maxi = selectDirFileList.length; i < maxi; i++) {
      const file_id = selectDirFileList[i].file_id
      if (selectedFiles.has(file_id)) filelist.push(selectDirFileList[i].file_id)
    }
    return filelist
  }
  static QuerySelectedFileList() {
    const filelist: IAliGetFileModel[] = []
    const file = window.getDvaApp()._store.getState().file as FileModelState
    const selectedFiles = file.selectedFiles
    for (let i = 0, maxi = selectDirFileList.length; i < maxi; i++) {
      const file_id = selectDirFileList[i].file_id
      if (selectedFiles.has(file_id)) filelist.push(selectDirFileList[i])
    }
    return filelist
  }
  static QuerySelectDir() {
    const treedir = window.getDvaApp()._store.getState().treedir as TreeDirModelState
    return treedir.selectDir
  }
}
