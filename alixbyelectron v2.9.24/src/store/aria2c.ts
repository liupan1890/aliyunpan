import Aria2 from 'aria2';
import { IAliFileJson, IAriaDownProgress, IStateDownFile } from './models';
import { StoreConfig, StoreDown, StoreSetting, StoreUser } from '.';
import path from 'path';
import AliFile from 'src/aliapi/file';
import AliFileList from 'src/aliapi/filelist';
import axios from 'axios';
import { NotifyError } from 'src/aliapi/notify';

const fspromises = window.require('fs/promises');
const fs = window.require('fs');

let Aria2cState = false;
let Aria2cChangeing = false;
let Aria2Engine = new Aria2({
  host: 'localhost',
  port: 29384,
  secure: false,
  secret: 'S4znWTaZYQ!i3cp^RN_b',
  path: '/jsonrpc',
});

export async function AriaTest(host: string, port: number, secret: string) {
  const url = 'http://' + host + ':' + port.toString() + '/jsonrpc';
  return axios
    .post(
      url,
      { method: 'aria2.getGlobalStat', jsonrpc: '2.0', id: 'id' + Date.now(), params: ['token:' + secret] },
      {
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 4000,
      }
    )
    .then(() => {
      return true;
    })
    .catch(function (error) {
      if (error.response && error.response.data && error.response.data.error) {
        if (error.response.data.error.message == 'Unauthorized') {
          NotifyError('连接失败 密码错误 ' + url + ' secret=' + secret);
          return false;
        }
      }
      if (error.message == 'Network Error' || error.message.indexOf('timeout of') >= 0) {
        NotifyError('连接失败 IP:Port错误 ' + url);
        return false;
      }
      NotifyError('连接失败 ' + (error.message ? error.message : '') + ' ' + url + ' secret=' + secret);
      return false;
    });
}
function Sleep(msTime: number) {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          success: true,
          time: msTime,
        }),
      msTime
    )
  );
}
export async function AriaChange(host: string, port: number, secret: string) {
  if (Aria2cChangeing) return;
  Aria2cChangeing = true;
  try {
    if (Aria2cState) {
      Aria2cState = false;
      Aria2Engine.close();
    }

    if (host == '') {
      host = 'localhost';
      port = 29384;
      secret = 'S4znWTaZYQ!i3cp^RN_b';
    }
    Aria2Engine = new Aria2({
      host,
      port,
      secure: false,
      secret,
      path: '/jsonrpc',
    });

    Aria2Engine.on('close', () => {
      if (Aria2cState == true && Aria2cChangeing == false) {
        Aria2cState = false;
        if (StoreSetting.ariaRemote) {
          StoreSetting.mSaveAriaRemote(false);
          NotifyError('Aria2连接已断开(自动切换回本地模式) ');
        } else {
          NotifyError('Aria2连接已断开');
        }
      }
    });
    await Sleep(1000);
    await Aria2Engine.open()
      .then(() => {
        Aria2cState = true;
      })
      .catch(() => {
        Aria2cState = false;
      });

    if (Aria2cState == false) {
      const url = Aria2Engine.host + ':' + Aria2Engine.port + ' secret=' + Aria2Engine.secret;

      if (StoreSetting.ariaRemote) {
        StoreSetting.mSaveAriaRemote(false);
        NotifyError('无法连接到Aria2(自动切换回本地模式) ' + url);
      } else {
        NotifyError('无法连接到Aria2 ' + url);
      }
    } else {
      await Aria2Engine.call('aria2.changeGlobalOption', { 'max-overall-download-limit': StoreSetting.downGlobalSpeed.toString() + 'M' })
        .then(() => {
          Aria2cState = true;
        })
        .catch((e: any) => {
          if (e && e.message == 'Unauthorized') {
            NotifyError('Aria2密码错误(密码不要有 ^ 或特殊字符)');
          }
          Aria2cState = false;
        });
    }
  } catch (e) {
    // console.log(e);
  }
  Aria2cChangeing = false;
  return Aria2cState;
}

export async function AriaGlobalSpeed() {
  try {
    await Aria2Engine.call('aria2.changeGlobalOption', { 'max-overall-download-limit': StoreSetting.downGlobalSpeed.toString() + 'M' }).catch();
  } catch {}
}

export async function AriaConnect() {
  if (Aria2cState == false) {
    if (StoreSetting.ariaRemote) {
      const host = StoreSetting.ariaUrl.split(':')[0];
      const port = parseInt(StoreSetting.ariaUrl.split(':')[1]);
      const secret = StoreSetting.ariaPwd;
      await AriaChange(host, port, secret).catch();
    } else {
      await AriaChange('', 0, '').catch();
    }
  }
  return Aria2cState;
}

