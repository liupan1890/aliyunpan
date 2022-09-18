import { useSettingStore } from '../store'
import DebugLog from '../utils/debuglog'
import message from '../utils/message'
import { GetOssExpires, HanToPin } from '../utils/utils'
import AliHttp from './alihttp'
import { IAliFileItem, IAliGetDirModel, IAliGetFileModel, IAliGetForderSizeModel } from './alimodels'
import AliDirFileList from './dirfilelist'
import { IDownloadUrl, IOfficePreViewUrl, IVideoPreviewUrl, IVideoXBTUrl } from './models'

export default class AliFile {
  
  static async ApiFileInfo(user_id: string, drive_id: string, file_id: string): Promise<IAliFileItem | undefined> {
    if (!user_id || !drive_id || !file_id) return undefined
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

    if (AliHttp.IsSuccess(resp.code)) {
      return resp.body as IAliFileItem
    } else {
      DebugLog.mSaveWarning('ApiFileInfo err=' + file_id + ' ' + (resp.code || ''))
    }
    return undefined
  }
  
  static async ApiFileInfoByPath(user_id: string, drive_id: string, file_path: string): Promise<IAliFileItem | undefined> {
    if (!user_id || !drive_id || !file_path) return undefined
    if (file_path.startsWith('/') == false) file_path = '/' + file_path
    const url = 'v2/file/get_by_path'
    const postdata = {
      drive_id: drive_id,
      file_path: file_path,
      url_expire_sec: 14400,
      office_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_url_process: 'image/resize,w_1920/format,jpeg',
      video_thumbnail_process: 'video/snapshot,t_106000,f_jpg,ar_auto,m_fast,w_400'
    }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (AliHttp.IsSuccess(resp.code)) {
      return resp.body as IAliFileItem
    } else {
      DebugLog.mSaveWarning('ApiFileInfoByPath err=' + file_path + ' ' + (resp.code || ''))
    }
    return undefined
  }

  static async ApiFileDownloadUrl(user_id: string, drive_id: string, file_id: string, expire_sec: number): Promise<IDownloadUrl | string> {
    if (!user_id || !drive_id || !file_id) return 'file_id错误'
    const data: IDownloadUrl = {
      drive_id: drive_id,
      file_id: file_id,
      expire_sec: 0,
      url: '',
      size: 0
    }

    const url1 = 'v2/file/get'
    const postdata1 = {
      drive_id: drive_id,
      file_id: file_id,
      url_expire_sec: 14400,
      office_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_url_process: 'image/resize,w_1920/format,jpeg',
      video_thumbnail_process: 'video/snapshot,t_106000,f_jpg,ar_auto,m_fast,w_400'
    }
    const resp1 = await AliHttp.Post(url1, postdata1, user_id, '')

    if (AliHttp.IsSuccess(resp1.code)) {
      let info = resp1.body as IAliFileItem
      if (info.download_url && GetOssExpires(info.download_url) > 14400) {
        data.url = info.download_url
        data.size = info.size
        data.expire_sec = GetOssExpires(data.url)
        return data
      }
    } else {
      DebugLog.mSaveWarning('ApiFileDownloadUrl1 err=' + file_id + ' ' + (resp1.code || ''))
    }

    const url = 'v2/file/get_download_url'
    const postdata = { drive_id: drive_id, file_id: file_id, expire_sec: expire_sec }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (AliHttp.IsSuccess(resp.code)) {
      data.url = resp.body.url
      data.size = resp.body.size
      data.expire_sec = GetOssExpires(data.url)
      return data
    } else if (resp.body.code == 'NotFound.FileId') {
      return '文件已从网盘中彻底删除'
    } else if (resp.body.code == 'ForbiddenFileInTheRecycleBin') {
      return '文件已放入回收站'
    } else if (resp.body.code) {
      return resp.body.code as string
    } else {
      DebugLog.mSaveWarning('ApiFileDownloadUrl err=' + file_id + ' ' + (resp.code || ''))
    }
    return '网络错误'
  }

