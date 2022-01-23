import { IAliGetFileModel } from '@/aliapi/models'
import SettingLog from '@/setting/settinglog'
import { Button, Image, Layout, message, Spin } from 'antd'
import axios, { AxiosResponse } from 'axios'
import React from 'react'
import { connect, GlobalModelState } from 'umi'
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'
import '../dark.css'
import '../index.css'
import '../pageleft.css'
const { Header, Content } = Layout

interface PageState {
  play: boolean
  name: string
  file_id: string
  mode: string
  showindex: number
  showlist: { fileindex: number; src: string; datasource: string }[]
}

function imageUrls(drive_id: string, file_id: string) {
  return (
    'https://api.aliyundrive.com/v2/file/download?t=' +
    Date.now().toString() +
    '&drive_id=' +
    drive_id +
    '&file_id=' +
    file_id +
    '&image_thumbnail_process=image%2Fresize%2Cl_60%2Fformat%2Cjpg%2Fauto-orient%2C1'
  )
}
function imageUrl(drive_id: string, file_id: string) {
  return (
    'https://api.aliyundrive.com/v2/file/download?t=' +
    Date.now().toString() +
    '&drive_id=' +
    drive_id +
    '&file_id=' +
    file_id +
    '&image_thumbnail_process=image%2Fresize%2Cl_1920%2Fformat%2Cwebp%2Fauto-orient%2C1'
  )
}

function imageUrlNoResize(drive_id: string, file_id: string) {
  return 'https://api.aliyundrive.com/v2/file/download?t=' + Date.now().toString() + '&drive_id=' + drive_id + '&file_id=' + file_id
}

function getImageUrl(item: IAliGetFileModel) {
  if (!item.sizestr) {
    if (item.category == 'image') {
      item.sizestr = imageUrls(item.drive_id, item.file_id)
      item.timestr = imageUrl(item.drive_id, item.file_id)
    } else {
      item.sizestr = imageUrlNoResize(item.drive_id, item.file_id)
      item.timestr = imageUrlNoResize(item.drive_id, item.file_id)
    }
  }
}
let keydowning = false
class PageImage extends React.Component<{ global: GlobalModelState; dispatch: any }, PageState> {
  constructor(props: any) {
    super(props)
    this.state = { play: false, name: '', file_id: '', mode: '', showindex: 0, showlist: [] }
  }
  imagelist: IAliGetFileModel[] = []
  viewver: Viewer | undefined = undefined
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'PageImage' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  componentDidMount() {
    const pageImage = this.props.global.pageImage!

    let name = pageImage.name || '图片在线预览'
    document.title = name

    const imagelist = pageImage.data.imagelist
    this.imagelist = []
    for (let i = 0, maxi = imagelist.length; i < maxi; i++) {
      const item = imagelist[i]
      this.imagelist.push(Object.assign({}, item, { sizestr: '', timestr: '', time: 0 }))
    }

    let file_id = pageImage.file_id
    let mode = pageImage.data.mode || 'fill'
    this.setState({ name, file_id, mode }, () => {
      this.showImage(file_id)
    })
    let rdoc = document.getElementById('root')
    if (rdoc) rdoc.addEventListener('keydown', this.onKeyDown, false)
  }
  componentWillUnmount() {
    let rdoc = document.getElementById('root')
    if (rdoc) rdoc.removeEventListener('keydown', this.onKeyDown, false)
  }

  onKeyDown = (event: any) => {
    if (this.state.mode == 'fill') return
    event.stopPropagation()
    event.preventDefault()
    if (keydowning) return
    keydowning = true
    setTimeout(() => {
      keydowning = false
    }, 200)
    if (event.code == 'ArrowRight') {
      this.goNextImage()
    } else if (event.code == 'ArrowLeft') {
      this.goLastImage()
    }
  }

