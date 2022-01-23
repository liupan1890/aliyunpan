import PanDAL from '@/store/pandal'

import UploadDAL from '@/store/uploaddal'
import UserDAL from '@/store/userdal'
import { AutoComplete, Button, DatePicker, Dropdown, Input, InputNumber, List, Menu, message, Popconfirm, Popover, Select, Spin, Tooltip } from 'antd'
import React from 'react'
import { AutoSizer, ColumnSizer, Grid, List as VList } from 'react-virtualized'

import { connect, FileModelState, PanFileGridRef, PanFileListRef, selectDirFileList, SettingModelState, TreeDirModelState } from 'umi'
import { OpenFile } from './filecmd'
import './fileitem.css'
import { menuFavSelectFile, menuInfoSelectFile, menuJumpToSelectFile, menuShareSelectFile, menuTrashSelectFile, topFavorDeleteAll } from './filemenu'
import './pan.css'
import { ShowRenameSingleModal } from './renamesinglemodal'
import { DownloadPan } from '../down/savepathmodal'
import SettingLog from '@/setting/settinglog'
import SettingPan from '@/setting/settingpan'
import { IAliGetFileModel } from '@/aliapi/models'
import PanStore from '@/store/panstore'
import LinearProgress from '@mui/material/LinearProgress'
import { DirPathMenu, FileListModeMenu, FileListOrderMenu, focusList, OnPanFileSelectedMenu, OnPanMenu, OnTrashMenu } from './panrighttopmenu'
import { FileColorMenu, FileCopyMenu, TrashMenu } from './panrightmenu'

export interface PanRightState {
  rangSelectStart: string
  rangSelectEnd: string
  rangSelectFiles: { [k: string]: any }
  isRangSelecting: boolean
  rangSelectID: string
  showDragUpload: boolean
  searchKey: string
  searchKeyHistory: { value: string }[]
}
let showfilemenu = false
function onHideClick() {
  let menu = document.getElementById('panfilemenu')
  if (menu) menu.style.display = 'none'
}
function onHideScroll() {
  if (showfilemenu) {
    let menu = document.getElementById('panfilemenu')
    if (menu) menu.style.display = 'none'
    showfilemenu = false
  }
}