  static async ApiVideoPreviewUrl(user_id: string, drive_id: string, file_id: string): Promise<IVideoPreviewUrl | undefined> {
    if (!user_id || !drive_id || !file_id) return undefined
    
    const url = 'v2/file/get_video_preview_play_info'
    
    const postdata = { drive_id: drive_id, file_id: file_id, category: 'live_transcoding', template_id: '', get_subtitle_info: true, url_expire_sec: 14400 }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (resp.body.code == 'VideoPreviewWaitAndRetry') {
      message.warning('视频正在转码中，稍后重试')
      return undefined
    }

    const data: IVideoPreviewUrl = {
      drive_id: drive_id,
      file_id: file_id,
      expire_sec: 0,
      width: 0,
      height: 0,
      url: '',
      duration: 0,
      url_FHD: '',
      url_HD: '',
      url_SD: '',
      url_LD: '',
      subtitles: []
    }
    if (AliHttp.IsSuccess(resp.code)) {
      const subtitle = resp.body.video_preview_play_info?.live_transcoding_subtitle_task_list || []
      for (let i = 0, maxi = subtitle.length; i < maxi; i++) {
        if (subtitle[i].status == 'finished') {
          data.subtitles.push({ language: subtitle[i].language, url: subtitle[i].url })
        }
      }
      const task_list = resp.body.video_preview_play_info?.live_transcoding_task_list || []

      for (let i = 0, maxi = task_list.length; i < maxi; i++) {
        if (task_list[i].template_id && task_list[i].template_id == 'FHD' && task_list[i].status == 'finished') {
          
          data.url_FHD = task_list[i].url
        } else if (task_list[i].template_id && task_list[i].template_id == 'HD' && task_list[i].status == 'finished') {
          
          data.url_HD = task_list[i].url
        } else if (task_list[i].template_id && task_list[i].template_id == 'SD' && task_list[i].status == 'finished') {
          
          data.url_SD = task_list[i].url
        } else if (task_list[i].template_id && task_list[i].template_id == 'LD' && task_list[i].status == 'finished') {
          
          data.url_LD = task_list[i].url
        }
      }
      data.url = data.url_FHD || data.url_HD || data.url_SD || data.url_LD || ''

      data.duration = Math.floor(resp.body.video_preview_play_info?.meta?.duration || 0)
      data.width = resp.body.video_preview_play_info?.meta?.width || 0
      data.height = resp.body.video_preview_play_info?.meta?.height || 0
      data.expire_sec = GetOssExpires(data.url)
      return data
    } else {
      DebugLog.mSaveWarning('ApiVideoPreviewUrl err=' + file_id + ' ' + (resp.code || ''))
    }
    return undefined
  }