export async function AriaGetDowningList() {
  const multicall = [
    ['aria2.tellActive', ['gid', 'status', 'totalLength', 'completedLength', 'downloadSpeed', 'errorCode', 'errorMessage']],
    ['aria2.tellWaiting', 0, 100, ['gid', 'status', 'totalLength', 'completedLength', 'downloadSpeed', 'errorCode', 'errorMessage']],
    ['aria2.tellStopped', 0, 100, ['gid', 'status', 'totalLength', 'completedLength', 'downloadSpeed', 'errorCode', 'errorMessage']],
  ];
  try {
    const result = await Aria2Engine.multicall(multicall).catch();
    if (result) {
      const list: IAriaDownProgress[] = [];
      let arr = result[0][0];
      list.push(...arr);
      arr = result[1][0];
      list.push(...arr);
      arr = result[2][0];
      list.push(...arr);
      StoreDown.mSpeedEvent(list);
    }
  } catch {}
}

export async function AriaDeleteList(list: string[]) {
  const multicall = [];
  for (let i = 0; i < list.length; i++) {
    multicall.push(['aria2.forceRemove', list[i]]);
    multicall.push(['aria2.removeDownloadResult', list[i]]);
  }
  try {
    await Aria2Engine.multicall(multicall).catch();
  } catch {}
}
export async function AriaStopList(list: string[]) {
  const multicall = [];
  for (let i = 0; i < list.length; i++) {
    multicall.push(['aria2.forcePause', list[i]]);
  }
  try {
    await Aria2Engine.multicall(multicall).catch();
  } catch {}
}
export async function AriaAddUrl(file: IStateDownFile): Promise<string> {
  try {
    const info = file.Info;
    const token = StoreUser.getUser(info.userid);
    if (token == undefined) return '找不到账号,可能该账号已退出';
    if (info.isDir) {
      const dirfull = path.join(info.DownSavePath, info.name);
      if (info.ariaRemote == false) {
        try {
          await fspromises.mkdir(dirfull, { recursive: true });
        } catch {}
      }
      const drive_id = info.drive_id == 'pan' || info.drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
      const dir: IAliFileJson = {
        items: [],
        next_marker: '',
        m_time: 0,
        m_user_id: token.user_id,
        m_drive_id: drive_id,
        m_dir_id: info.file_id,
        m_dir_name: info.name,
      };
      do {
        const isget = await AliFileList.ApiFileListOnePage(dir, token, false);
        if (isget != true) {
          return '解析子文件列表失败，稍后重试'; 
        } else {
          if (dir.items.length > 0) StoreDown.aAddDownload({ filelist: dir.items, savepath: dirfull, issavepath: false, tip: false });
          dir.items = [];
        }
      } while (dir.next_marker != '');

      return 'downed';
    } else {
      const dir = info.DownSavePath;
      const out = info.ariaRemote ? info.name : info.name + '.td';
      const filefull = path.join(dir, info.name);
      if (info.ariaRemote == false) {
        try {
          const finfo = await fspromises.stat(filefull);
          if (finfo.size == info.size) return 'downed';
          else return '本地存在重名文件，请手动删除';
        } catch {
          //no such file
        }

        if (info.size == 0) {
          try {
            await (await fspromises.open(filefull, 'w')).close();
            return 'downed';
          } catch {
            return '创建文件失败';
          }
        }
      }

      let downurl = file.Down.DownUrl;
      if (downurl != '' && downurl.indexOf('x-oss-expires=') > 0) {
        let expires = downurl.substr(downurl.indexOf('x-oss-expires=') + 'x-oss-expires='.length);
        expires = expires.substr(0, expires.indexOf('&'));
        const lasttime = parseInt(expires) - Date.now() / 1000; 
        const needtime = (info.size + 1) / 1024 / 1024;
        if (lasttime < 60 || lasttime < needtime + 60) downurl = ''; 
      } else downurl = '';
      if (downurl == '') {
        const durl = await AliFile.ApiFileDownloadUrl(info.drive_id, info.file_id, 14000, token);
        if (typeof durl == 'string') return '生成下载链接失败,' + durl;
        else if (durl.url == '') return '生成下载链接失败,可能需要重新登录' + token.user_name;
        downurl = durl.url;
        file.Down.DownUrl = downurl;
      }
      if (file.Down.IsStop) return '已暂停';
      const split = StoreSetting.downThreadMax;
      const referer = StoreConfig.referer;
      const userAgent = StoreConfig.userAgent;
      const multicall = [
        ['aria2.forceRemove', info.GID],
        ['aria2.removeDownloadResult', info.GID],
        ['aria2.addUri', [downurl], { gid: info.GID, dir, out, split, referer, 'user-agent': userAgent, 'check-certificate': 'false', 'file-allocation': 'trunc' }],
      ];
      const result = await Aria2Engine.multicall(multicall).catch(() => undefined);
      if (result == undefined || result.length < 3 || (result[2].code != undefined && result[2].code) != 0) return '创建aria任务失败，稍后自动重试' + result[2].message;
      if (result[2].length == 1) return 'success';
    }
  } catch {}
  return Promise.resolve('创建Aria任务失败1');
}

