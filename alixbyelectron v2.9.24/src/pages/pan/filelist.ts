import path from 'path';
import { format } from 'quasar';
import { NotifyInfo } from 'src/aliapi/notify';
import AliUpload from 'src/aliapi/upload';
import { StoreUpload } from 'src/store';
import { IStateUploadFile } from 'src/store/models';
const fspromises = window.require('fs/promises');

export async function UploadLocalFiles(user_id: string, drive_id: string, parentid: string, files: string[], tip: boolean) {
  if (files == undefined || files.length == 0) return 0;
  const uploadinglist: IStateUploadFile[] = [];
  let subpath = path.dirname(files[0]);
  if (subpath.endsWith('/') || subpath.endsWith('\\')) subpath = subpath.substr(0, subpath.length - 1); 
  const sublen = subpath.length + 1; 

  const PID = AliUpload.GetUploadIDHex(user_id + '_' + drive_id) + '_' + AliUpload.GetUploadIDHex(parentid);
  const plist: Promise<void>[] = [];
  let dtime = Date.now();
  for (let i = 0; i < files.length; i++) {
    let filepath = files[i];
    if (filepath.endsWith('$RECYCLE.BIN')) continue;
    if (filepath.endsWith('System Volume Information')) continue;
    if (filepath.endsWith('Thumbs.db')) continue;
    if (filepath.endsWith('desktop.ini')) continue;
    if (filepath.endsWith('.DS_Store')) continue;
    plist.push(
      fspromises
        .lstat(filepath)
        .then((stat: any) => {
          let isdir = false;
          if (stat.isDirectory()) {
            isdir = true;
            if (filepath.endsWith('/')) filepath = filepath.substr(0, filepath.length - 1);
            else if (filepath.endsWith('\\')) filepath = filepath.substr(0, filepath.length - 1);
          }

          const UploadID = PID + AliUpload.GetUploadIDHex(filepath) + '_' + stat.size.toString(16);
          uploadinglist.push({
            UploadID: UploadID,
            Info: {
              userid: user_id,
              localFilePath: isdir ? filepath + path.sep : filepath,
              path: '',
              parent_id: parentid,
              drive_id: drive_id,
              name: filepath.substr(sublen),
              size: stat.size,
              sizestr: format.humanStorageSize(stat.size),
              icon: isdir ? 'iconfont iconfolder' : 'iconfont iconwenjian',
              isDir: isdir,
              isMiaoChuan: false,
              sha1: '',
              crc64: '',
            },
            Upload: {
              DownState: '',
              DownTime: dtime++,
              DownSize: 0,
              DownSpeed: 0,
              DownSpeedStr: '',
              DownProcess: 0,
              IsStop: false,
              IsDowning: false,
              IsCompleted: false,
              IsFailed: false,
              FailedCode: 0,
              FailedMessage: '',
              AutoTry: 0,
              upload_id: '',
              file_id: '',
            },
          });
        })
        .catch((e: any) => {
          NotifyInfo(JSON.stringify(e));
          console.log(filepath, e);
        })
    );
  }
  await Promise.all(plist);
  StoreUpload.mAddUploading({ uploadinglist, tip });
  return uploadinglist.length;
}

export function UploadLocalDir(user_id: string, drive_id: string, parentid: string, localDirPath: string) {
  if (localDirPath.endsWith(path.sep) == false) localDirPath = localDirPath + path.sep;
  return fspromises
    .readdir(localDirPath)
    .then((childfiles: any) => {
      for (let j = 0; j < childfiles.length; j++) {
        childfiles[j] = localDirPath + childfiles[j];
      }
      return UploadLocalFiles(user_id, drive_id, parentid, childfiles, false);
    })
    .catch((e: any) => {
      console.log('dir', localDirPath, e);
      return 0;
    }) as Promise<number>;
}