  static async ApiAudioPreviewUrl(user_id: string, drive_id: string, file_id: string): Promise<IDownloadUrl | undefined> {
    if (!user_id || !drive_id || !file_id) return undefined
    
    const url = 'v2/file/get_audio_play_info'
    
    const postdata = { drive_id: drive_id, file_id: file_id, url_expire_sec: 14400 }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (resp.body.code == 'AudioPreviewWaitAndRetry') {
      message.warning('音频正在转码中，稍后重试')
    }

    const data: IDownloadUrl = {
      drive_id: drive_id,
      file_id: file_id,
      expire_sec: 0,
      url: '',
      size: 0
    }
    if (AliHttp.IsSuccess(resp.code)) {
      const task_list = resp.body.template_list || []
      if (!data.url) {
        for (let i = 0, maxi = task_list.length; i < maxi; i++) {
          if (task_list[i].template_id && task_list[i].template_id == 'HQ' && task_list[i].status == 'finished') data.url = task_list[i].url
        }
      }
      if (!data.url) {
        for (let i = 0, maxi = task_list.length; i < maxi; i++) {
          if (task_list[i].template_id && task_list[i].template_id == 'LQ' && task_list[i].status == 'finished') data.url = task_list[i].url
        }
      }

      return data
    } else {
      DebugLog.mSaveWarning('ApiAudioPreviewUrl err=' + file_id + ' ' + (resp.code || ''))
    }
    return undefined
  }
  static async ApiOfficePreViewUrl(user_id: string, drive_id: string, file_id: string): Promise<IOfficePreViewUrl | undefined> {
    if (!user_id || !drive_id || !file_id) return undefined
    const url = 'v2/file/get_office_preview_url'
    const postdata = { drive_id: drive_id, file_id: file_id, url_expire_sec: 14400 }
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    const data: IOfficePreViewUrl = {
      drive_id: drive_id,
      file_id: file_id,
      access_token: '',
      preview_url: ''
    }
    if (AliHttp.IsSuccess(resp.code)) {
      data.access_token = resp.body.access_token
      data.preview_url = resp.body.preview_url
      return data
    } else {
      DebugLog.mSaveWarning('ApiOfficePreViewUrl err=' + file_id + ' ' + (resp.code || ''))
    }
    return undefined
  }

  static async ApiGetFile(user_id: string, drive_id: string, file_id: string): Promise<IAliGetFileModel | undefined> {
    if (!user_id || !drive_id || !file_id) return undefined
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

    if (AliHttp.IsSuccess(resp.code)) {
      return AliDirFileList.getFileInfo(resp.body as IAliFileItem, '')
    } else {
      DebugLog.mSaveWarning('ApiGetFile err=' + file_id + ' ' + (resp.code || ''))
    }
    return undefined
  }
  
  static async ApiFileGetPath(user_id: string, drive_id: string, file_id: string): Promise<IAliGetDirModel[]> {
    if (!user_id || !drive_id || !file_id) return []
    const url = 'adrive/v1/file/get_path'
    const postdata = {
      drive_id: drive_id,
      file_id: file_id
    }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (AliHttp.IsSuccess(resp.code) && resp.body.items && resp.body.items.length > 0) {
      const list: IAliGetDirModel[] = []
      for (let i = resp.body.items.length - 1; i >= 0; i--) {
        let item = resp.body.items[i]
        list.push({
          __v_skip: true,
          drive_id: item.drive_id,
          file_id: item.file_id,
          parent_file_id: item.parent_file_id,
          name: item.name,
          namesearch: HanToPin(item.name),
          size: item.size || 0,
          time: new Date(item.updated_at).getTime(),
          
          description: item.description || ''
        })
      }
      return list
    } else {
      DebugLog.mSaveWarning('ApiFileGetPath err=' + file_id + ' ' + (resp.code || ''))
    }
    return []
  }
  
