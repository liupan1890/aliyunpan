import { Notify } from 'quasar';
import { IAliFileItem, IStatePanFile, ITokenInfo } from 'src/store/models';
import AliHttp from './alihttp';
import AliFileList from './filelist';
import { IBatchResult, IDownloadUrl, IOfficePreViewUrl, IVideoXBTUrl } from './models';
import { NotifyInfo } from './notify';

function IsSuccess(code: number) {
  return code >= 200 && code <= 300;
}
export default class AliFile {
  static async _ApiBatch(postdata: string, token: ITokenInfo, result: IBatchResult) {
    const url = 'v2/batch';
    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      const responses = resp.body.responses;
      for (let i = 0; i < responses.length; i++) {
        const status = responses[i].status as number;
        if (status >= 200 && status <= 205) {
          result.count++;
          const respi = responses[i];
          if (respi.body && respi.body.async_task_id) {
            result.task.push({ file_id: respi.id, task_id: respi.body.async_task_id, newdrive_id: respi.body.drive_id, newfile_id: respi.body.file_id });
          }
          //body: async_task_id: '47fd22fd-c45e-480d-b601-527a83580514';
          if (respi.body) {
            result.reslut.push({ id: respi.id, file_id: respi.body.file_id });
          }
        } else {
          const respi = responses[i];
          if (respi.body && respi.body.code) result.error.push({ id: respi.body.id, code: respi.body.code });
        }
      }
    }
  }
  static async ApiBatch(batchlist: string[], token: ITokenInfo) {
    const result: IBatchResult = {
      count: 0,
      task: [],
      reslut: [],
      error: [],
    };
    let add = 0;
    let postdata = '{"requests":[';
    const alltask: Promise<void>[] = [];
    for (let b = 0; b < batchlist.length; b++) {
      if (add > 0) postdata = postdata + ',';
      add++;
      postdata = postdata + batchlist[b];
      if (add > 98) {
        postdata += '],"resource":"file"}';
        alltask.push(AliFile._ApiBatch(postdata, token, result));
        postdata = '{"requests":[';
        add = 0;
      }
    }
    if (add > 0) {
      postdata += '],"resource":"file"}';
      alltask.push(AliFile._ApiBatch(postdata, token, result));
    }
    return Promise.all(alltask).then(() => {
      return result;
    });
  }
  static async ApiFavorBatch(drive_id: string, isfavor: boolean, files: string[], token: ITokenInfo): Promise<number> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    if (!files || files.length == 0) return Promise.resolve(0);
    const batchlist: string[] = [];
    for (let i = 0; i < files.length; i++) {
      let favdata =
        '{"body":{"drive_id":"' +
        drive_id +
        '","file_id":"' +
        files[i] +
        '","custom_index_key":"","starred":false},"headers":{"Content-Type":"application/json"},"id":"' +
        files[i] +
        '","method":"POST","url":"/file/update"}';

      if (isfavor) {
        favdata =
          '{"body":{"drive_id":"' +
          drive_id +
          '","file_id":"' +
          files[i] +
          '","custom_index_key":"starred_yes","starred":true},"headers":{"Content-Type":"application/json"},"id":"' +
          files[i] +
          '","method":"POST","url":"/file/update"}';
      }
      batchlist.push(favdata);
    }
    return (await AliFile.ApiBatch(batchlist, token)).count;
  }
  static async ApiTrashBatch(drive_id: string, files: string[], token: ITokenInfo): Promise<number> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    if (!files || files.length == 0) return Promise.resolve(0);
    const batchlist: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const postdata =
        '{"body":{"drive_id":"' + drive_id + '","file_id":"' + files[i] + '"},"headers":{"Content-Type":"application/json"},"id":"' + files[i] + '","method":"POST","url":"/recyclebin/trash"}';
      batchlist.push(postdata);
    }
    return (await AliFile.ApiBatch(batchlist, token)).count;
  }
  static async ApiTrashDeleteBatch(drive_id: string, files: string[], permanently: boolean, token: ITokenInfo): Promise<number> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    if (!files || files.length == 0) return Promise.resolve(0);
    const batchlist: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const postdata =
        '{"body":{"drive_id":"' +
        drive_id +
        '","file_id":"' +
        files[i] +
        '"' +
        (permanently ? ',"permanently":true' : '') +
        '},"headers":{"Content-Type":"application/json"},"id":"' +
        files[i] +
        '","method":"POST","url":"/file/delete"}';
      batchlist.push(postdata);
    }
    return (await AliFile.ApiBatch(batchlist, token)).count;
  }
  static async ApiTrashRestoreBatch(drive_id: string, files: string[], token: ITokenInfo): Promise<number> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    if (!files || files.length == 0) return Promise.resolve(0);
    const batchlist: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const postdata =
        '{"body":{"drive_id":"' + drive_id + '","file_id":"' + files[i] + '"},"headers":{"Content-Type":"application/json"},"id":"' + files[i] + '","method":"POST","url":"/recyclebin/restore"}';
      batchlist.push(postdata);
    }
    return (await AliFile.ApiBatch(batchlist, token)).count;
  }
  static async ApiRenameBatch(drive_id: string, files: string[], names: string[], token: ITokenInfo): Promise<number> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    if (!files || files.length == 0) return Promise.resolve(0);
    const batchlist: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const postdata = JSON.stringify({
        body: { drive_id: drive_id, file_id: files[i], name: names[i], check_name_mode: 'refuse' },
        headers: { 'Content-Type': 'application/json' },
        id: files[i],
        method: 'POST',
        url: '/file/update',
      });
      batchlist.push(postdata);
    }
    return (await AliFile.ApiBatch(batchlist, token)).count;
  }
  static async ApiMoveBatch(drive_id: string, files: string[], moveto_drive_id: string, moveto_dir_id: string, token: ITokenInfo): Promise<number> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    if (!files || files.length == 0) return Promise.resolve(0);
    const batchlist: string[] = [];
    for (let i = 0; i < files.length; i++) {
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
        );
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
        );
      }
    }
    return (await AliFile.ApiBatch(batchlist, token)).count;
  }
  static async ApiCopyBatch(drive_id: string, files: string[], names: string[], moveto_drive_id: string, moveto_dir_id: string, token: ITokenInfo): Promise<number> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    if (!files || files.length == 0) return Promise.resolve(0);
    const batchlist: string[] = [];
    for (let i = 0; i < files.length; i++) {
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
        );
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
        );
      }
    }
    const result = await AliFile.ApiBatch(batchlist, token);

    if (result.task.length > 0) {
      for (let i = 0; i < result.task.length; i++) {
        const task = result.task[i];
        for (let j = 0; j < files.length; j++) {
          if (files[j] == task.file_id) {
            const name = names[j];
            const notif = Notify.create({
              group: false,
              timeout: 0,
              spinner: true,
              position: 'bottom-right',
              classes: 'taskprogress',
              type: 'positive',
              message: '复制中[0] ' + name,
            });
            const task_id = task.task_id;
            let p = 0;
            const interval = setInterval(() => {
              if (p < 90) p++;
              AliFile.ApiAsyncTask(task_id, token)
                .then((ap: number) => {
                  notif({
                    message: `复制中[${ap == 0 ? p : ap}] ` + name,
                  });
                  if (ap === 100) {
                    notif({
                      icon: 'iconfont iconcheck',
                      spinner: false,
                      message: '复制完成!',
                      timeout: 2500,
                    });
                    clearInterval(interval);
                  }
                  if (ap < 0) {
                    notif({
                      icon: 'iconfont iconrstop',
                      spinner: false,
                      type: 'negative',
                      message: '复制操作失败!',
                      timeout: 3500,
                    });
                    clearInterval(interval);
                  }
                })
                .catch(() => {
                  clearInterval(interval);
                });
            }, 1000);
            break;
          }
        }
      }
    }

    return result.count;
  }

  static async ApiAsyncTask(async_task_id: string, token: ITokenInfo): Promise<number> {
    const url = 'v2/async_task/get';
    const postdata = {
      async_task_id,
    };
    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      if (resp.body.state == 'Succeed' || resp.body.state == 'succeed') return 100 as number;
      if (resp.body.state == 'Failed' || resp.body.state == 'failed') return -100 as number;
      if (resp.body.state == 'Running' || resp.body.state == 'running') {
        if (resp.body.total_process) return resp.body.total_process as number;
        return 0 as number;
      }
    }
    return -1;
  }

  static async ApiCreatNewForder(drive_id: string, parentid: string, name: string, token: ITokenInfo): Promise<string | undefined> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'adrive/v2/file/createWithFolders';
    //https://api.aliyundrive.com/adrive/v2/file/createWithFolders

    const postdata = {
      drive_id: drive_id,
      parent_file_id: parentid,
      name: name,
      check_name_mode: 'refuse',
      type: 'folder',
    };
    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      const file_id = resp.body.file_id as string | undefined;
      if (file_id) return file_id;
    }
    if (resp.body?.code == 'QuotaExhausted.Drive') return 'QuotaExhausted.Drive';
    return undefined;
  }
  static async ApiFileDownloadUrl(drive_id: string, file_id: string, expire_sec: number, token: ITokenInfo): Promise<IDownloadUrl | string> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/file/get_download_url';
    const postdata = { drive_id: drive_id, file_id: file_id, expire_sec: expire_sec };
    const resp = await AliHttp.Post(url, postdata, token);
    const data: IDownloadUrl = {
      drive_id: drive_id,
      file_id: file_id,
      expire_sec: expire_sec,
      url: '',
      size: 0,
    };
    if (IsSuccess(resp.code)) {
      data.url = resp.body.url;
      data.size = resp.body.size;
      return data;
    } else if (resp.body.code == 'NotFound.FileId') {
      return '文件已从网盘中彻底删除';
    } else if (resp.body.code == 'ForbiddenFileInTheRecycleBin') {
      return '文件已放入回收站';
    } else if (resp.body.code) {
      return resp.body.code as string;
    }
    return '网络错误';
  }

  static async ApiVideoPreviewUrl(drive_id: string, file_id: string, token: ITokenInfo): Promise<IDownloadUrl | undefined> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/file/get_video_preview_play_info';
    //{"drive_id":"8699982","file_id":"60df27a732f90f9d41bb486d949b7170e5a38a12","category":"live_transcoding","template_id":""}
    const postdata = { drive_id: drive_id, file_id: file_id, category: 'live_transcoding', template_id: '' };
    const resp = await AliHttp.Post(url, postdata, token);

    if (resp.body.code == 'VideoPreviewWaitAndRetry') {
      NotifyInfo('视频正在转码中，稍后重试');
    }
    const data: IDownloadUrl = {
      drive_id: drive_id,
      file_id: file_id,
      expire_sec: 15 * 60, 
      url: '',
      size: 0,
    };
    if (IsSuccess(resp.code)) {
      const task_list = resp.body.video_preview_play_info?.live_transcoding_task_list || [];
      for (let i = 0; i < task_list.length; i++) {
        if (task_list[i].template_id && task_list[i].template_id == 'FHD' && task_list[i].status == 'finished') data.url = task_list[i].url;
      }
      if (data.url == '') {
        for (let i = 0; i < task_list.length; i++) {
          if (task_list[i].template_id && task_list[i].template_id == 'HD' && task_list[i].status == 'finished') data.url = task_list[i].url;
        }
      }
      if (data.url == '') {
        for (let i = 0; i < task_list.length; i++) {
          if (task_list[i].template_id && task_list[i].template_id == 'SD' && task_list[i].status == 'finished') data.url = task_list[i].url;
        }
      }
      if (data.url == '') {
        for (let i = 0; i < task_list.length; i++) {
          if (task_list[i].template_id && task_list[i].template_id == 'LD' && task_list[i].status == 'finished') data.url = task_list[i].url;
        }
      }
      data.size = Math.floor(resp.body.video_preview_play_info?.meta?.duration || 0);
      return data;
    } else {
    }
    return undefined;
  }
  static async ApiFileInfo(drive_id: string, file_id: string, token: ITokenInfo): Promise<IStatePanFile | undefined> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/file/get';
    const postdata = {
      drive_id: drive_id,
      file_id: file_id,
      url_expire_sec: 14400,
      image_thumbnail_process: 'image/resize,w_400/format,jpeg',
      image_url_process: 'image/resize,w_1920/format,jpeg',
      video_thumbnail_process: 'video/snapshot,t_106000,f_jpg,ar_auto,m_fast,w_400',
    };
    const resp = await AliHttp.Post(url, postdata, token);

    if (IsSuccess(resp.code)) {
      const add = AliFileList.getFileInfo(resp.body as IAliFileItem);
      return add;
    }
    return undefined;
  }
  static async ApiOfficePreViewUrl(drive_id: string, file_id: string, token: ITokenInfo): Promise<IOfficePreViewUrl | undefined> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/file/get_office_preview_url';
    const postdata = { drive_id: drive_id, file_id: file_id };
    const resp = await AliHttp.Post(url, postdata, token);
    const data: IOfficePreViewUrl = {
      drive_id: drive_id,
      file_id: file_id,
      access_token: '',
      preview_url: '',
    };
    if (IsSuccess(resp.code)) {
      data.access_token = resp.body.access_token;
      data.preview_url = resp.body.preview_url;
      return data;
    }
    return undefined;
  }

  static async ApiBiXueTuBatch(drive_id: string, file_id: string, duration: number, imgcount: number, imgwidth: number, token: ITokenInfo): Promise<IVideoXBTUrl[]> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    if (duration <= 10) return [];
    const batchlist: string[] = [];
    let mtime = 0;
    let subtime = Math.floor(duration / (imgcount + 2));
    if (subtime < 1) subtime = 1;

    const imglist: IVideoXBTUrl[] = [];
    for (let i = 0; i < imgcount; i++) {
      mtime += subtime;
      if (mtime > duration) mtime = duration;
      const postdata = JSON.stringify({
        body: { drive_id: drive_id, file_id: file_id, url_expire_sec: 14400, video_thumbnail_process: 'video/snapshot,t_' + mtime.toString() + '000,f_jpg,ar_auto,m_fast,w_' + imgwidth.toString() },
        headers: { 'Content-Type': 'application/json' },
        id: (i.toString() + file_id).substr(0, file_id.length),
        method: 'POST',
        url: '/file/get',
      });
      batchlist.push(postdata);

      const time =
        Math.floor(mtime / 3600)
          .toString()
          .padStart(2, '0') +
        ':' +
        Math.floor((mtime % 3600) / 60)
          .toString()
          .padStart(2, '0') +
        ':' +
        Math.floor(mtime % 60)
          .toString()
          .padStart(2, '0');
      imglist.push({ time, url: '' });
    }

    let postdata = '{"requests":[';
    let add = 0;
    for (let b = 0; b < batchlist.length; b++) {
      if (add > 0) postdata = postdata + ',';
      add++;
      postdata = postdata + batchlist[b];
    }
    postdata += '],"resource":"file"}';

    const url = 'v2/batch';
    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      const responses = resp.body.responses;
      for (let i = 0; i < responses.length; i++) {
        const status = responses[i].status as number;
        if (status >= 200 && status <= 205) {
          imglist[i].url = responses[i].body?.thumbnail || '';
        } else {
          console.log(responses[i]);
        }
      }
    } else {
      console.log(resp);
    }
    return imglist;
  }

  static async ApiFileDownText(drive_id: string, file_id: string, filesize: number, maxsize: number, token: ITokenInfo): Promise<string> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/file/get_download_url';
    const postdata = { drive_id: drive_id, file_id: file_id, expire_sec: 14000 };
    const resp = await AliHttp.Post(url, postdata, token);

    if (IsSuccess(resp.code)) {
      const downurl = resp.body.url;
      const resp2 = await AliHttp.GetString(downurl, token, true, filesize, maxsize);
      if (IsSuccess(resp2.code)) {
        if (typeof resp2.body == 'string') return resp2.body;
        return JSON.stringify(resp2.body, undefined, 2);
      }
    } else {
      console.log('error', resp);
    }
    return '';
  }
  static async ApiFileDownJson(drive_id: string, file_id: string, token: ITokenInfo) {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/file/get_download_url';
    const postdata = { drive_id: drive_id, file_id: file_id, expire_sec: 14000 };
    const resp = await AliHttp.Post(url, postdata, token);

    if (IsSuccess(resp.code)) {
      const downurl = resp.body.url;
      const resp2 = await AliHttp.Get(downurl, token, true);
      if (IsSuccess(resp2.code)) {
        return resp2.body;
      }
    } else {
      console.log('error', resp);
    }
    return undefined;
  }
}
