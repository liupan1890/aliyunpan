import AliFile from 'src/aliapi/file';
import { NotifyError } from 'src/aliapi/notify';
import { StoreConfig, StoreSetting, StoreUI, StoreUser } from '.';

let findMPV = false;
let findPotplayer = false;
export async function Player(file_id: string, name: string) {
  const token = Object.assign({}, StoreUser.tokeninfo);
  const drive_id = StoreUI.gIsPanPage ? 'pan' : 'pic';
  let url = '';
  let mode = '';
  if (StoreSetting.uiVideoMode == 'online') {
    const data = await AliFile.ApiVideoPreviewUrl(drive_id, file_id, token);
    if (data && data.url != '') {
      url = 'http://localhost:29383/online/' + drive_id + '/' + file_id + '/' + token.user_id + '/index.m3u8';
      mode = '转码视频模式_没有字幕请切换原始文件模式';
    }
  }
  if (url == '') {
    const data = await AliFile.ApiFileDownloadUrl(drive_id, file_id, 14000, token);
    if (typeof data !== 'string' && data.url && data.url != '') {
      url = data.url;
      mode = '原始文件模式';
    }
  }
  if (url == '') {
    NotifyError('视频地址解析失败，无法预览');
    return;
  }
  if (StoreSetting.uiAutoColorVideo && StoreUI.fileColor.get(file_id) == undefined) {
    StoreUI.mChangColor({ selectkeys: [file_id], color: 'cvideo' });
  }
  const title = mode + '__' + name;

  if (findMPV == false && findPotplayer == false) {
    window.WebPlatformSync((data: { findMPV: boolean; findPotplayer: boolean }) => {
      findMPV = data.findMPV;
      findPotplayer = data.findPotplayer;
    });
  }
  if (findPotplayer) {
    if (window.WebSpawnSync) {
      window.WebSpawnSync(
        {
          command: 'potplayer',
          args: [url, '/new', '/referer=https://www.aliyundrive.com/', '/user_agent=' + StoreConfig.userAgent],
        },
        () => {
          //
        }
      );
    }
  } else if (findMPV) {
    if (window.WebSpawnSync) {
      window.WebSpawnSync(
        {
          command: 'mpv',
          args: [
            '--referrer=https://www.aliyundrive.com/',
            '--force-window=immediate',
            '--hwdec=auto',
            '--geometry=80%',
            '--autofit-larger=100%x100%',
            '--autofit-smaller=640',
            url,
            '--user-agent=' + StoreConfig.userAgent,
            '--title=' + title,
          ],
        },
        () => {
          //
        }
      );
    }
  } else {
    NotifyError('本地找不到MPV播放器，也找不到Potplayer播放器，无法继续');
  }
}
