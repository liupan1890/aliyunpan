import { message } from 'antd'
import AliHttp from './alihttp'
import { IAliFileItem, IDownloadUrl, IOfficePreViewUrl, IVideoXBTUrl } from './models'
import { IsSuccess } from './utils'

export default class AliFile {
  static async ApiFileInfo(user_id: string, drive_id: string, file_id: string): Promise<IAliFileItem | undefined> {
    const url = 'v2/file/get'
    const postdata = {
      drive_id: drive_id,
      file_id: file_id,
      url_expire_sec: 14400,
      office_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_url_process: 'image/resize,w_1920/format,jpeg',
      video_thumbnail_process: 'video/snapshot,t_106000,f_jpg,ar_auto,m_fast,w_400'
    }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (IsSuccess(resp.code)) {
      return resp.body as IAliFileItem
    }
    return undefined
  }
  static async ApiFileInfoByPath(user_id: string, drive_id: string, file_path: string): Promise<IAliFileItem | undefined> {
    if (file_path.startsWith('/') == false) file_path = '/' + file_path
    const url = 'v2/file/get_by_path'
    const postdata = {
      drive_id: drive_id,
      file_path: file_path,
      url_expire_sec: 14400,
      fields: 'thumbnail'
    }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (IsSuccess(resp.code)) {
      return resp.body as IAliFileItem
    }
    return undefined
  }

  static async ApiFileFullPath(user_id: string, drive_id: string, file_id: string): Promise<string | undefined> {
    const url = 'https://api.aliyundrive.com/adrive/v1/file/get_path'
    const postdata = {
      drive_id: drive_id,
      file_id: file_id
    }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (IsSuccess(resp.code) && resp.body.items && resp.body.items.length > 0) {
      let fullpath = ''
      for (let i = resp.body.items.length - 1; i > 0; i--) {
        fullpath += resp.body.items[i].name + '/'
      }
      fullpath += resp.body.items[0].name
      return fullpath
    }
    return undefined
  }

  static async ApiFileDownloadUrl(user_id: string, drive_id: string, file_id: string, expire_sec: number): Promise<IDownloadUrl | string> {
    const url = 'v2/file/get_download_url'
    const postdata = { drive_id: drive_id, file_id: file_id, expire_sec: expire_sec }
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    const data: IDownloadUrl = {
      drive_id: drive_id,
      file_id: file_id,
      expire_sec: expire_sec,
      url: '',
      size: 0
    }
    if (IsSuccess(resp.code)) {
      data.url = resp.body.url
      data.size = resp.body.size
      return data
    } else if (resp.body.code == 'NotFound.FileId') {
      return '文件已从网盘中彻底删除'
    } else if (resp.body.code == 'ForbiddenFileInTheRecycleBin') {
      return '文件已放入回收站'
    } else if (resp.body.code) {
      return resp.body.code as string
    }
    return '网络错误'
  }

  static async ApiVideoPreviewUrl(user_id: string, drive_id: string, file_id: string): Promise<IDownloadUrl | undefined> {
    const url = 'v2/file/get_video_preview_play_info'
    const postdata = { drive_id: drive_id, file_id: file_id, category: 'live_transcoding', template_id: '', url_expire_sec: 14400 }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (resp.body.code == 'VideoPreviewWaitAndRetry') {
      message.warning('视频正在转码中，稍后重试')
    }

    const data: IDownloadUrl = {
      drive_id: drive_id,
      file_id: file_id,
      expire_sec: 0,
      url: '',
      size: 0
    }
    if (IsSuccess(resp.code)) {
      const task_list = resp.body.video_preview_play_info?.live_transcoding_task_list || []
      if (!data.url) {
        for (let i = 0, maxi = task_list.length; i < maxi; i++) {
          if (task_list[i].template_id && task_list[i].template_id == 'FHD' && task_list[i].status == 'finished') data.url = task_list[i].url
        }
      }
      if (!data.url) {
        for (let i = 0, maxi = task_list.length; i < maxi; i++) {
          if (task_list[i].template_id && task_list[i].template_id == 'HD' && task_list[i].status == 'finished') data.url = task_list[i].url
        }
      }
      if (!data.url) {
        for (let i = 0, maxi = task_list.length; i < maxi; i++) {
          if (task_list[i].template_id && task_list[i].template_id == 'SD' && task_list[i].status == 'finished') data.url = task_list[i].url
        }
      }
      if (!data.url) {
        for (let i = 0, maxi = task_list.length; i < maxi; i++) {
          if (task_list[i].template_id && task_list[i].template_id == 'LD' && task_list[i].status == 'finished') data.url = task_list[i].url
        }
      }
      data.size = Math.floor(resp.body.video_preview_play_info?.meta?.duration || 0)
      data.expire_sec = 14400
      return data
    } else {
    }
    return undefined
  }

