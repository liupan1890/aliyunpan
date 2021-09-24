import { Notify } from 'quasar';
import AliFile from 'src/aliapi/file';
import { SQL, StoreRoot, StoreUser } from 'src/store';

export function topRestoreSelectFile() {
  if (!StoreUser.tokeninfo.user_id) return;
  const files = StoreRoot.gSelectedFiles;
  const selectkeys: string[] = [];
  const selectparentkeys: string[] = [];
  for (let i = 0; i < files.length; i++) {
    selectkeys.push(files[i].file_id);
    selectparentkeys.push(files[i].parent_file_id);
  }
  if (selectkeys.length == 0) return;
  const token = Object.assign({}, StoreUser.tokeninfo);
  const notify = Notify.create({
    group: false,
    timeout: 0,
    spinner: true,
    message: '执行中...',
  });
  AliFile.ApiTrashRestoreBatch('pan', selectkeys, token).then((data) => {
    StoreRoot.mClearSelectedFile();
    if (data == selectkeys.length && StoreRoot.showDir.file_id == 'trash') {
      const items = [...StoreRoot.gShowDirFiles()];
      for (let j = 0; j < items.length; j++) {
        if (selectkeys.indexOf(items[j].file_id) != -1) {
          items.splice(j, 1);
          j--;
        }
      }
      StoreRoot.mChangSelectedDirFileList({ dir_id: 'trash', items }); //3
    } else {
      StoreRoot.aReLoadDir({ dir_id: 'trash', deletecache: true });
    }

    StoreRoot.aRefreshAllDirList();
    StoreRoot.aRefreshDirList({ selectkeys: selectparentkeys, reload: 0 }); 

    notify({
      timeout: 2500,
      spinner: false,
      icon: data >= selectkeys.length ? 'iconfont iconcheck' : 'iconfont iconinfo_circle',
      type: data >= selectkeys.length ? 'positive' : 'negative',
      message: '恢复文件 成功 ' + data.toString() + '个' + (data < selectkeys.length ? ' 失败 ' + (selectkeys.length - data).toString() + ' 个' : ''),
    });
  });
}

export function topTrashDeleteSelectFile() {
  if (!StoreUser.tokeninfo.user_id) return;
  const selectkeys = StoreRoot.gSelectedFilesKey;
  if (selectkeys.length == 0) return;
  const token = Object.assign({}, StoreUser.tokeninfo);
  const notify = Notify.create({
    group: false,
    timeout: 0,
    spinner: true,
    message: '执行中...',
  });
  AliFile.ApiTrashDeleteBatch('pan', selectkeys, false, token).then((data) => {
    StoreRoot.mClearSelectedFile();
    if (data == selectkeys.length && StoreRoot.showDir.file_id == 'trash') {
      const items = [...StoreRoot.gShowDirFiles()];
      for (let j = 0; j < items.length; j++) {
        if (selectkeys.indexOf(items[j].file_id) != -1) {
          items.splice(j, 1);
          j--;
        }
      }
      StoreRoot.mChangSelectedDirFileList({ dir_id: 'trash', items }); //3
    } else {
      StoreRoot.aReLoadDir({ dir_id: 'trash', deletecache: true });
    }
    notify({
      timeout: 2500,
      spinner: false,
      icon: data >= selectkeys.length ? 'iconfont iconcheck' : 'iconfont iconinfo_circle',
      type: data >= selectkeys.length ? 'positive' : 'negative',
      message: '彻底删除文件 成功 ' + data.toString() + '个' + (data < selectkeys.length ? ' 失败 ' + (selectkeys.length - data).toString() + ' 个' : ''),
    });
  });
}