export function AriaHashFile(downitem: IStateDownFile): { DownID: string; Check: boolean } {
  const DownID = downitem.DownID;
  const dir = downitem.Info.DownSavePath;
  const out = downitem.Info.ariaRemote ? downitem.Info.name : downitem.Info.name + '.td';
  const sha1 = downitem.Info.sha1;
  const crc64 = downitem.Info.crc64;

  const data = {
    DownID: DownID,
    inputfile: path.join(dir, out),
    movetofile: path.join(dir, downitem.Info.name),
    hash: crc64 ? 'crc64' : sha1 ? 'sha1' : '',
    check: crc64 || sha1 || '',
  };
  let success = false;
  if (data.inputfile == data.movetofile) {
    success = true;
  } else {
    try {
      fs.renameSync(data.inputfile, data.movetofile);
      success = true;
    } catch {
      try {
        fs.renameSync(data.inputfile, data.movetofile);
        success = true;
      } catch {}
    }
  }
  return { DownID, Check: success }; 
}

export function FormateAriaError(code: string, message: string): string {
  switch (code) {
    case '0':
      return '';
    case '1':
      return 'aria2c未知错误';
    case '2':
      return 'aria2c网络超时';
    case '3':
      return 'aria2c网络文件404';
    case '4':
      return 'aria2c网络文件404';
    case '5':
      return 'aria2c下载缓慢自动退出';
    case '6':
      return 'aria2c发生网络中断';
    case '7':
      return 'aria2c被强制退出错误';
    case '8':
      return 'aria2c服务器不支持断点续传';
    case '9':
      return 'aria2c本地硬盘空间不足';
    case '10':
      return 'aria2c分片大小更改';
    case '11':
      return 'aria2c重复任务';
    case '12':
      return 'aria2c重复BT任务';
    case '13':
      return 'aria2c文件已存在且不能覆盖';
    case '14':
      return 'aria2c文件重命名失败';
    case '15':
      return 'aria2c打开文件失败';
    case '16':
      return 'aria2c创建文件大小时失败';
    case '17':
      return 'aria2c文件写入失败';
    case '18':
      return 'aria2c创建文件夹失败';
    case '19':
      return 'aria2cDNS解析失败';
    case '20':
      return 'aria2c解析磁力失败';
    case '21':
      return 'aria2cFTP不支持的命令';
    case '22':
      if (message.includes('403')) return '服务器拒绝访问403';
      if (message.includes('503')) return '服务器返回错误503';
      return message;
    case '23':
      return 'aria2cHTTP重定向失败';
    case '24':
      return 'aria2cHTTP认证失败';
    case '25':
      return 'aria2c格式化种子失败';
    case '26':
      return 'aria2c读取种子信息失败';
    case '27':
      return 'aria2c磁力链接错误';
    case '28':
      return 'aria2c提供了错误的参数';
    case '29':
      return 'aria2c服务器超载暂时无法处理请求';
    case '30':
      return 'aria2cRPC传输参数错误';
    case '31':
      return 'aria2c多余的响应数据';
    case '32':
      return 'aria2c文件sha1校验失败';
    default:
      return message;
  }
}

export function ClearFileName(filename: string): string {
  if (!filename) return '';
  
  filename = filename.replace(/[<>\:"\/\\\|\?\*]+/g, '');
  filename = filename.replace(/[\f\n\r\t\v]/g, '');
  while (filename.endsWith(' ') || filename.endsWith('.')) filename = filename.substr(0, filename.length - 1);
  if (window.platform == 'win32') {
    while (filename.startsWith(' ')) filename = filename.substr(1);
  } else if (window.platform == 'darwin') {
    if (filename.startsWith('...')) filename = '……' + filename.substr(3);
    else if (filename.startsWith('.')) filename = '_' + filename.substr(1);
  } else if (window.platform == 'linux') {
  }
  return filename;
}
