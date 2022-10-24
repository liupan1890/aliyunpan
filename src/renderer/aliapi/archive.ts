import AliHttp from './alihttp'

export interface ILinkTxtFile {
  key: string
  name: string
  size: number
  sha1: string
}
export interface ILinkTxt {
  key?: string
  name: string
  size: number
  fileList: (ILinkTxtFile | string)[]
  dirList: ILinkTxt[]
}
export interface IArchiveData {
  state: string
  task_id: string
  progress: number
  file_list: ILinkTxt
}

export default class AliArchive {
  
  static ApiGetFileList(result: IArchiveData, file_list: any): void {
    const func = function (file_list: any, link: ILinkTxt) {
      if (!file_list) return
      const parentKey = link.key ? link.key + '/' : ''
      for (let i = 0; i < file_list.length; i++) {
        let name = file_list[i].name as string
        if (name.startsWith(parentKey)) name = name.substr(parentKey.length)
        if (file_list[i].is_folder == true) {
          const item: ILinkTxt = {
            key: file_list[i].name,
            name: name,
            size: file_list[i].size,
            fileList: [],
            dirList: []
          }
          func(file_list[i].items, item)
          link.dirList.push(item)
        } else {
          link.fileList.push({ key: file_list[i].name, name: name, size: file_list[i].size, sha1: '' } as ILinkTxtFile)
        }
      }
    }

    const keys = Object.getOwnPropertyNames(file_list)
    const files: any[] = []
    for (let i = 0; i < keys.length; i++) {
      files.push(file_list[keys[i]])
    }
    func(files, result.file_list)
  }

  
  static async ApiArchiveList(user_id: string, drive_id: string, file_id: string, domain_id: string, archive_type: string, password: string): Promise<IArchiveData | undefined> {
    if (!user_id || !drive_id || !file_id) return undefined
    const url = 'v2/archive/list'
    const postData: {
      drive_id: string
      file_id: string
      domain_id: string
      archive_type: string
      password?: string
    } = {
      drive_id,
      file_id,
      domain_id,
      archive_type 
    }
    if (password) postData.password = password
    const resp = await AliHttp.Post(url, postData, user_id, '')

    const result: IArchiveData = {
      state: '',
      task_id: '',
      progress: 0,
      file_list: { name: '', size: 0, fileList: [], dirList: [] }
    }
    if (AliHttp.IsSuccess(resp.code)) {
      result.state = resp.body.state as string
      result.task_id = resp.body.task_id as string
      if (result.state == 'Succeed' || result.state == 'succeed') {
        AliArchive.ApiGetFileList(result, resp.body.file_list)
      }
      return result
    }

    if (resp.body?.code == 'InvalidPassword') result.state = '密码错误'
    else if (resp.body?.code == 'ArchiveTypeNotSupported') result.state = '不支持的压缩格式'
    else if (resp.body?.code == 'LimitArchive') result.state = '不支持压缩包体积太大'
    else if (resp.body?.code == 'BadArchive') result.state = '不支持的格式(阿里不支持部分版本的加密rar压缩包)'
    else if (resp.body?.code == 'InternalError') result.state = '阿里云盘服务器运行出错'
    else if (resp.body?.code == 'VipFeatureForbidden') result.state = '可能需要开通阿里云盘会员'
    else if (resp.body?.message && resp.body?.message.indexOf('some unknown error') > 0) result.state = '解压时出错'
    else if (resp.body?.code) result.state = resp.body?.code as string
    else result.state = '未知错误'
    return result
  }

  
  static async ApiArchiveStatus(user_id: string, drive_id: string, file_id: string, domain_id: string, task_id: string): Promise<IArchiveData | undefined> {
    if (!user_id || !drive_id || !file_id) return undefined
    const url = 'v2/archive/status'
    const postData = {
      drive_id,
      file_id,
      domain_id,
      task_id
    }
    const resp = await AliHttp.Post(url, postData, user_id, '')
    const result: IArchiveData = {
      state: '',
      task_id: '',
      progress: 0,
      file_list: { key: '', name: '', size: 0, fileList: [], dirList: [] }
    }
    if (AliHttp.IsSuccess(resp.code)) {
      result.state = resp.body.state as string
      result.task_id = resp.body.task_id as string
      result.progress = resp.body.progress as number
      if (result.state == 'Succeed' || result.state == 'succeed') {
        AliArchive.ApiGetFileList(result, resp.body.file_list)
      }
      return result
    }
    if (resp.body?.code == 'InvalidPassword') result.state = '密码错误'
    else if (resp.body?.code == 'InvalidParameterEmpty.TaskId') result.state = 'TaskId无效'
    else if (resp.body?.code == 'LimitArchive') result.state = '不支持压缩包体积太大'
    else if (resp.body?.code == 'BadArchive') result.state = '不支持的格式(阿里不支持部分版本的加密rar压缩包)'
    else if (resp.body?.code == 'InternalError') result.state = '阿里云盘服务器运行出错'
    else if (resp.body?.code == 'VipFeatureForbidden') result.state = '可能需要开通阿里云盘会员'
    else if (resp.body?.code) result.state = resp.body?.code as string
    else result.state = '未知错误'
    return result
  }

  
  static async ApiArchiveUncompress(user_id: string, drive_id: string, file_id: string, domain_id: string, archive_type: string, target_drive_id: string, target_file_id: string, password: string, file_list: string[]): Promise<IArchiveData | undefined> {
    if (!user_id || !drive_id || !file_id || !target_drive_id || !target_file_id) return undefined
    const url = 'v2/archive/uncompress'
    const postData: {
      drive_id: string
      file_id: string
      domain_id: string
      archive_type: string
      target_drive_id: string
      target_file_id: string
      file_list?: string[]
      password?: string
    } = {
      drive_id,
      file_id,
      domain_id,
      target_drive_id,
      target_file_id,
      archive_type 
    }
    if (file_list.length > 0) postData.file_list = file_list
    if (password != '') postData.password = password
    const resp = await AliHttp.Post(url, postData, user_id, '')
    const result: IArchiveData = {
      state: '',
      task_id: '',
      progress: 0,
      file_list: { name: '', size: 0, fileList: [], dirList: [] }
    }
    if (AliHttp.IsSuccess(resp.code)) {
      result.state = resp.body.state as string
      result.task_id = resp.body.task_id as string
      result.progress = resp.body.progress as number
      return result
    }

    if (resp.body?.code == 'InvalidPassword') result.state = '密码错误'
    else if (resp.body?.code == 'ArchiveTypeNotSupported') result.state = '不支持的压缩格式'
    else if (resp.body?.code == 'LimitArchive') result.state = '不支持压缩包体积太大'
    else if (resp.body?.code == 'BadArchive') result.state = '不支持的格式(阿里不支持部分版本的加密rar压缩包)'
    else if (resp.body?.code == 'InternalError') result.state = '阿里云盘服务器运行出错'
    else if (resp.body?.code == 'VipFeatureForbidden') result.state = '可能需要开通阿里云盘会员'
    else if (resp.body?.message && resp.body?.message.indexOf('some unknown error') > 0) result.state = '解压时出错'
    else if (resp.body?.code) result.state = resp.body?.code as string
    else result.state = '未知错误'
    return result
  }
}
