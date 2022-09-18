import AliHttp from './alihttp'

export interface IArchiveData {
  state: string
  task_id: string
  progress: number
  file_list: ILinkTxt
}
export interface ILinkTxt {
  Key?: string
  Name: string
  Size: number
  FileList: (ILinkTxtFile | string)[]
  DirList: ILinkTxt[]
}
export interface ILinkTxtFile {
  Key: string
  Name: string
  Size: number
  Sha1: string
}
export default class AliArchive {
  
  static ApiGetFileList(result: IArchiveData, file_list: any) {
    const func = function (file_list: any, link: ILinkTxt) {
      if (file_list == undefined) return
      const parentkey = link.Key == '' ? '' : link.Key + '/'
      for (let i = 0; i < file_list.length; i++) {
        let name = file_list[i].name as string
        if (name.startsWith(parentkey)) name = name.substr(parentkey.length)
        if (file_list[i].is_folder == true) {
          const item: ILinkTxt = {
            Key: file_list[i].name,
            Name: name,
            Size: file_list[i].size,
            FileList: [],
            DirList: []
          }
          func(file_list[i].items, item)
          link.DirList.push(item)
        } else {
          link.FileList.push({ Key: file_list[i].name, Name: name, Size: file_list[i].size, Sha1: '' })
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
    const postdata: {
      drive_id: string
      file_id: string
      domain_id: string
      archive_type: string 
      password?: string
    } = {
      drive_id: drive_id,
      file_id: file_id,
      domain_id,
      archive_type 
    }
    if (password) postdata.password = password
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    //{"state":"Running","file_list":{},"task_id":"7ae00bddf0c99e5a244e89032c21c413"}

    const result: IArchiveData = {
      state: '',
      task_id: '',
      progress: 0,
      file_list: { Name: '', Size: 0, FileList: [], DirList: [] }
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
    const postdata = {
      drive_id: drive_id,
      file_id: file_id,
      domain_id,
      task_id
    }
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    //{"state":"Running","file_list":{},"task_id":"3e74135777ec321e683b2ee9cb67871e","progress":0}
    const result: IArchiveData = {
      state: '',
      task_id: '',
      progress: 0,
      file_list: { Key: '', Name: '', Size: 0, FileList: [], DirList: [] }
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
    const postdata: {
      drive_id: string
      file_id: string
      domain_id: string
      archive_type: string
      target_drive_id: string
      target_file_id: string
      file_list?: string[]
      password?: string
    } = {
      drive_id: drive_id,
      file_id: file_id,
      domain_id,
      target_drive_id,
      target_file_id,
      archive_type 
    }
    if (file_list.length > 0) postdata.file_list = file_list
    if (password != '') postdata.password = password
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    //{"drive_id":"8699982","file_id":"6129aa5003f94b7bd7f14bbab90b3f1f98098562","domain_id":"bj29","target_drive_id":"8699982","target_file_id":"6125bc01b62175eacfc34eb683bf2680e286c4d2","archive_type":"zip"}
    //{"state":"Running","file_list":{},"task_id":"7ae00bddf0c99e5a244e89032c21c413"}
    const result: IArchiveData = {
      state: '',
      task_id: '',
      progress: 0,
      file_list: { Name: '', Size: 0, FileList: [], DirList: [] }
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
