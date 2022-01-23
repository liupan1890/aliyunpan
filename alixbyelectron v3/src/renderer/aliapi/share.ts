import SettingLog from '@/setting/settinglog'
import SettingYinSi from '@/setting/settingyinsi'
import { humanDateTime, humanExpiration, Unicode } from '@/store/format'
import { message } from 'antd'
import AliHttp from './alihttp'
import AliFileList, { IAliFileResp } from './filelist'
import { IAliShareItem, IBatchResult, IShareInfoModel } from './models'
import ServerHttp from './server'
import { ApiBatch, IsSuccess } from './utils'

export default class AliShare {
  static async ApiGetShareAnonymous(shareid: string) {
    const share: IShareInfoModel = {
      shareinfo: {
        shareid: '',
        creator_id: '',
        creator_name: '',
        creator_phone: '',
        display_name: '',
        expiration: '',
        file_count: 0,
        share_name: '',
        updated_at: '',
        vip: ''
      },
      shareinfojson: '',
      error: '解析分享链接失败'
    }
    const url = 'https://api.aliyundrive.com/adrive/v2/share_link/get_share_by_anonymous?share_id=' + shareid
    const postdata = { share_id: shareid }
    const resp = await AliHttp.Post(url, postdata, '', '')
    if (IsSuccess(resp.code)) {
      if (resp.body.creator_id) {
        share.shareinfo.shareid = shareid
        share.shareinfo.creator_id = resp.body.creator_id || ''
        share.shareinfo.creator_name = resp.body.creator_name || ''
        share.shareinfo.creator_phone = resp.body.creator_phone || ''
        share.shareinfo.display_name = resp.body.display_name || ''
        share.shareinfo.expiration = resp.body.expiration || ''
        share.shareinfo.file_count = resp.body.file_count || 0
        share.shareinfo.share_name = resp.body.share_name || ''
        share.shareinfo.updated_at = resp.body.updated_at || ''
        share.shareinfo.vip = resp.body.vip || ''
        share.shareinfojson = JSON.stringify(resp.body)
        share.error = ''
        return share
      }
    }
    if (resp.body.code == 'ShareLink.Cancelled') share.error = '分享链接被取消分享了'
    else if (resp.body.code == 'ShareLink.Forbidden') share.error = '分享链接违规禁止访问'
    else if (resp.body.code) share.error = resp.body.code
    else share.error = '解析分享链接失败'
    return share
  }

  static async ApiGetShareToken(shareid: string, pwd: string) {

    const url = 'https://api.aliyundrive.com/v2/share_link/get_share_token'
    const postdata = { share_id: shareid, share_pwd: pwd }

    let resp = await AliHttp.Post(url, postdata, '', '')
    let isgetpwd = false
    if (resp.body.code == 'InvalidResource.SharePwd') {
      if (SettingYinSi.yinsiLinkPassword) {
        const serdata = await ServerHttp.PostToServer({ cmd: 'GetAliSharePwd', shareid })
        if (serdata.password) {
          isgetpwd = true
          postdata.share_pwd = serdata.password
          resp = await AliHttp.Post(url, postdata, '', '')
        }
      }
    }

    if (resp.body.code == 'InvalidResource.SharePwd') return '，提取码错误'
    if (resp.body.code == 'ShareLink.Cancelled') return '，分享链接被取消分享了'
    if (resp.body.code == 'ShareLink.Forbidden') return '，分享链接违规禁止访问'
    if (resp.body.code) return '，' + resp.body.code

    if (IsSuccess(resp.code)) {
      if (SettingYinSi.yinsiLinkPassword && isgetpwd == false) ServerHttp.PostToServer({ cmd: 'PostAliShare', shareid, password: postdata.share_pwd })
      return (resp.body.share_token as string | undefined) || '，share_token错误'
    }
    return '，网络错误请重试'
  }

