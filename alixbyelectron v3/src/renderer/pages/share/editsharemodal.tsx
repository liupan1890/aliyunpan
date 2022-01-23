import { FolderIcon } from '@/components/folder'

import UserDAL from '@/store/userdal'
import { Button, DatePicker, Divider, Input, message, Modal, Popover, Space } from 'antd'
import Tree, { DataNode, EventDataNode } from 'antd/lib/tree'
import moment from 'moment'
import React, { Key } from 'react'
import { AutoSizer } from 'react-virtualized'
import locale from 'antd/es/date-picker/locale/zh_CN'
import { IShareLinkModel } from '@/store/models'
import AliShare from '@/aliapi/share'
import SettingLog from '@/setting/settinglog'

export function ShowEditShareModal(canedit: boolean, files: IShareLinkModel[]) {
  AliShare.ApiGetShareToken(files[0].share_id, files[0].share_pwd)
    .then((sharetoken) => {
      if (sharetoken.startsWith('，')) {
        message.error(sharetoken.substring(1))
        sharetoken = ''
      }

      const model = Modal.info({
        closable: true,
        centered: true,
        className: 'dialogmodal editsharemodal',
        icon: undefined,
        autoFocusButton: undefined,
        width: '80vw',
        style: { maxWidth: '540px', paddingBottom: '0', height: files.length == 1 ? '80vh' : 'auto' }
      })

      model.update({
        title:
          files.length == 1 ? (
            <>
              <span className="sharetime">[{files[0].share_msg}]</span>
              <span className="sharetitle">{files[0].share_name}</span>
            </>
          ) : (
            '批量更新分享链接'
          ),
        content: (
          <div className="editshare">
            <EditShare canedit={canedit} files={files} sharetoken={sharetoken} model={model} />
          </div>
        )
      })
    })
    .catch((e: any) => {
      message.error(e.message)
    })
}

class EditShare extends React.Component<
  { canedit: boolean; sharetoken: string; files: IShareLinkModel[]; model: { destroy: () => void; update: (configUpdate: any) => void } },
  {
    share_id: string
    share_url: string
    expiration: string
    share_pwd: string
    share_name: string
    open: boolean
  }
