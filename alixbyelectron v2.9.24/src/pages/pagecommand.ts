import { Dialog } from 'quasar';
import { NotifyError } from 'src/aliapi/notify';
import { StoreDown, StoreSetting } from 'src/store';
import { IStatePanFile } from 'src/store/models';
import DownSavePath from 'src/pages/dialog/DownSavePath.vue';

export function pageDownloadFiles(ispan: boolean, filelist: IStatePanFile[]) {
  if (StoreSetting.ariaRemote) {
    const savepath = StoreSetting.ariaSavePath;
    if (savepath == '') {
      NotifyError('需要先设置Aria远程文件下载保存位置');
      return;
    }
    if (ispan) StoreDown.aAddDownload({ filelist, savepath, issavepath: true, tip: true });
  } else if (StoreSetting.downSavePathEveryTime) {
    Dialog.create({
      component: DownSavePath,
    }).onOk((folder: { savePath: string }) => {
      const savepath = folder.savePath;
      if (savepath == '') {
        NotifyError('没有选择文件下载保存的位置');
        return;
      }
      if (ispan) StoreDown.aAddDownload({ filelist, savepath, issavepath: false, tip: true });
    });
  } else {
    const savepath = StoreSetting.downSavePath;
    if (savepath == '') {
      NotifyError('需要先设置文件下载保存的位置');
      return;
    }
    if (ispan) StoreDown.aAddDownload({ filelist, savepath, issavepath: true, tip: true });
  }
}

export function pageDownloadDir(ispan: boolean, drive_id: string, file_id: string) {
  if (StoreSetting.ariaRemote) {
    const savepath = StoreSetting.ariaSavePath;
    if (savepath == '') {
      NotifyError('需要先设置Aria远程文件下载保存位置');
      return;
    }
    if (ispan) StoreDown.aAddDownloadDir({ drive_id, file_id, savepath, issavepath: true });
  } else if (StoreSetting.downSavePathEveryTime) {
    Dialog.create({
      component: DownSavePath,
    }).onOk((folder: { savePath: string }) => {
      const savepath = folder.savePath;
      if (savepath == '') {
        NotifyError('没有选择文件下载保存的位置');
        return;
      }
      if (ispan) StoreDown.aAddDownloadDir({ drive_id, file_id, savepath, issavepath: false });
    });
  } else {
    const savepath = StoreSetting.downSavePath;
    if (savepath == '') {
      NotifyError('需要先设置文件下载保存的位置');
      return;
    }
    if (ispan) StoreDown.aAddDownloadDir({ drive_id, file_id, savepath, issavepath: true });
  }
}
