import AliShare from '@/aliapi/share'
import PanDAL from '@/store/pandal'

import UserDAL from '@/store/userdal'
import { message, Modal } from 'antd'
import React from 'react'
import SQL from '@/store/sql'
import { PanSaveTree } from '../pan/pansavetree'
import { CheckNode } from './sharelinktreemodal'
import { ITokenInfo } from '@/store/models'
import AliFile from '@/aliapi/file'
import SettingLog from '@/setting/settinglog'
import PanStore from '@/store/panstore'
import AliFileCmd from '@/aliapi/filecmd'

let _ShowSaveShareModal = false
export function ShowSaveShareModal(userID: string, shareid: string, sharetoken: string, selectNodes: CheckNode[]) {
  if (_ShowSaveShareModal) return
  _ShowSaveShareModal = true
  setTimeout(() => {
    _ShowSaveShareModal = false
  }, 500)

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
    title: '保存选中文件/文件夹到...',
    content: <ShareSave userID={userID} shareid={shareid} sharetoken={sharetoken} selectNodes={selectNodes} modal={modal} />
  })
}

class ShareSave extends React.Component<{ userID: string; shareid: string; sharetoken: string; selectNodes: CheckNode[]; modal: { destroy: () => void; update: (configUpdate: any) => void } }, {}> {
  constructor(props: any) {
    super(props)
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'ShareSave' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }

  componentDidMount() {}
  componentWillUnmount() {}

  handleCallBack = async (movetodirid: string) => {
    if (!movetodirid) {
      this.props.modal.destroy()
      return
    }

    let selectDir = PanDAL.QuerySelectDir()
    let loadingkey = 'sharesave' + Date.now().toString()
    message.loading({ content: '保存分享 执行中...', key: loadingkey, duration: 0 })

    let selectNodes = this.props.selectNodes
    let result = await SaveLink(this.props.shareid, this.props.sharetoken, this.props.userID, selectDir.drive_id, movetodirid, selectNodes)

    PanStore.DeleteDirFileList(selectDir.drive_id, [movetodirid])
    if (result == '') message.success({ content: '保存文件成功,请稍后手动刷新保存到的文件夹', key: loadingkey, duration: 2 })
    else message.error({ content: '保存文件出错,' + result, key: loadingkey, duration: 3 })
    this.props.modal.destroy()
  }
  render() {
    let selectDir = PanDAL.QuerySelectDir()
    return <PanSaveTree userID={this.props.userID} driveID={selectDir.drive_id} StorageKey={'ShareFiles'} callback={this.handleCallBack} />
  }
}

async function SaveLink(shareid: string, sharetoken: string, user_id: string, drive_id: string, parentid: string, nodes: CheckNode[]) {
  let result = ''
  const selectKeys: string[] = []
  const halfNodes: CheckNode[] = []
  for (let i = 0, maxi = nodes.length; i < maxi; i++) {
    if (nodes[i].halfChecked == false) selectKeys.push(nodes[i].file_id)
    else halfNodes.push(nodes[i])
  }
  const result1 = await AliShare.ApiSaveShareFilesBatch(shareid, sharetoken, user_id, drive_id, parentid, selectKeys)
  if (result1 !== 'success' && result1 !== 'async') result += ';' + result1 + ' '

  for (let i = 0, maxi = halfNodes.length; i < maxi; i++) {
    const half = halfNodes[i]
    const file_id = await AliFileCmd.ApiCreatNewForder(user_id, drive_id, parentid, half.name)
    if (file_id != undefined && file_id != 'QuotaExhausted.Drive') {
      const rchild = await SaveLink(shareid, sharetoken, user_id, drive_id, file_id, half.children)
      if (rchild) result += ';' + rchild + ' '
    } else result += ';创建' + half.name + '失败 '
  }

  return result
}