  static async ApiShareFileList(share_id: string, share_token: string, dir_id: string): Promise<IAliFileResp> {
    const dir: IAliFileResp = {
      items: [],
      punished_file_count:0,
      next_marker: '',
      m_user_id: '',
      m_drive_id: share_id,
      m_dir_id: dir_id,
      m_dir_name: '',
      m_need_report: false
    }
    let i = 0
    do {
      i++
      if (i == 3) {
        message.warning('分享链接内有包含大量文件，解析缓慢')
      }
      const isget = await AliShare.ApiShareFileListOnePage(dir, share_token)
      if (isget != true) {
        break
      }
    } while (dir.next_marker != '')

    return dir
  }

  static async ApiShareFileListOnePage(dir: IAliFileResp, share_token: string) {
    const url = 'https://api.aliyundrive.com/adrive/v3/file/list'
    const postdata = {
      share_id: dir.m_drive_id,
      parent_file_id: dir.m_dir_id,
      marker: dir.next_marker,
      limit: AliFileList.LimitMax,
      url_expire_sec: 14400,
      fields: '*',
      order_by: 'name',
      order_direction: 'DESC'
    }
    const resp = await AliHttp.Post(url, postdata, '', share_token)
    return AliFileList._FileListOnePage(dir, resp)
  }

  static async ApiCreatShare(user_id: string, drive_id: string, expiration: string, share_pwd: string, share_name: string, file_id_list: string[]): Promise<string | IAliShareItem> {

    const url = 'https://api.aliyundrive.com/adrive/v2/share_link/create'
    const postdata = JSON.stringify({ drive_id, expiration, share_pwd: share_pwd, share_name: share_name, file_id_list })
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    if (IsSuccess(resp.code)) {
      const item = resp.body as IAliShareItem
      const add: IAliShareItem = Object.assign({}, item, { first_file: undefined, icon: 'iconwenjian' })
      if (item.updated_at) add.updated_at = humanDateTime(item.updated_at)
      add.share_msg = humanExpiration(item.expiration)
      return add
    }
    if (resp.body.code.startsWith('UserPunished')) return '账号分享行为异常，无法分享'
    else if (resp.body.code == 'InvalidParameter.FileIdList') return '选择文件过多，无法分享'
    else if (resp.body.message && resp.body.message.indexOf('size of file_id_list') >= 0) return '选择文件过多，无法分享'
    else if (resp.body.code == 'FileShareNotAllowed') return '这个文件禁止分享'
    else if (resp.body.code) return resp.body.code.toString()
    else return '创建分享链接失败'
  }

  static async ApiCreatShareBatch(user_id: string, drive_id: string, expiration: string, share_pwd: string, file_id_list: string[]): Promise<number> {
    const batchlist: string[] = []
    for (let i = 0, maxi = file_id_list.length; i < maxi; i++) {
      const postdata: any = {
        body: {
          drive_id,
          expiration,
          share_pwd: share_pwd,
          file_id_list: [file_id_list[i]]
        },
        headers: {
          'Content-Type': 'application/json'
        },
        id: file_id_list[i],
        method: 'POST',
        url: '/share_link/create'
      }
      batchlist.push(JSON.stringify(postdata))
    }
    const result = await ApiBatch('', batchlist, user_id, '')
    return result.count
  }

  static async ApiCancelShareBatch(user_id: string, shareidlist: string[]) {
    if (!shareidlist || shareidlist.length == 0) return 0
    const batchlist: string[] = []
    for (let i = 0, maxi = shareidlist.length; i < maxi; i++) {
      const postdata: any = {
        body: {
          share_id: shareidlist[i]
        },
        headers: {
          'Content-Type': 'application/json'
        },
        id: shareidlist[i],
        method: 'POST',
        url: '/share_link/cancel'
      }
      batchlist.push(JSON.stringify(postdata))
    }
    const result = await ApiBatch('取消分享', batchlist, user_id, '')
    return result.count
  }

