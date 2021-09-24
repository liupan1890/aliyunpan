import { Notify } from 'quasar';
import { IAliFileJson, ILinkTxt, ITokenInfo } from 'src/store/models';
import AliHttp from './alihttp';
import AliFile from './file';
import AliFileList from './filelist';
import { NotifyInfo } from './notify';
import ServerHttp from './server';

export interface IShareAliModel {
  shareinfo: {
    shareid: string;
    creator_id: string;
    expiration: string;
    file_count: number;
    share_name: string;
    updated_at: string;
  };
  fileinfos: string;
  error: string;
}
function IsSuccess(code: number) {
  return code >= 200 && code <= 300;
}
export default class ShareAli {
  static async GetLinkFilesAli(shareid: string, pwd: string, ispublic: boolean, token: ITokenInfo) {
    token.share_token = '';
    let result = '';
    let sharetoken = '';
    let share: IShareAliModel = {
      shareinfo: {
        shareid: '',
        creator_id: '',
        expiration: '',
        file_count: 0,
        share_name: '',
        updated_at: '',
      },
      fileinfos: '',
      error: '',
    };
    let isgetpwd = false;
    for (let i = 0; i < 3; i++) {
      const link: ILinkTxt = {
        Key: 'root',
        Name: '',
        Size: 0,
        FileList: [],
        DirList: [],
      };
      if (share.shareinfo.creator_id == '') {
        share = await ShareAli.ApiGetShareAnonymous(shareid, token);
        if (share.error != '') result = share.error;
        if (share.error == '分享链接被取消分享了') break;
      }
      if (share.shareinfo.creator_id == '') continue; 
      link.Name = share.shareinfo.share_name;
      if (sharetoken == '' || sharetoken.startsWith('，')) {
        sharetoken = await ShareAli.ApiGetShareToken(shareid, pwd, token);
      }
      if (i == 0 && sharetoken == '，密码错误') {
        const serdata = await ServerHttp.PostToServer({ cmd: 'GetAliSharePwd', shareid });
        if (serdata.password) {
          pwd = serdata.password;
          isgetpwd = true;
          continue;
        }
      }
      if (sharetoken == '，密码错误') return '密码错误'; 

      if (sharetoken !== '' && sharetoken.startsWith('，') == false) {
        if (isgetpwd == false) ServerHttp.PostToServer({ cmd: 'PostAliShare', shareid, password: pwd, ispublic, info: share.shareinfo });
        token.share_token = sharetoken;
        const notif = Notify.create({
          group: false,
          icon: 'iconfont iconinfo_circle',
          type: 'negative',
          color: 'grey-8',
          message: '正在列出分享包含的全部文件，稍等片刻...',
        });

        result = await ShareAli.GetShareFileListOneDir(shareid, 'root', token, link);
        if (notif) notif({ timeout: 10 });
        if (result == 'success') return link; 
      }

      if (i < 2) {
        NotifyInfo('解析失败，自动重试中，解析缓慢');
      }
    }
    return result; 
  }

  static async ApiGetShareAnonymous(shareid: string, token: ITokenInfo) {
    //https://api.aliyundrive.com/v2/share_link/get_share_token
    //{"share_id":"BNGfGxA3NGq","share_pwd":""}
    const share: IShareAliModel = {
      shareinfo: {
        shareid: '',
        creator_id: '',
        expiration: '',
        file_count: 0,
        share_name: '',
        updated_at: '',
      },
      fileinfos: '',
      error: '',
    };
    const url = 'https://api.aliyundrive.com/adrive/v2/share_link/get_share_by_anonymous?share_id=' + shareid;
    const postdata = { share_id: shareid };
    const resp = await AliHttp.Post(url, postdata, token, false);
    if (IsSuccess(resp.code)) {
      if (resp.body.creator_id) {
        share.shareinfo.shareid = shareid;
        share.shareinfo.creator_id = resp.body.creator_id || '';
        share.shareinfo.expiration = resp.body.expiration || '';
        share.shareinfo.file_count = resp.body.file_count || 0;
        share.shareinfo.share_name = resp.body.share_name || '';
        share.shareinfo.updated_at = resp.body.updated_at || '';
        share.fileinfos = JSON.stringify(share.shareinfo);

        return share;
      }
    }
    if (resp.body.code == 'ShareLink.Cancelled') {
      share.error = '分享链接被取消分享了';
    } else if (resp.body.code && resp.body.code !== '') {
      share.error = resp.body.code;
    } else {
      share.error = '解析分享链接失败';
    }
    return share;
  }
  static async ApiGetShareToken(shareid: string, pwd: string, token: ITokenInfo) {
    //https://api.aliyundrive.com/v2/share_link/get_share_token
    //{"share_id":"BNGfGxA3NGq","share_pwd":""}

    const url = 'https://api.aliyundrive.com/v2/share_link/get_share_token';
    const postdata = { share_id: shareid, share_pwd: pwd };

    const resp = await AliHttp.Post(url, postdata, token, false);

    if (resp.body.code == 'InvalidResource.SharePwd') {
      return '，密码错误';
    }
    if (resp.body.code == 'ShareLink.Cancelled') {
      return '，分享链接被取消分享了';
    }
    if (resp.body.code && resp.body.code !== '') {
      return '，' + resp.body.code;
    }
    if (IsSuccess(resp.code)) {
      return (resp.body.share_token as string | undefined) || '，share_token错误';
    }
    return '，发生网络错误';
  }

