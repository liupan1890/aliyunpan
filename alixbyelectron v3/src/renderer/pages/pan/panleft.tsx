import AliFile from '@/aliapi/file'
import PanDAL from '@/store/pandal'

import UserDAL from '@/store/userdal'
import { Button, Dropdown, Menu, message, Tree } from 'antd'
import { EventDataNode } from 'antd/lib/tree'
import React, { Key } from 'react'
import { connect, PanTreeRef, TreeDirModelState } from 'umi'
import _ from 'underscore'
import { DownloadPan } from '../down/savepathmodal'
import { ShowCopyMoveModal } from './copymovemodal'
import { menuFavSelectFile, menuFileColorChange, menuInfoSelectFile, menuShareSelectFile, menuTrashSelectFile } from './filemenu'
import './pan.css'
import { ShowRenameSingleModal } from './renamesinglemodal'
import SQL from '@/store/sql'
import SettingLog from '@/setting/settinglog'
import AliFileCmd from '@/aliapi/filecmd'
import PanStore from '@/store/panstore'
import { FileColorMenu, FileCopyMenu } from './panrightmenu'
export interface PanLeftProps {
  collapsed: boolean
  sideWidth: number
  treedir: TreeDirModelState
  dispatch: any
}
function onHideClick() {
  let menu = document.getElementById('pantreemenu')
  if (menu) menu.style.display = 'none'
}
function onHideScroll() {
  if (showmenu) {
    let menu = document.getElementById('pantreemenu')
    if (menu) menu.style.display = 'none'
    showmenu = false
  }
}

let showmenu = false
class PanLeft extends React.Component<PanLeftProps> {
  constructor(props: any) {
    super(props)
    this.state = {
      treeHeight: 100
    }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'PanLeft' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }

  onRightClick = (info: { event: React.MouseEvent<Element, MouseEvent>; node: EventDataNode }) => {
    const key = info.node.key
    this.handleSelectPage(key.toString())

    let menufile = document.getElementById('panfilemenu')
    if (menufile) menufile.style.display = 'none'

    let menu = document.getElementById('pantreemenu')
    let pantree = document.getElementById('pantree')
    if (menu && pantree) {
      if (key == 'root' || key == 'favorite' || key == 'trash') {
        menu.style.display = 'none'
        showmenu = false
        return
      }
      showmenu = true
      let left = info.event.clientX + pantree.scrollLeft
      if (left > pantree.scrollWidth - 140) left = pantree.scrollWidth - 140

      let top = info.event.clientY + pantree.scrollTop - 70
      if (top > pantree.scrollHeight - 220) {
        top = info.event.clientY - 220 - 70
        if (top < 86) top = info.event.clientY - 220
      }

      menu.style.top = top.toString() + 'px'
      menu.style.left = left.toString() + 'px'
      menu.style.display = ''
    }
  }

  onSelectDir = (keys: Key[], info: { selected: boolean; nativeEvent: MouseEvent; node: EventDataNode }) => {
    const key = info.node.key
    if (key == 'favorite' || key == 'trash') {
    } else {
      let parent = info.nativeEvent.target as HTMLElement
      for (let i = 0; i < 10; i++) {
        if (parent.nodeName == 'DIV' && parent.className.indexOf('ant-tree-treenode ') >= 0) break
        if (parent.parentElement) parent = parent.parentElement
      }
      const children = parent.children
      for (let i = 0, maxi = children.length; i < maxi; i++) {
        if (children[i].className.indexOf('ant-tree-switcher_close') >= 0) {
          ;(children[i] as HTMLElement).click()
        }
      }
    }
    this.handleSelectPage(key.toString())
  }

