import { UploadLocalDir } from 'src/pages/pan/filelist';
import { SQL, StoreUpload } from 'src/store';

export function MainUploadEvent(arg: any) {
  StoreUpload.aUploadEvent(arg.list || []);
}

export function MainUploadDir(arg: any) {
  const parentid = arg.parentid as string;
  const Info = arg.Info;
  UploadLocalDir(Info.userid, Info.drive_id, parentid, Info.localFilePath);
}
export function MainUploadID(arg: any) {
  StoreUpload.mSaveToUploading({ UploadID: arg.UploadID, file_id: arg.file_id, upload_id: arg.upload_id });
}
export function MainSaveFileListAllPage(arg: any) {
  if (arg.from == 'sharelist') {
    //
  } else if (arg.from == 'filelist') {
    SQL.SaveFileList(arg.user_id, arg.drive_id, arg.dir_id, arg.items);
  } else if (arg.from == 'alldirlist') {
    SQL.SaveAllDir(arg.user_id, arg.drive_id, arg.items);
  } else if (arg.from == 'dirlist') {
    //
  } else if (arg.from == 'searchlist') {
    //
  }
}
