import AliFile from '@/aliapi/file'
import PanDAL from '@/store/pandal'

import UserDAL from '@/store/userdal'
import { message, Modal } from 'antd'
import React from 'react'
import { PanSaveTree } from './pansavetree'
import SQL from '@/store/sql'
import { IAliGetFileModel } from '@/aliapi/models'
import SettingLog from '@/setting/settinglog'
import AliFileCmd from '@/aliapi/filecmd'
import PanStore from '@/store/panstore'

let _ShowCopyMoveModal = false
export function ShowCopyMoveModal(driveID: string, istree: boolean, type: string) {
  if (_ShowCopyMoveModal) return
  _ShowCopyMoveModal = true
  setTimeout(() => {
    _ShowCopyMoveModal = false
  }, 500)
  if (!UserDAL.QueryUserID()) {
    message.info('请先登录一个阿里云盘账号')
    return
  }

  const userID = UserDAL.QueryUserID()
  const token = UserDAL.GetUserToken(userID)
  if (!token || !token.access_token) {
    message.error('账号失效，操作取消')
    return
  }

  const selectedFile: IAliGetFileModel[] = istree ? [{ ...PanDAL.QuerySelectDir(), isdir: true, ext: '', category: '', icon: '', sizestr: '', timestr: '', starred: false, download_url: '', thumbnail: '' }] : PanDAL.QuerySelectedFileList()

  if (selectedFile.length == 0) {
    message.error('没有选择要操作的文件/文件夹')
    return
  }

  const title = type == 'copy' ? '复制' : '移动'
  const modal = Modal.info({
    closable: true,
    centered: true,
    className: 'dialogmodal copymovemodal',
    icon: undefined,
    autoFocusButton: undefined,
    width: '80vw',
    style: { maxWidth: '540px', paddingBottom: '0', height: '80vh' }
  })

  modal.update({
    title: title + '选中文件/文件夹到...',
    content: <CopyMove istree={istree} title={title} userID={userID} driveID={driveID} selectedFile={selectedFile} modal={modal} />
  })
}

class CopyMove extends React.Component<{ istree: boolean; title: string; userID: string; driveID: string; selectedFile: IAliGetFileModel[]; modal: { destroy: () => void; update: (configUpdate: any) => void } }, { loading: boolean }> {
  constructor(props: any) {
    super(props)

    this.state = { loading: false }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'ShareLinkInput' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }

  componentDidMount() {}
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return
    }
  }

  handleCallBack = async (movetodirid: string) => {
    if (!movetodirid) {
      this.props.modal.destroy()
      return
    }
    const token = UserDAL.GetUserToken(this.props.userID)
    if (!token || !token.access_token) {
      message.error('账号失效，操作取消')
      return
    }

    const selectDir = PanDAL.QuerySelectDir()

    const diridlist: string[] = ['favorite', 'search']
    const fileidlist: string[] = []
    const filenamelist: string[] = []
    const selectedFile = this.props.selectedFile
    for (let i = 0, maxi = selectedFile.length; i < maxi; i++) {
      if (selectedFile[i].isdir && diridlist.includes(selectedFile[i].parent_file_id) == false) diridlist.push(selectedFile[i].parent_file_id)
      fileidlist.push(selectedFile[i].file_id)
      filenamelist.push(selectedFile[i].name)
    }
    let count = 0
    if (this.props.title == '移动') {
      count = await AliFileCmd.ApiMoveBatch(token.user_id, selectDir.drive_id, fileidlist, selectDir.drive_id, movetodirid)
      if (this.props.istree) {
        window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: selectDir.parent_file_id, force: true })
      } else {
        window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true })
        PanStore.DeleteDirFileList(selectDir.drive_id, diridlist)
      }
    } else {
      count = await AliFileCmd.ApiCopyBatch(token.user_id, selectDir.drive_id, fileidlist, filenamelist, selectDir.drive_id, movetodirid)
    }
    setTimeout(() => {
      PanDAL.GetDirFileList(token.user_id, selectDir.drive_id, movetodirid, true)
    }, 1000)
    if (count > 0) message.success(this.props.title + '文件成功,请稍后手动刷新保存到的文件夹')
    this.props.modal.destroy()
  }

  render() {
    return <PanSaveTree userID={this.props.userID} driveID={this.props.driveID} StorageKey={'MoveFiles'} callback={this.handleCallBack} />
  }
}
