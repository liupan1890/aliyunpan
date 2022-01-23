import SettingLog from '@/setting/settinglog'
import { ITokenInfo } from '@/store/models'
import UserDAL from '@/store/userdal'
import { message } from 'antd'
import AliHttp from './alihttp'
import { IAliBatchResult } from './models'

export function IsSuccess(code: number) {
  return code >= 200 && code <= 300
}

export function GetDriveID(user_id: string, drive: Drive) {
  let token = UserDAL.GetUserToken(user_id)
  if (token) {
    switch (drive) {
      case 'pan':
        return token.default_drive_id
      case 'pic':
        return token.pic_drive_id
      case 'safe':
        return token.default_sbox_drive_id
    }
  }
  return ''
}

export function GetDriveID2(token: ITokenInfo, drive: string) {
  if (token) {
    switch (drive) {
      case 'pan':
        return token.default_drive_id
      case 'pic':
        return token.pic_drive_id
      case 'safe':
        return token.default_sbox_drive_id
    }
  }
  return drive
}

async function _ApiBatch(postdata: string, user_id: string, share_token: string, result: IAliBatchResult) {
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
export async function ApiBatch(title: string, batchlist: string[], user_id: string, share_token: string) {
  let loadingkey = 'filebatch' + Date.now().toString()
  if (title != '') message.loading({ content: title + ' 执行中...', key: loadingkey, duration: 0 })

  const result: IAliBatchResult = { count: 0, task: [], reslut: [], error: [] }
  let add = 0
  let postdata = '{"requests":['
  let alltask: Promise<void>[] = []
  for (let i = 0, maxi = batchlist.length; i < maxi; i++) {
    if (add > 0) postdata = postdata + ','
    add++
    postdata = postdata + batchlist[i]
    if (add > 99) {
      postdata += '],"resource":"file"}'
      alltask.push(_ApiBatch(postdata, user_id, share_token, result))
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
    alltask.push(_ApiBatch(postdata, user_id, share_token, result))
  }
  if (alltask.length > 0) await Promise.all(alltask).catch(() => {})
  if (title != '') {
    if (result.error.length == 0) {
      message.success({ content: title + ' 成功', key: loadingkey, duration: 2 })
    } else {
      message.error({ content: title + ' 成功(' + result.count.toString() + ')个 失败 (' + result.error.length.toString() + ')个', key: loadingkey, duration: 3 })
    }
  }
  return result
}
