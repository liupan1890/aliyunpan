import message from '@/utils/message'
import AliHttp from './alihttp'
import { ApiBatch, ApiBatchMaker, ApiBatchMaker2, ApiBatchSuccess, ApiWaitAsyncTask } from './utils'

export default class AliFileCmd {
  
  static async ApiCreatNewForder(user_id: string, drive_id: string, parentid: string, name: string): Promise<string | undefined> {
    const url = 'adrive/v2/file/createWithFolders'
    
    const postdata = JSON.stringify({
      drive_id: drive_id,
      parent_file_id: parentid,
      name: name,
      check_name_mode: 'refuse',
      type: 'folder'
    })
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      const file_id = resp.body.file_id as string | undefined
      if (file_id) return file_id
    }
    if (resp.body?.code == 'QuotaExhausted.Drive') return '网盘空间已满,无法创建'
    return undefined
  }

  
  static async ApiTrashBatch(user_id: string, drive_id: string, files: string[]): Promise<string[]> {
    const batchlist = ApiBatchMaker('/recyclebin/trash', files, (file_id: string) => {
      return { drive_id: drive_id, file_id: file_id }
    })
    return ApiBatchSuccess('放入回收站', batchlist, user_id, '')
  }

  
  static async ApiDeleteBatch(user_id: string, drive_id: string, files: string[]): Promise<string[]> {
    const batchlist = ApiBatchMaker('/file/delete', files, (file_id: string) => {
      return { drive_id: drive_id, file_id: file_id }
    })
    return ApiBatchSuccess('彻底删除', batchlist, user_id, '')
  }

  
  static async ApiRenameBatch(user_id: string, drive_id: string, files: string[], names: string[]): Promise<{ file_id: string; parent_file_id: string; name: string; isdir: boolean }[]> {
    const batchlist = ApiBatchMaker2('/file/update', files, names, (file_id: string, name: string) => {
      return { drive_id: drive_id, file_id: file_id, name: name, check_name_mode: 'refuse' }
    })

    if (batchlist.length == 0) return Promise.resolve([])
    let successlist: { file_id: string; parent_file_id: string; name: string; isdir: boolean }[] = []
    const result = await ApiBatch(files.length <= 1 ? '' : '批量重命名', batchlist, user_id, '')
    result.reslut.map((t) => successlist.push({ file_id: t.file_id!, name: t.name!, parent_file_id: t.parent_file_id!, isdir: t.type !== 'folder' }))
    return successlist
  }

  
  static async ApiFavorBatch(user_id: string, drive_id: string, isfavor: boolean, ismessage: boolean, files: string[]): Promise<string[]> {
    const batchlist = ApiBatchMaker('/file/update', files, (file_id: string) => {
      return { drive_id: drive_id, file_id: file_id, custom_index_key: isfavor ? 'starred_yes' : '', starred: isfavor }
    })
    return ApiBatchSuccess(ismessage ? (isfavor ? '收藏文件' : '取消收藏') : '', batchlist, user_id, '')
  }
  
  static async ApiTrashCleanBatch(user_id: string, drive_id: string, ismessage: boolean, files: string[]): Promise<string[]> {
    const batchlist = ApiBatchMaker('/file/delete', files, (file_id: string) => {
      return { drive_id: drive_id, file_id: file_id }
    })
    return ApiBatchSuccess(ismessage ? '从回收站删除' : '', batchlist, user_id, '')
  }
  
  static async ApiTrashRestoreBatch(user_id: string, drive_id: string, ismessage: boolean, files: string[]): Promise<string[]> {
    const batchlist = ApiBatchMaker('/recyclebin/restore', files, (file_id: string) => {
      return { drive_id: drive_id, file_id: file_id }
    })
    return ApiBatchSuccess(ismessage ? '从回收站还原' : '', batchlist, user_id, '')
  }
  
  static async ApiFileColorBatch(user_id: string, drive_id: string, color: string, files: string[]): Promise<string[]> {
    const batchlist = ApiBatchMaker('/file/update', files, (file_id: string) => {
      return { drive_id: drive_id, file_id: file_id, description: color }
    })
    return ApiBatchSuccess(color=='c5b89b8'?'':'标记文件', batchlist, user_id, '')
  }
  
  static async ApiRecoverBatch(user_id: string, resumelist: { drive_id: string; file_id: string; content_hash: string; size: number; name: string }[]): Promise<string[]> {
    let successlist: string[] = []
    if (!resumelist || resumelist.length == 0) return Promise.resolve(successlist)

    const url = 'adrive/v1/file/resumeDeleted'
    const postdata = JSON.stringify({ resume_file_list: resumelist })
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      const task_id = resp.body.task_id as string
      for (let j = 0; j < 100; j++) {
        const url2 = 'adrive/v1/file/checkResumeTask'
        const resp2 = await AliHttp.Post(url2, { task_id }, user_id, '')
        if (AliHttp.IsSuccess(resp2.code)) {
          
          if (resp2.body.state == 'running') continue
          if (resp2.body.state == 'done') {
            let results = resp2.body.results as any[]
            if (results) {
              results.map((t) => {
                if (t.status && t.status == 200) successlist.push(t.file_id)
              })
            }
            return successlist 
          }
        }
      }
    } else if (resp.code && resp.code == 403) {
      if (resp.body?.code == 'UserNotVip') message.error('文件恢复功能需要开通阿里云盘会员')
      else message.error(resp.body?.code || '拒绝访问')
    } else {
      message.error('操作失败')
    }
    return successlist
  }

  
  static async ApiMoveBatch(user_id: string, drive_id: string, files: string[], moveto_drive_id: string, moveto_dir_id: string): Promise<string[]> {
    const batchlist = ApiBatchMaker('/file/move', files, (file_id: string) => {
      if (drive_id == moveto_drive_id) return { drive_id: drive_id, file_id: file_id, to_parent_file_id: moveto_dir_id, auto_rename: true }
      else return { drive_id: drive_id, file_id: file_id, to_drive_id: moveto_drive_id, to_parent_file_id: moveto_dir_id, auto_rename: true }
    })
    return ApiBatchSuccess(files.length <= 1 ? '移动' : '批量移动', batchlist, user_id, '')
  }
  
  static async ApiCopyBatch(user_id: string, drive_id: string, files: string[], moveto_drive_id: string, moveto_dir_id: string): Promise<string[]> {
    const batchlist = ApiBatchMaker('/file/copy', files, (file_id: string) => {
      if (drive_id == moveto_drive_id) return { drive_id: drive_id, file_id: file_id, to_parent_file_id: moveto_dir_id, auto_rename: true }
      else return { drive_id: drive_id, file_id: file_id, to_drive_id: moveto_drive_id, to_parent_file_id: moveto_dir_id, auto_rename: true }
    })
    return ApiBatchSuccess(files.length <= 1 ? '复制' : '批量复制', batchlist, user_id, '')
  }
}
