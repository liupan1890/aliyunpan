import AliFile from '@/aliapi/file'
import AliFileCmd from '@/aliapi/filecmd'
import { IAliGetFileModel } from '@/aliapi/models'
import SettingConfig from '@/setting/settingconfig'
import SettingUI from '@/setting/settingui'
import PanDAL from '@/store/pandal'
import PanStore from '@/store/panstore'

import UserDAL from '@/store/userdal'
import { message } from 'antd'
import { selectDirFileList } from 'umi'
import { PrismExt } from './codeext'

let _OpenFile = false
export function OpenFile(file: IAliGetFileModel) {
  if (_OpenFile) return
  _OpenFile = true
  setTimeout(() => {
    _OpenFile = false
  }, 500)
  if (file.ext == 'zip' || file.ext == 'rar') {
    message.info('此版本暂不支持')
    return
  }

  if (file.category == 'image' || file.category == 'image2') {
    Image(file.drive_id, file.file_id, file.name)
    return
  }
  if (file.category == 'image3') {
    message.info('此格式暂不支持预览')
    return
  }

  if (file.category.startsWith('video') || file.category.startsWith('audio')) {
    Player(file.drive_id, file.file_id, file.name, file.icon == 'iconweifa', file.description)
    return
  }

  if (file.category.startsWith('doc')) {
    Office(file.drive_id, file.file_id, file.name)
    return
  }
  const codeExt = PrismExt(file.ext)
  if ((codeExt && file.size < 5 * 1024 * 1024) || file.size < 50 * 1024) {
    Code(file.drive_id, file.file_id, file.name, codeExt, file.size)
    return
  }
  message.info('此格式暂不支持预览')
}
async function Player(drive_id: string, file_id: string, name: string, weifa: boolean, dec: string) {
  message.loading('Loading...', 2)
  const userID = UserDAL.QueryUserID()
  const token = UserDAL.GetUserToken(userID)
  if (!token || !token.access_token) {
    message.error('在线播放失败 账号失效，操作取消')
    return
  }
  let url = ''
  let mode = ''
  if (weifa || SettingUI.uiVideoMode == 'online') {
    const data = await AliFile.ApiVideoPreviewUrl(userID, drive_id, file_id)
    if (data && data.url != '') {
      url = data.url
      mode = '转码视频模式_没有字幕请切换原始文件模式'
    }
  }
  if (!url && weifa == false) {
    const data = await AliFile.ApiFileDownloadUrl(userID, drive_id, file_id, 14400)
    if (typeof data !== 'string' && data.url && data.url != '') {
      url = data.url
      mode = '原始文件模式'
    }
  }
  if (!url) {
    message.error('视频地址解析失败，操作取消')
    return
  }

  if (SettingUI.uiAutoColorVideo && dec == '') {
    await AliFileCmd.ApiDescriptionBatch(userID, drive_id, 'cvideo', [file_id])
    window.getDvaApp()._store.dispatch({ type: 'treedir/mDescription', description: 'cvideo', fileidlist: [file_id] })
  }

  const title = mode + '__' + name

  if (SettingUI.uiVideoPlayer == 'mpv') {
    let ag2: string[] = []
    if (window.platform == 'win32') {
      ag2 = ['"' + url + '"', '--title="' + title.replaceAll('"', '') + '"', '--user-agent="' + SettingConfig.userAgent + '"']
    } else if (window.platform == 'darwin') {
      ag2 = ["'" + url + "'", "--title='" + title.replaceAll("'", '') + "'", "--user-agent='" + SettingConfig.userAgent + "'"]
    } else if (window.platform == 'linux') {
      ag2 = ["'" + url + "'", "--title='" + title.replaceAll("'", '') + "'", "--user-agent='" + SettingConfig.userAgent + "'"]
    } else {
      message.error('不支持的系统，操作取消')
      return
    }

    window.WebExecSync(
      {
        command: 'mpv',
        args: ['--referrer=https://www.aliyundrive.com/', '--force-window=immediate', '--hwdec=auto', '--geometry=80%', '--autofit-larger=100%x100%', '--autofit-smaller=640', ...ag2]
      },
      (rdata: any) => {}
    )
  } else {
    let command = SettingUI.uiVideoPlayerPath
    let args = ['"' + url + '"']
    if (window.platform == 'win32') {
      command = '"' + SettingUI.uiVideoPlayerPath + '"'
      args = ['"' + url + '"']
      if (command.toLowerCase().indexOf('potplayer') > 0) {
        args = ['"' + url + '"', '/new', '/referer=https://www.aliyundrive.com/']
      } else if (command.toLowerCase().indexOf('mpv') > 0) {
        args = ['"' + url + '"', '--referrer=https://www.aliyundrive.com/', '--title="' + title.replaceAll('"', '') + '"']
      } else {
        if (url.indexOf('x-oss-additional-headers=referer') > 0) {
          message.error('用户token已过期，请点击头像里退出按钮后重新登录账号')
          return
        }
      }
    } else if (window.platform == 'darwin') {
      command = "open -a '" + command + "'"
      args = ["'" + url + "'"]

      if (url.indexOf('x-oss-additional-headers=referer') > 0) {
        message.error('用户token已过期，请点击头像里退出按钮后重新登录账号')
        return
      }
    } else if (window.platform == 'linux') {
      command = SettingUI.uiVideoPlayerPath
      args = ["'" + url + "'"]

      if (url.indexOf('x-oss-additional-headers=referer') > 0) {
        message.error('用户token已过期，请点击头像里退出按钮后重新登录账号')
        return
      }
    } else {
      message.error('不支持的系统，操作取消')
      return
    }

    window.WebExecSync(
      {
        command,
        args
      },
      (rdata: any) => {}
    )
  }
}

