import { ILinkTxt, ITokenInfo } from 'src/store/models';
import AliHttp from './alihttp';

export interface IArchiveData {
  state: string;
  task_id: string;
  progress: number;
  file_list: ILinkTxt;
}

function IsSuccess(code: number) {
  return code >= 200 && code <= 300;
}

export default class AliArchive {
  static ApiGetFileList(result: IArchiveData, file_list: any) {
    const func = function (file_list: any, link: ILinkTxt) {
      if (file_list == undefined) return;
      const parentkey = link.Key == '' ? '' : link.Key + '/';
      for (let i = 0; i < file_list.length; i++) {
        let name = file_list[i].name as string;
        if (name.startsWith(parentkey)) name = name.substr(parentkey.length);
        if (file_list[i].is_folder == true) {
          const item: ILinkTxt = {
            Key: file_list[i].name,
            Name: name,
            Size: file_list[i].size,
            FileList: [],
            DirList: [],
          };
          func(file_list[i].items, item);
          link.DirList.push(item);
        } else {
          link.FileList.push({ Key: file_list[i].name, Name: name, Size: file_list[i].size, Sha1: '' });
        }
      }
    };

    const keys = Object.getOwnPropertyNames(file_list);
    const files: any[] = [];
    for (let i = 0; i < keys.length; i++) {
      files.push(file_list[keys[i]]);
    }
    func(files, result.file_list);
  }
  static async ApiArchiveList(drive_id: string, file_id: string, domain_id: string, archive_type: string, password: string, token: ITokenInfo): Promise<IArchiveData> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/archive/list';
    const postdata: {
      drive_id: string;
      file_id: string;
      domain_id: string;
      archive_type: string; 
      password?: string;
    } = {
      drive_id: drive_id,
      file_id: file_id,
      domain_id,
      archive_type, 
    };
    if (password != '') postdata.password = password;
    const resp = await AliHttp.Post(url, postdata, token, false);
    //{"state":"Running","file_list":{},"task_id":"7ae00bddf0c99e5a244e89032c21c413"}

    const result: IArchiveData = {
      state: '',
      task_id: '',
      progress: 0,
      file_list: { Name: '', Size: 0, FileList: [], DirList: [] },
    };
    if (IsSuccess(resp.code)) {
      result.state = resp.body.state as string;
      result.task_id = resp.body.task_id as string;
      if (result.state == 'Succeed' || result.state == 'succeed') {
        AliArchive.ApiGetFileList(result, resp.body.file_list);
      }
      return result;
    }
    if (resp.body?.code == 'InvalidPassword') result.state = '密码错误';
    else if (resp.body?.code == 'ArchiveTypeNotSupported') result.state = '不支持的压缩格式';
    else if (resp.body?.code == 'LimitArchive') result.state = '不支持压缩包体积太大';
    else if (resp.body?.code == 'BadArchive') result.state = '不支持的格式(阿里不支持部分版本的加密rar压缩包)';
    else if (resp.body?.code == 'InternalError') result.state = '阿里云盘服务器运行出错';
    else if (resp.body?.message && resp.body?.message.indexOf('some unknown error') > 0) result.state = '解压时出错';
    else if (resp.body?.code) result.state = resp.body?.code as string;
    else result.state = '未知错误';
    return result;
  }

  static async ApiArchiveStatus(drive_id: string, file_id: string, domain_id: string, task_id: string, token: ITokenInfo): Promise<IArchiveData> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/archive/status';
    const postdata = {
      drive_id: drive_id,
      file_id: file_id,
      domain_id,
      task_id,
    };
    const resp = await AliHttp.Post(url, postdata, token, false);
    const result: IArchiveData = {
      state: '',
      task_id: '',
      progress: 0,
      file_list: { Key: '', Name: '', Size: 0, FileList: [], DirList: [] },
    };
    if (IsSuccess(resp.code)) {
      result.state = resp.body.state as string;
      result.task_id = resp.body.task_id as string;
      result.progress = resp.body.progress as number;
      if (result.state == 'Succeed' || result.state == 'succeed') {
        AliArchive.ApiGetFileList(result, resp.body.file_list);
      }
      return result;
    }
    if (resp.body?.code == 'InvalidPassword') result.state = '密码错误';
    else if (resp.body?.code == 'InvalidParameterEmpty.TaskId') result.state = 'TaskId无效';
    else if (resp.body?.code == 'LimitArchive') result.state = '不支持压缩包体积太大';
    else if (resp.body?.code == 'BadArchive') result.state = '不支持的格式(阿里不支持部分版本的加密rar压缩包)';
    else if (resp.body?.code == 'InternalError') result.state = '阿里云盘服务器运行出错';
    else if (resp.body?.code) result.state = resp.body?.code as string;
    else result.state = '未知错误';
    return result;
  }

  static async ApiArchiveUncompress(
    drive_id: string,
    file_id: string,
    domain_id: string,
    archive_type: string,
    target_drive_id: string,
    target_file_id: string,
    password: string,
    file_list: string[],
    token: ITokenInfo
  ): Promise<IArchiveData> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/archive/uncompress';
    const postdata: {
      drive_id: string;
      file_id: string;
      domain_id: string;
      archive_type: string;
      target_drive_id: string;
      target_file_id: string; 
      file_list?: string[];
      password?: string;
    } = {
      drive_id: drive_id,
      file_id: file_id,
      domain_id,
      target_drive_id,
      target_file_id,
      archive_type, 
    };
    if (file_list.length > 0) postdata.file_list = file_list;
    if (password != '') postdata.password = password;
    const resp = await AliHttp.Post(url, postdata, token, false);
     const result: IArchiveData = {
      state: '',
      task_id: '',
      progress: 0,
      file_list: { Name: '', Size: 0, FileList: [], DirList: [] },
    };
    if (IsSuccess(resp.code)) {
      result.state = resp.body.state as string;
      result.task_id = resp.body.task_id as string;
      result.progress = resp.body.progress as number;
      return result;
    }
    if (resp.body?.code == 'InvalidPassword') result.state = '密码错误';
    else if (resp.body?.code == 'ArchiveTypeNotSupported') result.state = '不支持的压缩格式';
    else if (resp.body?.code == 'LimitArchive') result.state = '不支持压缩包体积太大';
    else if (resp.body?.code == 'BadArchive') result.state = '不支持的格式(阿里不支持部分版本的加密rar压缩包)';
    else if (resp.body?.code == 'InternalError') result.state = '阿里云盘服务器运行出错';
    else if (resp.body?.message && resp.body?.message.indexOf('some unknown error') > 0) result.state = '解压时出错';
    else if (resp.body?.code) result.state = resp.body?.code as string;
    else result.state = '未知错误';
    return result;
  }
}