  static async ApiUpdateShareBatch(user_id: string, shareidlist: string[], expirationlist: string[], share_pwdlist: string[], share_namelist: string[] | undefined) {


    if (!shareidlist || shareidlist.length == 0) return 0
    const batchlist: string[] = []
    for (let i = 0, maxi = shareidlist.length; i < maxi; i++) {
      let postdata: any = {
        body: {
          share_id: shareidlist[i],
          expiration: expirationlist[i],
          share_pwd: share_pwdlist[i]
        },
        headers: {
          'Content-Type': 'application/json;charset-utf-8'
        },
        id: shareidlist[i],
        method: 'POST',
        url: '/share_link/update'
      }
      if (share_namelist != undefined) {
        postdata.body.share_name = share_namelist[i]
      }
      batchlist.push(JSON.stringify(postdata))
    }
    const result = await ApiBatch('更新分享链接', batchlist, user_id, '')
    return result.count
  }

  static async ApiSaveShareFilesBatch(shareid: string, share_token: string, user_id: string, drive_id: string, parentid: string, files: string[]) {

    if (!files || files.length == 0) return 'success'
    const batchlist: string[] = []
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      const postdata =
        '{"body":{"share_id":"' +
        shareid +
        '","file_id_list":["' +
        '"],"file_id":"' +
        files[i] +
        '","to_drive_id":"' +
        drive_id +
        '","to_parent_file_id":"' +
        parentid +
        '","auto_rename":true},"headers":{"Content-Type":"application/json"},"id":"' +
        files[i] +
        '","method":"POST","url":"/file/copy"}'
      batchlist.push(postdata)
    }
    const result = await AliShare.ApiBatch('', batchlist, user_id, share_token)
    if (result.count == files.length) {
      if (result.task.length > 0) {
        return 'async'
      } else return 'success'
    } else {
      if (result.error.length > 0) {
        if (result.error[0].code == 'QuotaExhausted.Drive') return '网盘空间已满'
        else return result.error[0].code
      }
      return 'error'
    }

  }

  static async ApiBatch(title: string, batchlist: string[], user_id: string, share_token: string) {
    let loadingkey = 'sharebatch' + Date.now().toString()
    if (title != '') message.loading({ content: title + ' 执行中...', key: loadingkey, duration: 0 })
    const result: IBatchResult = {
      count: 0,
      task: [],
      reslut: [],
      error: []
    }
   
    let add = 0
    let postdata = '{"requests":['
    let alltask: Promise<void>[] = []
    for (let i = 0, maxi = batchlist.length; i < maxi; i++) {
      if (add > 0) postdata = postdata + ','
      add++
      postdata = postdata + batchlist[i]
      if (add > 99) {
        postdata += '],"resource":"file"}'
        alltask.push(AliShare._ApiBatch(postdata, user_id, share_token, result))
        postdata = '{"requests":['
        add = 0
      }

      if (alltask.length >= 3) {
        await Promise.all(alltask).catch(() => {})
        alltask = []
        if (title != '') message.loading({ content: title + ' 执行中...(' + result.count.toString() + ')', key: loadingkey, duration: 0 })
      }
    }
    if (add > 0) {
      postdata += '],"resource":"file"}'
      alltask.push(AliShare._ApiBatch(postdata, user_id, share_token, result))
    }
    if (alltask.length > 0) await Promise.all(alltask).catch(() => {})
    if (title != '') message.destroy(loadingkey)
    return result
  }
  static async _ApiBatch(postdata: string, user_id: string, share_token: string, result: IBatchResult) {
    const url = 'v2/batch'
    const resp = await AliHttp.Post(url, postdata, user_id, share_token)
    if (IsSuccess(resp.code)) {
      const responses = resp.body.responses
      for (let i = 0, maxi = responses.length; i < maxi; i++) {
        const status = responses[i].status as number
        if (status >= 200 && status <= 205) {
          result.count++
          const respi = responses[i]
          if (respi.body && respi.body.async_task_id) {
            result.task.push({ file_id: respi.id, task_id: respi.body.async_task_id, newdrive_id: respi.body.drive_id, newfile_id: respi.body.file_id })
          }
          if (respi.body) {
            result.reslut.push({ id: respi.id, file_id: respi.body.file_id })
          }
        } else {
          const respi = responses[i]
          SettingLog.mSaveLog('danger', respi.body.message || respi.body.code)
          if (respi.body && respi.body.code) result.error.push({ id: respi.body.id, code: respi.body.code, message: respi.body.message })
        }
      }
    }
  }
}
