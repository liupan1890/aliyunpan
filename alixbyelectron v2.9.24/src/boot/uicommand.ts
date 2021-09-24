import AliFileList from 'src/aliapi/filelist';
import { DB } from 'src/store';
import { IStatePanFile, ITokenInfo } from 'src/store/models';
import AliFile from 'src/aliapi/file';
import AliHttp from 'src/aliapi/alihttp';
import { IncomingMessage, Server, ServerResponse } from 'http';

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
export async function LoadAllDirFiles(arg: any) {
  const dirlist = arg.items as IStatePanFile[];
  const token = arg.token as ITokenInfo;

  for (let i = 0; i < dirlist.length; i++) {
    const dir = dirlist[i];
    if (dir.file_id == 'favorite') {
      AliFileList.ApiFavorFileList(token.default_drive_id, 'favorite', '', token).then((data) => {
        if (data.next_marker === '' && data.items) {
          window.WinMsgToMain({ cmd: 'MainReLoadDir', dir_id: dir.file_id, deletecache: false }); 
        }
      });
    } else if (dir.file_id == 'trash') {
      AliFileList.ApiTrashFileList(token.default_drive_id, 'trash', '', token).then((data) => {
        if (data.next_marker === '' && data.items) {
          window.WinMsgToMain({ cmd: 'MainReLoadDir', dir_id: dir.file_id, deletecache: false }); 
        }
      });
    } else AliFileList.ApiFileList(dir.drive_id, dir.file_id, '', token);
    await sleep(200);
  }
}

export interface IM3U8Date {
  localurl: string;
  aliurl: string;
  body: any;
}
const OnlineMap = new Map<string, IM3U8Date>();
export async function OnlineIndex(url: string, response: ServerResponse) {
  const strs = url.split('/');
  const drive_id = strs[2];
  const file_id = strs[3];
  const user_id = strs[4];
  const localurl = drive_id + file_id + user_id;

  const token = await DB.getUser(user_id);
  if (token) {
    const info = await AliFile.ApiVideoPreviewUrl(drive_id, file_id, token);
    if (info && info.url != '') {
      const data = await AliHttp.Down(info.url, token, true);
      const body = await BlobToString(data.body);
      let aliurl = info.url;
      aliurl = aliurl.substr(0, aliurl.lastIndexOf('/') + 1);
      OnlineMap.set(localurl, { localurl, aliurl, body });
      response.writeHead(data.code, { 'Content-Type': 'text/plain' });
      response.end(body);
      return;
    }
  }
  response.writeHead(403);
  response.end();
}

function BlobToString(body: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsText(body, 'utf-8');
    reader.onload = function () {
      resolve((reader.result as string) || '');
    };
  });
}

export async function OnlineTs(url: string, response: ServerResponse) {
  const strs = url.split('/');
  const drive_id = strs[2];
  const file_id = strs[3];
  const user_id = strs[4];
  let filename = strs[5];
  const localurl = drive_id + file_id + user_id;
  if (filename.indexOf('x-oss-expires=') > 0) {
    let expires = filename.substr(filename.indexOf('x-oss-expires=') + 'x-oss-expires='.length);
    expires = expires.substr(0, expires.indexOf('&'));
    const lasttime = parseInt(expires) - Date.now() / 1000; 
    if (lasttime < 120) {
      const token = await DB.getUser(user_id);
      if (token) {
        const info = await AliFile.ApiVideoPreviewUrl(drive_id, file_id, token);
        if (info && info.url != '') {
          const data = await AliHttp.Down(info.url, token, true);
          const body = await BlobToString(data.body);
          let aliurl = info.url;
          aliurl = aliurl.substr(0, aliurl.lastIndexOf('/') + 1);
          OnlineMap.set(localurl, { localurl, aliurl, body });
          const lines = body.split('\n');
          const name = filename.substr(0, filename.indexOf('?') + 1);
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith(name)) filename = lines[i];
          }
          const getmap = OnlineMap.get(localurl);
          if (getmap) {
            response.writeHead(302, { Location: getmap.aliurl + filename });
            response.end();
            return;
          }
        }
      }
    }
  }
  const getmap = OnlineMap.get(localurl);
  if (getmap) {
    response.writeHead(302, { Location: getmap.aliurl + filename });
    response.end();
  }
  response.writeHead(403);
  response.end();
}
const http2 = window.require('http');
let server: Server | undefined = undefined;
export function CacheServer() {
  if (server === undefined) {
    console.log('start');
    const server2 = http2.createServer(function (request: IncomingMessage, response: ServerResponse) {
      const url = request.url || '';
      if (url.startsWith('/online/') && url.endsWith('/index.m3u8')) {
        OnlineIndex(url, response);
      } else if (url.startsWith('/online/')) {
        OnlineTs(url, response);
      } else {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Hello World');
      }
    }) as Server;
    try {
      server2.listen({ host: 'localhost', port: 29383 });
      server = server2;
    } catch (e) {
      console.log(e);
    }
  }
}