export function topTrashClear() {
  if (!StoreUser.tokeninfo.user_id) return;
  const files = StoreRoot.gShowDirFiles();
  const selectkeys: string[] = [];
  for (const file of files) {
    selectkeys.push(file.file_id);
  }
  if (selectkeys.length == 0) return;
  const notify = Notify.create({
    group: false,
    timeout: 0,
    spinner: true,
    message: '执行中...',
  });
  const token = Object.assign({}, StoreUser.tokeninfo);
  AliFile.ApiTrashDeleteBatch('pan', selectkeys, false, token).then((data) => {
    StoreRoot.mClearSelectedFile();
    StoreRoot.aReLoadDir({ dir_id: 'trash', deletecache: true });
    notify({
      timeout: 2500,
      spinner: false,
      icon: data >= selectkeys.length ? 'iconfont iconcheck' : 'iconfont iconinfo_circle',
      type: data >= selectkeys.length ? 'positive' : 'negative',
      message: '清空回收站 成功 ' + data.toString() + '个' + (data < selectkeys.length ? ' 失败 ' + (selectkeys.length - data).toString() + ' 个' : ''),
    });
  });
}

export function topUnFavSelectFile() {
  if (!StoreUser.tokeninfo.user_id) return;
  const files = StoreRoot.gSelectedFiles;
  const selectkeys: string[] = [];
  const selectparentkeys: string[] = [];
  for (let i = 0; i < files.length; i++) {
    selectkeys.push(files[i].file_id);
    selectparentkeys.push(files[i].parent_file_id);
  }
  if (selectkeys.length == 0) return;
  const token = Object.assign({}, StoreUser.tokeninfo);
  const notify = Notify.create({
    group: false,
    timeout: 0,
    spinner: true,
    message: '执行中...',
  });
  AliFile.ApiFavorBatch('pan', false, selectkeys, token).then((data) => {
    StoreRoot.mClearSelectedFile();
    SQL.FavorFiles(token.user_id, token.default_drive_id, false, selectkeys);
    if (data == selectkeys.length && StoreRoot.showDir.file_id == 'favorite') {
      const items = [...StoreRoot.gShowDirFiles()];
      for (let j = 0; j < items.length; j++) {
        if (selectkeys.indexOf(items[j].file_id) != -1) {
          items.splice(j, 1);
          j--;
        }
      }
      StoreRoot.mChangSelectedDirFileList({ dir_id: 'favorite', items }); //3
    } else {
      StoreRoot.aReLoadDir({ dir_id: 'favorite', deletecache: true });
    }

    notify({
      timeout: 2500,
      spinner: false,
      icon: data >= selectkeys.length ? 'iconfont iconcheck' : 'iconfont iconinfo_circle',
      type: data >= selectkeys.length ? 'positive' : 'negative',
      message: '取消收藏文件 成功 ' + data.toString() + '个' + (data < selectkeys.length ? ' 失败 ' + (selectkeys.length - data).toString() + ' 个' : ''),
    });
  });
}

export function topUnFavClear() {
  if (!StoreUser.tokeninfo.user_id) return;
  const files = StoreRoot.gShowDirFiles();
  const selectkeys: string[] = [];
  for (const file of files) {
    selectkeys.push(file.file_id);
  }
  if (selectkeys.length == 0) return;
  const notify = Notify.create({
    group: false,
    timeout: 0,
    spinner: true,
    message: '执行中...',
  });
  const token = Object.assign({}, StoreUser.tokeninfo);
  AliFile.ApiFavorBatch('pan', false, selectkeys, token).then((data) => {
    StoreRoot.mClearSelectedFile();
    SQL.FavorFiles(token.user_id, token.default_drive_id, false, selectkeys);
    StoreRoot.aReLoadDir({ dir_id: 'favorite', deletecache: true });
    notify({
      timeout: 2500,
      spinner: false,
      icon: data >= selectkeys.length ? 'iconfont iconcheck' : 'iconfont iconinfo_circle',
      type: data >= selectkeys.length ? 'positive' : 'negative',
      message: '清空收藏夹 成功 ' + data.toString() + '个' + (data < selectkeys.length ? ' 失败 ' + (selectkeys.length - data).toString() + ' 个' : ''),
    });
  });
}
