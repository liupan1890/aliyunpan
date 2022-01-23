import { IShareInfoModel } from '@/aliapi/models'
import AliShare from '@/aliapi/share'
import { FolderIcon } from '@/components/folder'
import SettingLog from '@/setting/settinglog'
import { humanSize } from '@/store/format'

import ShareDAL from '@/store/sharedal'
import { Button, message, Modal, Tooltip } from 'antd'
import Tree, { DataNode, EventDataNode } from 'antd/lib/tree'
import TreeC from 'rc-tree/lib/Tree'
import React, { Key } from 'react'
import { AutoSizer } from 'react-virtualized'
import { ShowSaveShareModal } from './sharelinksavemodal'

export function ShowShareTreeModal(userID: string, shareid: string, password: string, sharetoken: string) {
  const modal = Modal.info({
    closable: true,
    centered: true,
    className: 'dialogmodal sharelinkmodal',
    icon: undefined,
    autoFocusButton: undefined,
    width: '80vw',
    style: { maxWidth: '740px', paddingBottom: '0', height: '80vh' }
  })

  modal.update({
    title: '导入',
    content: (
      <div className="editshare">
        <ShareLinkTree userID={userID} shareid={shareid} password={password} sharetoken={sharetoken} modal={modal} />
      </div>
    )
  })
}

export interface CheckNode {
  file_id: string
  name: string
  halfChecked: boolean
  children: CheckNode[]
}
export interface DataNode2 extends DataNode {
  isdir: boolean
  size: number
  sizestr: string
  time: number
  timestr: string
}
function getCheckNode(list: DataNode[], checkedMap: Map<string, boolean>, halfCheckedMap: Map<string, boolean>) {
  const selectnodes: CheckNode[] = []
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    const item = list[i]
    const key = list[i].key.toString()
    if (checkedMap.has(key)) {
      checkedMap.delete(key)
      selectnodes.push({ file_id: key, name: item.title!.toString(), halfChecked: false, children: [] })
    } else if (item.children && item.children.length > 0) {
      if (halfCheckedMap.has(key)) {
        halfCheckedMap.delete(key)
        const child = getCheckNode(item.children, checkedMap, halfCheckedMap)
        selectnodes.push({ file_id: key, name: item.title!.toString(), halfChecked: true, children: child })
      }
    }
  }
  return selectnodes
}

function getCheckNode2(list: DataNode[], checkedMap: Map<string, boolean>, halfCheckedMap: Map<string, boolean>) {
  const selectnodes: CheckNode[] = []
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    const item = list[i]
    const key = list[i].key.toString()
    if (checkedMap.has(key)) {
      checkedMap.delete(key)
      selectnodes.push({ file_id: key, name: item.title!.toString(), halfChecked: false, children: [] })
    } else if (item.children && item.children.length > 0) {
      if (halfCheckedMap.has(key)) {
        halfCheckedMap.delete(key)
        const child = getCheckNode2(item.children, checkedMap, halfCheckedMap)
        for (let j = 0, maxj = child.length; j < maxj; j++) {
          selectnodes.push(child[j])
        }
      }
    }
  }
  return selectnodes
}

function getCheckNodeSize(check: { file: number; dir: number; size: number }, list: DataNode[], checkedMap: Map<string, boolean>) {
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    const item = list[i] as DataNode2
    const key = list[i].key.toString()
    if (checkedMap.has(key)) {
      checkedMap.delete(key)
      if (item.isdir) {
        check.dir++
      } else {
        check.file++
        check.size += item.size
      }
    }
    if (item.children && item.children.length > 0) {
      getCheckNodeSize(check, item.children, checkedMap)
    }
  }
}

class ShareLinkTree extends React.Component<
  { userID: string; shareid: string; password: string; sharetoken: string; modal: { destroy: () => void; update: (configUpdate: any) => void } },
  { fileloading: boolean; display_name: string; expiration: string; checkedinfo: string; shareinfo: IShareInfoModel | undefined; initTreeData: DataNode[] }