  showImage = (file_id: string) => {
    let imagelist = this.imagelist
    let fileindex = 0
    for (let i = 0, maxi = imagelist.length; i < maxi; i++) {
      if (imagelist[i].file_id == file_id) {
        fileindex = i
        break
      }
    }
    const indexinfo = '[' + (fileindex + 1).toString() + '/' + imagelist.length.toString() + '] '
    const name = indexinfo + ' ' + imagelist[fileindex].name
    document.title = name
    const showlist = []
    const start = Math.max(fileindex - 100, 0)
    const end = Math.min(start + 200, imagelist.length)
    let showindex = fileindex - start
    for (let i = start; i < end; i++) {
      const item = imagelist[i]
      getImageUrl(item)
      showlist.push({ fileindex: i, src: item.sizestr, datasource: item.timestr })
    }
    let next = showindex + 1

    if (next < showlist.length) {
      if (this.imagelist[showlist[next].fileindex].time == 0) {
        this.imagelist[showlist[next].fileindex].time = Date.now()
        let url1 = showlist[next].src
        let url2 = showlist[next].datasource
        this.preload(url1)
        this.preload(url2)
      }
    }
    next = showindex + 2
    if (next < showlist.length) {
      if (this.imagelist[showlist[next].fileindex].time == 0) {
        this.imagelist[showlist[next].fileindex].time = Date.now()
        let url1 = showlist[next].src
        let url2 = showlist[next].datasource
        this.preload(url1)
        this.preload(url2)
      }
    }
    this.setState({ name, file_id, showindex, showlist }, () => {
      if (this.state.mode == 'fill') {
        this.viewver = new Viewer(document.getElementById('images')!, {
          backdrop: 'static',
          keyboard: true,
          focus: true,
          loading: true,
          zIndex: 1,
          button: false,
          title: false,
          url: 'data-src',
          fullscreen: false,
          loop: false,
          play: () => {
            let win = window.Electron.remote.getCurrentWindow()
            if (win.isMaximized() == false) win.maximize()
            this.setState({ play: true })
          },
          stop: () => {
            let win = window.Electron.remote.getCurrentWindow()
            if (win.isMaximized()) win.restore()
            this.setState({ play: false })
          },
          view: (e: any) => {
            const nextindex = e.detail.index
            const showlist = this.state.showlist
            const filelist = this.imagelist

            const fileindex = showlist[nextindex].fileindex
            const file_id = filelist[fileindex].file_id
            const name = '[' + (fileindex + 1).toString() + '/' + filelist.length.toString() + '] ' + filelist[fileindex].name
            let showindex = this.state.showindex

            const max = showlist.length - 1
            if (nextindex > max - 5 && fileindex < filelist.length - 1) {
              const last = showlist[showlist.length - 1].fileindex
              if (last < filelist.length - 1) {
                const showlist2 = []
                const start2 = last + 1
                const end2 = Math.min(start2 + 100, filelist.length)
                for (let i = start2; i < end2; i++) {
                  const item = filelist[i]
                  getImageUrl(item)
                  showlist2.push({ fileindex: i, src: item.sizestr, datasource: item.timestr })
                }
                if (showlist2.length > 0) {
                  showlist.push(...showlist2)
                  showindex = nextindex
                  this.setState({ name, file_id, showindex, showlist }, () => {
                    this.viewver?.update()
                    this.viewver?.view(nextindex)
                  })
                  return
                }
              }
            } else if (nextindex <= 5) {
              const begin = showlist[0].fileindex
              if (begin > 0) {
                const showlist2 = []
                const start2 = Math.max(begin - 100, 0)
                const end2 = begin
                for (let i = start2; i < end2; i++) {
                  const item = filelist[i]
                  getImageUrl(item)
                  showlist2.push({ fileindex: i, src: item.sizestr, datasource: item.timestr })
                }
                if (showlist2.length > 0) {
                  showlist.splice(0, 0, ...showlist2)
                  showindex = showlist2.length
                  this.setState({ name, file_id, showindex, showlist }, () => {
                    this.viewver?.update()
                    this.viewver?.view(nextindex)
                  })
                  return
                }
              }
            }

            this.setState({ name, file_id, showindex })
          },
          viewed: (e: any) => {
          }
        })
        this.viewver.view(showindex)
      } else {
        setTimeout(() => {
          let doc = document.getElementById('fullwidthimage')
          if (doc) {
            doc.scrollTop = 0
          }
        }, 200)
      }
    })
  }

  preload(url: string) {
    return axios
      .get(url, {
        withCredentials: false,
        responseType: 'blob',
        timeout: 30000
      })
      .then((response: AxiosResponse) => {})
      .catch(function (error) {})
  }