async function Office(drive_id: string, file_id: string, name: string) {
  message.loading('Loading...', 2)
  const userID = UserDAL.QueryUserID()
  const token = UserDAL.GetUserToken(userID)
  if (!token || !token.access_token) {
    message.error('在线预览失败 账号失效，操作取消')
    return
  }

  const data = await AliFile.ApiOfficePreViewUrl(userID, drive_id, file_id)
  if (!data || !data.preview_url) {
    message.error('获取文件预览链接失败，操作取消')
    return
  }
  const pageOffice = { user_id: token.user_id, drive_id, file_id, name, token, data }
  window.WebOpenWindow({ showPage: 'pageOffice', pageOffice })
}

async function Image(drive_id: string, file_id: string, name: string) {
  message.loading('Loading...', 2)
  const userID = UserDAL.QueryUserID()
  const token = UserDAL.GetUserToken(userID)
  if (!token || !token.access_token) {
    message.error('在线预览失败 账号失效，操作取消')
    return
  }
  const data = await AliFile.ApiFileDownloadUrl(userID, drive_id, file_id, 14400)
  if (typeof data == 'string') {
    message.error('获取文件预览链接失败，操作取消')
    return
  }
  const imagelist: IAliGetFileModel[] = []
  const filelist = selectDirFileList
  for (let i = 0, maxi = filelist.length; i < maxi; i++) {
    if (filelist[i].category == 'image') imagelist.push(filelist[i])
    if (filelist[i].category == 'image2') imagelist.push(filelist[i])
  }
  if (imagelist.length == 0) {
    message.error('获取文件预览链接失败，操作取消')
    return
  }
  const pageImage = { user_id: token.user_id, drive_id, file_id, name, token, data: { mode: SettingUI.uiImageMode, imagelist } }
  window.WebOpenWindow({ showPage: 'pageImage', pageImage, theme: 'dark' })
}

async function Code(drive_id: string, file_id: string, name: string, codeExt: string, fileSize: number) {
  message.loading('Loading...', 2)
  const userID = UserDAL.QueryUserID()
  const token = UserDAL.GetUserToken(userID)
  if (!token || !token.access_token) {
    message.error('在线预览失败 账号失效，操作取消')
    return
  }
  const data = await AliFile.ApiFileDownloadUrl(userID, drive_id, file_id, 14400)
  if (typeof data == 'string') {
    message.error('获取文件预览链接失败，操作取消')
    return
  }

  const pageCode = { user_id: token.user_id, drive_id, file_id, name, token, data: { codeExt, fileSize } }
  window.WebOpenWindow({ showPage: 'pageCode', pageCode, theme: 'dark' })
}
