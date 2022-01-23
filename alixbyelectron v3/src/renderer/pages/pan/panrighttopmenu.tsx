import PanStore from '@/store/panstore'
import { AutoComplete, Button, Dropdown, Input, Menu, message, Select, Tooltip } from 'antd'
import DownOutlined from '@ant-design/icons/lib/icons/DownOutlined'
import React, { Component } from 'react'
import SettingPan from '@/setting/settingpan'
import SettingUI from '@/setting/settingui'
import { IAliGetDirModel } from '@/aliapi/models'
import { menuFavSelectFile, menuShareSelectFile, menuTrashSelectFile, topRestoreSelectFile, topTrashDeleteAll, topTrashDeleteSelectFile } from './filemenu'
import { ShowInputShareModal } from '../share/sharelinkinputmodal'
import { ShowCreatNewFileModal } from './creatnewfilemodal'
import { ShowCreatNewDirModal } from './creatnewdirmodal'
import UserDAL from '@/store/userdal'
import UploadDAL from '@/store/uploaddal'
import { DownloadPan } from '../down/savepathmodal'
import { ShowRenameSingleModal } from './renamesinglemodal'
import { ShowCopyMoveModal } from './copymovemodal'
export function Bottom(props: any) {
  let { name } = props
  const sayHi = () => {
    console.log(`Hi ${name}`)
  }
  return (
    <div>
      <h1>Hello, {name}</h1>
      <button onClick={sayHi}>Say Hi</button>
    </div>
  )
}
export function focusList() {
  let find = document.getElementsByClassName('ReactVirtualized__Grid')
  if (find && find.length > 0) {
    find[0].scrollTop++
    find[0].scrollTop--
    let doc = find[0] as HTMLElement
    doc.focus()
  }
}
export function DirPathMenu(selectDirPath: IAliGetDirModel[], handleSelectDir: any) {
  return (
    <div style={{ minHeight: '26px', width: '100%', flexShrink: 0, flexGrow: 0 }}>
      <div className="toppannav" style={{ display: SettingUI.uiLeftTreeCollapsed || SettingUI.uiShowPanPath ? '' : 'none' }}>
        <div className="toppannavitem">
          <Dropdown
            overlay={
              <Menu className="ptm">
                {selectDirPath.map((item: IAliGetDirModel, index: number) => (
                  <Menu.Item key={'tpn' + index} onClick={() => handleSelectDir(item.file_id)} style={{ maxWidth: '600px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </Menu.Item>
                ))}
              </Menu>
            }>
            <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
              路径 <DownOutlined />
            </a>
          </Dropdown>
        </div>

        {selectDirPath.map((item: IAliGetDirModel, index: number) => (
          <div key={'dirpath' + index} onClick={() => handleSelectDir(item.file_id)} className="toppannavitem" title={item.name}>
            {item.name.length > 30 ? item.name.substring(0, 27) + '...' : item.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export function FileListOrderMenu(props: any) {
  let fileListOrder = PanStore.GetDirOrder(props.treedir.selectDir.drive_id, props.treedir.selectDir.file_id)
  fileListOrder = fileListOrder.replace('asc', '升序').replace('desc', '降序').replace('name', '文件名').replace('ext', '类型').replace('size', '大小').replace('updated_at', '时间')

  const onFileListOrder = ({ key }: { key: string }) => {
    let dir = props.treedir.selectDir
    PanStore.SaveDirOrder(dir.drive_id, dir.file_id, key)
    props.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'order', force: false })
    focusList()
  }
  return (
    <div>
      <Dropdown
        overlay={
          <Menu className="ptm" onClick={onFileListOrder}>
            <Menu.Item key="name asc">文件名 升序</Menu.Item>
            <Menu.Item key="name desc">文件名 降序</Menu.Item>
            <Menu.Item key="updated_at asc">时间 升序</Menu.Item>
            <Menu.Item key="updated_at desc">时间 降序</Menu.Item>
            <Menu.Item key="size asc">大小 升序</Menu.Item>
            <Menu.Item key="size desc">大小 降序</Menu.Item>
            <Menu.Item key="ext asc">类型 升序</Menu.Item>
            <Menu.Item key="ext desc">类型 降序</Menu.Item>
          </Menu>
        }>
        <div className="paixu" title="在设置里可以设置文件夹排序方式">
          <i className="iconfont iconpaixu" />
          {props.file.selectDirFileLoading ? '加载中...' : fileListOrder} <DownOutlined />
        </div>
      </Dropdown>
    </div>
  )
}

export function FileListModeMenu() {
  const onFileListMode = (mode: string) => {
    SettingPan.mSaveUiFileListMode(mode)
    focusList()
  }
  return (
    <div style={{ paddingTop: '1px', paddingBottom: '1px' }}>
      <Tooltip title="列表模式">
        <Button className="select" icon={<i className="iconfont iconliebiaomoshi" />} onClick={() => onFileListMode('list')}></Button>
      </Tooltip>
      <Tooltip title="缩略图模式">
        <Button className="select" icon={<i className="iconfont iconxiaotumoshi" />} onClick={() => onFileListMode('image')}></Button>
      </Tooltip>
      <Tooltip title="大图模式">
        <Button className="select" icon={<i className="iconfont iconsuoluetumoshi" />} onClick={() => onFileListMode('big')}></Button>
      </Tooltip>
    </div>
  )
}

export function OnTrashMenu(isOnTrash: boolean) {
  return (
    <div className="toppanbtn" style={{ display: isOnTrash ? '' : 'none' }}>
      <Button icon={<i className="iconfont iconrecover" />} onClick={() => topRestoreSelectFile()} title="当前选中的项">
        恢复选中
      </Button>
      <Button icon={<i className="iconfont icondelete" />} onClick={() => topTrashDeleteSelectFile()} title="当前选中的项">
        彻底删除
      </Button>
      <Button icon={<i className="iconfont iconrest" />} onClick={() => topTrashDeleteAll()} title="彻底删除回收站内全部文件">
        清空回收站
      </Button>
    </div>
  )
}
export function onUpload(type: string, selectDir: IAliGetDirModel) {
  let user_id = UserDAL.QueryUserID()
  if (!user_id) {
    message.info('请先登录一个阿里云盘账号')
    return
  }

  if (type == 'file') {
    window.WebShowOpenDialogSync({ title: '选择多个文件上传到网盘', buttonLabel: '上传选中的文件', properties: ['openFile', 'multiSelections'] }, (files: string[] | undefined) => {
      if (files && files.length > 0) {
        UploadDAL.UploadLocalFiles(user_id, selectDir.drive_id, selectDir.file_id, files, true)
      }
    })
  } else {
    window.WebShowOpenDialogSync({ title: '选择多个文件夹上传到网盘', buttonLabel: '上传文件夹', properties: ['openDirectory', 'multiSelections'] }, (files: string[] | undefined) => {
      if (files && files.length > 0) {
        UploadDAL.UploadLocalFiles(user_id, selectDir.drive_id, selectDir.file_id, files, true)
      }
    })
  }
}
export function OnPanMenu(isOnPan: boolean, selectDir: IAliGetDirModel, selectedFilesCount: number) {
  return (
    <div className="toppanbtn" style={{ display: isOnPan && selectedFilesCount < 1 ? '' : 'none' }}>
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="newfile" onClick={(e) => ShowCreatNewFileModal(selectDir.drive_id, selectDir.file_id)}>
              新建文件
            </Menu.Item>
            <Menu.Item key="newfolder" onClick={(e) => ShowCreatNewDirModal('newfolder', selectDir.drive_id, selectDir.file_id, undefined)}>
              新建文件夹
            </Menu.Item>
            <Menu.Item key="newdatefolder" onClick={(e) => ShowCreatNewDirModal('newdatefolder', selectDir.drive_id, selectDir.file_id, undefined)}>
              新建日期文件夹
            </Menu.Item>
          </Menu>
        }>
        <Button icon={<i className="iconfont iconplus" />}>
          新建
          <i className="iconfont icondown" />
        </Button>
      </Dropdown>

      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="uploadfile" onClick={() => onUpload('file', selectDir)}>
              上传文件
            </Menu.Item>
            <Menu.Item key="uploaddir" onClick={() => onUpload('folder', selectDir)}>
              上传文件夹
            </Menu.Item>
          </Menu>
        }>
        <Tooltip placement="top" title={'上传到：' + selectDir.name + ' 里面'}>
          <Button icon={<i className="iconfont iconupload" />}>
            上传 <i className="iconfont icondown" />
          </Button>
        </Tooltip>
      </Dropdown>
      <Button icon={<i className="iconfont iconlink2" />} onClick={(e) => ShowInputShareModal()}>
        导入分享
      </Button>
    </div>
  )
}
export function OnPanFileSelectedMenu(isOnPan: boolean, isOnTrash: boolean, isOnFavor: boolean, selectDir: IAliGetDirModel, selectedFilesCount: number, onSelectFile: any) {
  return (
    <div className="toppanbtn" style={{ display: isOnTrash == false && selectedFilesCount >= 1 ? '' : 'none' }}>
      <Button icon={<i className="iconfont icondownload" />} onClick={() => DownloadPan(false, false)}>
        下载
      </Button>
      <Button icon={<i className="iconfont iconfenxiang" />} onClick={() => menuShareSelectFile(false)}>
        分享
      </Button>
      <Button style={{ display: isOnFavor ? 'none' : '' }} icon={<i className="iconfont iconcrown" />} onClick={() => menuFavSelectFile(false, true)}>
        收藏
      </Button>
      <Button style={{ display: isOnFavor ? '' : 'none' }} icon={<i className="iconfont iconcrown2" />} onClick={() => menuFavSelectFile(false, false)}>
        取消收藏
      </Button>
      <Button icon={<i className="iconfont iconedit-square" />} onClick={() => ShowRenameSingleModal(false)}>
        重命名
      </Button>
      <Button icon={<i className="iconfont iconcopy" />} onClick={() => ShowCopyMoveModal(selectDir.drive_id, false, 'copy')}>
        复制
      </Button>
      <Button icon={<i className="iconfont iconscissor" />} onClick={() => ShowCopyMoveModal(selectDir.drive_id, false, 'move')}>
        移动
      </Button>
      <Button icon={<i className="iconfont icondelete" />} danger onClick={() => menuTrashSelectFile(false)} title="放入回收站">
        删除
      </Button>
      <Button icon={<i className="iconfont iconrstop" />} onClick={(e) => onSelectFile(e, false, '', false)} title="取消选中"></Button>
    </div>
  )
}
export function OnSearchMenu(isOnSearch: boolean) {}