  handleMinClick = () => {
    window.Electron.remote.getCurrentWindow().minimize()
  }
  handleMaxClick = () => {
    let win = window.Electron.remote.getCurrentWindow()
    if (win.isMaximized()) win.restore()
    else win.maximize()
  }
  handleHideClick = () => {
    window.Electron.remote.getCurrentWindow().close()
  }
  goLastImage = () => {
    let imagelist = this.imagelist
    let fileindex = 0
    let file_id = this.state.file_id
    for (let i = 0, maxi = imagelist.length; i < maxi; i++) {
      if (imagelist[i].file_id == file_id) {
        fileindex = i - 1
        break
      }
    }
    if (fileindex < 0) {
      message.info('已经是第一张图片了')
    } else {
      this.showImage(imagelist[fileindex].file_id)
    }
  }
  goNextImage = () => {
    let imagelist = this.imagelist
    let fileindex = 0
    let file_id = this.state.file_id
    for (let i = 0, maxi = imagelist.length; i < maxi; i++) {
      if (imagelist[i].file_id == file_id) {
        fileindex = i + 1
        break
      }
    }
    if (fileindex >= imagelist.length) {
      message.info('已经是最后一张图片了')
    } else {
      this.showImage(imagelist[fileindex].file_id)
    }
  }

  goRefreshImage = () => {
    let imagelist = this.imagelist
    let file_id = this.state.file_id
    for (let i = 0, maxi = imagelist.length; i < maxi; i++) {
      if (imagelist[i].file_id == file_id) {
        imagelist[i].sizestr = ''
        imagelist[i].timestr = ''
        break
      }
    }
    this.showImage(file_id)
  }
  modeChange = (mode: string) => {
    this.setState({ mode }, () => {
      this.showImage(this.state.file_id)
    })
  }

  render() {
    const { name, mode, showindex, showlist } = this.state

    return (
      <Layout className="root dark" draggable="false">
        <Header id="header" className="tophead" draggable="false">
          <div className="tophead2 q-electron-drag">
            <Button type="text">
              <i className="iconfont iconfile-file"></i>
            </Button>
            <div className="title">小白羊</div>
            <div className="titlename">{name}</div>
            <div className="flexauto"></div>
            <Button type="text" onClick={this.handleMinClick} title="最小化">
              <i className="iconfont iconzuixiaohua"></i>
            </Button>
            <Button type="text" onClick={this.handleMaxClick} title="最大化">
              <i className="iconfont iconfullscreen"></i>
            </Button>
            <Button type="text" onClick={this.handleHideClick} title="关闭">
              <i className="iconfont iconclose"></i>
            </Button>
          </div>
        </Header>
        <Layout draggable="false">
          <Content id="content" style={{ padding: '12px 16px 12px 16px' }}>
            <div className="toppanbtns" style={{ display: mode == 'fill' ? 'none' : '' }}>
              <div className="flexauto"></div>
              <div className="toppanbtn">
                <Button onClick={() => this.modeChange('fill')}>相册模式</Button>
              </div>
              <div className="toppanbtn">
                <Button icon={<i className="iconfont iconreload-1-icon" />} onClick={this.goRefreshImage}>
                  刷新
                </Button>
              </div>

              <div className="toppanbtn">
                <Button onClick={this.goLastImage}>
                  <i className="iconfont iconarrow-left-2-icon" />
                  上一张
                </Button>
                <Button onClick={this.goNextImage}>
                  下一张
                  <i className="iconfont iconarrow-right-2-icon" />
                </Button>
              </div>
            </div>
            <div className="doc-preview" id="doc-preview" style={{ width: '100%', height: 'calc(100% - 26px)' }}>
              {showlist.length == 0 ? (
                <div></div>
              ) : mode == 'width' ? (
                <div id="fullwidthimage" className="fullwidthimage scroll">
                  <Image
                    id="imagewidth"
                    placeholder={
                      <div className="loading">
                        <Spin size="large" />
                      </div>
                    }
                    preview={false}
                    width={'100%'}
                    src={showlist[showindex].datasource}
                    fallback="data:image/png;base64,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"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <ul id="images" style={{ display: 'none' }}>
                  {showlist.map((item) => (
                    <li key={item.fileindex}>
                      <img src={item.src} data-src={item.datasource} referrerPolicy="no-referrer" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Content>
        </Layout>
      </Layout>
    )
  }
}

function mapStateToProps({ global }: { global: GlobalModelState }) {
  return { global }
}
export default connect(mapStateToProps)(PageImage)