  static async ApiFileGetPathString(user_id: string, drive_id: string, file_id: string, dirsplit: string): Promise<string> {
    if (!user_id || !drive_id || !file_id) return ''
    const url = 'adrive/v1/file/get_path'
    const postdata = {
      drive_id: drive_id,
      file_id: file_id
    }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (AliHttp.IsSuccess(resp.code) && resp.body.items && resp.body.items.length > 0) {
      const list: string[] = []
      for (let i = resp.body.items.length - 1; i >= 0; i--) {
        let item = resp.body.items[i]
        list.push(item.name)
      }
      return list.join(dirsplit)
    } else {
      DebugLog.mSaveWarning('ApiFileGetPathString err=' + file_id + ' ' + (resp.code || ''))
    }
    return ''
  }

  
  static async ApiFileGetFolderSize(user_id: string, drive_id: string, file_id: string): Promise<IAliGetForderSizeModel | undefined> {
    if (!user_id || !drive_id || !file_id) return undefined
    const url = 'adrive/v1/file/get_folder_size_info'
    
    const postdata = {
      drive_id: drive_id,
      file_id: file_id
    }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (AliHttp.IsSuccess(resp.code)) {
      return resp.body as IAliGetForderSizeModel
    } else {
      DebugLog.mSaveWarning('ApiFileGetFolderSize err=' + file_id + ' ' + (resp.code || ''))
    }
    return { size: 0, folder_count: 0, file_count: 0, reach_limit: false }
  }

  
  static async ApiFileDownText(user_id: string, drive_id: string, file_id: string, filesize: number, maxsize: number): Promise<string> {
    if (!user_id || !drive_id || !file_id) return ''
    const downurl = await AliFile.ApiFileDownloadUrl(user_id, drive_id, file_id, 14400)
    if (typeof downurl == 'string') return downurl
    const resp = await AliHttp.GetString(downurl.url, '', filesize, maxsize) 
    if (AliHttp.IsSuccess(resp.code)) {
      if (typeof resp.body == 'string') return resp.body
      return JSON.stringify(resp.body, undefined, 2)
    } else {
      DebugLog.mSaveWarning('ApiFileDownText err=' + file_id + ' ' + (resp.code || ''))
    }
    return ''
  }

  
  static async ApiBiXueTuBatch(user_id: string, drive_id: string, file_id: string, duration: number, imgcount: number, imgwidth: number): Promise<IVideoXBTUrl[]> {
    if (!user_id || !drive_id || !file_id) return []
    if (duration <= 0) return []
    const batchlist: string[] = []
    let mtime = 0
    let subtime = Math.floor(duration / (imgcount + 2))
    if (subtime < 1) subtime = 1

    const imglist: IVideoXBTUrl[] = []
    for (let i = 0; i < imgcount; i++) {
      mtime += subtime
      if (mtime > duration) break
      const postdata = {
        body: { drive_id: drive_id, file_id: file_id, url_expire_sec: 14400, video_thumbnail_process: 'video/snapshot,t_' + mtime.toString() + '000,f_jpg,ar_auto,m_fast,w_' + imgwidth.toString() },
        headers: { 'Content-Type': 'application/json' },
        id: (i.toString() + file_id).substr(0, file_id.length),
        method: 'POST',
        url: '/file/get'
      }
      batchlist.push(JSON.stringify(postdata))

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
    if (AliHttp.IsSuccess(resp.code)) {
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
      DebugLog.mSaveWarning('ApiBiXueTuBatch err=' + file_id + ' ' + (resp.code || ''))
    }
    return imglist
  }

  
  static async ApiUpdateVideoTime(user_id: string, drive_id: string, file_id: string, play_cursor: number): Promise<IAliFileItem | undefined> {
    if (!useSettingStore().uiAutoPlaycursorVideo) return 
    if (!user_id || !drive_id || !file_id) return undefined
    const url = 'v2/file/get'
    const postdata = {
      drive_id: drive_id,
      file_id: file_id,
      url_expire_sec: 14400,
      office_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_url_process: 'image/resize,w_1920/format,jpeg',
      video_thumbnail_process: 'video/snapshot,t_' + Math.floor(play_cursor) + ',f_jpg,w_0,h_0,m_fast'
    }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (AliHttp.IsSuccess(resp.code)) {
      let info = resp.body as IAliFileItem

      const urlvideo = 'adrive/v2/video/update'
      const postvideodata = {
        drive_id: drive_id,
        file_id: file_id,
        play_cursor: play_cursor.toString(),
        thumbnail: info.thumbnail || ''
      }
      const respvideo = await AliHttp.Post(urlvideo, postvideodata, user_id, '')
      if (AliHttp.IsSuccess(respvideo.code)) {
        return respvideo.body as IAliFileItem
      } else {
        DebugLog.mSaveWarning('ApiUpdateVideoTime2 err=' + file_id + ' ' + (respvideo.code || ''))
      }
    } else {
      DebugLog.mSaveWarning('ApiUpdateVideoTime err=' + file_id + ' ' + (resp.code || ''))
    }
    return undefined
  }
}