let dragRowItem = false
class PanRight extends React.Component<{ treedir: TreeDirModelState; file: FileModelState; setting: SettingModelState; dispatch: any }, PanRightState> {
  constructor(props: any) {
    super(props)
    this.state = {
      rangSelectStart: '',
      rangSelectEnd: '',
      rangSelectFiles: {} as { [k: string]: any },
      isRangSelecting: false,
      rangSelectID: '',
      showDragUpload: false,
      searchKey: '',
      searchKeyHistory: []
    }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'PanRight' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  componentDidMount() {
    window.addEventListener('click', onHideClick)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('keydown', this.onKeyDown)

    focusList()
  }
  componentWillUnmount() {
    window.removeEventListener('click', onHideClick)
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
    if (window.getDvaApp()._store.getState().global.currentPage !== 'panright') return

    if (event.code == 'KeyF' && event.ctrlKey) {
      if (this.state.isRangSelecting) return
      event.stopPropagation()
      event.preventDefault()
      if (this.props.file.selectedFiles.size > 0) this.props.dispatch({ type: 'file/mChangSelectedFile', file_id: '', ctrl: false, shift: false })

      this.inputSearchInputRef.current?.focus()
      this.inputSearchInputRef.current?.select()
      return
    }

    if (event.code == 'F5' || (event.code == 'KeyR' && event.ctrlKey)) {
      event.stopPropagation()
      event.preventDefault()
      this.handleSelectDir('refresh')
      return
    }

    if (event.code == 'F2' && this.props.file.selectedFiles.size == 1) {
      event.stopPropagation()
      event.preventDefault()
      ShowRenameSingleModal(false)
      return
    }

    if (event.target && event.target.nodeName == 'INPUT') return

    if (event.code == 'Enter') {
      event.stopPropagation()
      event.preventDefault()
      const se = PanDAL.QuerySelectedFileList()
      if (se.length == 1) this.onOpenFile(undefined, se[0], false)
      return
    }

    if (event.code == 'Space') {
      if (this.state.isRangSelecting) return
      event.stopPropagation()
      event.preventDefault()
      if (this.props.file.selectedFiles.size > 0) this.props.dispatch({ type: 'file/mChangSelectedFile', file_id: '', ctrl: false, shift: false })

      this.inputSearchInputRef.current?.focus()
      this.inputSearchInputRef.current?.select()
      return
    }

    if (event.code == 'Backspace' || (event.code == 'ArrowLeft' && event.altKey)) {
      event.stopPropagation()
      event.preventDefault()
      this.handleSelectDir('back')
      return
    }
    if (event.code == 'Escape') {
      event.stopPropagation()
      event.preventDefault()

      if (this.state.isRangSelecting) this.onSelectRangStart()
      else {
        this.props.dispatch({ type: 'file/mChangSelectedFile', file_id: '', ctrl: false, shift: false })
      }
      return
    }

    if (event.code == 'KeyA' && event.ctrlKey) {
      this.props.dispatch({ type: 'file/mChangSelectedFile', file_id: 'all', ctrl: false, shift: false })
      return
    }
  }

  onPanDrop = (e: any) => {
    if (dragRowItem) return
    e.preventDefault()
    this.setState({ showDragUpload: false })
    if (!UserDAL.QueryUserID()) {
      message.info('请先登录一个阿里云盘账号')
      return
    }

    const fileslist = e.dataTransfer.files
    if (fileslist && fileslist.length > 0) {
      const files: string[] = []
      for (let i = 0, maxi = fileslist.length; i < maxi; i++) {
        const path = fileslist[i].path
        files.push(path)
      }
      UploadDAL.UploadLocalFiles(UserDAL.QueryUserID(), this.props.treedir.selectDir.drive_id, this.props.treedir.selectDir.file_id, files, true)
    }
  }
  onPanDragEnter = (e: any) => {
    if (dragRowItem) return
    e.dataTransfer.dropEffect = 'copy'
    this.setState({ showDragUpload: true })
  }
  onPanDragLeave = (e: any) => {
    if (dragRowItem) return
    this.setState({ showDragUpload: false })
  }
  onPanDragOver = (e: any) => {
    if (dragRowItem) return
    e.preventDefault()
  }

  onRowItemDragStart = (ev: any, file_id: string) => {
    dragRowItem = true
    this.props.dispatch({
      type: 'file/mChangSelectedFile',
      file_id,
      add: true,
      ctrl: false,
      shift: false
    })
    const files = PanDAL.QuerySelectedFileList()


    const dragImage = document.createElement('div')
    dragImage.className = 'dragrowitem'
    if (files.length == 1) {
      dragImage.innerHTML = '<a>移动</a>' + files[0].name
    } else {
      dragImage.innerHTML = '<a>批量移动</a>' + files[0].name + ' 等(' + files.length.toString() + '个文件)'
    }
    if (ev.dataTransfer) {
      document.body.appendChild(dragImage)
      ev.dataTransfer.setDragImage(dragImage, -16, 10)
      ev.dataTransfer.dropEffect = 'move'
      setTimeout(() => document.body.removeChild(dragImage), 0)
    }
  }
  onRowItemDragEnd = (ev: any) => {
    dragRowItem = false
  }

  onShare = (type: string) => {
    if (type == 'ali') {
      message.info('此版本暂不支持')
    }
  }

  handleSelectDir = (file_id: string) => {
    onHideScroll()
    if (!this.props.treedir.selectDir.drive_id) return
    this.props.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: file_id, force: file_id == 'refresh' })
  }

  inputSearchRef = React.createRef<any>()
  inputSearchInputRef = React.createRef<Input>()

  handleSearchFile = (key: string) => {
    setTimeout(() => {
      this.inputSearchRef.current?.blur()
      focusList()
    }, 50)

    if (key == '清理全部搜索记录') {
      this.setState({ searchKeyHistory: [], searchKey: '' })
      return
    }
    const list: { value: string }[] = []
    if (key != '') list.push({ value: key })
    const oldlist = this.state.searchKeyHistory
    const check: { [key: string]: boolean } = { 清理全部搜索记录: true, [key]: true }
    for (let i = 0, maxi = oldlist.length; i < maxi && i < 10; i++) {
      if (!check[oldlist[i].value]) {
        list.push(oldlist[i])
        check[oldlist[i].value] = true
      }
    }
    if (list.length > 0) list.push({ value: '清理全部搜索记录' })

    this.setState({ searchKeyHistory: list, searchKey: '' })
    this.props.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'search-name:' + key.replaceAll('-', '\\u002d').replaceAll(':', '\\u003a'), force: false })
  }

  handleSearchType = (val: string) => {
    SettingPan.mSaveUiFileSearchMode(val)
    this.setState({})
  }

  onSelectAll = () => {
    this.props.dispatch({
      type: 'file/mChangSelectedFile',
      file_id: 'all',
      ctrl: false,
      shift: false
    })
  }

  onSelectRangStart = () => {
    const isRang = !this.state.isRangSelecting
    this.setState({
      isRangSelecting: isRang,
      rangSelectID: '',
      rangSelectStart: '',
      rangSelectEnd: '',
      rangSelectFiles: {}
    })
    focusList()
  }

  onSelectRang = (file_id: string) => {
    if (this.state.isRangSelecting && this.state.rangSelectID != '') {
      let startid = this.state.rangSelectID
      let endid = ''
      const s: { [k: string]: any } = {}
      const children = selectDirFileList
      let a = -1
      let b = -1
      for (let i = 0, maxi = children.length; i < maxi; i++) {
        if (children[i].file_id == file_id) a = i
        if (children[i].file_id == startid) b = i
        if (a > 0 && b > 0) break
      }
      if (a >= 0 && b >= 0) {
        if (a > b) {
          ;[a, b] = [b, a]
          endid = file_id
        } else {
          endid = startid
          startid = file_id
        }
        for (let n = a; n <= b; n++) {
          s[children[n].file_id] = true
        }
      }
      this.setState({
        rangSelectStart: startid,
        rangSelectEnd: endid,
        rangSelectFiles: s
      })
      focusList()
    }
  }

  onSelectFile = (event: any, menu: boolean, file_id: string, ctrl: boolean) => {
    event.stopPropagation()
    if (this.state.isRangSelecting) {
      if (event.button != 0) {
        event.preventDefault()
        return
      }
      if (!this.state.rangSelectID) {
        if (!this.props.file.selectedFiles.has(file_id)) this.props.dispatch({ type: 'file/mChangSelectedFile', file_id, ctrl: true, shift: false })
        this.setState({
          rangSelectID: file_id,
          rangSelectStart: file_id,
          rangSelectFiles: { [file_id]: true }
        })
      } else {
        const start = this.state.rangSelectID
        const children = selectDirFileList
        let a = -1
        let b = -1
        for (let i = 0, maxi = children.length; i < maxi; i++) {
          if (children[i].file_id == file_id) a = i
          if (children[i].file_id == start) b = i
          if (a > 0 && b > 0) break
        }
        const filelist: string[] = []
        if (a >= 0 && b >= 0) {
          if (a > b) [a, b] = [b, a]
          for (let n = a; n <= b; n++) {
            filelist.push(children[n].file_id)
          }
        }
        this.props.dispatch({ type: 'file/mChangSelectedFileRang', filelist })
        this.setState({
          isRangSelecting: false,
          rangSelectID: '',
          rangSelectStart: '',
          rangSelectEnd: '',
          rangSelectFiles: {}
        })
      }
      return
    }

    if (menu) {

      if (!this.props.file.selectedFiles.has(file_id)) {
        this.props.dispatch({ type: 'file/mChangSelectedFile', file_id, ctrl: event.ctrlKey, shift: event.shiftKey })
      }
      let menutree = document.getElementById('pantreemenu')
      if (menutree) menutree.style.display = 'none'

      let menu = document.getElementById('panfilemenu')
      let body = document.body

      if (menu && body) {
        showfilemenu = true
        let left = event.clientX
        if (left > body.clientWidth - 140) left = body.clientWidth - 140

        let top = event.clientY + 4
        let height = this.props.treedir.selectDir.file_id == 'trash' ? 80 : 220
        if (top > body.clientHeight - height) {
          top = event.clientY - height
          if (top < 86) top = event.clientY + 4
        }

        menu.style.top = top.toString() + 'px'
        menu.style.left = left.toString() + 'px'
        menu.style.position = 'fixed'
        menu.style.display = ''
      }
    } else {
      this.props.dispatch({ type: 'file/mChangSelectedFile', file_id, ctrl: ctrl || event.ctrlKey, shift: event.shiftKey })
      if (!file_id) focusList()
      onHideScroll()
    }
  }
  onOpenFile = (event: any, file: IAliGetFileModel, double: boolean) => {
    if (event) {
      if (SettingPan.uiFileOpenDouble) {
        if (double == false) {
          return
        }
      } else if (double) {
        event.stopPropagation()
        return
      }
    }
    if (this.state.isRangSelecting) {
      return
    }

    if (this.props.treedir.selectDir.file_id == 'trash') {
      if (event) event.stopPropagation()
      if (event) event.preventDefault()
      return
    }

    if (file.isdir) {
      if (event) event.stopPropagation()
      if (event) event.preventDefault()
      this.handleSelectDir(file.file_id)
      return
    }
    onHideScroll()
    if (event) event.stopPropagation()
    if (event) event.preventDefault()
    this.props.dispatch({
      type: 'file/mChangSelectedFile',
      file_id: file.file_id,
      ctrl: false,
      shift: false,
      forceselect: true
    })
    OpenFile(file)
  }
  renderItem = ({ index, style }: { index: number; style: any }) => {
    try {
      const { rangSelectStart, rangSelectEnd, rangSelectFiles } = this.state
      const file = this.props.file
      const item = selectDirFileList[index]
      if (index < 2) console.log('renderItem', item.name)
      return (
        <div
          key={'pl' + index}
          style={style}
          className={file.selectedFiles.has(item.file_id) ? 'fileitem selected' : 'fileitem'}
          onMouseOver={() => this.onSelectRang(item.file_id)}
          onClick={(e) => this.onSelectFile(e, false, item.file_id, false)}
          onDoubleClick={(e) => this.onOpenFile(e, item, true)}
          onContextMenu={(e) => this.onSelectFile(e, true, item.file_id, false)}
          draggable="true"
          onDragStart={(ev) => this.onRowItemDragStart(ev, item.file_id)}
          onDragEnd={this.onRowItemDragEnd}>
          <div className={'rangselect ' + (rangSelectFiles[item.file_id] ? (rangSelectStart == item.file_id ? 'rangstart' : rangSelectEnd == item.file_id ? 'rangend' : 'rang') : '')}>
            <Button
              tabIndex={-1}
              title={index.toString()}
              shape="circle"
              className="select"
              onClick={(e) => this.onSelectFile(e, false, item.file_id, true)}
              icon={<i className={file.selectedFiles.has(item.file_id) ? (item.starred ? 'iconfont iconcrown' : 'iconfont iconrsuccess') : item.starred ? 'iconfont iconcrown' : 'iconfont iconrpic'} />}></Button>
          </div>
          <div className="fileicon">
            <i className={'iconfont ' + item.icon} aria-hidden="true" role="img"></i>
          </div>
          <div className="filename">
            <Tooltip
              placement="left"
              autoAdjustOverflow={true}
              mouseEnterDelay={0.5}
              arrowPointAtCenter={false}
              overlayClassName="preimgp"
              title={
                item.thumbnail ? (
                  <div className="preimg">
                    <img src={item.thumbnail} />
                  </div>
                ) : undefined
              }>
              <div onClick={(e) => this.onOpenFile(e, item, false)} className={item.description}>
                {item.name}
              </div>
            </Tooltip>
          </div>
          <div className="filebtn">
            <Tooltip title="右击鼠标显示菜单">
              <Button tabIndex={-1} className="gengduo" icon={<i className="iconfont icongengduo" />} onClick={(e) => this.onSelectFile(e, true, item.file_id, false)}></Button>
            </Tooltip>
          </div>
          <div className="filesize">{item.sizestr}</div>
          <div className="filetime">{item.timestr}</div>
        </div>
      )
    } catch (ex: any) {
      SettingLog.mSaveLog('danger', 'PanRightRenderItem' + (ex.message ? ex.message : ex.toString()))
      return <div key={'pi' + index} style={style} className={'fileitem'}></div>
    }
  }

  cellRenderer = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: any }, columnCount: number) => {
    const index = rowIndex * columnCount + columnIndex
    try {
      const { rangSelectStart, rangSelectEnd, rangSelectFiles } = this.state
      const file = this.props.file

      if (index >= selectDirFileList.length) {
        return <div key={'pi' + index} style={style}></div>
      }
      const item = selectDirFileList[index]
      return (
        <div key={'pi' + index} className="griditemparent" style={style}>
          <div
            className={file.selectedFiles.has(item.file_id) ? 'griditem selected' : 'griditem'}
            onMouseOver={() => this.onSelectRang(item.file_id)}
            onClick={(e) => this.onSelectFile(e, false, item.file_id, false)}
            onDoubleClick={(e) => this.onOpenFile(e, item, true)}
            onContextMenu={(e) => this.onSelectFile(e, true, item.file_id, false)}
            draggable="true"
            onDragStart={(ev) => this.onRowItemDragStart(ev, item.file_id)}
            onDragEnd={this.onRowItemDragEnd}>
            <div className="gridicon">
              <i className={'iconfont ' + item.icon} aria-hidden="true" role="img"></i>
            </div>
            <div className="gridicon">{item.thumbnail ? <img src={item.thumbnail} onError={(e) => (e.currentTarget.style.display = 'none')} /> : <span></span>}</div>

            <div className="gridicon">
              {item.category.startsWith('video') ? (
                <span className="playicon" onClick={(e) => this.onOpenFile(e, item, false)}>
                  <svg viewBox="0 0 1024 1024">
                    <path d="M689.066667 480l-196.266667-177.066667c-27.733333-25.6-70.4-6.4-70.4 32v356.266667c0 36.266667 44.8 55.466667 70.4 32l196.266667-177.066667c17.066667-19.2 17.066667-49.066667 0-66.133333z"></path>
                  </svg>
                </span>
              ) : (
                <span></span>
              )}
            </div>

            <div className="gridname">
              <div onClick={(e) => this.onOpenFile(e, item, false)} className={item.description} title={item.sizestr + ' ' + item.name}>
                {item.name}
              </div>
            </div>

            <div className="gridinfo">{item.timestr}</div>

            <div className={'rangselect ' + (rangSelectFiles[item.file_id] ? (rangSelectStart == item.file_id ? 'rangstart' : rangSelectEnd == item.file_id ? 'rangend' : 'rang') : '')}>
              <Button
                tabIndex={-1}
                title={index.toString()}
                shape="circle"
                className="select"
                onClick={(e) => this.onSelectFile(e, false, item.file_id, true)}
                icon={<i className={file.selectedFiles.has(item.file_id) ? (item.starred ? 'iconfont iconcrown' : 'iconfont iconrsuccess') : item.starred ? 'iconfont iconcrown' : 'iconfont iconrpic'} />}></Button>
            </div>
          </div>
        </div>
      )
    } catch (ex: any) {
      SettingLog.mSaveLog('danger', 'PanRightCellRenderItem' + (ex.message ? ex.message : ex.toString()))
      return <div key={'pi' + index} style={style} className={'griditemparent'}></div>
    }
  }
  componentDidUpdate() {
    console.log('pageright updated')
    focusList()
  }

  render() {
    const treedir = this.props.treedir
    console.log('pageright render', treedir.selectDir)
    const file = this.props.file
    const isRangSelecting = this.state.isRangSelecting
    const rangSelectFiles = this.state.rangSelectFiles

    const isOnTrash = treedir.selectDir.file_id == 'trash'
    const isOnFavor = treedir.selectDir.file_id == 'favorite' || treedir.selectDir.parent_file_id == 'favorite'
    const isOnSearch = treedir.selectDir.file_id.startsWith('search')
    const isOnPan = isOnFavor == false && isOnTrash == false && isOnSearch == false

    const selectedFilesCount = file.selectedFiles.size

    return (
      <div className="pageright" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }} onDrop={this.onPanDrop} onDragOver={this.onPanDragOver} onDragEnter={this.onPanDragEnter} tabIndex={0}>
        {DirPathMenu(this.props.treedir.selectDirPath, this.handleSelectDir)}
        <div className="toppanbtns" style={{ flexShrink: 0, flexGrow: 0 }}>
          <div className="toppanbtn" style={{ marginRight: '12px' }}>
            <Button icon={<i className="iconfont iconarrow-left-2-icon" />} title="后退" onClick={() => this.handleSelectDir('back')}></Button>
            <Button icon={<i className="iconfont iconreload-1-icon" />} title="刷新文件" onClick={() => this.handleSelectDir('refresh')}></Button>
          </div>
          <div className="toppanbtn" style={{ display: isOnFavor && selectedFilesCount < 1 ? '' : 'none' }}>
            <Button icon={<i className="iconfont iconcrown2" />} onClick={() => topFavorDeleteAll()}>
              清空收藏夹
            </Button>
          </div>
          {OnTrashMenu(isOnTrash)}
          {OnPanMenu(isOnPan, treedir.selectDir, selectedFilesCount)}
          <div className="toppanbtn" style={{ display: isOnSearch && selectedFilesCount == 0 ? '' : 'none', flexGrow: 1, flexShrink: 1 }}>
            <Dropdown
              disabled
              overlay={
                <Menu>
                  <Menu.Item key="se0101">全盘</Menu.Item>
                  <Menu.Item key="se0102">仅文件夹</Menu.Item>
                  <Menu.Item key="se0103">仅视频</Menu.Item>
                  <Menu.Item key="se0104">仅文档</Menu.Item>
                  <Menu.Item key="se0105">仅图片</Menu.Item>
                  <Menu.Item key="se0106">仅音频</Menu.Item>
                </Menu>
              }>
              <Button>
                全盘 <i className="iconfont icondown" />
              </Button>
            </Dropdown>
            <Dropdown
              disabled
              overlay={
                <Menu>
                  <Menu.Item key="se0201" className="searchmenu" disabled>
                    <InputNumber prefix="<=" addonAfter="MB" size="small" style={{ width: '150px' }} />
                  </Menu.Item>
                  <Menu.Item key="se0202" className="searchmenu" disabled>
                    <InputNumber prefix=">=" addonAfter="MB" size="small" style={{ width: '150px' }} />
                  </Menu.Item>
                </Menu>
              }>
              <Button>
                体积 <i className="iconfont icondown" />
              </Button>
            </Dropdown>
            <Dropdown
              disabled
              overlay={
                <Menu>
                  <Menu.Item key="se0301">一周内</Menu.Item>
                  <Menu.Item key="se0302">一月内</Menu.Item>
                  <Menu.Item key="se0302">三月内</Menu.Item>
                  <Menu.Item key="se0302">半年内</Menu.Item>
                  <Menu.Item key="se0302">一年内</Menu.Item>
                </Menu>
              }>
              <Button>
                时间 <i className="iconfont icondown" />
              </Button>
            </Dropdown>
            <Popconfirm title="Title" disabled>
              <Button>
                类型
                <i className="iconfont icondown" />
              </Button>
            </Popconfirm>
            <Input.Group compact>
              <AutoComplete
                ref={this.inputSearchRef}
                style={{ width: 'calc(100% - 34px)' }}
                autoFocus={false}
                value={this.state.searchKey}
                onChange={(val) => this.setState({ searchKey: val })}
                options={this.state.searchKeyHistory}
                onSelect={(val) => this.handleSearchFile(val.toString())}>
                <Input.Search ref={this.inputSearchInputRef} placeholder={isOnFavor ? '搜索已收藏' : '搜索整个网盘'} onSearch={this.handleSearchFile} />
              </AutoComplete>
            </Input.Group>
          </div>
          {OnPanFileSelectedMenu(isOnPan, isOnTrash, isOnFavor, treedir.selectDir, selectedFilesCount, this.onSelectFile)}
        </div>

        <div id="PanRightSelected" className="RightSelected" style={{ flexShrink: 0, flexGrow: 0 }}>
          <div style={{ margin: '0 2px' }}>
            <Tooltip placement="left" title="点击全选">
              <Button
                shape="circle"
                className="select all"
                icon={<i className={selectedFilesCount > 0 && selectedFilesCount == selectDirFileList.length ? 'iconfont iconrsuccess' : 'iconfont iconrpic'} />}
                onClick={this.onSelectAll}></Button>
            </Tooltip>
          </div>
          <div className="selectInfo">
            已选中 {selectedFilesCount} / {selectDirFileList.length} 个
          </div>
          <div style={{ margin: '0 2px' }}>
            <Tooltip
              placement="rightTop"
              title={
                <div>
                  第1步: 点击区间选择这个按钮
                  <br />
                  第2步: 鼠标点击一个文件
                  <br />
                  第3步: 移动鼠标点击另外一个文件
                </div>
              }>
              <Button danger={isRangSelecting} className="qujian" onClick={this.onSelectRangStart}>
                {isRangSelecting ? '取消选择' : '区间选择'}
              </Button>
            </Tooltip>
          </div>
          <div style={{ flexGrow: 1 }}>
            <LinearProgress variant="buffer" value={0} valueBuffer={0} style={{ width: '100%', display: file.selectDirFileLoading ? '' : 'none' }} />
          </div>
          {FileListOrderMenu(this.props)}
          {FileListModeMenu()}
        </div>

        <div id="PanRightList" className="PanRightList" tabIndex={0} style={{ flexShrink: 0, flexGrow: 1 }}>
          <List
            className="VList"
            style={{
              display: selectDirFileList.length <= 0 ? 'none' : ''
            }}>
            <AutoSizer>
              {({ width, height }: { width: number; height: number }) => {
                if (SettingPan.uiFileListMode == 'image' || SettingPan.uiFileListMode == 'big') {
                  let imageWidth = SettingPan.uiFileListMode == 'big' ? 200 : 150
                  let imageHeight = SettingPan.uiFileListMode == 'big' ? 240 : 180
                  const columnCount = Math.floor((width + 10) / imageWidth)
                  return (
                    <ColumnSizer columnMaxWidth={imageWidth + 50} columnMinWidth={imageWidth - 10} columnCount={columnCount} key="GridColumnSizer" width={width + 10}>
                      {({ columnWidth }: { columnWidth: number }) => {
                        return (
                          <Grid
                            ref={PanFileGridRef}
                            tabIndex={-1}
                            width={width + 10}
                            height={height}
                            data3={file.refresh}
                            data4={isRangSelecting}
                            data5={rangSelectFiles}
                            onScroll={onHideScroll}
                            rowCount={Math.ceil(selectDirFileList.length / columnCount)}
                            rowHeight={imageHeight}
                            cellRenderer={(e: any) => this.cellRenderer(e, columnCount)}
                            columnWidth={columnWidth}
                            columnCount={columnCount}
                            style={{
                              overflowY: 'auto',
                              overflowX: 'hidden',
                              marginLeft: '-10px'
                            }}
                          />
                        )
                      }}
                    </ColumnSizer>
                  )
                } else {
                  return (
                    <VList
                      ref={PanFileListRef}
                      tabIndex={-1}
                      height={height}
                      width={width}
                      data3={file.refresh}
                      data4={isRangSelecting}
                      data5={rangSelectFiles}
                      onScroll={onHideScroll}
                      rowCount={selectDirFileList.length}
                      rowHeight={50}
                      rowRenderer={this.renderItem}
                    />
                  )
                }
              }}
            </AutoSizer>
          </List>
          <div className="downHideTip" style={{ display: selectDirFileList.length <= 0 ? '' : 'none' }}>
            <div style={{ marginTop: '20%' }}></div>
            <i className={file.selectDirFileLoading ? 'iconfont ' : 'iconfont iconempty'} />
            <br />
            {file.selectDirFileLoading ? '加载中...' : '文件夹是空的'}
          </div>
        </div>

        <div id="panfilemenu" className="panfilemenu ant-dropdown" style={{ display: 'none' }}>
          <Menu mode="vertical" style={{ display: isOnTrash ? 'none' : '' }} selectedKeys={[]} prefixCls="ptm ant-dropdown-menu">
            <Menu.Item key="xiazai" icon={<i className="iconfont icondownload" />} onClick={() => DownloadPan(false, false)}>
              下载
            </Menu.Item>
            <Menu.Item key="fenxiang" icon={<i className="iconfont iconfenxiang" />} onClick={() => menuShareSelectFile(false)}>
              分享
            </Menu.Item>
            <Menu.Item key="shoucang1" style={{ display: isOnFavor ? 'none' : '' }} onClick={() => menuFavSelectFile(false, true)} icon={<i className="iconfont iconcrown" />}>
              加收藏
            </Menu.Item>
            <Menu.Item key="shoucang2" style={{ display: isOnFavor ? '' : 'none' }} onClick={() => menuFavSelectFile(false, false)} icon={<i className="iconfont iconcrown2" />}>
              取消收藏
            </Menu.Item>
            <Menu.Item key="rename" icon={<i className="iconfont iconedit-square" />} onClick={() => ShowRenameSingleModal(false)}>
              重命名
            </Menu.Item>
            <Menu.Item
              key="xiangqing"
              style={{
                display: selectedFilesCount == 1 ? '' : 'none'
              }}
              icon={<i className="iconfont iconinfo_circle" />}
              onClick={() => menuInfoSelectFile(false)}>
              详情
            </Menu.Item>
            <Menu.Item
              key="jumpto"
              style={{
                display: selectedFilesCount == 1 && isOnSearch ? '' : 'none'
              }}
              icon={<i className="iconfont iconfolder" />}
              onClick={() => menuJumpToSelectFile(false)}>
              打开位置
            </Menu.Item>
            {FileCopyMenu(false, this.props.treedir.selectDir.drive_id)}
            {FileColorMenu(false)}
            <Menu.Item key="shanchudao1" danger icon={<i className="iconfont icondelete" />} onClick={() => menuTrashSelectFile(false)}>
              放入回收站
            </Menu.Item>
          </Menu>
          {TrashMenu(isOnTrash)}
        </div>

        <Dropdown overlay={<Menu />}>
          <span></span>
        </Dropdown>

        <div id="PanRightShowUpload" style={{ display: this.state.showDragUpload ? '' : 'none' }} onDragOver={this.onPanDragOver} onDragLeave={this.onPanDragLeave}>
          <div className="ShowUpload" style={{ pointerEvents: 'none' }}>
            <i className="iconfont iconyouxian" style={{ fontSize: '64px' }} />
            <div className="ShowUploadTitle">
              <span className="link">上传到：{treedir.selectDir.name}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(({ treedir, file, setting }: { treedir: TreeDirModelState; file: FileModelState; setting: SettingModelState }) => ({
  treedir,
  file,
  setting
}))(PanRight)
