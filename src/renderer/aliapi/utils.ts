import { ITokenInfo, useFootStore } from '../store'
import UserDAL from '../user/userdal'
import DebugLog from '../utils/debuglog'
import { Sleep } from '../utils/format'
import message from '../utils/message'
import AliHttp from './alihttp'
import AliFile from './file'
import { IAliBatchResult } from './models'

export declare type Drive = 'pan' | 'pic' | 'safe'


export function GetDriveID(user_id: string, drive: Drive): string {
  const token = UserDAL.GetUserToken(user_id) 
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


export function GetDriveID2(token: ITokenInfo, driveName: string): string {
  if (token) {
    switch (driveName) {
      case 'pan':
        return token.default_drive_id
      case 'pic':
        return token.pic_drive_id
      case 'safe':
        return token.default_sbox_drive_id
    }
  }
  return driveName
}

async function _ApiBatch(postData: string, user_id: string, share_token: string, result: IAliBatchResult): Promise<void> {
  if (!user_id && !share_token) return
  const url = 'v2/batch'
  const resp = await AliHttp.Post(url, postData, user_id, share_token)
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
        const logmsg = (respi.body.code || '') + ' ' + (respi.body.message || '')
        if (logmsg.includes('File under sync control') == false) DebugLog.mSaveDanger(logmsg)
        if (respi.body && respi.body.code) result.error.push({ id: respi.body.id || respi.id, code: respi.body.code, message: respi.body.message })
      }
    }
  } else {
    DebugLog.mSaveWarning('_ApiBatch err=' + (resp.code || ''))
  }
}

export declare type AsyncType = '解压' | '复制' | '导入分享' | '回收站还原' | '异步' | '放回收站' | '彻底删除'

export async function ApiBatch(title: string, batchList: string[], user_id: string, share_token: string): Promise<IAliBatchResult> {
  const result: IAliBatchResult = { count: 0, async_task: [], reslut: [], error: [] }
  if (!user_id && !share_token) return result

  const loadingKey = 'filebatch' + Date.now().toString()
  if (title != '') message.loading(title + ' 执行中...', 60, loadingKey)

  let add = 0
  let postData = '{"requests":['
  let allTask: Promise<void>[] = []
  for (let i = 0, maxi = batchList.length; i < maxi; i++) {
    if (add > 0) postData = postData + ','
    add++
    postData = postData + batchList[i]
    if (add > 99) {
      postData += '],"resource":"file"}'
      allTask.push(_ApiBatch(postData, user_id, share_token, result))
      postData = '{"requests":['
      add = 0
    }

    if (allTask.length >= 3) {
      
      await Promise.all(allTask).catch(() => {})
      allTask = []
      if (title != '') message.loading(title + ' 执行中...(' + result.count.toString() + ')', 60, loadingKey)
    }
  }
  if (add > 0) {
    postData += '],"resource":"file"}'
    allTask.push(_ApiBatch(postData, user_id, share_token, result))
  }
  if (allTask.length > 0) await Promise.all(allTask).catch(() => {})
  
  if (result.async_task.length > 0) {
    if (title != '' || share_token != '') message.warning(title + ' 异步执行中(' + result.async_task.length + ')', 2, loadingKey)

    let type: AsyncType = '异步'
    if (title == '放入回收站') type = '放回收站'
    if (title == '从回收站还原') type = '回收站还原'

    if (title == '彻底删除') type = '彻底删除'
    if (title == '批量复制') type = '复制'
    if (title == '复制') type = '复制'
    if (!title && share_token) type = '导入分享'

    const footStore = useFootStore()
    for (let i = 0, maxi = result.async_task.length; i < maxi; i++) {
      const task = result.async_task[i]

      if (type == '放回收站' || type == '彻底删除') {
        
        result.reslut.push({ id: task.file_id, file_id: task.newfile_id })
      }

      if (task.newdrive_id && task.newfile_id) {
        const fileinfo = await AliFile.ApiGetFile(user_id, task.newdrive_id, task.newfile_id)
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
        message.warning(title + ' 异步执行中(' + result.async_task.length + ')', 2, loadingKey)
      } else {
        message.success(title + ' 成功', 0, loadingKey)
        message.success(title + ' 成功', 3)
      }
    } else {
      message.error(title + ' 成功(' + result.count.toString() + ')个 失败 (' + result.error.length.toString() + ')个', 3, loadingKey)

      let isSyncError = false
      result.error.map((t) => {
        if (t.message.includes('File under sync control')) isSyncError = true
        return true
      })
      if (isSyncError) message.error('自动备份文件夹不支持移动/新建/删除/重命名等操作', 3)
    }
  }
  return result
}


export function ApiBatchMaker(url: string, idList: string[], bodymake: (file_id: string) => any): string[] {
  if (!idList || idList.length == 0) return []
  const batchList: string[] = []
  const batchSet = new Set()
  for (let i = 0, maxi = idList.length; i < maxi; i++) {
    const id = idList[i]
    if (batchSet.has(id)) continue
    batchSet.add(id)
    batchList.push(JSON.stringify({ body: bodymake(id), headers: { 'Content-Type': 'application/json' }, id: id, method: 'POST', url }))
  }
  batchSet.clear()
  return batchList
}

export function ApiBatchMaker2(url: string, idList: string[], namelist: string[], bodymake: (file_id: string, name: string) => any): string[] {
  if (!idList || idList.length == 0) return []
  const batchList: string[] = []
  const batchSet = new Set()
  for (let i = 0, maxi = idList.length; i < maxi; i++) {
    const id = idList[i]
    if (batchSet.has(id)) continue
    batchSet.add(id)
    batchList.push(JSON.stringify({ body: bodymake(id, namelist[i]), headers: { 'Content-Type': 'application/json' }, id: id, method: 'POST', url }))
  }
  batchSet.clear()
  return batchList
}

export async function ApiBatchSuccess(title: string, batchList: string[], user_id: string, share_token: string): Promise<string[]> {
  if (batchList.length == 0) return Promise.resolve(batchList)
  const successList: string[] = []
  const result = await ApiBatch(title, batchList, user_id, share_token)
  result.reslut.map((t) => successList.push(t.id))
  return successList
}

export async function ApiWaitAsyncTask(title: string, user_id: string, taskList: IAliBatchResult['async_task']): Promise<void> {
  for (let i = 0, maxi = taskList.length; i < maxi; i++) {
    const async_task_id = taskList[i].task_id
    if (!user_id || !async_task_id) continue
    for (let j = 0; j < 100; j++) {
      const url = 'v2/async_task/get'
      const postData = { async_task_id }
      const resp = await AliHttp.Post(url, postData, user_id, '')
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

export async function ApiGetAsyncTask(user_id: string, async_task_id: string): Promise<'running' | 'error' | 'success'> {
  if (!user_id || !async_task_id) return 'error'
  const url = 'v2/async_task/get'
  const postData = { async_task_id }
  const resp = await AliHttp.Post(url, postData, user_id, '')
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


export async function ApiGetAsyncTaskUnzip(user_id: string, drive_id: string, file_id: string, domain_id: string, task_id: string): Promise<string> {
  if (!user_id || !task_id) return 'error'
  const url = 'v2/archive/status'
  const postData = { drive_id, file_id, domain_id, task_id }
  const resp = await AliHttp.Post(url, postData, user_id, '')
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
