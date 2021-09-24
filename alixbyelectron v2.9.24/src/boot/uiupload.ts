import { format } from 'quasar';
import AliFile from 'src/aliapi/file';
import { IUploadCreat } from 'src/aliapi/models';
import AliUpload from 'src/aliapi/upload';
import { DB } from 'src/store';
import { IAriaDownProgress, IStateUploadFile, ITokenInfo } from 'src/store/models';
const fspromises = window.require('fs/promises');

const UploadList: IStateUploadFile[] = [];
export function UploadEvent() {
  const list: IAriaDownProgress[] = [];
  for (let j = 0; j < UploadList.length; j++) {
    const item = UploadList[j];
    try {
      if (item.Upload.FailedMessage.startsWith('计算sha1(')) {
        const posnow = AliUpload.GetFileHashProofSpeed(item.UploadID);
        let speed = posnow - item.Upload.DownSize;
        item.Upload.DownSize = posnow;
        if (speed < 0) speed = 0;
        list.push({
          gid: item.UploadID,
          status: item.Upload.DownState, 
          totalLength: item.Info.size.toString(),
          completedLength: '0',
          downloadSpeed: '0',
          errorCode: item.Upload.FailedCode.toString(),
          errorMessage: item.Upload.FailedMessage + ' ' + format.humanStorageSize(speed) + '/s',
        });
      } else if (item.Upload.DownState != 'removed') {
        const posnow = AliUpload.GetFileUploadProofSpeed(item.UploadID);
        let speed = posnow - item.Upload.DownSize;
        item.Upload.DownSize = posnow;
        if (speed < 0) speed = 0;

        list.push({
          gid: item.UploadID,
          status: item.Upload.DownState, 
          totalLength: item.Info.size.toString(),
          completedLength: item.Upload.DownSize.toString(),
          downloadSpeed: speed.toString(),
          errorCode: item.Upload.FailedCode.toString(),
          errorMessage: item.Upload.FailedMessage,
        });
      }

      if (item.Upload.DownState == 'paused' || item.Upload.DownState == 'removed') {
        UploadList.splice(j, 1);
        j--;
        continue;
      }
    } catch {}
  }
  if (window.WinMsgToMain) window.WinMsgToMain({ cmd: 'MainUploadEvent', list });
}

export function UploadAdd(uploadList: IStateUploadFile[]) {
  for (let i = 0; i < uploadList.length; i++) {
    const item = uploadList[i];
    let find = false;
    for (let j = 0; j < UploadList.length; j++) {
      if (item.UploadID == UploadList[j].UploadID) {
        find = true;
        if (item.Upload.DownState != 'active') {
          item.Upload.DownState = 'active';
          StartUpload(item);
        }
        break;
      }
    }
    if (find == false) {
      item.Upload.DownState = 'active';
      UploadList.push(item);
      StartUpload(item);
    }
  }
}

export function UploadCmd(uploadAll: boolean, uploadCmd: string, uploadIDList: string[]) {
  for (let j = 0; j < UploadList.length; j++) {
    const UploadID = UploadList[j].UploadID;
    if (uploadAll || uploadIDList.includes(UploadID)) {
      if (uploadCmd == 'stop') {
        if (UploadList[j].Upload.DownState == 'active') StopUpload(UploadList[j], false);
        else UploadList[j].Upload.DownState = 'paused';
      } else if (uploadCmd == 'delete') {
        if (UploadList[j].Upload.DownState == 'active') StopUpload(UploadList[j], true);
        else UploadList[j].Upload.DownState = 'removed';
      }
    }
  }
}

function StopUpload(item: IStateUploadFile, isdelete: boolean) {
  item.Upload.DownState = 'paused';
  if (isdelete) item.Upload.DownState = 'removed';
}

async function reloadUploadUrl(uploadinfo: IUploadCreat, item: IStateUploadFile, token: ITokenInfo) {
  uploadinfo.file_id = item.Upload.file_id;
  uploadinfo.upload_id = item.Upload.upload_id;
  uploadinfo.part_info_list = [];
  await AliUpload.UploadFilePartUrl(item.Info.drive_id, item.Upload.file_id, item.Upload.upload_id, item.Info.size, uploadinfo, token);
  if (uploadinfo.part_info_list.length > 0) {
    await AliUpload.UploadFilePartUrlFinished(item.Info.drive_id, item.Upload.file_id, item.Upload.upload_id, 0, uploadinfo, token);
    let isupload = true;
    for (let i = 0; i < uploadinfo.part_info_list.length; i++) {
      if (isupload && uploadinfo.part_info_list[i].isupload == false) {
        isupload = false; 
      }
      if (isupload === false && uploadinfo.part_info_list[i].isupload == true) uploadinfo.part_info_list[i].isupload = false; 
    }
  } else {
    uploadinfo.upload_id = '';
    uploadinfo.file_id = '';
  }
}

