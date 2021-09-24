import { CacheServer, LoadAllDirFiles } from './uicommand';
import AliFileList from 'src/aliapi/filelist';
import { UploadAdd, UploadCmd, UploadEvent } from './uiupload';
import { MainSaveFileListAllPage, MainUploadDir, MainUploadEvent, MainUploadID } from './maincommand';
import { StoreRoot } from 'src/store';

let uploadTimer: NodeJS.Timer | undefined = undefined;
export const WinMsg = function (arg: any) {
  if (arg.cmd == 'LimitMax') {
    AliFileList.LimitMax = arg.LimitMax;
  } else if (arg.cmd == 'LoadAllDirFiles') {
    LoadAllDirFiles(arg);
  } else if (arg.cmd == 'CacheServer') {
    CacheServer();
  } else if (arg.cmd == 'UploadServer') {
    if (uploadTimer !== undefined) return;
    const func = () => {
      try {
        UploadEvent();
      } catch {}
      uploadTimer = setTimeout(func, 1000);
    };
    uploadTimer = setTimeout(func, 3000);
  } else if (arg.cmd == 'UploadCmd') {
    UploadCmd(arg.uploadAll, arg.uploadCmd, arg.uploadIDList);
  } else if (arg.cmd == 'UploadAdd') {
    UploadAdd(arg.addlist);
  } else if (arg.cmd == 'MainUploadEvent') {
    MainUploadEvent(arg);
  } else if (arg.cmd == 'MainUploadDir') {
    MainUploadDir(arg);
  } else if (arg.cmd == 'MainUploadID') {
    MainUploadID(arg);
  } else if (arg.cmd == 'MainReLoadDir') {
    StoreRoot.aReLoadDir({ dir_id: arg.dir_id, deletecache: arg.deletecache });
  } else if (arg.cmd == 'MainSaveFileListAllPage') {
    MainSaveFileListAllPage(arg);
  }
};