  handleSelectPage = (key: string) => {
    this.props.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: key, force: false })
  }

  onExpandDir = (keys: Key[], info: { expanded: boolean; node: EventDataNode }) => {
    this.props.dispatch({ type: 'treedir/aExpandedTree', keys })
  }

  handleTreeShouSuo = () => {
    this.props.dispatch({ type: 'treedir/aExpandedTree', keys: [] })
  }

  throttled = _.throttle(() => {
    const height = document.body.clientHeight - 42 - 44 - 25 - 8
    this.setState({ treeHeight: height })
  }, 200)

  componentDidMount() {
    const height = document.body.clientHeight - 42 - 44 - 25 - 8
    this.setState({ treeHeight: height })
    window.addEventListener('click', onHideClick)
    window.addEventListener('mousewheel', onHideScroll)
    window.addEventListener('resize', this.throttled)
  }
  componentWillUnmount() {
    window.removeEventListener('click', onHideClick)
    window.addEventListener('mousewheel', onHideScroll)
    window.removeEventListener('resize', this.throttled)
  }
  onRowItemDragEnter = (ev: any) => {
    ev.target.parentNode.style.outline = '2px dotted #637dff'
    ev.dataTransfer.dropEffect = 'move'
  }
  onRowItemDragLeave = (ev: any) => {
    ev.target.parentNode.style.outline = 'none'
  }
  onRowItemDragOver = (e: any) => {
    e.preventDefault()
  }

  onRowItemDrop = (ev: any, movetodirid: string) => {
    ev.preventDefault()
    ev.target.parentNode.style.outline = 'none'

    const parentid = this.props.treedir.selectDir.file_id
    if (parentid == 'trash') {
      message.error('回收站内文件不支持移动')
      return
    }
    if (!movetodirid) {
      message.error('没有选择要移动到的位置')
      return
    }
    if (movetodirid == parentid) {
      message.error('不能移动到原位置')
      return
    }
    const userID = UserDAL.QueryUserID()
    const token = UserDAL.GetUserToken(userID)
    if (!token || !token.access_token) {
      message.error('账号失效，操作取消')
      return
    }
    const diridlist: string[] = ['favorite', 'search']
    const fileidlist: string[] = []
    const filenamelist: string[] = []
    const selectedFile = PanDAL.QuerySelectedFileList()
    for (let i = 0, maxi = selectedFile.length; i < maxi; i++) {
      if (selectedFile[i].isdir && diridlist.includes(selectedFile[i].parent_file_id) == false) diridlist.push(selectedFile[i].parent_file_id)
      fileidlist.push(selectedFile[i].file_id)
      filenamelist.push(selectedFile[i].name)
    }

    AliFileCmd.ApiMoveBatch(token.user_id, token.default_drive_id, fileidlist, token.default_drive_id, movetodirid).then((count: Number) => {
      window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true })
      PanStore.DeleteDirFileList(this.props.treedir.selectDir.drive_id, diridlist)

      if (count > 0) message.success('移动文件成功,请稍后手动刷新保存到的文件夹')
    })
  }

  componentDidUpdate() {
    console.log('pageleft updated', PanTreeRef.current)
  }

  render() {
    console.log('pageleft render')

    const { collapsed, sideWidth, treedir } = this.props
    const { treeHeight } = this.state as { treeHeight: number }
    return (
      <div id="pantreeparent" className="pageleft">
        <div style={{ display: collapsed ? '' : 'none' }}>
          <Menu className="leftmenu" mode="inline" selectedKeys={[treedir.selectDir.file_id.startsWith('search') ? 'search' : treedir.selectDir.file_id || 'root']}>
            <Menu.Item key="trash" title={'回收站'} icon={<i className="iconfont icondelete" onClick={() => this.handleSelectPage('trash')} />}></Menu.Item>
            <Menu.Item key="favorite" title={'收藏夹'} icon={<i className="iconfont iconcrown" onClick={() => this.handleSelectPage('favorite')} />}></Menu.Item>
            <Menu.Item key="search" title={'搜索'} icon={<i className="iconfont iconsearch" onClick={() => this.handleSelectPage('search')} />}></Menu.Item>
            <Menu.Item key="root" title={'根目录'} icon={<i className="iconfont iconfolder" />} onClick={() => this.handleSelectPage('root')}></Menu.Item>
          </Menu>
        </div>
        <div className="headdesc">
          网盘里的文件
          <Button type="link" className="treeshousuo" onClick={this.handleTreeShouSuo}>
            <i className="iconfont iconshousuo1" />
            收缩
          </Button>
        </div>
        <div id="pantree" className="pantree" style={{ display: collapsed ? 'none' : '' }}>
          <div id="pantree2" className="pantree2">
            <Tree
              ref={PanTreeRef}
              blockNode
              style={{ width: sideWidth.toString() + 'px' }}
              height={treeHeight}
              selectedKeys={[treedir.selectDir.file_id.startsWith('search-') ? 'search' : treedir.selectDir.file_id]}
              showIcon={true}
              switcherIcon={<i className="iconfont Arrow" />}
              treeData={treedir.treeData}
              expandedKeys={treedir.treeExpandedKeys}
              onSelect={this.onSelectDir}
              onExpand={this.onExpandDir}
              onRightClick={this.onRightClick}
              titleRender={(nodeData: any) => {
                return (
                  <span className={'treedragnode '} onDrop={(ev) => this.onRowItemDrop(ev, nodeData.key)} onDragOver={this.onRowItemDragOver} onDragEnter={this.onRowItemDragEnter} onDragLeave={this.onRowItemDragLeave}>
                    {nodeData.title}
                  </span>
                )
              }}></Tree>

            <div id="pantreemenu" className="pantreemenu ant-dropdown" style={{ display: 'none' }}>
              <Menu mode="vertical" selectedKeys={[]} prefixCls="ptm ant-dropdown-menu">
                <Menu.Item key="xiazai" icon={<i className="iconfont icondownload" />} onClick={() => DownloadPan(true, false)}>
                  下载
                </Menu.Item>
                <Menu.Item key="fenxiang" icon={<i className="iconfont iconfenxiang" />} onClick={() => menuShareSelectFile(true)}>
                  分享
                </Menu.Item>
                <Menu.Item key="shoucang" onClick={() => menuFavSelectFile(true, true)} icon={<i className="iconfont iconcrown" />}>
                  加收藏
                </Menu.Item>
                <Menu.Item key="rename" icon={<i className="iconfont iconedit-square" />} onClick={() => ShowRenameSingleModal(true)}>
                  重命名
                </Menu.Item>
                <Menu.Item key="xiangqing" icon={<i className="iconfont iconinfo_circle" />} onClick={() => menuInfoSelectFile(true)}>
                  详情
                </Menu.Item>

                {FileCopyMenu(true, this.props.treedir.selectDir.drive_id)}
                {FileColorMenu(true)}

                <Menu.Item danger key="shanchudao1" icon={<i className="iconfont icondelete" />} onClick={() => menuTrashSelectFile(true)}>
                  放入回收站
                </Menu.Item>
              </Menu>
            </div>

            <Dropdown overlay={<Menu />}>
              <span></span>
            </Dropdown>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(({ treedir }: { treedir: TreeDirModelState }) => ({
  treedir
}))(PanLeft)
