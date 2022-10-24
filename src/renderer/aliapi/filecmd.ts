import DebugLog from '../utils/debuglog'
import message from '../utils/message'
import AliHttp from './alihttp'
import { IAliFileItem, IAliGetFileModel } from './alimodels'
import AliDirFileList from './dirfilelist'
import { ApiBatch, ApiBatchMaker, ApiBatchMaker2, ApiBatchSuccess } from './utils'

export default class AliFileCmd {
  
  static async ApiCreatNewForder(user_id: string, drive_id: string, parent_file_id: string, creatDirName: string): Promise<{ file_id: string; error: string }> {
    const result = { file_id: '', error: '新建文件夹失败' }
    if (!user_id || !drive_id || !parent_file_id) return result
    const url = 'adrive/v2/file/createWithFolders'
    const postData = JSON.stringify({
      drive_id: drive_id,
      parent_file_id: parent_file_id,
      name: creatDirName,
      check_name_mode: 'refuse',
      type: 'folder'
    })
    const resp = await AliHttp.Post(url, postData, user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      const file_id = resp.body.file_id as string | undefined
      if (file_id) return { file_id, error: '' }
    } else {
      DebugLog.mSaveWarning('ApiCreatNewForder err=' + parent_file_id + ' ' + (resp.code || ''))
    }
    if (resp.body?.code == 'QuotaExhausted.Drive') return { file_id: '', error: '网盘空间已满,无法创建' }
    if (resp.body?.code) return { file_id: '', error: resp.body?.code }
    return result
  }

  
  static async ApiTrashBatch(user_id: string, drive_id: string, file_idList: string[]): Promise<string[]> {
    const batchList = ApiBatchMaker('/recyclebin/trash', file_idList, (file_id: string) => {
      return { drive_id: drive_id, file_id: file_id }
    })
    return ApiBatchSuccess('放入回收站', batchList, user_id, '')
  }

  
  static async ApiDeleteBatch(user_id: string, drive_id: string, file_idList: string[]): Promise<string[]> {
    const batchList = ApiBatchMaker('/file/delete', file_idList, (file_id: string) => {
      return { drive_id: drive_id, file_id: file_id }
    })
    return ApiBatchSuccess('彻底删除', batchList, user_id, '')
  }

  
  static async ApiRenameBatch(user_id: string, drive_id: string, file_idList: string[], names: string[]): Promise<{ file_id: string; parent_file_id: string; name: string; isDir: boolean }[]> {
    const batchList = ApiBatchMaker2('/file/update', file_idList, names, (file_id: string, name: string) => {
      return { drive_id: drive_id, file_id: file_id, name: name, check_name_mode: 'refuse' }
    })

    if (batchList.length == 0) return Promise.resolve([])
    const successList: { file_id: string; parent_file_id: string; name: string; isDir: boolean }[] = []
    const result = await ApiBatch(file_idList.length <= 1 ? '' : '批量重命名', batchList, user_id, '')
    result.reslut.map((t) => successList.push({ file_id: t.file_id!, name: t.name!, parent_file_id: t.parent_file_id!, isDir: t.type !== 'folder' }))
    return successList
  }

  
  static async ApiFavorBatch(user_id: string, drive_id: string, isfavor: boolean, ismessage: boolean, file_idList: string[]): Promise<string[]> {
    const batchList = ApiBatchMaker('/file/update', file_idList, (file_id: string) => {
      return { drive_id: drive_id, file_id: file_id, custom_index_key: isfavor ? 'starred_yes' : '', starred: isfavor }
    })
    return ApiBatchSuccess(ismessage ? (isfavor ? '收藏文件' : '取消收藏') : '', batchList, user_id, '')
  }

  
  static async ApiTrashCleanBatch(user_id: string, drive_id: string, ismessage: boolean, file_idList: string[]): Promise<string[]> {
    const batchList = ApiBatchMaker('/file/delete', file_idList, (file_id: string) => {
      return { drive_id: drive_id, file_id: file_id }
    })
    return ApiBatchSuccess(ismessage ? '从回收站删除' : '', batchList, user_id, '')
  }

  
  static async ApiTrashRestoreBatch(user_id: string, drive_id: string, ismessage: boolean, file_idList: string[]): Promise<string[]> {
    const batchList = ApiBatchMaker('/recyclebin/restore', file_idList, (file_id: string) => {
      return { drive_id: drive_id, file_id: file_id }
    })
    return ApiBatchSuccess(ismessage ? '从回收站还原' : '', batchList, user_id, '')
  }

  
  static async ApiFileColorBatch(user_id: string, drive_id: string, color: string, file_idList: string[]): Promise<string[]> {
    const batchList = ApiBatchMaker('/file/update', file_idList, (file_id: string) => {
      return { drive_id: drive_id, file_id: file_id, description: color }
    })
    return ApiBatchSuccess(color == '' ? '清除文件标记' : color == 'c5b89b8' ? '' : '标记文件', batchList, user_id, '')
  }

  
  static async ApiRecoverBatch(user_id: string, resumeList: { drive_id: string; file_id: string; content_hash: string; size: number; name: string }[]): Promise<string[]> {
    const successList: string[] = []
    if (!resumeList || resumeList.length == 0) return Promise.resolve(successList)

    const url = 'adrive/v1/file/resumeDeleted'
    const postData = JSON.stringify({ resume_file_list: resumeList })
    const resp = await AliHttp.Post(url, postData, user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      const task_id = resp.body.task_id as string
      if (!user_id || !task_id) return []
      for (let j = 0; j < 100; j++) {
        const url2 = 'adrive/v1/file/checkResumeTask'
        const resp2 = await AliHttp.Post(url2, { task_id }, user_id, '')
        if (AliHttp.IsSuccess(resp2.code)) {
          
          if (resp2.body.state == 'running') continue
          if (resp2.body.state == 'done') {
            const results = resp2.body.results as any[]
            if (results) {
              results.map((t: any) => {
                if (t.status && t.status == 200) successList.push(t.file_id)
                return true
              })
            }
            return successList 
          }
        }
      }
    } else if (resp.code && resp.code == 403) {
      if (resp.body?.code == 'UserNotVip') message.error('文件恢复功能需要开通阿里云盘会员')
      else message.error(resp.body?.code || '拒绝访问')
    } else {
      DebugLog.mSaveWarning('ApiRecoverBatch err=' + (resp.code || ''))
      message.error('操作失败')
    }
    return successList
  }

  
  static async ApiMoveBatch(user_id: string, drive_id: string, file_idList: string[], to_drive_id: string, to_parent_file_id: string): Promise<string[]> {
    const batchList = ApiBatchMaker('/file/move', file_idList, (file_id: string) => {
      if (drive_id == to_drive_id) return { drive_id: drive_id, file_id: file_id, to_parent_file_id: to_parent_file_id, auto_rename: true }
      else return { drive_id: drive_id, file_id: file_id, to_drive_id: to_drive_id, to_parent_file_id: to_parent_file_id, auto_rename: true }
    })
    return ApiBatchSuccess(file_idList.length <= 1 ? '移动' : '批量移动', batchList, user_id, '')
  }

  
  static async ApiCopyBatch(user_id: string, drive_id: string, file_idList: string[], to_drive_id: string, to_parent_file_id: string): Promise<string[]> {
    const batchList = ApiBatchMaker('/file/copy', file_idList, (file_id: string) => {
      if (drive_id == to_drive_id) return { drive_id: drive_id, file_id: file_id, to_parent_file_id: to_parent_file_id, auto_rename: true }
      else return { drive_id: drive_id, file_id: file_id, to_drive_id: to_drive_id, to_parent_file_id: to_parent_file_id, auto_rename: true }
    })
    return ApiBatchSuccess(file_idList.length <= 1 ? '复制' : '批量复制', batchList, user_id, '')
  }

  
  static async ApiGetFileBatch(user_id: string, drive_id: string, file_idList: string[]): Promise<IAliGetFileModel[]> {
    const batchList = ApiBatchMaker('/file/get', file_idList, (file_id: string) => {
      return {
        drive_id: drive_id,
        file_id: file_id,
        url_expire_sec: 14400,
        office_thumbnail_process: 'image/resize,w_400/format,jpeg',
        image_thumbnail_process: 'image/resize,w_400/format,jpeg',
        image_url_process: 'image/resize,w_1920/format,jpeg',
        video_thumbnail_process: 'video/snapshot,t_106000,f_jpg,ar_auto,m_fast,w_400'
      }
    })
    const successList: IAliGetFileModel[] = []
    const result = await ApiBatch('', batchList, user_id, '')
    result.reslut.map((t) => {
      if (t.body) successList.push(AliDirFileList.getFileInfo(t.body as IAliFileItem, 'download_url'))
      return true
    })
    return successList
  }
}
