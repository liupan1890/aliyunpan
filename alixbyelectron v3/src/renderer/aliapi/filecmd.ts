import { SafeJsonStr, Unicode } from '@/store/format'
import { message, notification } from 'antd'
import AliHttp from './alihttp'
import { ApiBatch, IsSuccess } from './utils'

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
    if (IsSuccess(resp.code)) {
      const file_id = resp.body.file_id as string | undefined
      if (file_id) return file_id
    }
    if (resp.body?.code == 'QuotaExhausted.Drive') return '网盘空间已满,无法创建'
    return undefined
  }
  static async ApiFavorBatch(user_id: string, drive_id: string, isfavor: boolean, ismessage: boolean, files: string[]): Promise<number> {
    if (!files || files.length == 0) return Promise.resolve(0)
    const batchlist: string[] = []
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      let favdata = '{"body":{"drive_id":"' + drive_id + '","file_id":"' + files[i] + '","custom_index_key":"","starred":false},"headers":{"Content-Type":"application/json"},"id":"' + files[i] + '","method":"POST","url":"/file/update"}'

      if (isfavor) {
        favdata =
          '{"body":{"drive_id":"' + drive_id + '","file_id":"' + files[i] + '","custom_index_key":"starred_yes","starred":true},"headers":{"Content-Type":"application/json"},"id":"' + files[i] + '","method":"POST","url":"/file/update"}'
      }
      batchlist.push(favdata)
    }

    const result = await ApiBatch(ismessage ? (isfavor ? '收藏文件' : '取消收藏') : '', batchlist, user_id, '')
    return result.count
  }
  static async ApiTrashBatch(user_id: string, drive_id: string, files: string[]): Promise<number> {
    if (!files || files.length == 0) return Promise.resolve(0)
    const batchlist: string[] = []
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      const postdata = '{"body":{"drive_id":"' + drive_id + '","file_id":"' + files[i] + '"},"headers":{"Content-Type":"application/json"},"id":"' + files[i] + '","method":"POST","url":"/recyclebin/trash"}'
      batchlist.push(postdata)
    }
    const result = await ApiBatch('删除文件到回收站', batchlist, user_id, '')
    return result.count
  }
  static async ApiTrashDeleteBatch(user_id: string, drive_id: string, files: string[], permanently: boolean): Promise<number> {
    if (!files || files.length == 0) return Promise.resolve(0)
    const batchlist: string[] = []
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      const postdata =
        '{"body":{"drive_id":"' + drive_id + '","file_id":"' + files[i] + '"' + (permanently ? ',"permanently":true' : '') + '},"headers":{"Content-Type":"application/json"},"id":"' + files[i] + '","method":"POST","url":"/file/delete"}'
      batchlist.push(postdata)
    }
    const result = await ApiBatch('彻底删除文件', batchlist, user_id, '')
    return result.count
  }
  static async ApiTrashCleanBatch(user_id: string, drive_id: string, files: string[]): Promise<number> {
    if (!files || files.length == 0) return Promise.resolve(0)
    const batchlist: string[] = []
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      const postdata = '{"body":{"drive_id":"' + drive_id + '","file_id":"' + files[i] + '"' + '},"headers":{"Content-Type":"application/json"},"id":"' + files[i] + '","method":"POST","url":"/file/delete"}'
      batchlist.push(postdata)
    }
    const result = await ApiBatch('', batchlist, user_id, '')
    return result.count
  }
  static async ApiTrashRestoreBatch(user_id: string, drive_id: string, files: string[]): Promise<number> {
    if (!files || files.length == 0) return Promise.resolve(0)
    const batchlist: string[] = []
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      const postdata = '{"body":{"drive_id":"' + drive_id + '","file_id":"' + files[i] + '"},"headers":{"Content-Type":"application/json"},"id":"' + files[i] + '","method":"POST","url":"/recyclebin/restore"}'
      batchlist.push(postdata)
    }
    const result = await ApiBatch('恢复文件', batchlist, user_id, '')
    return result.count
  }
  static async ApiRenameBatch(user_id: string, drive_id: string, files: string[], names: string[]): Promise<number> {
    if (!files || files.length == 0) return Promise.resolve(0)
    const batchlist: string[] = []
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      const postdata = JSON.stringify({
        body: { drive_id: drive_id, file_id: files[i], name: names[i], check_name_mode: 'refuse' },
        headers: { 'Content-Type': 'application/json' },
        id: files[i],
        method: 'POST',
        url: '/file/update'
      })
      batchlist.push(postdata)
    }
    const result = await ApiBatch(files.length <= 1 ? '' : '批量重命名', batchlist, user_id, '')
    return result.count
  }
  static async ApiMoveBatch(user_id: string, drive_id: string, files: string[], moveto_drive_id: string, moveto_dir_id: string): Promise<number> {
    if (!files || files.length == 0) return Promise.resolve(0)
    const batchlist: string[] = []
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      if (drive_id == moveto_drive_id) {
        batchlist.push(
          '{"body":{"drive_id":"' +
            drive_id +
            '","file_id":"' +
            files[i] +
            '","to_parent_file_id":"' +
            moveto_dir_id +
            '","auto_rename":true},"headers":{"Content-Type":"application/json"},"id":"' +
            files[i] +
            '","method":"POST","url":"/file/move"}'
        )
      } else {
        batchlist.push(
          '{"body":{"drive_id":"' +
            drive_id +
            '","file_id":"' +
            files[i] +
            '","to_drive_id":"' +
            moveto_drive_id +
            '","to_parent_file_id":"' +
            moveto_dir_id +
            '","auto_rename":true},"headers":{"Content-Type":"application/json"},"id":"' +
            files[i] +
            '","method":"POST","url":"/file/move"}'
        )
      }
    }
    const result = await ApiBatch(files.length <= 1 ? '移动' : '批量移动', batchlist, user_id, '')
    return result.count
  }
  static async ApiCopyBatch(user_id: string, drive_id: string, files: string[], names: string[], moveto_drive_id: string, moveto_dir_id: string): Promise<number> {
    if (!files || files.length == 0) return Promise.resolve(0)
    const batchlist: string[] = []
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      if (drive_id == moveto_drive_id) {
        batchlist.push(
          '{"body":{"drive_id":"' +
            drive_id +
            '","file_id":"' +
            files[i] +
            '","to_parent_file_id":"' +
            moveto_dir_id +
            '","auto_rename":true},"headers":{"Content-Type":"application/json"},"id":"' +
            files[i] +
            '","method":"POST","url":"/file/copy"}'
        )
      } else {
        batchlist.push(
          '{"body":{"drive_id":"' +
            drive_id +
            '","file_id":"' +
            files[i] +
            '","to_drive_id":"' +
            moveto_drive_id +
            '","to_parent_file_id":"' +
            moveto_dir_id +
            '","auto_rename":true},"headers":{"Content-Type":"application/json"},"id":"' +
            files[i] +
            '","method":"POST","url":"/file/copy"}'
        )
      }
    }
    const result = await ApiBatch(files.length <= 1 ? '复制' : '批量复制', batchlist, user_id, '')
    if (result.task.length > 0) message.warning('复制文件时部分文件正在异步执行')
    if (result.task.length > 0) {
      for (let i = 0, maxi = result.task.length; i < maxi; i++) {
        const task = result.task[i]
        for (let j = 0, maxj = files.length; j < maxj; j++) {
          if (files[j] == task.file_id) {
            const name = names[j]
            const task_id = task.task_id
            notification.open({
              key: 'task_' + task_id,
              className: 'tasknotify taskloading',
              message: '复制中[0] ' + name,
              placement: 'bottomRight',
              duration: 0
            })

            let p = 0
            const interval = setInterval(() => {
              if (p < 90) p++
              AliFileCmd.ApiAsyncTask(user_id, task_id)
                .then((ap: number) => {
                  notification.open({
                    key: 'task_' + task_id,
                    className: 'tasknotify taskloading',
                    message: `复制中[${ap == 0 ? p : ap}] ` + name,
                    placement: 'bottomRight',
                    duration: 0
                  })

                  if (ap === 100) {
                    notification.open({
                      key: 'task_' + task_id,
                      className: 'tasknotify tasksuccess',
                      message: '复制完成!',
                      placement: 'bottomRight',
                      duration: 2
                    })
                    clearInterval(interval)
                  }
                  if (ap < 0) {
                    notification.open({
                      key: 'task_' + task_id,
                      className: 'tasknotify taskerror',
                      message: '复制失败!' + name,
                      placement: 'bottomRight',
                      duration: 3
                    })
                    clearInterval(interval)
                  }
                })
                .catch(() => {
                  clearInterval(interval)
                })
            }, 1000)
            break
          }
        }
      }
    }

    return result.count
  }
  static async ApiAsyncTask(user_id: string, async_task_id: string): Promise<number> {
    const url = 'v2/async_task/get'
    const postdata = {
      async_task_id
    }
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    if (IsSuccess(resp.code)) {
      if (resp.body.state == 'Succeed' || resp.body.state == 'succeed') return 100 as number
      if (resp.body.state == 'Failed' || resp.body.state == 'failed') return -100 as number
      if (resp.body.state == 'Running' || resp.body.state == 'running') {
        if (resp.body.total_process) return resp.body.total_process as number
        return 0 as number
      }
    }
    return -1
  }

  static async ApiDescriptionBatch(user_id: string, drive_id: string, description: string, files: string[]): Promise<number> {
    if (!files || files.length == 0) return Promise.resolve(0)
    const batchlist: string[] = []
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      let desdata = '{"body":{"drive_id":"' + drive_id + '","file_id":"' + files[i] + '","description":"' + description + '"},"headers":{"Content-Type":"application/json"},"id":"' + files[i] + '","method":"POST","url":"/file/update"}'
      batchlist.push(desdata)
    }

    const result = await ApiBatch('', batchlist, user_id, '')
    return result.count
  }
}