async function checkPreHashAndGetPartlist(uploadinfo: IUploadCreat, item: IStateUploadFile, token: ITokenInfo) {
  let PreHashMatched = true;
  if (item.Info.size >= 1024000) {
    const prehash = await AliUpload.GetFilePreHash(item.Info.localFilePath);
    const Matched = await AliUpload.UploadCreatFileWithFolders(item.Info.drive_id, item.Info.parent_id, item.Info.name, item.Info.size, '', '', prehash, token);
    PreHashMatched = Matched.errormsg == 'PreHashMatched';
    if (Matched.errormsg == '') {
      item.Upload.upload_id = Matched.upload_id;
      item.Upload.file_id = Matched.file_id;
      uploadinfo.file_id = Matched.file_id;
      uploadinfo.upload_id = Matched.upload_id;
      uploadinfo.part_info_list = Matched.part_info_list;
      uploadinfo.errormsg = '';
      uploadinfo.israpid = false;
    }
  }
  if (PreHashMatched) {
    const proof = await AliUpload.GetFileHashProof(token.access_token, item);
    if (item.Upload.DownState !== 'active') {
      item.Upload.FailedCode = 0;
      item.Upload.FailedMessage = '';
      return true;
    }
    if (proof.sha1 == 'error') {
      item.Upload.DownState = 'error';
      item.Upload.FailedCode = 503;
      item.Upload.FailedMessage = '计算sha1出错可能文件拒绝访问';
      return true;
    } else {
      const MiaoChuan = await AliUpload.UploadCreatFileWithFolders(item.Info.drive_id, item.Info.parent_id, item.Info.name, item.Info.size, proof.sha1, proof.proof_code, '', token);
      if (MiaoChuan.israpid) {
        item.Upload.DownState = 'complete';
        return true;
      } else if (MiaoChuan.errormsg != '') {
        item.Upload.DownState = 'error';
        item.Upload.FailedCode = 504;
        item.Upload.FailedMessage = MiaoChuan.errormsg;
        return true;
      } else {
        item.Upload.upload_id = MiaoChuan.upload_id;
        item.Upload.file_id = MiaoChuan.file_id;
        uploadinfo.file_id = MiaoChuan.file_id;
        uploadinfo.upload_id = MiaoChuan.upload_id;
        uploadinfo.part_info_list = MiaoChuan.part_info_list;
        uploadinfo.errormsg = '';
        uploadinfo.israpid = false;
        return false;
      }
    }
  }
}

async function StartUpload(item: IStateUploadFile) {
  const token = await DB.getUser(item.Info.userid);
  if (token == undefined || token.user_id !== item.Info.userid) {
    item.Upload.DownState = 'error';
    item.Upload.FailedCode = 401;
    item.Upload.FailedMessage = '找不到账号,无法继续';
    return;
  }
  const name = item.Info.path == '' ? item.Info.name : item.Info.path + '/' + item.Info.name;
  if (item.Info.isDir) {
    const result = await AliFile.ApiCreatNewForder(item.Info.drive_id, item.Info.parent_id, name, token);
    if (result != undefined && result != 'QuotaExhausted.Drive') {
      if (item.Info.isMiaoChuan == false && window.WinMsgToMain) window.WinMsgToMain({ cmd: 'MainUploadDir', Info: item.Info, parentid: result });
      item.Upload.DownState = 'complete';
    } else {
      item.Upload.DownState = 'error';
      item.Upload.FailedCode = 402;
      item.Upload.FailedMessage = '创建文件夹失败:' + name;
      if (result == 'QuotaExhausted.Drive') item.Upload.FailedMessage = '创建文件夹失败：网盘空间已满';
    }
    return;
  }

  if (item.Info.isMiaoChuan) {
    const result = await AliUpload.UploadCreatFile(item.Info.drive_id, item.Info.parent_id, name, item.Info.size, item.Info.sha1, '', token);
    if (result.israpid) {
      item.Upload.DownState = 'complete';
    } else {
      item.Upload.DownState = 'error';
      item.Upload.FailedCode = 402;
      item.Upload.FailedMessage = '秒传失败,' + (result.errormsg == '' ? '云盘中不存在此sha1的相同文件' : result.errormsg);
    }
    return;
  }

  const stat = await fspromises.lstat(item.Info.localFilePath).catch(() => {
    return undefined;
  });
  if (!stat) {
    item.Upload.DownState = 'error';
    item.Upload.FailedCode = 402;
    item.Upload.FailedMessage = '读取文件大小失败可能已删除';
    return;
  }

  if (item.Info.size != stat.size) {
    item.Info.size = stat.size;
    item.Info.sizestr = format.humanStorageSize(stat.size);
    item.Info.sha1 = '';
    item.Upload.upload_id = '';
  }

  const uploadinfo: IUploadCreat = {
    israpid: false,
    upload_id: '',
    file_id: '',
    part_info_list: [],
    errormsg: '',
  };
  if (item.Upload.upload_id != '' && item.Upload.file_id != '') {
    await reloadUploadUrl(uploadinfo, item, token);
  }
  if (uploadinfo.upload_id == '') {
    const PreHashMatched = await checkPreHashAndGetPartlist(uploadinfo, item, token);
    if (PreHashMatched) return;
  }
  if (uploadinfo.part_info_list.length == 0) {
    item.Upload.DownState = 'error';
    item.Upload.FailedCode = 505;
    item.Upload.FailedMessage = '获取上传地址失败1';
    return;
  }
  if (uploadinfo.part_info_list.length > 1 && window.WinMsgToMain) window.WinMsgToMain({ cmd: 'MainUploadID', UploadID: item.UploadID, file_id: uploadinfo.file_id, upload_id: uploadinfo.upload_id });

  const UpResult = await AliUpload.UploadOneFile(uploadinfo, item, token);

  if (UpResult == 'success') item.Upload.DownState = 'complete';
  else if (item.Upload.DownState == 'active') {
    item.Upload.DownState = 'error';
    item.Upload.FailedCode = 505;
    item.Upload.FailedMessage = UpResult;
  }
}