> {
  constructor(props: any) {
    super(props)
    const share = this.props.files[0]
    this.state = {
      share_id: share.share_id,
      share_url: 'https://www.aliyundrive.com/s/' + share.share_id + (share.share_pwd ? ' 提取码：' + share.share_pwd : ''),
      expiration: share.expiration ? new Date(share.expiration).toString() : '',
      share_pwd: share.share_pwd,
      share_name: share.share_name,
      open: false
    }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'EditShare' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }

  componentDidMount() {}
  componentWillUnmount() {}
  handleOk = () => {
    const UserID = UserDAL.QueryUserID()
    const token = UserDAL.GetUserToken(UserID)
    if (!token || !token.access_token) {
      message.error('账号失效，操作取消')
      return
    }
    let expiration = this.state.expiration
    let mindate = new Date()
    mindate.setMinutes(mindate.getMinutes() + 2)
    if (expiration) expiration = new Date(expiration) < mindate ? mindate.toISOString() : new Date(expiration).toISOString()
    else expiration = ''

    let share_pwd = this.state.share_pwd.trim().replaceAll(' ', '')
    if (share_pwd.length != 4 && share_pwd.length != 0) {
      message.error('提取码必须为 空 或者 4位 数字字母汉字特殊字符的组合')
      return
    }
    let share_name = this.state.share_name.trim().replaceAll('"', '')
    share_name = share_name.replace(/[<>\:"\\\|\?\*]+/g, '')
    share_name = share_name.replace(/[\f\n\r\t\v]/g, '')
    while (share_name.endsWith(' ') || share_name.endsWith('.')) share_name = share_name.substring(0, share_name.length - 1)

    if (share_name.length < 1) {
      message.error('必须填写名称')
      return
    }
    const files = this.props.files
    const idlsit: string[] = []
    const explsit: string[] = []
    const pwdlsit: string[] = []
    let namelsit: string[] | undefined = []
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      idlsit.push(files[i].share_id)
      explsit.push(expiration)
      pwdlsit.push(share_pwd)
      namelsit.push(share_name)
    }

    if (this.props.files.length > 1) {
      namelsit = undefined
    }
    AliShare.ApiUpdateShareBatch(UserID, idlsit, explsit, pwdlsit, namelsit).then((data) => {
      window.getDvaApp()._store.dispatch({ type: 'share/aRefresh' }) //更新不用等待

      if (this.props.files.length > 1) {
        if (data == this.props.files.length) message.success('批量修改分享链接成功')
        else message.error('批量修改分享链接成功 {' + data.toString() + '} 失败 {' + (this.props.files.length - data).toString() + '}')
        this.props.model.destroy()
      } else {
        if (data == 1) {
          message.success('更新一条分享链接成功')
          this.setState({ share_url: 'https://www.aliyundrive.com/s/' + this.state.share_id + (share_pwd ? ' 提取码：' + share_pwd : '') })
          this.props.model.destroy()
        } else message.error('更新一条分享链接失败')
      }
    })
  }

  handleTime = (hours: number) => {
    if (hours == 0) this.setState({ expiration: '', open: false })
    else {
      let mindate = new Date()
      mindate.setHours(mindate.getHours() + hours, mindate.getMinutes() + 2)
      this.setState({ expiration: mindate.toISOString(), open: false })
    }
  }

  handleCopy = () => {
    window.Electron.clipboard.writeText(this.state.share_name + '\n' + this.state.share_url, 'clipboard')
    message.success('分享链接已复制到剪切板')
  }
  handleLink = () => {
    window.Electron.shell.openExternal('https://www.aliyundrive.com/s/' + this.state.share_id)
    if (this.state.share_pwd) {
      window.Electron.clipboard.writeText(this.state.share_pwd, 'clipboard')
      message.success('提取码已复制到剪切板')
    }
  }

  render() {
    return (
      <>
        <div className="sharelinkcopy" style={{ display: this.props.files.length == 1 ? '' : 'none' }}>
          <a title="单击打开" onClick={this.handleLink} style={{ margin: '0', whiteSpace: 'pre', maxWidth: 'calc(100% - 80px)', overflow: 'hidden', display: 'inline-block', textOverflow: 'ellipsis' }}>
            {this.state.share_url}
          </a>
          <Button type="primary" size="small" onClick={this.handleCopy}>
            复制链接
          </Button>
        </div>
        <Divider style={{ display: this.props.files.length == 1 ? '' : 'none', marginBottom: '16px' }}></Divider>
        <div className="flex flexnoauto" style={{ margin: '0 0 8px 0', display: this.props.files.length == 1 ? '' : 'none' }}>
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <span style={{ paddingLeft: '2px', paddingRight: '8px' }}>名称</span>
            <Input minLength={1} style={{ width: '100%' }} disabled={this.props.canedit == false} value={this.state.share_name} placeholder="不能为空" onChange={(e) => this.setState({ share_name: e.target.value })} />
          </Space>
        </div>
        <div className="flex flexnoauto" style={{ margin: '0 0 16px 0' }}>
          <Space direction="vertical" size={0}>
            <span style={{ paddingLeft: '2px' }}>有效期</span>
            <DatePicker
              className="ShareDatePicker"
              allowClear={false}
              showTime
              showNow={false}
              value={this.state.expiration ? moment(new Date(this.state.expiration), 'YYYY/MM/DD HH:mm:ss') : undefined}
              placeholder="永久有效"
              format={'YYYY/MM/DD HH:mm:ss'}
              locale={locale}
              open={this.state.open}
              disabled={this.props.canedit == false}
              onChange={(e) => {
                this.setState({ expiration: e?.toISOString(true) || '', open: false })
              }}
              onOpenChange={(val) => {
                this.setState({ open: val })
              }}
              renderExtraFooter={() => (
                <Space>
                  <Button key="td0" type="primary" size="small" onClick={(e) => this.handleTime(0)}>
                    永久有效
                  </Button>
                  <Button key="td1" type="primary" size="small" onClick={(e) => this.handleTime(3)}>
                    3小时
                  </Button>
                  <Button key="td2" type="primary" size="small" onClick={(e) => this.handleTime(24)}>
                    一天
                  </Button>
                  <Button key="td3" type="primary" size="small" onClick={(e) => this.handleTime(72)}>
                    三天
                  </Button>
                  <Button key="td4" type="primary" size="small" onClick={(e) => this.handleTime(168)}>
                    一周
                  </Button>
                  <Button key="td5" type="primary" size="small" onClick={(e) => this.handleTime(336)}>
                    两周
                  </Button>
                  <Button key="td6" type="primary" size="small" onClick={(e) => this.handleTime(720)}>
                    一月
                  </Button>
                </Space>
              )}
            />
          </Space>
          <div style={{ margin: '0 16px' }}></div>
          <Space direction="vertical" size={0}>
            <span style={{ paddingLeft: '2px' }}>提取码</span>
            <Input minLength={4} maxLength={4} style={{ maxWidth: '100px' }} disabled={this.props.canedit == false} value={this.state.share_pwd} placeholder="没有不填" onChange={(e) => this.setState({ share_pwd: e.target.value })} />
          </Space>
          <Space direction="vertical" size={0}>
            <span style={{ paddingLeft: '2px' }}></span>
            <Popover
              content={
                <div>
                  <span className="opred">名称</span> <span className="oporg">必填</span>：<br />
                  分享链接显示的名称，默认为的分享的第一个文件的名称
                  <hr />
                  <span className="opred">有效期</span> <span className="oporg">1分钟--永远有效</span>：<br />
                  分享链接的有效期，过期后此链接无法被访问，
                  <br />
                  但可以重新修改此链接的有效期，使链接恢复可用
                  <hr />
                  <span className="opred">提取码</span> <span className="oporg">空 / 4位数字字母汉字特殊字符</span>：<br />
                  提取码可以重复修改，只有使用最新的正确的提取码才可以访问该分享链接
                </div>
              }>
              <i className="iconfont iconbulb" />
            </Popover>
          </Space>
          <div className="flexauto"></div>
          <div style={{ margin: '0 16px' }}></div>
          <Space direction="vertical" size={0}>
            <span style={{ paddingLeft: '2px' }}></span>
            <Button type="primary" onClick={this.handleOk} style={{ display: this.props.canedit ? '' : 'none' }}>
              更新
            </Button>
          </Space>
        </div>
        {this.props.files.length == 1 ? (
          <ShareLinkTree shareid={this.props.files[0].share_id} sharetoken={this.props.sharetoken} />
        ) : (
          <Space>
            <div>
              <span className="oporg">注意：</span>会更新选中的<span className="opblue"> {this.props.files.length} </span>条分享链接的有效期和提取码
            </div>
          </Space>
        )}
      </>
    )
  }
}

interface DataNode2 extends DataNode {
  isdir: boolean
  size: number
  sizestr: string
  time: number
  timestr: string
}

class ShareLinkTree extends React.Component<{ shareid: string; sharetoken: string }, { fileloading: boolean; punished_file_count: number; initTreeData: DataNode[] }> {
  constructor(props: any) {
    super(props)
    this.state = {
      fileloading: true,
      punished_file_count: 0,
      initTreeData: [{ title: 'aliyundrive.com/s/' + this.props.shareid, key: 'root', icon: <i className="iconfont iconlink2" />, isLeaf: false }]
    }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'ShareLinkTree' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }

  componentDidMount() {}
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return
    }
  }

  onLoadData = ({ key }: any) => {
    return new Promise<void>((resolve) => {
      if (!this.props.sharetoken) {
        resolve()
        return
      }

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
                sizestr: item.isdir ? '' : item.sizestr,
                time: item.time,
                timestr: item.timestr,
                icon: <i className={'iconfont ' + item.icon} />
              })
            }
            if (key == 'root') this.setState({ punished_file_count: resp.punished_file_count || 0 })
            this.setState({ initTreeData: this.updateTreeData(this.state.initTreeData, key, addlist) })
          } else {
            message.error(resp.next_marker)
          }
          this.setState({ fileloading: false })
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

  render() {
    return (
      <div className="sharetree flexauto">
        <div className="sharetree2">
          <AutoSizer>
            {({ width, height }: { width: number; height: number }) => {
              return (
                <Tree
                  blockNode
                  style={{ width: width + 'px' }}
                  height={height}
                  //showLine={{ showLeafIcon: false }}
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
    )
  }
}
