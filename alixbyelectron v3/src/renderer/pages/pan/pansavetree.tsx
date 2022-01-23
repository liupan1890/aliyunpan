import { FolderIcon } from '@/components/folder'
import PanDAL from '@/store/pandal'

import UserDAL from '@/store/userdal'
import { Button, message } from 'antd'
import Tree, { DataNode, EventDataNode } from 'antd/lib/tree'
import React, { Key } from 'react'
import { AutoSizer } from 'react-virtualized'
import TreeC from 'rc-tree/lib/Tree'
import { ShowCreatNewDirModal } from './creatnewdirmodal'
import { IAliGetDirModel } from '@/aliapi/models'
import SettingLog from '@/setting/settinglog'
import PanStore from '@/store/panstore'
import AliFileList from '@/aliapi/filelist'

export class PanSaveTree extends React.Component<{ userID: string; driveID: string; StorageKey: string; callback: any }, { select: IAliGetDirModel; InitTreeData: DataNode[]; ExpandedKeys: string[]; SelectedKeys: string[] }> {
  constructor(props: any) {
    super(props)
    const defaultid = localStorage.getItem(this.props.StorageKey) || ''
    const ExpandedKeys: string[] = []
    let SelectedKeys: string[] = []
    let InitTreeData = [{ title: '根目录', key: 'root', icon: FolderIcon }]

    const dirpath = PanStore.GetDirPath(this.props.driveID, defaultid)
    for (let i = 0, maxi = dirpath.length; i < maxi; i++) {
      ExpandedKeys.push(dirpath[i].file_id)
      SelectedKeys = [dirpath[i].file_id]
    }
    if (ExpandedKeys.includes('root') == false) ExpandedKeys.push('root')
    if (SelectedKeys.includes('root') == false) SelectedKeys.push('root')

    let dir = PanStore.GetDir(this.props.driveID, defaultid)
    if (!dir.file_id) dir = PanStore.GetDir(this.props.driveID, 'root')
    this.state = { select: dir, InitTreeData, ExpandedKeys, SelectedKeys }

    this.onLoadDataList(dirpath).then(() => {
      this.CMTreeRef.current?.setExpandedKeys(ExpandedKeys)
      setTimeout(() => {
        this.CMTreeRef.current?.scrollTo({ key: ExpandedKeys[ExpandedKeys.length - 1], offset: 100 })
      }, 200)
    })
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'ShareSave' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }

  componentDidMount() {
    let doc = document.getElementById('selectdir')
    if (doc) doc.innerText = '已选择：' + this.state.select.name
  }
  componentWillUnmount() {}

  handleOk = async () => {
    const movetodirid = this.state.select.file_id
    if (!movetodirid) {
      message.error('没有选择要保存到的位置')
      return
    }
    this.props.callback(movetodirid)
  }
  handleCancel = () => {
    this.props.callback(undefined)
  }

  handleCallBack = () => {
    this.onLoadData({ key: this.state.select.file_id })
  }
  onLoadDataList = async (list: IAliGetDirModel[]): Promise<void> => {
    if (list.length == 0) return Promise.resolve()
    await this.onLoadData({ key: list[0].file_id }).catch(() => {})
    list.splice(0, 1)
    return this.onLoadDataList(list)
  }

  onLoadData = ({ key }: any) => {
    return new Promise<void>((resolve) => {
      AliFileList.ApiFileListForCopy(this.props.userID, this.props.driveID, key, 'name ASC', '', true)
        .then((data) => {
          const addlist: DataNode[] = []
          for (let i = 0, maxi = data.items.length; i < maxi; i++) {
            const item = data.items[i]
            addlist.push({ title: item.name, key: item.file_id, icon: FolderIcon })
          }
          this.setState({ InitTreeData: this.updateTreeData(this.state.InitTreeData, key, addlist) })
        })
        .catch(() => {})
        .then(() => {
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
    const key = info.node.key.toString()
    const dir = PanStore.GetDir(this.props.driveID, key)
    this.setState({ select: dir })
    localStorage.setItem(this.props.StorageKey, dir.file_id)
    let doc = document.getElementById('selectdir')
    if (doc) doc.innerText = '已选择：' + (info.node.title?.toString() || '')
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

  CMTreeRef = React.createRef<TreeC>()
  render() {
    const drivrID = PanDAL.QuerySelectDir().drive_id
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div id="dirtree" className="pantree">
          <div id="dirtree2">
            <AutoSizer>
              {({ width, height }: { width: number; height: number }) => {
                return (
                  <Tree
                    ref={this.CMTreeRef}
                    style={{ width: width + 'px' }}
                    height={height}
                    blockNode
                    showIcon={true}
                    switcherIcon={<i className="iconfont Arrow" />}
                    loadData={this.onLoadData}
                    treeData={this.state.InitTreeData}
                    onSelect={this.onSelectDir}
                    defaultExpandParent={true}
                    defaultExpandedKeys={this.state.ExpandedKeys}
                    defaultSelectedKeys={this.state.SelectedKeys}
                    titleRender={(nodeData: any) => {
                      return <span>{nodeData.title}</span>
                    }}
                  />
                )
              }}
            </AutoSizer>
          </div>
        </div>
        <div id="selectdir" className="flex">
          已选择：
        </div>
        <div className="flex">
          <Button key="newfolderbtn" onClick={(e) => ShowCreatNewDirModal('newfolderbtn', this.state.select.drive_id, this.state.select.file_id, this.handleCallBack)}>
            新建文件夹
          </Button>
          <div className="flexauto"></div>

          <Button key="back" onClick={this.handleCancel}>
            取消
          </Button>
          <div style={{ margin: '0 6px' }}></div>
          <Button type="primary" onClick={this.handleOk}>
            保存
          </Button>
        </div>
      </div>
    )
  }
}
