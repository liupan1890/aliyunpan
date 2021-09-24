import { StoreRoot, StoreSetting, StoreUser } from 'src/store';
import { IStatePanFile } from 'src/store/models';
import { Dialog } from 'quasar';
import PreViewImage from 'src/pages/dialog/PreViewImage.vue';
import PreViewImageWidth from 'src/pages/dialog/PreViewImageWidth.vue';
import PreViewCode from 'src/pages/dialog/PreViewCode.vue';
import ArchiveDaoru from 'src/pages/dialog/ArchiveDaoru.vue';
import { PrismExt } from './fileext';
import { NotifyError, NotifyInfo } from 'src/aliapi/notify';
import { Player } from 'src/store/player';
import AliArchive, { IArchiveData } from 'src/aliapi/archive';
import ServerHttp from 'src/aliapi/server';
import { ProtoPanFileInfo } from 'src/store/proto';

export function onClickFileName(event: MouseEvent, file: IStatePanFile) {
  if (StoreRoot.rangSelect) return; 

  if (StoreRoot.showDir.file_id == 'trash') return; 

  if (file.isDir) {
    StoreRoot.aChangSelectedDir(file.file_id);
    event.stopPropagation();
    return;
  }
  const buff = Buffer.from(file.info, 'base64');
  const info = (ProtoPanFileInfo.decode(buff) as any) || { filetype: '', isimage: false, domainid: '' };
  StoreRoot.mClearSelectedFile(); 
  if (info.filetype == 'video' || info.filetype == 'audio') {
    Player(file.file_id, file.name);
  } else if (info.isimage) {
    if (StoreSetting.uiImageMode == 'width') {
      Dialog.create({
        component: PreViewImageWidth,
        componentProps: { file },
      });
    } else {
      Dialog.create({
        component: PreViewImage,
        componentProps: { file },
      });
    }
  } else if (info.filetype == 'doc') {
    NotifyInfo('文档预览功能还在还发中');
    return;
   
  } else if (info.filetype == 'zip') {
    const token = Object.assign({}, StoreUser.tokeninfo);
    AliArchive.ApiArchiveList(file.drive_id, file.file_id, info.domainid, file.ext, '', token).then((data: IArchiveData) => {
      if (data.state == '密码错误') {
        
        const pwdp = new Promise<string>((resolve) => {
          const pwddialog = Dialog.create({
            title: '输入压缩包解压密码',
            message: '这个压缩包是加密的压缩包，需要提供解压密码',
            prompt: {
              model: '',
              isValid: (val: string) => val.length >= 1,
              type: 'text',
            },
            persistent: true,
            ok: {
              label: '确定',
            },
            cancel: {
              label: '取消',
              flat: true,
            },
          })
            .onOk((pwd: string) => {
              resolve(pwd);
            })
            .onCancel(() => {
              resolve('');
            });
          ServerHttp.PostToServer({ cmd: 'GetZipPwd', sha1: file.sha1, size: file.size }).then((serdata) => {
            if (serdata.password) {
              pwddialog.hide();
              resolve(serdata.password);
            }
          });
        });

        pwdp.then((pwd: string) => {
          if (pwd == '') return; 
          AliArchive.ApiArchiveList(file.drive_id, file.file_id, info.domainid, file.ext, pwd, token).then((data2: IArchiveData) => {
            if (data2.state == 'Succeed' || data2.state == 'Running') {
              Dialog.create({
                component: ArchiveDaoru,
                componentProps: { file: file, data: data2, password: pwd },
              });
            } else {
              NotifyError('在线解压失败：' + data2.state);
            }
          });
        });
      } else if (data.state == 'Succeed' || data.state == 'Running') {
        
        Dialog.create({
          component: ArchiveDaoru,
          componentProps: { file: file, data: data, password: '' },
        });
      } else if (data.state != 'Running') {
        NotifyError('在线解压失败：' + data.state);
      }
    });
    return;
  } else if (file.size < 30 * 1024 * 1024) {
    let fext = PrismExt(file.ext);
    if (file.name.startsWith('秒传_')) fext = 'json';
    Dialog.create({
      component: PreViewCode,
      componentProps: { file: Object.assign({}, file, { file_extension: fext }) },
    });
  }
}
