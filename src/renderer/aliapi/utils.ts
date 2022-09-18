import { ITokenInfo, useFootStore } from '../store'
import UserDAL from '../user/userdal'
import DebugLog from '../utils/debuglog'
import { Sleep } from '../utils/format'
import message from '../utils/message'
import AliHttp from './alihttp'
import AliFile from './file'
import { IAliBatchResult } from './models'


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
  if (!user_id && !share_token) return
  const url = 'v2/batch'
  const resp = await AliHttp.Post(url, postdata, user_id, share_token)
  if (AliHttp.IsSuccess(resp.code)) {
    const responses = resp.body.responses
    for (let i = 0, maxi = responses.length; i < maxi; i++) {
      const status = responses[i].status as number
      if (status >= 200 && status <= 205) {
        result.count++
        const respi = responses[i]
        if (respi.body && respi.body.async_task_id) {
          
          
          result.async_task.push({ drive_id: respi.body.drive_id || '', file_id: respi.id, task_id: respi.body.async_task_id, newdrive_id: respi.body.drive_id || '', newfile_id: respi.body.file_id || '' })
        } else if (respi.body && respi.body.share_id && respi.body.share_msg) {
          
          result.reslut.push({ id: respi.id, share_id: respi.body.share_id, share_pwd: respi.body.share_pwd || '', share_url: respi.body.share_url, expiration: respi.body.expiration || '', share_name: respi.body.share_name || '' })
        } else if (respi.body) {
          result.reslut.push({ id: respi.id, file_id: respi.body.file_id, name: respi.body.name || '', body: respi.body })
        } else if (respi.id) {
          result.reslut.push({ id: respi.id, file_id: respi.id })
        }
      } else {
        const respi = responses[i]
        let logmsg = (respi.body.code || '') + ' ' + (respi.body.message || '')
        if (logmsg.includes('File under sync control') == false) DebugLog.mSaveDanger(logmsg)
        if (respi.body && respi.body.code) result.error.push({ id: respi.body.id || respi.id, code: respi.body.code, message: respi.body.message })
      }
    }
  } else {
    DebugLog.mSaveWarning('_ApiBatch err=' + (resp.code || ''))
  }
}
export async function ApiBatch(title: string, batchlist: string[], user_id: string, share_token: string) {
  const result: IAliBatchResult = { count: 0, async_task: [], reslut: [], error: [] }
  if (!user_id && !share_token) return result

  let loadingkey = 'filebatch' + Date.now().toString()
  if (title != '') message.loading(title + ' 执行中...', 60, loadingkey)

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
      if (title != '') message.loading(title + ' 执行中...(' + result.count.toString() + ')', 60, loadingkey)
    }
  }
  if (add > 0) {
    postdata += '],"resource":"file"}'
    alltask.push(_ApiBatch(postdata, user_id, share_token, result))
  }
  if (alltask.length > 0) await Promise.all(alltask).catch(() => {})
  
  if (result.async_task.length > 0) {
    if (title != '' || share_token != '') message.warning(title + ' 异步执行中(' + result.async_task.length + ')', 2, loadingkey)

    let type: AsyncType = '异步'
    if (title == '放入回收站') type = '放回收站'
    if (title == '从回收站还原') type = '回收站还原'

    if (title == '彻底删除') type = '彻底删除'
    if (title == '批量复制') type = '复制'
    if (title == '复制') type = '复制'
    if (title == '' && share_token) type = '导入分享'

    const footStore = useFootStore()
    for (let i = 0, maxi = result.async_task.length; i < maxi; i++) {
      let task = result.async_task[i]

      if (type == '放回收站' || type == '彻底删除') {
        
        result.reslut.push({ id: task.file_id, file_id: task.newfile_id })
      }

      if (task.newdrive_id && task.newfile_id) {
        let fileinfo = await AliFile.ApiGetFile(user_id, task.newdrive_id, task.newfile_id)
        if (fileinfo) {
          footStore.mAddTask(user_id, task.task_id, type, fileinfo.name, task.newdrive_id, task.newfile_id)
          continue
        }
      }
      footStore.mAddTask(user_id, task.task_id, type, task.task_id, '', '')
    }
  }

  
  if (title != '' || share_token != '') {
    if (result.error.length == 0) {
      if (result.async_task.length > 0) {
        message.warning(title + ' 异步执行中(' + result.async_task.length + ')', 2, loadingkey)
      } else {
        message.success(title + ' 成功', 0, loadingkey)
        message.success(title + ' 成功', 3)
      }
    } else {
      message.error(title + ' 成功(' + result.count.toString() + ')个 失败 (' + result.error.length.toString() + ')个', 3, loadingkey)

      let issyncerror = false
      result.error.map((t) => {
        if (t.message.includes('File under sync control')) issyncerror = true
      })
      if (issyncerror) message.error('自动备份文件夹不支持移动/新建/删除/重命名等操作', 3)
    }
  }
  return result
}


