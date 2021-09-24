import { Dialog } from 'quasar';
import AliFile from 'src/aliapi/file';
import { StoreRoot, StoreSetting, StoreUI, StoreUser } from 'src/store';
import MoveFiles from 'src/pages/dialog/MoveFiles.vue';
import FileCreat from 'src/pages/dialog/FileCreat.vue';
import FilesDetail from 'src/pages/dialog/FilesDetail.vue';
import { DeleteFiles, FavorFiles, RenameFiles } from './filecommand';
import { pageDownloadDir, pageDownloadFiles } from '../pagecommand';
import PreViewImageXBT from 'src/pages/dialog/PreViewImageXBT.vue';
import MutilRename from 'src/pages/dialog/MutilRename.vue';
import { NotifyError, NotifySuccess } from 'src/aliapi/notify';
import { ProtoPanFileInfo } from 'src/store/proto';
export function treeChangeColor(val: string) {
  StoreUI.mChangColor({ selectkeys: [StoreRoot.showDir.file_id], color: val });
}

export function menuChangeColor(val: string) {
  const selectkeys = StoreRoot.gSelectedFilesKey;
  StoreUI.mChangColor({ selectkeys, color: val });
}

export function menuRenameSelectFile(istree: boolean) {
  let file_id = '';
  let name = '';
  let parentid = '';
  if (istree) {
    parentid = StoreRoot.showDir.parent_file_id;
    file_id = StoreRoot.showDir.file_id;
    name = StoreRoot.showDir.name;
  } else {
    parentid = StoreRoot.showDir.file_id;
    const sel = StoreRoot.gSelectedFiles;
    if (sel.length == 1) {
      file_id = sel[0].file_id;
      name = sel[0].name;
    }
  }

  if (file_id != '') {
    Dialog.create({
      class: 'rename',
      title: '重命名',
      message: '文件名不要有特殊字符：<>!:*?\\/.\'"',
      prompt: {
        model: name + '',
        isValid: (val: string) => val.length >= 1,
        type: 'input', 
        attrs: { spellcheck: false },
      },
      persistent: true,
      ok: {
        label: '保存',
      },
      cancel: {
        label: '取消',
        flat: true,
      },
    }).onOk((newname: string) => {
      RenameFiles(parentid, file_id, newname); 
    });
  } else {
    Dialog.create({
      component: MutilRename,
      componentProps: { istree },
    });
  }
}
export function menuCreatNewFile(dir_id: string | undefined) {
  if (dir_id == undefined || dir_id == '') dir_id = StoreRoot.showDir.file_id;
  Dialog.create({
    component: FileCreat,
    componentProps: { drive_id: StoreUI.gIsPanPage ? 'pan' : 'pic', parentid: dir_id },
  });
}
export function menuCreatNewDir(dir_id: string | undefined, name: string) {
  if (dir_id == undefined || dir_id == '') dir_id = StoreRoot.showDir.file_id;
  const date = new Date(Date.now());
  const y = date.getFullYear().toString();
  let m: number | string = date.getMonth() + 1;
  m = m < 10 ? '0' + m.toString() : m.toString();
  let d: number | string = date.getDate();
  d = d < 10 ? '0' + d.toString() : d.toString();
  let h: number | string = date.getHours();
  h = h < 10 ? '0' + h.toString() : h.toString();
  let minute: number | string = date.getMinutes();
  minute = minute < 10 ? '0' + minute.toString() : minute.toString();
  let second: number | string = date.getSeconds();
  second = second < 10 ? '0' + second.toString() : second.toString();
  if (name == 'time') {
    name = StoreSetting.uiTimeFolderFormate.replace(/yyyy/g, y).replace(/MM/g, m).replace(/dd/g, d).replace(/HH/g, h).replace(/mm/g, minute).replace(/ss/g, second);
  }

  Dialog.create({
    title: '新建文件夹',
    message: '文件夹名不要有特殊字符：<>!:*?\\/.\'"',
    prompt: {
      model: name,
      isValid: (val: string) => val.length >= 1,
      type: 'text', 
    },
    persistent: true,
    ok: {
      label: '创建',
    },
    cancel: {
      label: '取消',
      flat: true,
    },
  }).onOk((newname: string) => {
    const token = Object.assign({}, StoreUser.tokeninfo);
    AliFile.ApiCreatNewForder('pan', dir_id!, newname, token).then((data) => {
      if (data == undefined) NotifyError('新建文件夹 失败');
      else if (data == 'QuotaExhausted.Drive') NotifyError('新建文件夹失败：网盘空间已满');
      else {
        StoreRoot.aReLoadDir({ dir_id: dir_id!, deletecache: true });
        NotifySuccess('新建文件夹文件 成功');
      }
    });
  });
}

export function menuTrashSelectFile(istree: boolean, force: boolean) {
  if (!StoreUser.tokeninfo.user_id) return;
  const parentid = istree ? StoreRoot.showDir.parent_file_id : StoreRoot.showDir.file_id;
  const selectkeys = istree ? [StoreRoot.showDir.file_id] : StoreRoot.gSelectedFilesKey;
  StoreRoot.mClearSelectedFile();
  DeleteFiles(parentid, selectkeys, force);
}
export function menuFavSelectFile(istree: boolean) {
  if (!StoreUser.tokeninfo.user_id) return;
  const parentid = istree ? StoreRoot.showDir.parent_file_id : StoreRoot.showDir.file_id;
  const selectkeys = istree ? [StoreRoot.showDir.file_id] : StoreRoot.gSelectedFilesKey;
  FavorFiles(true, parentid, selectkeys);
}

export function menuMoveFiles(istree: boolean, ismove: boolean) {
  Dialog.create({
    component: MoveFiles,
    componentProps: { istree, ismove },
  });
}

export async function menuFilesDetail(istree: boolean) {
  if (istree == false) {
    if (StoreRoot.showDir.file_id == 'trash') return;
    const file = StoreRoot.gSelectedFileFirst;
    if (file && file.info) {
      const buff = Buffer.from(file.info, 'base64');
      const info = (ProtoPanFileInfo.decode(buff) as any) || { filetype: '' };

      if (file && info.filetype == 'video') {
        if (file.duration <= 0) {
          const token = Object.assign({}, StoreUser.tokeninfo);
          const data = await AliFile.ApiVideoPreviewUrl(StoreUI.gIsPanPage ? 'pan' : 'pic', file.file_id, token);
          if (data) file.duration = data.size || 0;
        }
        if (file.duration > 0) {
          Dialog.create({
            component: PreViewImageXBT,
            componentProps: { ispan: StoreUI.gIsPanPage, file },
          });
          return;
        }
      }
    }
  }
  Dialog.create({
    component: FilesDetail,
    componentProps: { istree },
  });
}

export function menuDownload(istree: boolean) {
  if (istree) {
    pageDownloadDir(true, StoreRoot.showDir.drive_id, StoreRoot.showDir.file_id);
  } else {
    const filelist = StoreRoot.gSelectedFiles;
    pageDownloadFiles(true, filelist);
  }
}
