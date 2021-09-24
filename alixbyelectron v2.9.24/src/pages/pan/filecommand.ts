import { Notify } from 'quasar';
import AliFile from 'src/aliapi/file';
import { SQL, StoreRoot, StoreUser } from 'src/store';

export async function RenameFiles(parentid: string, file_id: string, name: string) {


  const token = Object.assign({}, StoreUser.tokeninfo);
  const notify = Notify.create({
    group: false,
    timeout: 0,
    spinner: true,
    message: '执行中...',
  });
  const data = await AliFile.ApiRenameBatch('pan', [file_id], [name], token);
  if (data == 1) {
    StoreRoot.mRenameFiles({ files: [file_id], names: [name] }); 
    await SQL.RenameFiles(token.user_id, token.default_drive_id, [file_id], [name]); 
  } else {
    StoreRoot.aReLoadDir({ dir_id: parentid, deletecache: true }); 
  }
  notify({
    timeout: 2500,
    spinner: false,
    icon: data >= 1 ? 'iconfont iconcheck' : 'iconfont iconinfo_circle',
    type: data >= 1 ? 'positive' : 'negative',
    message: '重命名文件 ' + (data == 1 ? ' 成功 1 个' : ' 失败 1 个'),
  });
}

export async function DeleteFiles(parentid: string, files: string[], force: boolean) {
  const token = Object.assign({}, StoreUser.tokeninfo);
  const notify = Notify.create({
    group: false,
    timeout: 0,
    spinner: true,
    message: '执行中...',
  });
  let data = 0;
  if (force) data = await AliFile.ApiTrashDeleteBatch('pan', files, true, token);
  else data = await AliFile.ApiTrashBatch('pan', files, token);
  StoreRoot.mClearSelectedFile(); 
  if (data == files.length) {
    StoreRoot.mDeleteFiles({ parentid, files }); 
    if (parentid == StoreRoot.showDir.parent_file_id) StoreRoot.aChangSelectedDir(parentid); 
    await SQL.DeleteFiles(token.user_id, token.default_drive_id, parentid, files);
    StoreRoot.aRefreshDirSize(parentid);
  } else {
    StoreRoot.aReLoadDir({ dir_id: parentid, deletecache: true }); 
  }

  StoreRoot.aRefreshDirList({ selectkeys: ['trash'], reload: 0 }); 
  notify({
    timeout: 2500,
    spinner: false,
    icon: data >= files.length ? 'iconfont iconcheck' : 'iconfont iconinfo_circle',
    type: data >= files.length ? 'positive' : 'negative',
    message: '删除文件 成功 ' + data.toString() + '个' + (data < files.length ? ' 失败 ' + (files.length - data).toString() + ' 个' : ''),
  });
}

export async function FavorFiles(isFavor: boolean, parentid: string, files: string[]) {
  const token = Object.assign({}, StoreUser.tokeninfo);

  const notify = Notify.create({
    group: false,
    timeout: 0,
    spinner: true,
    message: '执行中...',
  });
  const data = await AliFile.ApiFavorBatch('pan', isFavor, files, token);
  StoreRoot.mClearSelectedFile(); 
  if (data == files.length) {
    if (parentid == StoreRoot.showDir.file_id) StoreRoot.mFavorFiles({ isFavor, files }); 
    await SQL.FavorFiles(token.user_id, token.default_drive_id, isFavor, files);
  } else {
    StoreRoot.aReLoadDir({ dir_id: parentid, deletecache: true }); 
  }
  StoreRoot.aRefreshDirList({ selectkeys: ['favorite'], reload: 0 }); 
  notify({
    timeout: 2500,
    spinner: false,
    icon: data >= files.length ? 'iconfont iconcheck' : 'iconfont iconinfo_circle',
    type: data >= files.length ? 'positive' : 'negative',
    message: '收藏文件 成功 ' + data.toString() + '个' + (data < files.length ? ' 失败 ' + (files.length - data).toString() + ' 个' : ''),
  });
}