> {
  constructor(props: any) {
    super(props)
    this.state = {
      fileloading: true,
      display_name: 'Loading...',
      expiration: '',
      checkedinfo: '',
      shareinfo: undefined,
      initTreeData: [{ title: '分享链接 ' + this.props.shareid, key: 'root', icon: FolderIcon, isLeaf: false }]
    }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'ShareLinkTree' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }

  componentDidMount() {
    AliShare.ApiGetShareAnonymous(this.props.shareid).then((info) => {
      if (info.error == '') {
        let expiration = '永久有效'
        if (info.shareinfo.expiration != '' && info.shareinfo.expiration != '-1') {
          let d1 = new Date(info.shareinfo.expiration)
          let d2 = new Date()
          const date = Math.floor((d1.getTime() - d2.getTime()) / 1000)
          if (date < 0) expiration = '过期已失效'
          else if (date < 60) expiration = '即将过期(' + date + '秒后)'
          else if (date < 3600) expiration = '即将过期(' + Math.floor(date / 60) + '分钟后)'
          else if (date < 3600 * 24) expiration = '即将过期(' + Math.floor(date / 3600) + '小时后)'
          else expiration = Math.floor(date / 3600 / 24) + '天后过期'
        }
        this.setState({ display_name: info.shareinfo.display_name, expiration: expiration, shareinfo: info })
      } else {
        this.setState({ display_name: info.error, expiration: '' })
      }
    })
  }
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return
    }
  }

  handleOk = (saveby: string) => {
    if (this.state.fileloading) return

    ShareDAL.SaveOtherShare(this.props.password, this.state.shareinfo!, true)

    const checkedKeys = this.CMTreeRef.current?.state.checkedKeys!
    const checkedMap = new Map<string, boolean>()
    for (let i = 0, maxi = checkedKeys.length; i < maxi; i++) {
      checkedMap.set(checkedKeys[i].toString(), true)
    }
    const halfCheckedKeys = this.CMTreeRef.current?.state.halfCheckedKeys!
    const halfCheckedMap = new Map<string, boolean>()
    for (let i = 0, maxi = halfCheckedKeys.length; i < maxi; i++) {
      halfCheckedMap.set(halfCheckedKeys[i].toString(), true)
    }

    const treeData = this.CMTreeRef.current?.state.treeData[0].children!
    let selectnodes: CheckNode[] = []

    if (saveby == 'all') {
      for (let i = 0, maxi = treeData.length; i < maxi; i++) {
        const item = treeData[i]
        selectnodes.push({ file_id: item.key.toString(), name: item.title!.toString(), halfChecked: false, children: [] })
      }
    } else if (saveby == 'select2') {
      selectnodes = getCheckNode2(treeData, checkedMap, halfCheckedMap)
    } else {
      selectnodes = getCheckNode(treeData, checkedMap, halfCheckedMap)
    }
    this.props.modal.destroy()
    ShowSaveShareModal(this.props.userID, this.props.shareid, this.props.sharetoken, selectnodes)
  }

  handleCancel = () => {
    this.props.modal.destroy()
  }

  onLoadData = ({ key }: any) => {
    return new Promise<void>((resolve) => {
      this.setState({ fileloading: true })
      AliShare.ApiShareFileList(this.props.shareid, this.props.sharetoken, key)
        .then((resp) => {
          if (!resp.next_marker) {
            const addlist: DataNode2[] = []
            for (let i = 0, maxi = resp.items.length; i < maxi; i++) {
              const item = resp.items[i]
              addlist.push({
                title: item.name,
                key: item.file_id,
                isLeaf: !item.isdir,
                isdir: item.isdir,
                size: item.size,
                sizestr: item.sizestr,
                time: item.time,
                timestr: item.timestr,
                icon: <i className={'iconfont ' + item.icon} />
              })
            }
            this.setState({ initTreeData: this.updateTreeData(this.state.initTreeData, key, addlist) })
          } else {
            message.error(resp.next_marker)
          }
        })
        .catch(() => {})
        .then(() => {
          this.setState({ fileloading: false })
          resolve()
        })
    })
  }

  updateTreeData(list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] {
    const rlist: DataNode[] = []
    for (let i = 0, maxi = list.length; i < maxi; i++) {
      let node = list[i]
      if (node.key === key) {
        const chd = node.children
        if (chd) {
          const chdmap = new Map<string | number, DataNode[]>()
          for (let j = 0, maxj = chd.length; j < maxj; j++) {
            if (chd[j].children) chdmap.set(chd[j].key, chd[j].children!)
          }
          for (let j = 0, maxj = children.length; j < maxj; j++) {
            children[j].children = chdmap.get(children[j].key)
          }
        }
        rlist.push({ ...node, children })
        children = []
      } else if (node.children) {
        rlist.push({ ...node, children: this.updateTreeData(node.children, key, children) })
      } else {
        rlist.push(node)
      }
    }
    return rlist
  }
  onSelectDir = (keys: Key[], info: { selected: boolean; nativeEvent: MouseEvent; node: EventDataNode }) => {
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
  onCheck = (keys: any, info: any) => {
    const checkedKeys = keys
    const checkedMap = new Map<string, boolean>()
    for (let i = 0, maxi = checkedKeys.length; i < maxi; i++) {
      checkedMap.set(checkedKeys[i].toString(), true)
    }
    const treeData = this.CMTreeRef.current?.state.treeData[0].children!
    const check = { file: 0, dir: 0, size: 0 }
    getCheckNodeSize(check, treeData, checkedMap)

    this.setState({ checkedinfo: '已勾选: ' + check.dir.toString() + '个文件夹 ' + check.file.toString() + '个文件 ' + humanSize(check.size) })
  }
  CMTreeRef = React.createRef<TreeC>()
  render() {
    return (
      <>
        <div className="flex flexnoauto">
          <div id="shareinfo">{this.state.display_name}</div>
          <div className="flexauto"></div>
          <div id="sharetime">{this.state.expiration}</div>
        </div>
        <div className="sharetree flexauto">
          <div className="sharetree2">
            <AutoSizer>
              {({ width, height }: { width: number; height: number }) => {
                return (
                  <Tree
                    ref={this.CMTreeRef}
                    checkable
                    blockNode
                    style={{ width: width + 'px' }}
                    height={height}
                    showIcon={true}
                    switcherIcon={<i className="iconfont Arrow" />}
                    loadData={this.onLoadData}
                    treeData={this.state.initTreeData}
                    onSelect={this.onSelectDir}
                    defaultExpandParent={true}
                    defaultExpandedKeys={['root']}
                    titleRender={(nodeData: any) => {
                      return (
                        <>
                          <span className="sharetitleleft">{nodeData.title}</span>
                          <span className="sharetitleright">{nodeData.sizestr}</span>
                        </>
                      )
                    }}
                  />
                )
              }}
            </AutoSizer>
          </div>
        </div>
        <div className="flex flexnoauto" style={{ margin: '16px 0 0 0' }}>
          <div id="selectinfo">{this.state.checkedinfo}</div>
          <div className="flexauto"></div>
          <Button key="back" onClick={this.handleCancel}>
            取消
          </Button>
          <div style={{ margin: '0 6px' }}></div>
          <Tooltip overlay={'网页版模式,选中的文件全部保存到一个文件夹,丢掉分享链接内部路径'}>
            <Button loading={this.state.fileloading} onClick={() => this.handleOk('select2')}>
              直接保存勾选的
            </Button>
          </Tooltip>
          <div style={{ margin: '0 6px' }}></div>
          <Tooltip overlay={'按照分享链接内部的完整路径保存'}>
            <Button loading={this.state.fileloading} type="primary" onClick={() => this.handleOk('select')}>
              按路径保存勾选的
            </Button>
          </Tooltip>
          <div style={{ margin: '0 6px' }}></div>
          <Tooltip overlay={'无视勾选状态，保存整个分享链接内全部文件'}>
            <Button loading={this.state.fileloading} type="primary" onClick={() => this.handleOk('all')}>
              一键保存全部
            </Button>
          </Tooltip>
        </div>
      </>
    )
  }
}
