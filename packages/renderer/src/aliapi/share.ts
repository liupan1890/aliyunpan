import DebugLog from '@/utils/debuglog'
import { humanDateTime, humanExpiration, humanSize } from '@/utils/format'
import message from '@/utils/message'
import AliHttp, { IUrlRespData } from './alihttp'
import ServerHttp from './server'
import { ApiBatch, ApiBatchMaker, ApiBatchSuccess } from './utils'
import { useSettingStore } from '@/store'
import { IAliShareItem, IAliShareAnonymous, IAliShareFileItem } from './alimodels'
import getFileIcon from './fileicon'

export interface IAliShareFileResp {
  items: IAliShareFileItem[]
  itemsKey: Set<string>
  punished_file_count: number
  
  next_marker: string

  m_user_id: string 
  m_share_id: string 
  m_dir_id: string 
  m_dir_name: string 
}

export interface UpdateShareModel {
  share_id: string
  share_pwd: string
  expiration: string
  share_name: string
}

export default class AliShare {
  
  static async ApiGetShareAnonymous(shareid: string) {
    
    
    const share: IAliShareAnonymous = {
      shareinfo: {
        shareid: shareid,
        creator_id: '',
        creator_name: '',
        creator_phone: '',
        display_name: '',
        expiration: '',
        file_count: 0,
        share_name: '',
        created_at: '',
        updated_at: '',
        vip: ''
      },
      shareinfojson: '',
      error: '解析分享链接失败'
    }
    const url = 'adrive/v2/share_link/get_share_by_anonymous?share_id=' + shareid
    const postdata = { share_id: shareid }
    const resp = await AliHttp.Post(url, postdata, '', '')
    if (AliHttp.IsSuccess(resp.code)) {
      if (resp.body.creator_id) {
        share.shareinfo.shareid = shareid
        share.shareinfo.creator_id = resp.body.creator_id || ''
        share.shareinfo.creator_name = resp.body.creator_name || ''
        share.shareinfo.creator_phone = resp.body.creator_phone || ''
        share.shareinfo.display_name = resp.body.display_name || ''
        share.shareinfo.expiration = resp.body.expiration || ''
        share.shareinfo.file_count = resp.body.file_count || 0
        share.shareinfo.share_name = resp.body.share_name || ''
        share.shareinfo.created_at = resp.body.created_at || ''
        share.shareinfo.updated_at = resp.body.updated_at || ''
        share.shareinfo.vip = resp.body.vip || ''
        share.shareinfojson = JSON.stringify(resp.body)
        share.error = ''
        return share 
      }
    }
    
    if (resp.body?.code == 'ShareLink.Cancelled') share.error = '分享链接被取消分享了'
    else if (resp.body?.code == 'ShareLink.Expired') share.error = '分享链接过期失效了'
    else if (resp.body?.code == 'ShareLink.Forbidden') share.error = '分享链接违规禁止访问'
    else if (resp.body?.code) share.error = resp.body.code
    else share.error = '解析分享链接失败'
    return share
  }

  
  static async ApisSubscription(user_id: string, shareid: string) {
    const url = 'adrive/v1/share_link/subscription/update'
    const postdata = { share_id: shareid, update_last_seen: true }
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      return true
    }
    return false
  }

  
  static async ApiGetShareToken(shareid: string, pwd: string) {
    
    

    const url = 'v2/share_link/get_share_token'
    const postdata = { share_id: shareid, share_pwd: pwd }

    let resp = await AliHttp.Post(url, postdata, '', '')
    let isgetpwd = false

    if (resp.body?.code == 'InvalidResource.SharePwd') {
      if (useSettingStore().yinsiLinkPassword) {
        const serdata = await ServerHttp.PostToServer({ cmd: 'GetAliSharePwd', shareid })
        if (serdata.password) {
          isgetpwd = true 
          postdata.share_pwd = serdata.password
          resp = await AliHttp.Post(url, postdata, '', '') 
        }
      }
    }

    
    if (resp.body?.code == 'InvalidResource.SharePwd') return '，提取码错误'
    if (resp.body?.code == 'ShareLink.Cancelled') return '，分享链接被取消分享了'
    if (resp.body?.code == 'ShareLink.Expired') return '，分享链接过期失效了'
    if (resp.body?.code == 'ShareLink.Forbidden') return '，分享链接违规禁止访问'
    if (resp.body?.code) return '，' + resp.body.code

    
    if (AliHttp.IsSuccess(resp.code)) {
      if (useSettingStore().yinsiLinkPassword && isgetpwd == false) ServerHttp.PostToServer({ cmd: 'PostAliShare', shareid, password: postdata.share_pwd }) 
      return (resp.body.share_token as string | undefined) || '，share_token错误'
    }
    return '，网络错误请重试'
  }

  
  static async ApiShareFileList(share_id: string, share_token: string, dir_id: string): Promise<IAliShareFileResp> {
    const dir: IAliShareFileResp = {
      items: [],
      itemsKey: new Set(),
      punished_file_count: 0,
      next_marker: '',
      m_user_id: '',
      m_share_id: share_id,
      m_dir_id: dir_id,
      m_dir_name: ''
    }
    do {
      const isget = await AliShare.ApiShareFileListOnePage(dir, share_token)
      if (isget != true) {
        break 
      }
    } while (dir.next_marker)

    return dir
  }

  
  static async ApiShareFileListOnePage(dir: IAliShareFileResp, share_token: string) {
    const url = 'adrive/v3/file/list?jsonmask=next_marker,items(category,created_at,domain_id,drive_id,file_extension,file_id,hidden,mime_extension,mime_type,name,parent_file_id,punish_flag,size,starred,type,updated_at,description)'
    let postdata = {
      share_id: dir.m_share_id,
      parent_file_id: dir.m_dir_id,
      limit: 100,
      url_expire_sec: 14400,
      fields: 'thumbnail',
      order_by: 'name',
      order_direction: 'DESC'
    }
    if (dir.next_marker) postdata = Object.assign(postdata, { marker: dir.next_marker })
    const resp = await AliHttp.Post(url, postdata, '', share_token)
    return AliShare._ShareFileListOnePage(dir, resp)
  }

  static _ShareFileListOnePage(dir: IAliShareFileResp, resp: IUrlRespData) {
    try {
      if (AliHttp.IsSuccess(resp.code)) {
        dir.next_marker = resp.body.next_marker
        for (let i = 0, maxi = resp.body.items.length; i < maxi; i++) {
          const item = resp.body.items[i] as IAliShareFileItem
          if (dir.itemsKey.has(item.file_id)) continue
          const add = {
            drive_id: item.drive_id,
            file_id: item.file_id,
            name: item.name,
            type: item.type,
            parent_file_id: item.parent_file_id,

            file_extension: item.file_extension || '',
            mime_extension: item.mime_extension || '',
            mime_type: item.mime_type || '',
            size: item.size || 0,
            category: item.category || '',
            punish_flag: item.punish_flag || 0,
            isdir: item.type == 'folder',
            sizestr: item.type == 'folder' ? '' : humanSize(item.size),
            icon: getFileIcon(item.category, item.file_extension, item.mime_extension, item.mime_type, item.size)[1]
          }
          dir.items.push(add)
          dir.itemsKey.add(add.file_id)
        }
        dir.punished_file_count += resp.body.punished_file_count || 0
        return true
      } else if (resp.code == 404) {
        
        dir.items.length = 0
        dir.next_marker = ''
        return true
      } else if (resp.body && resp.body.code) {
        dir.items.length = 0
        dir.next_marker = resp.body.code 
        message.warning('列出分享链接内文件出错 ' + resp.body.code, 2)
        return false
      }
    } catch (e: any) {
      DebugLog.mSaveLog('danger', '_ShareFileListOnePage' + dir.m_dir_id + ' error=' + (e.message || ''))
    }
    dir.next_marker = 'error ' + resp.code
    return false
  }

  
  static async ApiCreatShare(user_id: string, drive_id: string, expiration: string, share_pwd: string, share_name: string, file_id_list: string[]): Promise<string | IAliShareItem> {
    
    

    const url = 'adrive/v2/share_link/create'
    const postdata = JSON.stringify({ drive_id, expiration, share_pwd: share_pwd, share_name: share_name, file_id_list })
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    
    if (AliHttp.IsSuccess(resp.code)) {
      const item = resp.body as IAliShareItem
      const add: IAliShareItem = Object.assign({}, item, { first_file: undefined, icon: 'iconwenjian' })
      if (item.created_at) add.created_at = humanDateTime(item.created_at)
      if (item.updated_at) add.updated_at = humanDateTime(item.updated_at)
      add.share_msg = humanExpiration(item.expiration)
      return add
    }
    
    if (resp.body?.code.startsWith('UserPunished')) return '账号分享行为异常，无法分享'
    else if (resp.body?.code == 'InvalidParameter.FileIdList') return '选择文件过多，无法分享'
    else if (resp.body?.message && resp.body.message.indexOf('size of file_id_list') >= 0) return '选择文件过多，无法分享'
    else if (resp.body?.code == 'FileShareNotAllowed') return '这个文件禁止分享'
    else if (resp.body?.code) return resp.body.code.toString()
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

  
  static async ApiCancelShareBatch(user_id: string, shareidlist: string[]): Promise<string[]> {
    const batchlist = ApiBatchMaker('/share_link/cancel', shareidlist, (share_id: string) => {
      return { share_id: share_id }
    })
    return ApiBatchSuccess(shareidlist.length > 1 ? '批量取消分享' : '取消分享', batchlist, user_id, '')
  }

  
  static async ApiUpdateShareBatch(user_id: string, shareidlist: string[], expirationlist: string[], share_pwdlist: string[], share_namelist: string[] | undefined) {
    

    

    if (!shareidlist || shareidlist.length == 0) return []
    const batchlist: string[] = []
    if (share_namelist != undefined) {
      for (let i = 0, maxi = shareidlist.length; i < maxi; i++) {
        batchlist.push(
          JSON.stringify({
            body: { share_id: shareidlist[i], share_pwd: share_pwdlist[i], expiration: expirationlist[i], share_name: share_namelist[i] },
            headers: { 'Content-Type': 'application/json' },
            id: shareidlist[i],
            method: 'POST',
            url: '/share_link/update'
          })
        )
      }
    } else {
      for (let i = 0, maxi = shareidlist.length; i < maxi; i++) {
        batchlist.push(JSON.stringify({ body: { share_id: shareidlist[i], share_pwd: share_pwdlist[i], expiration: expirationlist[i] }, headers: { 'Content-Type': 'application/json' }, id: shareidlist[i], method: 'POST', url: '/share_link/update' }))
      }
    }

    let successlist: UpdateShareModel[] = []
    const result = await ApiBatch(shareidlist.length > 1 ? '批量更新分享链接' : '更新分享链接', batchlist, user_id, '')
    result.reslut.map((t) => successlist.push({ share_id: t.share_id!, share_pwd: t.share_pwd!, expiration: t.expiration!, share_name: t.share_name! }))
    return successlist
  }

  
  static async ApiSaveShareFilesBatch(shareid: string, share_token: string, user_id: string, drive_id: string, parentid: string, files: string[]) {
    

    
    
    
    if (!files || files.length == 0) return 'success'
    const batchlist: string[] = []
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      const postdata =
        '{"body":{"share_id":"' +
        shareid +
        '","file_id_list":["' +
        //files[i] +
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
    const result = await ApiBatch('', batchlist, user_id, share_token)
    if (result.count == files.length) {
      if (result.async_task.length > 0) return 'async'
      else return 'success'
    } else {
      if (result.error.length > 0) {
        if (result.error[0].code == 'QuotaExhausted.Drive') return '网盘空间已满'
        else return result.error[0].code
      }
      return 'error'
    }

    /**
     * 异步任务，查询结果
     * punished_file_count  部分文件由于违规，已封禁
     *
     * some if(data.state=='PartialSucceed'&&data.message=='ErrQuotaExhausted') 空间不足，已保存部分文件
     * every if(data.state=='Failed') 可用空间不足，保存失败
     */
  }
}