  static async GetShareFileListOneDir(share_id: string, parentid: string, token: ITokenInfo, link: ILinkTxt) {
    const page = await ShareAli.ApiShareFileList(share_id, parentid, token);
    if (page.next_marker !== '') return '发生网络错误'; 

    const PList: Promise<string>[] = [];

    for (let i = 0; i < page.items.length; i++) {
      const item = page.items[i];
      if (item.isDir) {
        const dir: ILinkTxt = {
          Key: item.file_id,
          Name: item.name,
          Size: 0,
          FileList: [],
          DirList: [],
        };
        link.DirList.push(dir);
        PList.push(ShareAli.GetShareFileListOneDir(share_id, item.file_id, token, dir));
      } else {
        link.Size += item.size;
        link.FileList.push({ Key: item.file_id, Name: item.name, Size: item.size, Sha1: '' });
      }
    }
    await Promise.all(PList);
    return 'success';
  }
  static async ApiShareFileList(share_id: string, dir_id: string, token: ITokenInfo): Promise<IAliFileJson> {
    const dir: IAliFileJson = {
      items: [],
      next_marker: '',
      m_time: 0,
      m_user_id: token.user_id,
      m_drive_id: share_id,
      m_dir_id: dir_id,
      m_dir_name: '',
    };
    let i = 0;
    do {
      i++;
      if (i == 5) {
        NotifyInfo('链接内有包含大量文件的文件夹，解析缓慢');
      }
      const isget = await ShareAli.ApiShareFileListOnePage(dir, token);
      if (isget != true) {
        break; 
      }
    } while (dir.next_marker != '');

    return dir;
  }
  static async ApiShareFileListOnePage(dir: IAliFileJson, token: ITokenInfo) {
    const url = 'https://api.aliyundrive.com/adrive/v3/file/list';
    const postdata = {
      share_id: dir.m_drive_id,
      parent_file_id: dir.m_dir_id,
      marker: dir.next_marker,
      limit: AliFileList.LimitMax,
      url_expire_sec: 14000,
      image_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_url_process: 'image/resize,w_1920/format,jpeg',
      video_thumbnail_process: 'video/snapshot,t_106000,f_jpg,ar_auto,m_fast,w_400',
      fields: '*',
      order_by: 'name',
      order_direction: 'ASC',
    };
    const resp = await AliHttp.Post(url, postdata, token);
    return AliFileList._FileListOnePage('sharelist', dir, false, resp);
  }
  static async ApiSaveShareFilesBatch(shareid: string, drive_id: string, parentid: string, files: string[], token: ITokenInfo) {
    //{"requests":[{"body":{"file_id":"60d5aa14be9f9a3019bc4655803010090140f5cc","share_id":"BNGfGxA3NGq","file_id_list":["60d5aa14be9f9a3019bc4655803010090140f5cc"],"to_parent_file_id":"60d32777623547df8c0645c080e4545f4d8b038f","to_drive_id":"8699982","auto_rename":true},"headers":{"Content-Type":"application/json"},"id":"0","method":"POST","url":"/file/copy"}],"resource":"file"}

    //https://api.aliyundrive.com/v2/batch
    //{"responses":[{"body":{"domain_id":"bj29","drive_id":"8699982","file_id":"60d9c4ca9ed2d8c38038475dab7f28bc8a6d7564"},"id":"0","status":201}]}
    //保存文件 返回值201

    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    if (!files || files.length == 0) return Promise.resolve(0);
    const batchlist: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const postdata =
        '{"body":{"share_id":"' +
        shareid +
        '","file_id_list":["' +
        files[i] +
        '"],"file_id":"' +
        files[i] +
        '","to_drive_id":"' +
        drive_id +
        '","to_parent_file_id":"' +
        parentid +
        '","auto_rename":true},"headers":{"Content-Type":"application/json"},"id":"' +
        files[i] +
        '","method":"POST","url":"/file/copy"}';
      batchlist.push(postdata);
    }
    const result = await AliFile.ApiBatch(batchlist, token);
    if (result.count == files.length) {
      if (result.task.length > 0) {
        return 'async';
      } else return 'success';
    } else {
      if (result.error.length > 0) {
        if (result.error[0].code == 'QuotaExhausted.Drive') return '网盘空间已满';
        else return result.error[0].code;
      }
      return 'error';
    }
  }
}
