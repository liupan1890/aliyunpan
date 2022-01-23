import { IAliShareItem } from '@/aliapi/models'
import AliShare from '@/aliapi/share'
import SettingLog from '@/setting/settinglog'
import { Sleep } from '@/store/format'

import ShareDAL from '@/store/sharedal'
import UserDAL from '@/store/userdal'
import { message } from 'antd'
import { ShowEditShareModal } from './editsharemodal'

let _topDelete = false
export async function topDeleteShare(delby: string) {
  const userID = UserDAL.QueryUserID()
  if (!userID) return
  if (_topDelete) return
  _topDelete = true
  try {
    const name = delby == 'selected' ? '取消分享' : delby == 'expired' ? '清理全部过期已失效' : '清理全部文件已删除'

    let filelist: IAliShareItem[] = []
    if (delby == 'selected') {
      filelist = ShareDAL.QuerySelectedShareList()
    } else {
      const ShareList = ShareDAL.QueryAllShareList()
      for (let i = 0, maxi = ShareList.length; i < maxi; i++) {
        const item = ShareList[i]
        if (delby == 'expired') {
          if (item.expired && item.first_file != undefined) filelist.push(item)
        } else {
          if (item.first_file == undefined) filelist.push(item)
        }
      }
    }

    if (filelist.length == 0) {
      message.error('没有需要删除的分享链接！')
      _topDelete = false
      return
    }
    let count = 0
    let selectkeys: string[] = []
    for (let i = 0, maxi = filelist.length; i < maxi; i++) {
      selectkeys.push(filelist[i].share_id)
    }
    if (selectkeys.length > 0) {
      count += await AliShare.ApiCancelShareBatch(userID, selectkeys)
    }
    const loadingkey = 'chanceshare' + Date.now().toString()
    for (let i = 8; i > 0; i--) {
      message.success({ content: name + ' 成功，请稍后刷新我的分享列表(' + i.toString() + ')', key: loadingkey, duration: 0 })
      await Sleep(1000)
    }
    message.success({ content: name + ' 成功，请稍后刷新我的分享列表', key: loadingkey, duration: 1 })
    window.getDvaApp()._store.dispatch({ type: 'share/aRefresh' })
  } catch (e: any) {
    message.error(e.message)
    SettingLog.mSaveLog('danger', e.message)
  }
  _topDelete = false
}

export async function topCopyShareLink() {
  const filelist = ShareDAL.QuerySelectedShareList()
  let link = ''
  let count = 0
  for (let i = 0, maxi = filelist.length; i < maxi; i++) {
    const item = filelist[i]

    count++
    link += item.share_name + '\n' + '链接：https://www.aliyundrive.com/s/' + item.share_id
    if (item.share_pwd) link += '  提取码：' + item.share_pwd
    link += '\n\n'
  }
  if (count == 0) {
    message.error('没有有效的分享链接！')
  } else {
    window.Electron.clipboard.writeText(link, 'clipboard')
    message.success({ content: '分享链接已复制到剪切板(' + count.toString() + ')', duration: 2 })
  }
}

export async function topEditShareLink() {
  const filelist = ShareDAL.QuerySelectedShareList()
  if (filelist.length > 0) {
    ShowEditShareModal(true, filelist)
  }
}

export async function topDeleteOtherShare() {
  const filelist = ShareDAL.QuerySelectedOtherShareList()
  for (let i = 0, maxi = filelist.length; i < maxi; i++) {
    ShareDAL.DeleteOtherShare(filelist[i].share_id, false)
  }
  ShareDAL.DeleteOtherShare('', true)
}

export async function topCopyOtherShareLink() {
  const filelist = ShareDAL.QuerySelectedOtherShareList()
  let link = ''
  let count = 0
  for (let i = 0, maxi = filelist.length; i < maxi; i++) {
    const item = filelist[i]
    count++
    link += item.share_name + '\n' + '链接：https://www.aliyundrive.com/s/' + item.share_id
    if (item.share_pwd) link += '  提取码：' + item.share_pwd
    link += '\n\n'
  }
  if (count == 0) {
    message.error('没有有效的分享链接！')
  } else {
    window.Electron.clipboard.writeText(link, 'clipboard')
    message.success({ content: '分享链接已复制到剪切板(' + count.toString() + ')', duration: 2 })
  }
}
