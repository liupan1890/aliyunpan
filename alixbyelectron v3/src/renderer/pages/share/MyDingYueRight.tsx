import { IAliShareItem } from '@/aliapi/models'
import SettingLog from '@/setting/settinglog'

import ShareDAL from '@/store/sharedal'
import { Alert, Button, Card, Menu, Dropdown, List, Popover, Tooltip, message, Modal, Badge, AutoComplete, Input } from 'antd'
import React from 'react'
import { AutoSizer, List as VList } from 'react-virtualized'
import { connect, ShareModelState } from 'umi'
import { ShowEditShareModal } from './editsharemodal'
import './share.css'
import { topCopyShareLink, topDeleteShare, topEditShareLink } from './sharemenu'

function focusList() {
  let find = document.getElementsByClassName('ReactVirtualized__Grid')
  if (find && find.length > 0) {
    let doc = find[0] as HTMLElement
    doc.focus()
  }
}

class MyDingYueRight extends React.Component<{ share: ShareModelState; dispatch: any }, { searchKeys: { value: string }[]; searchKey: string; isSearch: boolean }> {
  constructor(props: any) {
    super(props)
    this.state = { searchKeys: [], searchKey: '', isSearch: false }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'MyDingYueRight' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  componentDidMount() {
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('keydown', this.onKeyDown)

    focusList()
  }
  componentWillUnmount() {
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('keydown', this.onKeyDown)
  }
  onKeyDown = (event: any) => {
    if (event.code == 'Space') {
      event.preventDefault()
    }
  }
  onKeyUp = (event: any) => {
    if (document.getElementsByClassName('ant-modal-root').length > 0) return
    if (window.getDvaApp()._store.getState().global.currentPage !== 'MyShareRight') return

    if (event.code == 'KeyF' && event.ctrlKey) {
      event.stopPropagation()
      event.preventDefault()
      if (this.props.share.selectedShares.size > 0) this.props.dispatch({ type: 'share/mChangSelectedShare', file_id: '', ctrl: false, shift: false })
      this.inputSearchInputRef.current?.focus()
      this.inputSearchInputRef.current?.select()
      return
    }

    if (event.code == 'F5' || (event.code == 'KeyR' && event.ctrlKey)) {
      event.stopPropagation()
      event.preventDefault()
      this.props.dispatch({ type: 'share/aRefresh' })
      return
    }

    if (event.code == 'F2') {
      event.stopPropagation()
      event.preventDefault()

      const filelist = ShareDAL.QuerySelectedShareList()
      if (filelist.length > 1) {
        ShowEditShareModal(true, filelist)
      } else if (filelist.length == 1) {
        ShowEditShareModal(true, [filelist[0]])
      }
      return
    }

    if (event.target && event.target.nodeName == 'INPUT') return

    if (event.code == 'Enter') {
      event.stopPropagation()
      event.preventDefault()

      const filelist = ShareDAL.QuerySelectedShareList()
      if (filelist.length > 1) {
        ShowEditShareModal(true, filelist)
      } else if (filelist.length == 1) {
        ShowEditShareModal(true, [filelist[0]])
      }
      return
    }

    if (event.code == 'Space') {
      event.stopPropagation()
      event.preventDefault()
      if (this.props.share.selectedShares.size > 0) this.props.dispatch({ type: 'share/mChangSelectedShare', file_id: '', ctrl: false, shift: false })
      this.inputSearchInputRef.current?.focus()
      this.inputSearchInputRef.current?.select()
      return
    }

    if (event.code == 'Escape') {
      event.stopPropagation()
      event.preventDefault()
      this.props.dispatch({ type: 'share/mChangSelectedShare', file_id: '', ctrl: false, shift: false })
      return
    }

    if (event.code == 'KeyA' && event.ctrlKey) {
      this.props.dispatch({ type: 'share/mChangSelectedShare', file_id: 'all', ctrl: false, shift: false })
      return
    }
  }
  onSelectAll = () => {
    this.props.dispatch({ type: 'share/mChangSelectedShare', file_id: 'all', ctrl: false, shift: false })
  }
  onSelectFile = (event: any, share_id: string, ctrl: boolean) => {
    event.stopPropagation()
    this.props.dispatch({ type: 'share/mChangSelectedShare', file_id: share_id, ctrl: ctrl || event.ctrlKey, shift: event.shiftKey })
  }
  onDelete = (delby: string) => {
    message.info('此版本暂不支持')
  }

  onOpenFile = (event: any, file: IAliShareItem) => {
    event.stopPropagation()
    event.preventDefault()
    this.props.dispatch({
      type: 'share/mChangSelectedShare',
      file_id: file.share_id,
      ctrl: false,
      shift: false,
      forceselect: true
    })
    ShowEditShareModal(true, [file])
  }

  handleRefresh = () => {
    this.setState({ searchKey: '', isSearch: false })
    this.props.dispatch({ type: 'share/aRefresh' })
    focusList()
  }

  handleOrder = (orderby: string) => {
    this.props.dispatch({ type: 'share/mOrderbyShare', orderby })
    focusList()
  }

  inputSearchRef = React.createRef<any>()
  inputSearchInputRef = React.createRef<Input>()
  handleSearchFile = (key: string) => {
    setTimeout(() => {
      this.inputSearchInputRef.current?.blur()
      focusList()
    }, 50)
    const list: { value: string }[] = []
    if (key != '') list.push({ value: key })
    const oldlist = this.state.searchKeys
    const check: { [key: string]: boolean } = { [key]: true }
    for (let i = 0, maxi = oldlist.length; i < maxi && i < 10; i++) {
      if (!check[oldlist[i].value]) {
        list.push(oldlist[i])
        check[oldlist[i].value] = true
      }
    }
    this.setState({ searchKeys: list, isSearch: true })
    this.props.dispatch({ type: 'share/mSearchShare', key: key })
  }
  renderItem = ({ index, key, style }: { index: number; key: string; style: any }) => {
    try {
      const share = this.props.share
      const item = share.ShareListShow[index]

      return (
        <div key={'msl' + index} style={style} className={'fileitem ' + (share.selectedShares.has(item.share_id) ? ' selected ' : '')} onClick={(e) => this.onSelectFile(e, item.share_id, false)}>
          <div style={{ margin: '2px' }}>
            <Button
              tabIndex={-1}
              title={index.toString()}
              shape="circle"
              className="select"
              onClick={(e) => this.onSelectFile(e, item.share_id, true)}
              icon={<i className={share.selectedShares.has(item.share_id) ? 'iconfont iconrsuccess' : 'iconfont iconrpic'} />}></Button>
          </div>
          <div className="fileicon">
            <i className={'iconfont ' + item.icon} aria-hidden="true" role="img"></i>
          </div>
          <div className="filename">
            <div title={item.share_name} onClick={(e) => this.onOpenFile(e, item)}>
              {item.share_name}
            </div>
          </div>
          <div className="cell tiquma">{item.share_pwd}</div>
          <div className="cell count">{item.preview_count}</div>
          <div className="cell count">{item.download_count}</div>
          <div className="cell count">{item.save_count}</div>

          {item.status == 'forbidden' ? (
            <div className="cell sharestate forbidden">已违规</div>
          ) : item.first_file ? (
            item.expired ? (
              <div className="cell sharestate expired">过期已失效</div>
            ) : (
              <div className="cell sharestate active">{item.share_msg}</div>
            )
          ) : (
            <div className="cell sharestate deleted">文件已删除</div>
          )}
          <div className="cell sharetime">{item.created_at}</div>
        </div>
      )
    } catch (ex: any) {
      SettingLog.mSaveLog('danger', 'MyShareRenderItem' + (ex.message ? ex.message : ex.toString()))
      return <div key={'msl' + index} style={style} className={'fileitem '}></div>
    }
  }
  render() {
    const share = this.props.share
    return (
      <>
        <div className="toppanbtns" style={{ marginTop: '24px' }}>
          <div className="toppanbtn" style={{ marginRight: '12px' }}>
            <Button icon={<i className="iconfont iconreload-1-icon" />} onClick={this.handleRefresh}>
              刷新
            </Button>
          </div>
        </div>
      </>
    )
  }
}

export default connect(({ share }: { share: ShareModelState }) => ({
  share
}))(MyDingYueRight)