export function ApiBatchMaker(url: string, idlist: string[], bodymake: (file_id: string) => any) {
  if (!idlist || idlist.length == 0) return []
  const batchlist: string[] = []
  const batchset = new Set()
  for (let i = 0, maxi = idlist.length; i < maxi; i++) {
    let id = idlist[i]
    if (batchset.has(id)) continue
    batchset.add(id)
    batchlist.push(JSON.stringify({ body: bodymake(id), headers: { 'Content-Type': 'application/json' }, id: id, method: 'POST', url }))
  }
  batchset.clear()
  return batchlist
}

export function ApiBatchMaker2(url: string, idlist: string[], namelist: string[], bodymake: (file_id: string, name: string) => any) {
  if (!idlist || idlist.length == 0) return []
  const batchlist: string[] = []
  const batchset = new Set()
  for (let i = 0, maxi = idlist.length; i < maxi; i++) {
    let id = idlist[i]
    if (batchset.has(id)) continue
    batchset.add(id)
    batchlist.push(JSON.stringify({ body: bodymake(id, namelist[i]), headers: { 'Content-Type': 'application/json' }, id: id, method: 'POST', url }))
  }
  batchset.clear()
  return batchlist
}

export async function ApiBatchSuccess(title: string, batchlist: string[], user_id: string, share_token: string) {
  if (batchlist.length == 0) return Promise.resolve(batchlist)
  let successlist: string[] = []
  const result = await ApiBatch(title, batchlist, user_id, share_token)
  result.reslut.map((t) => successlist.push(t.id))

  return successlist
}

export async function ApiWaitAsyncTask(title: string, user_id: string, tasklist: IAliBatchResult['async_task']) {
  for (let i = 0, maxi = tasklist.length; i < maxi; i++) {
    let async_task_id = tasklist[i].task_id
    if (!user_id || !async_task_id) continue
    for (let j = 0; j < 100; j++) {
      const url = 'v2/async_task/get'
      const postdata = { async_task_id }
      const resp = await AliHttp.Post(url, postdata, user_id, '')
      if (AliHttp.IsSuccess(resp.code)) {
        if (resp.body.state == 'Succeed' || resp.body.state == 'succeed') break
        if (resp.body.state == 'done' || resp.body.state == 'done') break
        if (resp.body.state == 'Failed' || resp.body.state == 'failed') break
        if (resp.body.state == 'Running' || resp.body.state == 'running') continue
      }
      await Sleep(1000)
    }
  }
}

export async function ApiGetAsyncTask(user_id: string, async_task_id: string) {
  if (!user_id || !async_task_id) return 'error'
  const url = 'v2/async_task/get'
  const postdata = { async_task_id }
  const resp = await AliHttp.Post(url, postdata, user_id, '')
  if (AliHttp.IsSuccess(resp.code)) {
    if (resp.body.state == 'Succeed' || resp.body.state == 'succeed') return 'success'
    if (resp.body.state == 'done' || resp.body.state == 'done') return 'success'
    if (resp.body.state == 'Failed' || resp.body.state == 'failed') return 'error'
    if (resp.body.state == 'Running' || resp.body.state == 'running') return 'running'
    if (resp.body.state == 'PartialSucceed') {
      message.warning('操作部分成功 ' + resp.body.message?.replace('ErrQuotaExhausted', '网盘空间已满') || '', 5)
      return 'error'
    }
  } else {
    DebugLog.mSaveWarning('ApiGetAsyncTask err=' + (resp.code || ''))
  }
  return 'error'
}


export async function ApiGetAsyncTaskUnzip(user_id: string, drive_id: string, file_id: string, domain_id: string, task_id: string) {
  if (!user_id || !task_id) return 'error'
  const url = 'v2/archive/status'
  const postdata = { drive_id, file_id, domain_id, task_id }
  const resp = await AliHttp.Post(url, postdata, user_id, '')
  if (AliHttp.IsSuccess(resp.code)) {
    if (resp.body.state == 'Succeed' || resp.body.state == 'succeed') return 'success'
    if (resp.body.state == 'Failed' || resp.body.state == 'failed') return 'error'
    if (resp.body.state == 'Running' || resp.body.state == 'running') return 'running'
    if (resp.body.state == 'PartialSucceed') {
      message.warning('操作部分成功 ' + resp.body.message?.replace('ErrQuotaExhausted', '网盘空间已满') || '', 5)
      return 'error'
    }
  } else {
    DebugLog.mSaveWarning('ApiGetAsyncTaskUnzip err=' + (resp.code || ''))
  }
  return 'error'
}