  static async ApiOfficePreViewUrl(user_id: string, drive_id: string, file_id: string): Promise<IOfficePreViewUrl | undefined> {
    const url = 'v2/file/get_office_preview_url'
    const postdata = { drive_id: drive_id, file_id: file_id, url_expire_sec: 14400 }
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    const data: IOfficePreViewUrl = {
      drive_id: drive_id,
      file_id: file_id,
      access_token: '',
      preview_url: ''
    }
    if (IsSuccess(resp.code)) {
      data.access_token = resp.body.access_token
      data.preview_url = resp.body.preview_url
      return data
    }
    return undefined
  }

  static async ApiBiXueTuBatch(user_id: string, drive_id: string, file_id: string, duration: number, imgcount: number, imgwidth: number): Promise<IVideoXBTUrl[]> {
    if (duration <= 0) return []
    const batchlist: string[] = []
    let mtime = 0
    let subtime = Math.floor(duration / (imgcount + 2))
    if (subtime < 1) subtime = 1

    const imglist: IVideoXBTUrl[] = []
    for (let i = 0; i < imgcount; i++) {
      mtime += subtime
      if (mtime > duration) break
      const postdata = JSON.stringify({
        body: { drive_id: drive_id, file_id: file_id, url_expire_sec: 14400, video_thumbnail_process: 'video/snapshot,t_' + mtime.toString() + '000,f_jpg,ar_auto,m_fast,w_' + imgwidth.toString() },
        headers: { 'Content-Type': 'application/json' },
        id: (i.toString() + file_id).substr(0, file_id.length),
        method: 'POST',
        url: '/file/get'
      })
      batchlist.push(postdata)

      const time =
        Math.floor(mtime / 3600)
          .toString()
          .padStart(2, '0') +
        ':' +
        Math.floor((mtime % 3600) / 60)
          .toString()
          .padStart(2, '0') +
        ':' +
        Math.floor(mtime % 60)
          .toString()
          .padStart(2, '0')
      imglist.push({ time, url: '' })
    }

    let postdata = '{"requests":['
    let add = 0
    for (let i = 0, maxi = batchlist.length; i < maxi; i++) {
      if (add > 0) postdata = postdata + ','
      add++
      postdata = postdata + batchlist[i]
    }
    postdata += '],"resource":"file"}'

    const url = 'v2/batch'
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    if (IsSuccess(resp.code)) {
      const responses = resp.body.responses
      for (let i = 0, maxi = responses.length; i < maxi; i++) {
        const status = responses[i].status as number
        if (status >= 200 && status <= 205) {
          imglist[i].url = responses[i].body?.thumbnail || ''
        } else {
          console.log(responses[i])
        }
      }
    } else {
      console.log(resp)
    }
    return imglist
  }

  static async ApiFileDownText(user_id: string, drive_id: string, file_id: string, filesize: number, maxsize: number): Promise<string> {
    const url = 'v2/file/get_download_url'
    const postdata = { drive_id: drive_id, file_id: file_id, expire_sec: 14400 }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (IsSuccess(resp.code)) {
      const downurl = resp.body.url
      const resp2 = await AliHttp.GetString(downurl, '', filesize, maxsize)
      if (IsSuccess(resp2.code)) {
        if (typeof resp2.body == 'string') return resp2.body
        return JSON.stringify(resp2.body, undefined, 2)
      }
    } else {
      console.log('error', resp)
    }
    return ''
  }

  static async ApiFileDownJson(user_id: string, drive_id: string, file_id: string) {
    const url = 'v2/file/get_download_url'
    const postdata = { drive_id: drive_id, file_id: file_id, expire_sec: 14400 }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (IsSuccess(resp.code)) {
      const downurl = resp.body.url
      const resp2 = await AliHttp.Get(downurl, '')
      if (IsSuccess(resp2.code)) {
        return resp2.body
      }
    } else {
      console.log('error', resp)
    }
    return undefined
  }
}
